'use client';

import { useState } from 'react';

interface ComposeEmailProps {
  onSubmit: (data: any) => void;
}

export default function ComposeEmail({ onSubmit }: ComposeEmailProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipients, setRecipients] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [delay, setDelay] = useState(1000);
  const [maxEmailsPerHour, setMaxEmailsPerHour] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const recipientList = recipients.split(',').map(email => email.trim());

    onSubmit({
      subject,
      body,
      sender: 'noreply@example.com', // Mock sender
      recipients: recipientList,
      scheduledAt: new Date(scheduledAt),
      delay,
      maxEmailsPerHour,
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Compose New Email</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Recipients (comma-separated)</label>
          <input
            type="text"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            placeholder="email1@example.com, email2@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Scheduled At</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Delay Between Sends (ms)</label>
            <input
              type="number"
              value={delay}
              onChange={(e) => setDelay(Number(e.target.value))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Emails Per Hour</label>
            <input
              type="number"
              value={maxEmailsPerHour}
              onChange={(e) => setMaxEmailsPerHour(Number(e.target.value))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Schedule Email
        </button>
      </form>
    </div>
  );
}
