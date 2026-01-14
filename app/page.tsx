'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from './components/Calendar';
import AuthGate from './components/AuthGate';
import { getPocketBase } from '@/lib/pocketbase';

export default function Home() {
  const [year, setYear] = useState(2026);
  const router = useRouter();
  const pb = getPocketBase();
  const currentUser = pb.authStore.model;

  const handleLogout = () => {
    pb.authStore.clear();
    // Clear the cookie by setting it to expire
    document.cookie = 'pb_auth=; path=/; max-age=0; SameSite=Lax';
    router.push('/login');
  };

  return (
    <AuthGate>
      <main className="min-h-screen bg-white p-8">
        <div className="w-full mx-auto overflow-x-auto">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Year:</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || 2026)}
                className="px-3 py-1 border border-gray-300 rounded-md w-24"
                min="2000"
                max="2100"
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {currentUser?.email || currentUser?.name}
              </span>
              <button
                onClick={() => router.push('/settings')}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
          <Calendar year={year} />
        </div>
      </main>
    </AuthGate>
  );
}

