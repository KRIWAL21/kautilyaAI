import { defineStore } from "pinia";
import { ref } from "vue";
import { makeRequest, tokenStorage } from "@/request/request";
import endpoints from "@/request/endpoints";
import type {
  CreateEventRegistrationPayload,
  EventRegistrationRecord,
  EventRegistrationsResponse,
  EventItem,
  EventsResponse,
} from "@/types/events";

const getEventIdFromRegistration = (registration: EventRegistrationRecord): string => {
  if (!registration?.eventId) return "";
  if (typeof registration.eventId === "string") return registration.eventId;
  return registration.eventId._id ?? "";
};

export const useEventStore = defineStore("events", () => {
  const events = ref<EventItem[]>([]);
  const registeredEventIds = ref<string[]>([]);
  const loading = ref(false);
  const registeringEventId = ref<string | null>(null);
  const pageNumber = ref(1);
  const totalPages = ref(0);
  const totalEvents = ref(0);
  const error = ref<string | null>(null);

  const getEvents = async (
    size = 12,
    page = 1,
    filters: {
      searchQuery?: string;
      location?: string;
      venue?: string;
    } = {},
  ) => {
    try {
      loading.value = true;
      error.value = null;

      const params = {
        pageSize: size,
        pageNumber: page,
        sortBy: "date",
        sortOrder: "asc",
        searchQuery: filters.searchQuery || undefined,
        location: filters.location || undefined,
        venue: filters.venue || undefined,
      };

      const response: EventsResponse = await makeRequest(
        endpoints.events,
        "GET",
        {},
        {},
        params,
        0,
      );

      events.value = response?.data?.events ?? [];
      totalPages.value = response?.data?.totalPages ?? 0;
      totalEvents.value = response?.data?.totalEvents ?? 0;
      pageNumber.value = response?.data?.pageNumber ?? page;
    } catch (err: any) {
      console.error("Error fetching events", err);
      events.value = [];
      totalPages.value = 0;
      totalEvents.value = 0;
      error.value =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to load events";
    } finally {
      loading.value = false;
    }
  };

  const getMyRegistrations = async () => {
    try {
      const userId = tokenStorage.getUserId();
      if (!userId) {
        registeredEventIds.value = [];
        return;
      }

      const response: EventRegistrationsResponse = await makeRequest(
        endpoints.eventRegistrations,
        "GET",
        {},
        {},
        {
          pageSize: 300,
          pageNumber: 1,
          userId,
        },
        0,
      );

      const ids = (response?.data?.registrations ?? [])
        .map((registration) => getEventIdFromRegistration(registration))
        .filter((id): id is string => Boolean(id));

      registeredEventIds.value = [...new Set(ids)];
    } catch (err: any) {
      console.error("Error fetching event registrations", err);
      registeredEventIds.value = [];
    }
  };

  const participateInEvent = async (eventId: string) => {
    try {
      const userId = tokenStorage.getUserId();
      if (!userId) {
        throw new Error("Broker user id not found. Please login again.");
      }

      registeringEventId.value = eventId;
      error.value = null;

      const payload: CreateEventRegistrationPayload = {
        eventId,
        userIds: [userId],
      };

      const response = await makeRequest(
        endpoints.eventRegistrations,
        "POST",
        payload,
        {},
        {},
        0,
      );

      if (!registeredEventIds.value.includes(eventId)) {
        registeredEventIds.value = [...registeredEventIds.value, eventId];
      }

      const matchedEvent = events.value.find((event) => event._id === eventId);
      if (matchedEvent) {
        matchedEvent.registeredAttendees =
          (matchedEvent.registeredAttendees ?? 0) + 1;
      }

      return response;
    } catch (err: any) {
      error.value =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to participate in event";
      throw err;
    } finally {
      registeringEventId.value = null;
    }
  };

  return {
    events,
    registeredEventIds,
    loading,
    registeringEventId,
    pageNumber,
    totalPages,
    totalEvents,
    error,
    getEvents,
    getMyRegistrations,
    participateInEvent,
  };
});
