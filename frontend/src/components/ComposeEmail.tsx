'use client';

import { useState } from 'react';

interface ComposeEmailProps {
  onSubmit: (data: { subject: string; body: string; recipients: string; scheduledAt: string }) => void;
}

export default function ComposeEmail({ onSubmit }: ComposeEmailProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipients, setRecipients] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !body || !recipients || !scheduledAt) {
      alert('Please fill all fields');
      return;
    }
    onSubmit({ subject, body, recipients, scheduledAt });
    setSubject('');
    setBody('');
    setRecipients('');
    setScheduledAt('');
  };

  return (
    <div style={{ background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>Compose New Email</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#555', marginBottom: '6px' }}>Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
            placeholder="Email subject"
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#555', marginBottom: '6px' }}>Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }}
            placeholder="Email content"
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#555', marginBottom: '6px' }}>Recipients (comma-separated)</label>
          <input
            type="text"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
            placeholder="email1@example.com, email2@example.com"
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#555', marginBottom: '6px' }}>Scheduled At</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
            required
          />
        </div>
        <button
          type="submit"
          style={{ background: '#0066cc', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}
        >
          Schedule Email
        </button>
      </form>
    </div>
  );

