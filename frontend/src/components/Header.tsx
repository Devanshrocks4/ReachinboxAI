'use client';

import { useState, useEffect } from 'react';

export default function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser({
      name: 'Devansh Gupta',
      email: 'guptadevansh52003@gmail.com',
    });
  }, []);

  return (
    <header style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '16px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333' }}>Email Scheduler</h2>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontSize: '14px' }}>
              <p style={{ color: '#333', margin: '0' }}>{user.name}</p>
              <p style={{ color: '#666', margin: '4px 0 0 0' }}>{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
