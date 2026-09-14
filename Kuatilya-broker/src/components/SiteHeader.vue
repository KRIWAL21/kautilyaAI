<script setup lang="ts">
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ModeToggle from "./ModeToggle.vue";
import { computed } from "vue";
import { useAuthStore } from "@/store/AuthStore";

const authStore = useAuthStore();

// Show which portal the user is in
const portalLabel = computed(() => {
  if (authStore.isBuilder) return "Builder Portal";
  if (authStore.isClient) return "Client Portal";
  return "Broker Portal";
});
</script>

<template>
  <header
    class="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
  >
    <div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
      <SidebarTrigger class="-ml-1" />

      <Separator
        orientation="vertical"
        class="mx-2 data-[orientation=vertical]:h-4"
      />
      <span class="text-xs text-muted-foreground font-medium">{{ portalLabel }}</span>
      <div class="ml-auto flex items-center gap-2">
        <ModeToggle />
      </div>
    </div>
  </header>
</template>
