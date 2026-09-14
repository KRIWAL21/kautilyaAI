<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useProjectStore } from "@/store/ProjectStore";
import { useAuthStore } from "@/store/AuthStore";
import { makeRequest } from "@/request/request";
import type { Project } from "@/types/project";
import MicrositeShareCard from "@/sections/ProjectSections/MicrositeShareCard.vue";
import { Globe, Search, ExternalLink, Copy, Check } from "lucide-vue-next";

const store = useProjectStore();
const authStore = useAuthStore();
const brokerId = computed(() => authStore.userId || localStorage.getItem("userId") || "dummy");

const allProjects = ref<Project[]>([]);
const selectedProject = ref<Project | null>(null);
const searchQuery = ref("");
const isLoading = ref(false);
const copiedId = ref<string | null>(null);

onMounted(async () => {
  isLoading.value = true;
  try {
    const res = await makeRequest("/projects/broker", "GET", {}, {}, {}, 0);
    allProjects.value = res.data || [];
    // Select first project by default
    if (allProjects.value.length > 0) {
      selectedProject.value = allProjects.value[0];
    }
  } catch (err) {
    console.error("Failed to load projects", err);
  } finally {
    isLoading.value = false;
  }
});

const filteredProjects = computed(() => {
  if (!searchQuery.value.trim()) return allProjects.value;
  const q = searchQuery.value.toLowerCase();
  return allProjects.value.filter(
    (p) =>
      p.projectName?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q) ||
      p.builderName?.toLowerCase().includes(q)
  );
});

function selectProject(p: Project) {
  selectedProject.value = p;
}

function getMicrositeUrl(projectId: string) {
  return `http://localhost:3000/${projectId}/${brokerId.value}`;
}

async function copyProjectLink(p: Project) {
  const url = getMicrositeUrl(p._id);
  try {
    await navigator.clipboard.writeText(url);
    copiedId.value = p._id;
    setTimeout(() => {
      copiedId.value = null;
    }, 2000);
  } catch {
    const el = document.createElement("textarea");
    el.value = url;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    copiedId.value = p._id;
    setTimeout(() => {
      copiedId.value = null;
    }, 2000);
  }
}
</script>

<template>
  <div class="space-y-6 p-6">
    <!-- Header -->
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-2 border-b">
      <div>
        <div class="flex items-center gap-2">
          <div class="rounded-full bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <Globe class="h-6 w-6" />
          </div>
          <h1 class="text-3xl font-bold tracking-tight text-foreground">Personalised Microsites</h1>
        </div>
        <p class="mt-2 text-base text-muted-foreground max-w-2xl">
          Generate client-ready microsites with your custom branding, contact details, and direct lead attribution. Share these unique links to capture leads directly into your pipeline.
        </p>
      </div>
    </div>

    <!-- Active Featured Share Card -->
    <div v-if="selectedProject">
      <MicrositeShareCard
        :project-id="selectedProject._id"
        :user-id="brokerId"
        :project-name="selectedProject.projectName"
      />
    </div>

    <!-- Project Selector & Quick Copy List -->
    <div class="rounded-2xl border bg-card p-6 space-y-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-lg font-bold">Select a Project</h2>
          <p class="text-xs text-muted-foreground">
            Choose any project below to generate its personalised dynamic URL instantly.
          </p>
        </div>
        <!-- Search bar -->
        <div class="relative w-full sm:w-72">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            v-model="searchQuery"
            placeholder="Search projects by name, city..."
            class="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <svg class="h-8 w-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
        </svg>
      </div>

      <!-- Projects Table/List -->
      <div v-else-if="filteredProjects.length" class="divide-y rounded-xl border overflow-hidden">
        <div
          v-for="p in filteredProjects.slice(0, 20)"
          :key="p._id"
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 transition hover:bg-muted/30"
          :class="selectedProject?._id === p._id ? 'bg-emerald-500/5 border-l-4 border-l-emerald-500' : ''"
        >
          <div class="space-y-1 min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <p class="font-semibold text-sm truncate">{{ p.projectName }}</p>
              <span v-if="selectedProject?._id === p._id" class="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                Selected
              </span>
            </div>
            <p class="text-xs text-muted-foreground truncate">
              {{ [p.builderName, p.city].filter(Boolean).join(" • ") || "Project" }}
            </p>
            <p class="font-mono text-[11px] text-muted-foreground truncate">
              {{ getMicrositeUrl(p._id) }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              @click="selectProject(p)"
              class="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition"
            >
              Select
            </button>
            <button
              type="button"
              @click="copyProjectLink(p)"
              class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition"
              :class="copiedId === p._id ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' : ''"
            >
              <Check v-if="copiedId === p._id" class="h-3.5 w-3.5" />
              <Copy v-else class="h-3.5 w-3.5" />
              {{ copiedId === p._id ? "Copied!" : "Copy Link" }}
            </button>
            <a
              :href="getMicrositeUrl(p._id)"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition"
            >
              <ExternalLink class="h-3.5 w-3.5" />
              Open
            </a>
          </div>
        </div>
      </div>

      <div v-else class="py-12 text-center text-sm text-muted-foreground">
        No projects match "{{ searchQuery }}".
      </div>
    </div>
  </div>
</template>
