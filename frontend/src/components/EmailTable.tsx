'use client';

interface Email {
  id: string;
  subject: string;
  recipients: string[] | string;
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
      <div style={{ textAlign: 'center', padding: '32px 0', color: '#999' }}>
        No {type} emails found.
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return { bg: '#d4edda', color: '#155724' };
      case 'FAILED':
        return { bg: '#f8d7da', color: '#721c24' };
      default:
        return { bg: '#fff3cd', color: '#856404' };
    }
  };

  const recipientsList = (recipients: string[] | string) => {
    if (typeof recipients === 'string') return recipients;
    return Array.isArray(recipients) ? (recipients as any[]).join(', ') : String(recipients);
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f5f5f5' }}>
          <tr>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', borderBottom: '1px solid #ddd', textTransform: 'uppercase' }}>
              Recipients
            </th>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', borderBottom: '1px solid #ddd', textTransform: 'uppercase' }}>
              Subject
            </th>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', borderBottom: '1px solid #ddd', textTransform: 'uppercase' }}>
              {type === 'scheduled' ? 'Scheduled At' : 'Sent At'}
            </th>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', borderBottom: '1px solid #ddd', textTransform: 'uppercase' }}>
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {emails.map((email, idx) => {
            const statusColor = getStatusColor(email.status);
            return (
              <tr key={email.id} style={{ borderBottom: '1px solid #ddd', background: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#333' }}>
                  {recipientsList(email.recipients)}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#333' }}>
                  {email.subject}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#333' }}>
                  {type === 'scheduled'
                    ? new Date(email.scheduledAt).toLocaleString()
                    : email.sentAt
                    ? new Date(email.sentAt).toLocaleString()
                    : 'N/A'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    borderRadius: '4px',
                    background: statusColor.bg,
                    color: statusColor.color,
                  }}>
                    {email.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
