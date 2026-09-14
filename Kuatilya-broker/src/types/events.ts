export interface EventCompany {
  _id: string;
  companyName?: string;
  email?: string;
  contactNumber?: string;
  isActive?: boolean;
}

export interface EventItem {
  _id: string;
  name: string;
  location: string;
  date: string;
  time: string;
  venue: string;
  lastDateToRegister: string;
  description?: string;
  maxAttendees?: number;
  registeredAttendees?: number;
  participantsCount?: number;
  isActive?: boolean;
  companyId?: string | EventCompany | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventsListData {
  events: EventItem[];
  totalPages: number;
  totalEvents: number;
  pageSize: number;
  pageNumber: number;
}

export interface EventsResponse {
  status: number;
  message: string;
  data: EventsListData;
}

export interface EventRegistrationRecord {
  _id: string;
  eventId: string | EventItem;
  userIds: Array<string | { _id: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventRegistrationsData {
  registrations: EventRegistrationRecord[];
  totalPages: number;
  totalRegistrations: number;
  pageSize: number;
  pageNumber: number;
}

export interface EventRegistrationsResponse {
  status: number;
  message: string;
  data: EventRegistrationsData;
}

export interface CreateEventRegistrationPayload {
  eventId: string;
  userIds: string[];
}
