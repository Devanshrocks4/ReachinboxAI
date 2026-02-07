import { Queue, Worker } from 'bullmq';
import { config } from '../config';
import { EmailService } from '../services/emailService';
import { sendEmail } from '../utils/emailSender';
import { RateLimiter } from '../utils/rateLimiter';

let emailQueue: Queue | null = null;
let emailWorker: Worker | null = null;

// In-memory fallback queue (used when Redis is not available).
class InMemoryFallback {
  private pending: Array<{ emailJobId: string; runAt: number }> = [];
  private processing = new Set<string>();
  private minDelay = config.rateLimit.minDelayBetweenSends || 1000;
  private lastSentBySender: Record<string, number> = {};

  add(emailJobId: string, scheduledAt: Date) {
    const runAt = scheduledAt.getTime();
    this.pending.push({ emailJobId, runAt });
    this.pending.sort((a, b) => a.runAt - b.runAt);
    console.log(`InMemory: Added job ${emailJobId}, delay=${runAt - Date.now()}ms`);
    this.scheduleNext();
  }

  private scheduleNext() {
    if (this.pending.length === 0) return;
    const now = Date.now();
    const next = this.pending[0];
    const delay = Math.max(0, next.runAt - now);
    console.log(`InMemory: Scheduling job ${next.emailJobId} in ${delay}ms`);

    setTimeout(async () => {
      // Pop the job (could have been processed already)
      const job = this.pending.shift();
      if (!job) return;

      // Process job
      console.log(`InMemory: Processing job ${job.emailJobId}`);
      await this.processJob(job.emailJobId);

      // Schedule the following job
      this.scheduleNext();
    }, delay);
  }

  private async processJob(emailJobId: string) {
    if (this.processing.has(emailJobId)) return;
    this.processing.add(emailJobId);

    try {
      const emailJob = await EmailService.getEmailJob(emailJobId);
      if (!emailJob || emailJob.status !== 'PENDING') {
        console.log(`InMemory: Job ${emailJobId} not found or not pending`);
        return;
      }
      console.log(`InMemory: Got job ${emailJobId}`);

      // Enforce min delay per sender
      const sender = emailJob.sender;
      const now = Date.now();
      const last = this.lastSentBySender[sender] || 0;
      const wait = Math.max(0, this.minDelay - (now - last));
      if (wait > 0) {
        console.log(`InMemory: Rate limit wait ${wait}ms for ${sender}`);
        await new Promise((r) => setTimeout(r, wait));
      }

      // Check rate limiter (will allow if no Redis)
      const canSend = await RateLimiter.checkAndIncrement(sender);
      if (!canSend) {
        console.log(`InMemory: Rate limit exceeded for ${sender}`);
        const nextTime = await RateLimiter.getNextAvailableTime(sender);
        // re-add to pending
        this.add(emailJobId, nextTime);
        return;
      }

      try {
        await sendEmail({
          to: emailJob.recipients,
          subject: emailJob.subject,
          body: emailJob.body,
          from: emailJob.sender,
        });

        this.lastSentBySender[sender] = Date.now();
        await EmailService.updateEmailJobStatus(emailJobId, 'SENT', new Date());
        console.log('InMemory: Sent email', emailJobId);
      } catch (error) {
        await EmailService.updateEmailJobStatus(
          emailJobId,
          'FAILED',
          undefined,
          new Date(),
          error instanceof Error ? error.message : 'Unknown error'
        );
        console.log('InMemory: Failed to send', emailJobId, error instanceof Error ? error.message : error);
      }
    } finally {
      this.processing.delete(emailJobId);
    }
  }
}

const fallback = new InMemoryFallback();

try {
  emailQueue = new Queue('email', {
    connection: {
      url: config.redis.url,
    },
  });

  // Handle connection errors
  emailQueue.on('error', (err) => {
    console.log('Email Queue connection error:', err.message);
  });

  emailWorker = new Worker(
    'email',
    async (job) => {
      const { emailJobId } = job.data;

      const emailJob = await EmailService.getEmailJob(emailJobId);
      if (!emailJob || emailJob.status !== 'PENDING') {
        return;
      }

      // Check rate limit
      const canSend = await RateLimiter.checkAndIncrement(emailJob.sender);
      if (!canSend) {
        // Reschedule to next available hour
        const nextTime = await RateLimiter.getNextAvailableTime(emailJob.sender);
        await EmailQueueService.addEmailJob(emailJobId, nextTime);
        return;
      }

      try {
        await sendEmail({
          to: emailJob.recipients,
          subject: emailJob.subject,
          body: emailJob.body,
          from: emailJob.sender,
        });

        await EmailService.updateEmailJobStatus(emailJobId, 'SENT', new Date());
      } catch (error) {
        await EmailService.updateEmailJobStatus(
          emailJobId,
          'FAILED',
          undefined,
          new Date(),
          error instanceof Error ? error.message : 'Unknown error'
        );
        throw error;
      }
    },
    {
      connection: {
        url: config.redis.url,
      },
      concurrency: 5, // Configurable
    }
  );

  emailWorker.on('error', (err) => {
    console.log('Email Worker connection error:', err.message);
  });
} catch (error) {
  console.log('Redis not available, using in-memory fallback queue');
}

export class EmailQueueService {
  static async addEmailJob(emailJobId: string, scheduledAt: Date) {
    console.log(`addEmailJob called: emailQueue=${emailQueue ? 'exists' : 'null'}, jobId=${emailJobId}`);
    const delay = scheduledAt.getTime() - Date.now();

    if (emailQueue) {
      console.log(`Using BullMQ queue`);
      if (delay > 0) {
        await emailQueue.add(
          'send-email',
          { emailJobId },
          {
            delay,
            removeOnComplete: true,
            removeOnFail: true,
          }
        );
      } else {
        await emailQueue.add(
          'send-email',
          { emailJobId },
          {
            removeOnComplete: true,
            removeOnFail: true,
          }
        );
      }
      return;
    }

    // Fallback to in-memory scheduling
    console.log(`Using in-memory fallback queue`);
    fallback.add(emailJobId, scheduledAt);
  }
}
