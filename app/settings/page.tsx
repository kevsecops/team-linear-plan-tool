'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EventType } from '@/types';
import { getPocketBase } from '@/lib/pocketbase';
import AuthGate from '../components/AuthGate';

export default function SettingsPage() {
  const router = useRouter();
  const pb = getPocketBase();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [newEventTypeName, setNewEventTypeName] = useState('');
  const [newEventTypeColor, setNewEventTypeColor] = useState('#FF6B6B');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const fetchEventTypes = async () => {
    try {
      const response = await fetch('/api/event-types');
      const data = await response.json();
      setEventTypes(data);
    } catch (error) {
      console.error('Error fetching event types:', error);
    }
  };

  const handleCreateEventType = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const token = pb.authStore.token;
      const response = await fetch('/api/event-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newEventTypeName,
          colorHexCode: newEventTypeColor,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event type');
      }

      const newEventType = await response.json();
      setEventTypes([...eventTypes, newEventType]);
      setNewEventTypeName('');
      setNewEventTypeColor('#FF6B6B');
      setSuccess('Event type created successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to create event type');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGate>
      <main className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Settings</h1>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Back to Calendar
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Event Types</h2>

            {/* Create New Event Type Form */}
            <form onSubmit={handleCreateEventType} className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Create New Event Type</h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newEventTypeName}
                    onChange={(e) => setNewEventTypeName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Team Meeting"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={newEventTypeColor}
                      onChange={(e) => setNewEventTypeColor(e.target.value)}
                      className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newEventTypeColor}
                      onChange={(e) => setNewEventTypeColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="#FF6B6B"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            </form>

            {/* Existing Event Types List */}
            <div>
              <h3 className="text-lg font-medium mb-4">Existing Event Types</h3>
              {eventTypes.length === 0 ? (
                <p className="text-gray-500">No event types yet. Create one above.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eventTypes.map((eventType) => (
                    <div
                      key={eventType.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                    >
                      <div
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: eventType.colorHexCode }}
                      />
                      <div>
                        <div className="font-medium">{eventType.name}</div>
                        <div className="text-sm text-gray-500">{eventType.colorHexCode}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </AuthGate>
  );
}
