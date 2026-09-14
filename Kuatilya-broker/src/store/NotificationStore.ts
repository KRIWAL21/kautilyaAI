import { defineStore } from "pinia";
import { ref } from "vue";
import { makeRequest } from "@/request/request";
import endpoints from "@/request/endpoints";

export interface BrokerNotification {
  _id: string;
  title?: string;
  message?: string;
  category?: string;
  isRead?: boolean;
  createdAt?: string;
  scheduledAt?: string;
}

interface NotificationListPayload {
  notifications?: BrokerNotification[];
  unreadCount?: number;
}

interface NotificationListResponse {
  data?: NotificationListPayload;
}

export const useNotificationStore = defineStore("notification", () => {
  const notifications = ref<BrokerNotification[]>([]);
  const unreadCount = ref(0);
  const isLoading = ref(false);
  const errorMessage = ref<string | null>(null);
  const currentUnreadOnly = ref(false);

  const fetchNotifications = async (
    silent = false,
    unreadOnly = currentUnreadOnly.value,
  ) => {
    try {
      if (!silent) {
        isLoading.value = true;
      }

      currentUnreadOnly.value = unreadOnly;

      const response = (await makeRequest(
        endpoints.notifications,
        "GET",
        {},
        {},
        {
          pageSize: 20,
          pageNumber: 1,
          unreadOnly: unreadOnly ? "true" : "false",
        },
      )) as NotificationListResponse;

      const payload = response?.data ?? {};
      const list = Array.isArray(payload.notifications)
        ? payload.notifications
        : [];
      notifications.value = unreadOnly
        ? list.filter((item) => !item.isRead)
        : list;
      unreadCount.value = Number(payload.unreadCount ?? 0);
      errorMessage.value = null;
    } catch (error) {
      console.error("Error fetching notifications", error);
      errorMessage.value = "Failed to load notifications";
    } finally {
      if (!silent) {
        isLoading.value = false;
      }
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    if (!notificationId) return;

    const current = notifications.value.find(
      (item) => item._id === notificationId,
    );

    if (current?.isRead) return;

    notifications.value = currentUnreadOnly.value
      ? notifications.value.filter((item) => item._id !== notificationId)
      : notifications.value.map((item) =>
          item._id === notificationId ? { ...item, isRead: true } : item,
        );
    unreadCount.value = Math.max(0, unreadCount.value - 1);

    try {
      await makeRequest(
        `${endpoints.notifications}/${notificationId}/read`,
        "PATCH",
      );
    } catch (error) {
      console.error("Error marking notification as read", error);
      await fetchNotifications(true, currentUnreadOnly.value);
    }
  };

  const markAllNotificationsAsRead = async () => {
    const hasUnread = unreadCount.value > 0;
    if (!hasUnread) return;

    notifications.value = currentUnreadOnly.value
      ? []
      : notifications.value.map((item) => ({
          ...item,
          isRead: true,
        }));
    unreadCount.value = 0;

    try {
      await makeRequest(endpoints.notificationsReadAll, "PATCH");
    } catch (error) {
      console.error("Error marking all notifications as read", error);
      await fetchNotifications(true, currentUnreadOnly.value);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    errorMessage,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };
});
