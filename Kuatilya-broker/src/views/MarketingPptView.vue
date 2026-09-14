<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import GenerateGammaSection from "@/sections/AiPptSections/GenerateGammaSection.vue";
import PptListSection from "@/sections/AiPptSections/PptListSection.vue";

const route = useRoute();
const router = useRouter();

type Tab = "create" | "list";
const activeTab = ref<Tab>((route.query.tab as Tab) || "create");

// Sync tab with URL query
watch(activeTab, (val) => {
  router.replace({ query: { tab: val } });
});
watch(() => route.query.tab, (val) => {
  if (val === "create" || val === "list") activeTab.value = val;
});
</script>

<template>
  <section class="min-h-screen bg-background px-4 py-6 lg:px-6">
    <!-- Page header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-foreground">AI PPT Generation</h1>
      <p class="text-muted-foreground text-sm mt-1">
        Create and manage Gamma AI-powered presentations for your clients
      </p>
    </div>

    <!-- Tabs -->
    <div class="mb-6 flex rounded-xl border border-border bg-muted p-1 w-fit gap-1">
      <button
        v-for="tab in ([{ key: 'create', label: '✨ Create New' }, { key: 'list', label: '📂 My Presentations' }])"
        :key="tab.key"
        class="px-5 py-2 rounded-lg text-sm font-medium transition-all"
        :class="
          activeTab === tab.key
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        "
        @click="activeTab = tab.key as Tab"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Content -->
    <GenerateGammaSection v-if="activeTab === 'create'" @generated="activeTab = 'list'" />
    <PptListSection v-else />
  </section>
</template>
