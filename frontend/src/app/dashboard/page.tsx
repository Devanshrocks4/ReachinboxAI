'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ComposeEmail from '@/components/ComposeEmail';
import EmailTable from '@/components/EmailTable';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

type Email = {
  id: string;
  subject: string;
  recipients: string[] | string;
  scheduledAt: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  sentAt?: string;
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'scheduled' | 'sent'>('scheduled');
  const [scheduledEmails, setScheduledEmails] = useState<Email[]>([]);
  const [sentEmails, setSentEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const [scheduledRes, sentRes] = await Promise.all([
        fetch(`${API_URL}/emails/scheduled`),
        fetch(`${API_URL}/emails/sent`)
      ]);

      const scheduled = await scheduledRes.json();
      const sent = await sentRes.json();

      setScheduledEmails(Array.isArray(scheduled) ? scheduled : []);
      setSentEmails(Array.isArray(sent) ? sent : []);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompose = async (data: { subject: string; body: string; recipients: string; scheduledAt: string }) => {
    try {
      // Debug: show what time is being sent
      const scheduledDate = new Date(data.scheduledAt);
      console.log('Scheduling email for:', data.scheduledAt);
      console.log('ISO string:', scheduledDate.toISOString());
      console.log('Local timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);

      const response = await fetch(`${API_URL}/emails/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: data.subject,
          body: data.body,
          recipients: data.recipients.split(',').map((r: string) => r.trim()),
          // send full ISO time (UTC) so backend stores exact instant
          scheduledAt: new Date(data.scheduledAt).toISOString(),
          sender: 'demo@reachinbox.ai',
        }),
      });

      if (response.ok) {
        alert('Email scheduled successfully!');
        fetchEmails();
      } else {
        alert('Failed to schedule email');
      }
    } catch (error) {
      console.error('Error scheduling email:', error);
      alert('Error scheduling email');
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>Email Scheduler</h1>

        <div style={{ marginBottom: '30px' }}>
          <ComposeEmail onSubmit={handleCompose} />
        </div>

        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ borderBottom: '1px solid #ddd', padding: '0' }}>
            <div style={{ display: 'flex' }}>
              <button
                onClick={() => setActiveTab('scheduled')}
                style={{
                  padding: '12px 20px',
                  border: 'none',
                  borderBottom: activeTab === 'scheduled' ? '3px solid #0066cc' : 'none',
                  background: 'transparent',
                  color: activeTab === 'scheduled' ? '#0066cc' : '#666',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'scheduled' ? '600' : '400',
                  fontSize: '14px',
                }}
              >
                Scheduled ({scheduledEmails.length})
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                style={{
                  padding: '12px 20px',
                  border: 'none',
                  borderBottom: activeTab === 'sent' ? '3px solid #0066cc' : 'none',
                  background: 'transparent',
                  color: activeTab === 'sent' ? '#0066cc' : '#666',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'sent' ? '600' : '400',
                  fontSize: '14px',
                }}
              >
                Sent ({sentEmails.length})
              </button>
            </div>
          </div>

          <div style={{ padding: '20px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
            ) : (
              <EmailTable
                emails={activeTab === 'scheduled' ? scheduledEmails : sentEmails}
                type={activeTab}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
