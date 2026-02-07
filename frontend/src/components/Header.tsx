'use client';

import { useState, useEffect } from 'react';

export default function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Mock user for now
    setUser({
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://via.placeholder.com/40'
    });
  }, []);

  const handleLogout = () => {
    // Handle logout
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-900">Email Scheduler</h2>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <img
                className="h-8 w-8 rounded-full"
                src={user.avatar}
                alt={user.name}
              />
              <div className="text-sm">
                <p className="text-gray-900">{user.name}</p>
                <p className="text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
