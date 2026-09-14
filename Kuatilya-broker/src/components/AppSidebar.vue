<script setup lang="ts">
import {
  IconChartBar,
  IconCalendarEvent,
  IconDashboard,
  IconFolder,
  IconInnerShadowTop,
  IconListDetails,
  IconMapPin,
  IconMail,
  IconHome,
  IconNetwork,
  IconWallet,
  IconSchool,
  IconBell,
  IconPhoneCall,
  IconBuilding,
  IconSearch,
} from "@tabler/icons-vue"
import { BookOpenCheck, Brain, Headset, UsersRound, Globe } from "lucide-vue-next"
import NavMain from '@/components/NavMain.vue'
import NavUser from '@/components/NavUser.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useAuthStore } from "@/store/AuthStore"
import { computed } from "vue"

const authStore = useAuthStore()

const user = {
  name: "User",
  email: "",
  avatar: "",
}

// ── Nav items per role ───────────────────────────────────────────
const brokerNavGroups = [
  {
    label: "Core CRM",
    items: [
      { title: "Dashboard", url: "/", icon: IconDashboard },
      { title: "Leads", url: "/leads", icon: IconListDetails },
      { title: "Follow Ups", url: "/follow-up", icon: IconPhoneCall },
      { title: "Tasks", url: "/tasks", icon: BookOpenCheck },
      { title: "Reminders", url: "/reminders", icon: IconBell },
    ]
  },
  {
    label: "Marketing & Growth",
    items: [
      {
        title: "Marketing",
        url: "",
        icon: IconChartBar,
        children: [
          { title: "PPT Generation", url: "/marketing/ppt" },
          { title: "Image Generation", url: "/marketing/image" },
          { title: "Video Generation", url: "/marketing/video" },
        ],
      },
      { title: "Personalised Microsite", url: "/my-microsite", icon: Globe },
      { title: "My Collateral", url: "/my-collateral", icon: IconFolder },
      { title: "Invitations", url: "/invitations", icon: IconMail },
      { title: "Events", url: "/events", icon: IconCalendarEvent },
    ]
  },
  {
    label: "Sales & Properties",
    items: [
      { title: "Properties", url: "/properties", icon: IconHome },
      { title: "Site Visits", url: "/site-visits", icon: IconMapPin },
      { title: "Projects", url: "/projects", icon: IconFolder },
      { title: "Group Buy", url: "/group-buy", icon: UsersRound },
    ]
  },
  {
    label: "Team & Network",
    items: [
      { title: "Team", url: "/team", icon: UsersRound },
      { title: "Broker Network", url: "/broker-network", icon: IconNetwork },
    ]
  },
  {
    label: "AI & Productivity",
    items: [
      { title: "AI", url: "/ai", icon: Brain },
      { title: "Passbook", url: "/passbook", icon: IconWallet },
      { title: "Training", url: "/training", icon: IconSchool },
    ]
  },
  {
    label: "Support",
    items: [
      {
        title: "Customer Support",
        url: "/customer-support",
        icon: Headset,
        children: [
          { title: "Terms and Conditions", url: "/support/terms" },
        ],
      },
    ]
  }
]

const builderNavGroups = [
  {
    label: "My Portfolio",
    items: [
      { title: "Dashboard", url: "/builder", icon: IconDashboard },
      { title: "My Properties", url: "/builder/properties", icon: IconBuilding },
      { title: "Projects", url: "/builder/projects", icon: IconFolder },
      { title: "Site Visit Requests", url: "/builder/inquiries", icon: IconMapPin },
    ]
  },
  {
    label: "Account",
    items: [
      { title: "Profile", url: "/profile", icon: IconHome },
    ]
  }
]

const clientNavGroups = [
  {
    label: "Discover",
    items: [
      { title: "Dashboard", url: "/client", icon: IconDashboard },
      { title: "Browse Properties", url: "/client/search", icon: IconSearch },
      { title: "My Site Visits", url: "/client/site-visits", icon: IconMapPin },
    ]
  },
  {
    label: "Account",
    items: [
      { title: "Profile", url: "/profile", icon: IconHome },
    ]
  }
]

const navGroups = computed(() => {
  if (authStore.isBuilder) return builderNavGroups
  if (authStore.isClient) return clientNavGroups
  return brokerNavGroups
})

const portalTitle = computed(() => {
  if (authStore.isBuilder) return "Builder Portal"
  if (authStore.isClient) return "Client Portal"
  return "Kautilya AI"
})
</script>

<template>
  <Sidebar collapsible="offcanvas">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            as-child
            class="data-[slot=sidebar-menu-button]:p-1.5!"
          >
            <a href="#">
              <IconInnerShadowTop class="size-5!" />
              <span class="text-base font-semibold">{{ portalTitle }}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <NavMain v-for="(group, index) in navGroups" :key="index" :label="group.label" :items="group.items" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="user" />
    </SidebarFooter>
  </Sidebar>
</template>

