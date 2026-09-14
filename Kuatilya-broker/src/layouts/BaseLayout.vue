<script lang="ts">
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'
export const iframeHeight = "800px";
export const description =
  "A dashboard with sidebar, data table, and analytics cards.";
</script>

<script setup lang="ts">
import AppSidebar from "@/components/AppSidebar.vue";
import SiteHeader from "@/components/SiteHeader.vue";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { RouterView, useRoute } from "vue-router";
const route = useRoute();
</script>

<template>
  <SidebarProvider
    :style="{
      '--sidebar-width': 'calc(var(--spacing) * 72)',
      '--header-height': 'calc(var(--spacing) * 12)',
    }"
  >
    <AppSidebar varient="inset" />
    <SidebarInset>
      <!-- Main area MUST be flex-1 -->
      <div class="flex flex-1 flex-col w-full border">
        <!-- Header -->
        <SiteHeader />

        <div class="flex flex-1 flex-col">
          <div class="@container/main flex flex-1 flex-col gap-2">
            <div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <RouterView :key="route.fullPath" />
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
    <Toaster position="top-right"/>
  </SidebarProvider>
</template>
