import express from 'express';
import { EmailService, ScheduleEmailData } from '../services/emailService';
import { EmailQueueService } from '../queues/emailQueue';
import { debugListInMemoryJobs } from '../services/emailService';

const router = express.Router();

router.post('/schedule', async (req, res) => {
  try {
    const body = req.body;

    // Validate data
    if (!body.subject || !body.body || !body.sender || !body.recipients || !body.scheduledAt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const data: ScheduleEmailData = {
      subject: body.subject,
      body: body.body,
      sender: body.sender,
      recipients: body.recipients,
      scheduledAt: new Date(body.scheduledAt),
    };

    const emailJob = await EmailService.createEmailJob(data);
    console.log('Created email job:', emailJob.id);

    // Add to queue (async, don't wait for it)
    EmailQueueService.addEmailJob(emailJob.id, data.scheduledAt).catch(e => console.error('Queue error:', e));

    res.json({ success: true, emailJobId: emailJob.id });
  } catch (error) {
    console.error('Schedule error:', error);
    res.status(500).json({ error: 'Failed to schedule email' });
  }
});

router.get('/scheduled', async (req, res) => {
  try {
    const emails = await EmailService.getScheduledEmails();
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scheduled emails' });
  }
});

router.get('/sent', async (req, res) => {
  try {
    const emails = await EmailService.getSentEmails();
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sent emails' });
  }
});

export default router;

// Debug route to inspect in-memory store (for local demo)
router.get('/debug/inmemory', async (req, res) => {
  try {
    const jobs = debugListInMemoryJobs();
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: 'failed' });
  }
});
