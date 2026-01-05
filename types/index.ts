export interface User {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
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
  userId: string;
  eventTypeId: string;
  user: User;
  eventType: EventType;
  createdAt: string;
  updatedAt: string;
}

