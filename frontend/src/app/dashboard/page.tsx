'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ComposeEmail from '@/components/ComposeEmail';
import EmailTable from '@/components/EmailTable';

type Email = {
  id: string;
  subject: string;
  recipients: string[];
  scheduledAt: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  sentAt?: string;
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'scheduled' | 'sent'>('scheduled');
  const [scheduledEmails, setScheduledEmails] = useState<Email[]>([]);
  const [sentEmails, setSentEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const [scheduledRes, sentRes] = await Promise.all([
        fetch('/api/emails/scheduled'),
        fetch('/api/emails/sent')
      ]);

      const scheduled = await scheduledRes.json();
      const sent = await sentRes.json();

      setScheduledEmails(scheduled);
      setSentEmails(sent);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompose = async (data: any) => {
    try {
      const response = await fetch('/api/emails/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        fetchEmails(); // Refresh
      }
    } catch (error) {
      console.error('Failed to schedule email:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Email Scheduler</h1>
        </div>

        <div className="mb-8">
          <ComposeEmail onSubmit={handleCompose} />
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('scheduled')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'scheduled'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Scheduled Emails
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`ml-8 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sent'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sent Emails
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <EmailTable
                emails={activeTab === 'scheduled' ? scheduledEmails : sentEmails}
                type={activeTab}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
