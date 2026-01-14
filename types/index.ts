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

// PocketBase EventType collection
export interface EventType {
  id: string;
  name: string;
  colorHexCode: string;
  created: string;
  updated: string;
}

// PocketBase Event collection (with expanded relations)
export interface Event {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  userId: string; // PocketBase user ID (relation)
  eventTypeId: string; // PocketBase eventType ID (relation)
  eventType: EventType | null; // Expanded relation from PocketBase
  user: User; // Expanded relation from PocketBase
  created: string;
  updated: string;
  // PocketBase expand object (when relations are expanded)
  expand?: {
    userId?: User;
    eventTypeId?: EventType;
  };
}

