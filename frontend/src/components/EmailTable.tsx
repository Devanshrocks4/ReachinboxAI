'use client';

interface Email {
  id: string;
  subject: string;
  recipients: string[];
  scheduledAt: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  sentAt?: string;
}

interface EmailTableProps {
  emails: Email[];
  type: 'scheduled' | 'sent';
}

export default function EmailTable({ emails, type }: EmailTableProps) {
  if (emails.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No {type} emails found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Recipients
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subject
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {type === 'scheduled' ? 'Scheduled At' : 'Sent At'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {emails.map((email) => (
            <tr key={email.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {email.recipients.join(', ')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {email.subject}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {type === 'scheduled'
                  ? new Date(email.scheduledAt).toLocaleString()
                  : email.sentAt
                    ? new Date(email.sentAt).toLocaleString()
                    : 'N/A'
                }
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  email.status === 'SENT'
                    ? 'bg-green-100 text-green-800'
                    : email.status === 'FAILED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {email.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
