<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import type { Component } from "vue"
import { useSidebar } from "@/components/ui/sidebar"
import { ChevronDown } from 'lucide-vue-next'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'

interface NavChild {
  title: string
  url: string
  icon?: Component
}

interface NavItem {
  title: string
  url: string
  icon?: Component
  children?: NavChild[]
}

const props = defineProps<{
  label?: string
  items: NavItem[]
}>()

const route = useRoute()
const { isMobile, setOpenMobile } = useSidebar()

// Track open state for each collapsible item
const openItems = ref<Record<string, boolean>>({})

const isActive = (url: string) => {
  if (!url) return false
  // Exact match for root, prefix match for others
  if (url === '/') return route.path === '/'
  return route.path === url || route.path.startsWith(url + '/')
}

const isParentActive = (item: NavItem) => {
  if (item.children) {
    return item.children.some(child => isActive(child.url))
  }
  return isActive(item.url)
}

const toggleItem = (title: string) => {
  openItems.value[title] = !openItems.value[title]
}

const isOpen = (title: string) => {
  return !!openItems.value[title]
}

const handleParentClick = (item: NavItem) => {
  if (item.children) {
    toggleItem(item.title)
  }
}

const closeMobileIfNeeded = () => {
  if (isMobile.value) {
    setOpenMobile(false)
  }
}
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel v-if="label">{{ label }}</SidebarGroupLabel>
    <SidebarGroupContent class="flex flex-col gap-2">
      <SidebarMenu>
        <SidebarMenuItem v-for="item in items" :key="item.title">
          <!-- Collapsible parent item (has children) -->
          <template v-if="item.children">
            <SidebarMenuButton
              :tooltip="item.title"
              :data-state="isParentActive(item) ? 'active' : 'inactive'"
              class="data-[state=active]:bg-white/40 data-[state=active]:text-accent-foreground hover:bg-accent hover:text-accent-foreground data-[state=active]:hover:bg-white/30 cursor-pointer"
              @click="handleParentClick(item)"
            >
              <component :is="item.icon" v-if="item.icon" />
              <span class="flex-1">{{ item.title }}</span>
              <ChevronDown
                class="ml-auto size-4 shrink-0 transition-transform duration-200"
                :class="{ 'rotate-180': isOpen(item.title) }"
              />
            </SidebarMenuButton>
            <!-- Sub-items -->
            <SidebarMenuSub v-if="isOpen(item.title)" class="ml-0 border-l border-sidebar-border pl-2 mt-1">
              <SidebarMenuSubItem v-for="child in item.children" :key="child.title">
                <SidebarMenuSubButton
                  as-child
                  :data-active="isActive(child.url)"
                  class="cursor-pointer data-[active=true]:bg-white/40 data-[active=true]:font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  <RouterLink :to="child.url" @click="closeMobileIfNeeded">
                    <component :is="child.icon" v-if="child.icon" />
                    <span>{{ child.title }}</span>
                  </RouterLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </template>

          <!-- Regular flat item (no children) -->
          <template v-else>
            <SidebarMenuButton
              as-child
              :tooltip="item.title"
              :data-state="isActive(item.url) ? 'active' : 'inactive'"
              class="data-[state=active]:bg-white/40 data-[state=active]:text-accent-foreground hover:bg-accent hover:text-accent-foreground data-[state=active]:hover:bg-white/30 cursor-pointer"
            >
              <RouterLink :to="item.url" @click="closeMobileIfNeeded">
                <component :is="item.icon" v-if="item.icon" />
                <span>{{ item.title }}</span>
              </RouterLink>
            </SidebarMenuButton>
          </template>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
