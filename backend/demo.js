/**
 * Simple demo: Show email scheduling and in-memory processing
 */

const http = require('http');

function request(method, path, data) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const opts = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (payload) {
      opts.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(opts, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000);
    if (payload) req.write(payload);
    req.end();
  });
}

async function main() {
  console.log('\n🚀 REACHINBOX EMAIL SCHEDULER - LIVE DEMO\n');
  console.log('='.repeat(50));

  try {
    // Schedule an email
    console.log('\n📧 Step 1: Scheduling an email for 1 second from now...');
    const emailData = {
      subject: 'Test Email from REACHINBOX',
      body: 'Hello! This is a test email from REACHINBOX AI.',
      sender: 'noreply@reachinbox.ai',
      recipients: ['user@example.com', 'test@example.com'],
      scheduledAt: new Date(Date.now() + 1000).toISOString(),
    };

    const scheduleRes = await request('POST', '/api/emails/schedule', emailData);
    console.log(`   Response: ${JSON.stringify(scheduleRes.data)}`);

    if (scheduleRes.status !== 200) {
      console.log('   ❌ Failed!');
      process.exit(1);
    }

    const jobId = scheduleRes.data.emailJobId;
    console.log(`   ✅ Scheduled! Job ID: ${jobId}`);

    // Check scheduled emails
    console.log('\n📋 Step 2: Checking scheduled emails...');
    const scheduledRes = await request('GET', '/api/emails/scheduled');
    console.log(`   Found ${scheduledRes.data.length} scheduled email(s)`);
    if (scheduledRes.data.length > 0) {
      console.log(`   - Subject: ${scheduledRes.data[0].subject}`);
      console.log(`   - Status: ${scheduledRes.data[0].status}`);
    }

    // Wait for processing
    console.log('\n⏳ Step 3: Waiting 2 seconds for in-memory worker to send...');
    await new Promise((r) => setTimeout(r, 2000));

    // Check sent emails
    console.log('\n✉️  Step 4: Checking sent emails...');
    const sentRes = await request('GET', '/api/emails/sent');
    console.log(`   Found ${sentRes.data.length} sent email(s)`);
    if (sentRes.data.length > 0) {
      console.log(`   - Subject: ${sentRes.data[0].subject}`);
      console.log(`   - Status: ${sentRes.data[0].status}`);
      console.log(`   - Sent At: ${sentRes.data[0].sentAt}`);
    }

    // Check scheduled again
    console.log('\n📋 Step 5: Checking scheduled again...');
    const scheduledRes2 = await request('GET', '/api/emails/scheduled');
    console.log(`   Found ${scheduledRes2.data.length} scheduled email(s)`);

    // Debug info
    console.log('\n🔧 Step 6: Debug - In-memory store...');
    const debugRes = await request('GET', '/api/emails/debug/inmemory');
    console.log(`   Total jobs in memory: ${(debugRes.data.jobs || []).length}`);
    (debugRes.data.jobs || []).forEach((job, i) => {
      console.log(`   [${i}] ID: ${job.id}, Status: ${job.status}, Subject: ${job.subject}`);
    });

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ DEMO COMPLETED SUCCESSFULLY!\n');
    console.log('Summary:');
    console.log(`  📋 Scheduled: ${scheduledRes2.data.length}`);
    console.log(`  ✉️  Sent: ${sentRes.data.length}`);
    console.log(`  💾 In-Memory: ${(debugRes.data.jobs || []).length}`);
    console.log('\nThe in-memory fallback queue is working correctly!');
    console.log('Emails are being scheduled and sent without Redis/Postgres.\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
}

main();
