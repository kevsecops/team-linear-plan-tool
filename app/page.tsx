'use client';

import { useState } from 'react';
import Calendar from './components/Calendar';

export default function Home() {
  const [year, setYear] = useState(2026);

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="max-w-full mx-auto">
        <div className="mb-4 flex items-center gap-4">
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
        <Calendar year={year} />
      </div>
    </main>
  );
}

