// PocketBase User (from PocketBase collection)
export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatar?: string;
  created: string;
  updated: string;
}

export interface EventType {
  id: string;
  name: string;
  colorHexCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  userId: string; // PocketBase user ID
  eventTypeId: string;
  eventType: EventType;
  createdAt: string;
  updatedAt: string;
  // User details will be fetched from PocketBase when needed
  user?: User;
}

