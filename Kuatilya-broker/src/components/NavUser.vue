<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useProfileStore } from "@/store/ProfileStore";
import { useNotificationStore } from "@/store/NotificationStore";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/AuthStore";
import { io, type Socket } from "socket.io-client";
import {
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-vue";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { File } from "lucide-vue-next";
import { BASE_URL, tokenStorage } from "@/request/request";

interface User {
  name: string;
  email: string;
  avatar: string;
}

const profileStore = useProfileStore()
const {profileData} = storeToRefs(profileStore)
const notificationStore = useNotificationStore()
const {
  notifications,
  unreadCount,
  isLoading: isNotificationLoading,
  errorMessage: notificationError,
} = storeToRefs(notificationStore)
const showUnreadOnly = ref(false)

let notificationPollTimer: number | null = null
let notificationSocket: Socket | null = null
let notificationRoom: string | null = null

const resolveBrokerId = () => {
  const profileId = String(profileData.value?._id ?? "").trim()
  if (profileId) return profileId

  const stored = tokenStorage.getUserId()
  if (!stored) return ""

  try {
    const parsed = JSON.parse(stored)
    return String(parsed?._id ?? parsed?.id ?? "").trim()
  } catch {
    return String(stored).trim()
  }
}

const handleSocketNotification = () => {
  void notificationStore.fetchNotifications(true, showUnreadOnly.value)
}

const connectNotificationSocket = () => {
  const brokerId = resolveBrokerId()
  if (!brokerId) return

  if (!notificationSocket) {
    notificationSocket = io(BASE_URL, {
      transports: ["websocket"],
      withCredentials: true,
    })
  }

  const nextRoom = `user:${brokerId}`

  if (notificationRoom && notificationRoom !== nextRoom) {
    notificationSocket.emit("leaveRoom", { room: notificationRoom })
  }

  notificationRoom = nextRoom
  notificationSocket.emit("joinRoom", { room: nextRoom })
  notificationSocket.off("notification", handleSocketNotification)
  notificationSocket.on("notification", handleSocketNotification)
}

onMounted(async() => {
  await Promise.all([
    profileStore.getProfileData(),
    notificationStore.fetchNotifications(false, showUnreadOnly.value),
  ])

  connectNotificationSocket()

  notificationPollTimer = window.setInterval(() => {
    void notificationStore.fetchNotifications(true, showUnreadOnly.value)
  }, 60000)
})

onUnmounted(() => {
  if (notificationPollTimer) {
    window.clearInterval(notificationPollTimer)
  }

  if (notificationSocket) {
    if (notificationRoom) {
      notificationSocket.emit("leaveRoom", { room: notificationRoom })
    }
    notificationSocket.off("notification", handleSocketNotification)
    notificationSocket.disconnect()
    notificationSocket = null
    notificationRoom = null
  }
})

defineProps<{
  user: User;
}>();

const { isMobile } = useSidebar();

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = () => {
  // Clear ALL possible localStorage keys (old + new naming)
  authStore.logout();
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("userData");
  // Use router.push (not window.location.href) to avoid hard reload flicker
  router.push("/auth/login");
};

const markNotificationRead = async (notificationId: string) => {
  await notificationStore.markNotificationAsRead(notificationId)
}

const markAllNotificationsRead = async () => {
  await notificationStore.markAllNotificationsAsRead()
}

const toggleUnreadOnly = async () => {
  showUnreadOnly.value = !showUnreadOnly.value
  await notificationStore.fetchNotifications(true, showUnreadOnly.value)
}

const formatNotificationTime = (value?: string) => {
  if (!value) return "Just now"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Just now"

  const diffMs = Date.now() - date.getTime()
  if (diffMs < 60 * 1000) return "Just now"

  const diffMinutes = Math.floor(diffMs / (60 * 1000))
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString()
}
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton size="default" class="justify-start">
            <div class="relative">
              <IconNotification class="size-4" />
              <span
                v-if="unreadCount > 0"
                class="absolute -right-2 -top-2 inline-flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground"
              >
                {{ unreadCount > 9 ? "9+" : unreadCount }}
              </span>
            </div>
            <span>Notifications</span>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-80 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          :side-offset="4"
          align="end"
        >
          <DropdownMenuLabel class="flex items-center justify-between gap-2">
            <span>Notifications</span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="text-xs font-medium text-muted-foreground"
                @click.stop="toggleUnreadOnly"
              >
                {{ showUnreadOnly ? "Show all" : "Unread only" }}
              </button>
              <button
                type="button"
                class="text-xs font-medium text-primary disabled:opacity-50"
                :disabled="unreadCount === 0"
                @click.stop="markAllNotificationsRead"
              >
                Mark all read
              </button>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <template v-if="isNotificationLoading && notifications.length === 0">
            <DropdownMenuItem disabled>
              Loading notifications...
            </DropdownMenuItem>
          </template>

          <template v-else-if="notificationError && notifications.length === 0">
            <DropdownMenuItem disabled>
              {{ notificationError }}
            </DropdownMenuItem>
          </template>

          <template v-else-if="notifications.length === 0">
            <DropdownMenuItem disabled>
              No notifications yet
            </DropdownMenuItem>
          </template>

          <template v-else>
            <DropdownMenuItem
              v-for="notification in notifications"
              :key="notification._id"
              class="flex flex-col items-start gap-1 whitespace-normal py-2"
              :class="!notification.isRead ? 'bg-muted/40' : ''"
              @click="markNotificationRead(notification._id)"
            >
              <div class="flex w-full items-start justify-between gap-2">
                <p class="text-sm font-medium leading-tight">
                  {{ notification.title || "Notification" }}
                </p>
                <span class="whitespace-nowrap text-[10px] text-muted-foreground">
                  {{ formatNotificationTime(notification.createdAt || notification.scheduledAt) }}
                </span>
              </div>
              <p class="text-xs leading-snug text-muted-foreground">
                {{ notification.message || "You have a new notification." }}
              </p>
            </DropdownMenuItem>
          </template>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>

    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
          
            <Avatar class="h-8 w-8 rounded-lg grayscale">
              <!-- <AvatarImage :src="profileData?." :alt="user.name" /> -->
              <AvatarFallback class="rounded-full">{{ profileData?.name?.charAt(0).toUpperCase() }}</AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-medium">{{ profileData?.name }}</span>
              <span class="text-muted-foreground truncate text-xs">
                {{ profileData?.email }}
              </span>
            </div>
            <IconDotsVertical class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-(--reka-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          :side-offset="4"
          align="end"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar class="h-8 w-8 rounded-lg">
                <!-- <AvatarImage :src="user.avatar" :alt="user.name" /> -->
                <AvatarFallback class="rounded-full">{{ profileData?.name?.charAt(0).toUpperCase() }}</AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-medium">{{ profileData?.name }}</span>
                <span class="text-muted-foreground truncate text-xs">
                {{ profileData?.email }}
              </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <router-link to="/profile">
              <DropdownMenuItem>
                <IconUserCircle />
                Account
              </DropdownMenuItem>
            </router-link>
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <router-link to="/privacy-policy">
              <DropdownMenuItem>
                <File />
                Privacy Policy
              </DropdownMenuItem>
            </router-link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="handleLogout">
            <IconLogout />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
