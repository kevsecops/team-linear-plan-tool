'use client';

import { useState, useEffect } from 'react';
import { User, EventType } from '@/types';
import { getPocketBase } from '@/lib/pocketbase';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: Date;
  endDate: Date;
  users: User[];
  eventTypes: EventType[];
  onEventCreated: () => void;
}

export default function EventModal({
  isOpen,
  onClose,
  startDate,
  endDate,
  users,
  eventTypes,
  onEventCreated,
}: EventModalProps) {
  const [title, setTitle] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedEventTypeId, setSelectedEventTypeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pb = getPocketBase();
  const currentUser = pb.authStore.model;

  // Set default user to current logged-in user and refetch event types when modal opens
  useEffect(() => {
    if (isOpen) {
      if (currentUser && !selectedUserId) {
        setSelectedUserId(currentUser.id);
      }
      // Refetch event types to get any newly created ones
      fetch('/api/event-types')
        .then(res => res.json())
        .then(data => {
          // Update parent's eventTypes via a callback if needed
          // For now, we rely on the parent to refetch
        })
        .catch(err => console.error('Error fetching event types:', err));
    }
  }, [isOpen, currentUser, selectedUserId]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !selectedUserId || !selectedEventTypeId) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const pb = getPocketBase();
      const token = pb.authStore.token;
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          title,
          // PocketBase Date fields need full ISO datetime strings
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          userId: selectedUserId,
          eventTypeId: selectedEventTypeId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }

      setTitle('');
      setSelectedUserId('');
      setSelectedEventTypeId('');
      onEventCreated();
    } catch (error: any) {
      console.error('Error creating event:', error);
      const errorMessage = error.message || 'Failed to create event. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create New Event</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <div className="text-sm text-gray-600">
              {formatDate(startDate)} - {formatDate(endDate)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter event title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a user</option>
              {users && users.length > 0 ? (
                users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))
              ) : (
                <option value="" disabled>No users available. Please ensure you are logged in.</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select
              value={selectedEventTypeId}
              onChange={(e) => setSelectedEventTypeId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select an event type</option>
              {eventTypes && eventTypes.length > 0 ? (
                eventTypes.map((eventType) => (
                  <option key={eventType.id} value={eventType.id}>
                    {eventType.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>No event types available. Create one in Settings first.</option>
              )}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

