import { EmailService, ScheduleEmailData } from './src/services/emailService';
import { EmailQueueService } from './src/queues/emailQueue';
import { debugListInMemoryJobs } from './src/services/emailService';

async function demo() {
  console.log('Starting demo...');

  const data: ScheduleEmailData = {
    subject: 'Demo Email from local demo.ts',
    body: '<p>This is a demo email</p>',
    sender: 'noreply@demo.local',
    recipients: ['user@example.com'],
    scheduledAt: new Date(Date.now() - 1000), // immediate
  };

  const job = await EmailService.createEmailJob(data);
  console.log('Created job:', job.id);

  await EmailQueueService.addEmailJob(job.id, data.scheduledAt);
  console.log('Added to queue (or in-memory fallback)');

  // Wait for processing
  await new Promise((r) => setTimeout(r, 4000));

  console.log('In-memory jobs:', debugListInMemoryJobs());

  const scheduled = await EmailService.getScheduledEmails();
  console.log('Scheduled (API):', scheduled);

  const sent = await EmailService.getSentEmails();
  console.log('Sent (API):', sent);
}

demo().catch((e) => {
  console.error('Demo error', e);
  process.exit(1);
});
