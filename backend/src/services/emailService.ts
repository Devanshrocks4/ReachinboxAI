import { prisma } from '../db';

export interface ScheduleEmailData {
  subject: string;
  body: string;
  sender: string;
  recipients: string[];
  scheduledAt: Date;
}

export class EmailService {
  static async createEmailJob(data: ScheduleEmailData) {
    try {
      return await prisma.emailJob.create({
        data: {
          subject: data.subject,
          body: data.body,
          sender: data.sender,
          recipients: data.recipients,
          scheduledAt: data.scheduledAt,
        },
      });
    } catch (error) {
      console.log('DB not available, using in-memory store for create');
      // Fallback to in-memory storage
      const id = `inmem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      InMemoryStore.create(id, {
        id,
        subject: data.subject,
        body: data.body,
        sender: data.sender,
        recipients: data.recipients,
        scheduledAt: data.scheduledAt,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return InMemoryStore.get(id);
    }
  }

  static async getEmailJob(id: string) {
    try {
      return await prisma.emailJob.findUnique({
        where: { id },
      });
    } catch (error) {
      // Fallback to in-memory store
      // console.log('DB not available, using in-memory store for getEmailJob');
      return InMemoryStore.get(id);
    }
  }

  static async updateEmailJobStatus(
    id: string,
    status: 'SENT' | 'FAILED',
    sentAt?: Date,
    failedAt?: Date,
    error?: string
  ) {
    try {
      return await prisma.emailJob.update({
        where: { id },
        data: {
          status,
          sentAt,
          failedAt,
          error,
        },
      });
    } catch (err) {
      // Update in-memory store if present
      // console.log('DB not available, updating in-memory store');
      return InMemoryStore.updateStatus(id, status, sentAt, failedAt, error);
    }
  }

  static async getScheduledEmails() {
    try {
      return await prisma.emailJob.findMany({
        where: { status: 'PENDING' },
        orderBy: { scheduledAt: 'asc' },
      });
    } catch (error) {
      // Return from in-memory store
      return InMemoryStore.listByStatus('PENDING');
    }
  }

  static async getSentEmails() {
    try {
      return await prisma.emailJob.findMany({
        where: { status: 'SENT' },
        orderBy: { sentAt: 'desc' },
      });
    } catch (error) {
      return InMemoryStore.listByStatus('SENT');
    }
  }
}

// Simple in-memory store used when DB is unavailable (demo fallback)
const InMemoryStore = (() => {
  type Job = any;
  const store = new Map<string, Job>();

  return {
    create(id: string, job: Job) {
      store.set(id, job);
    },
    get(id: string) {
      return store.get(id) || null;
    },
    updateStatus(id: string, status: 'SENT' | 'FAILED', sentAt?: Date, failedAt?: Date, error?: string) {
      const job = store.get(id);
      if (!job) return null;
      job.status = status;
      if (sentAt) job.sentAt = sentAt;
      if (failedAt) job.failedAt = failedAt;
      if (error) job.error = error;
      job.updatedAt = new Date();
      store.set(id, job);
      return job;
    },
    listByStatus(status: string) {
      const arr: Job[] = [];
      for (const v of store.values()) {
        if (v.status === status) arr.push(v);
      }
      return arr.sort((a, b) => (a.scheduledAt?.getTime?.() || 0) - (b.scheduledAt?.getTime?.() || 0));
    },
    // debug helper to list all jobs
    listAll() {
      return Array.from(store.values());
    }
  };
})();

export function debugListInMemoryJobs() {
  // @ts-ignore
  return InMemoryStore.listAll ? InMemoryStore.listAll() : [];
}
