<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useProjectStore } from "@/store/ProjectStore";
import { useAuthStore } from "@/store/AuthStore";
import { toast } from "vue-sonner";
import type { Project } from "@/types/project";
import MicrositeShareCard from "@/sections/ProjectSections/MicrositeShareCard.vue";
import { Globe, X } from "lucide-vue-next";

const router = useRouter();
const store = useProjectStore();
const authStore = useAuthStore();
const brokerId = computed(() => authStore.userId || localStorage.getItem("userId") || "dummy");
const activeMicrositeProject = ref<Project | null>(null);

function openMicrosite(p: Project) {
  activeMicrositeProject.value = p;
}

onMounted(() => store.fetchBuilderProjects());

const search = ref("");

const filtered = computed(() =>
  store.projects.filter(p =>
    !search.value || p.projectName?.toLowerCase().includes(search.value.toLowerCase()) ||
    p.city?.toLowerCase().includes(search.value.toLowerCase())
  )
);

function goToCreate() { router.push({ name: 'builder-project-create' }) }
function goToDetail(p: Project) { router.push({ name: 'builder-project-detail', params: { id: p._id } }) }

function priceLabel(p: Project) {
  if (!p.minPrice && !p.maxPrice) return "Price on Request";
  if (p.minPrice && p.maxPrice) return `?${fmt(p.minPrice)} – ?${fmt(p.maxPrice)}`;
  if (p.minPrice) return `From ?${fmt(p.minPrice)}`;
  return `Up to ?${fmt(p.maxPrice)}`;
}

function fmt(n: number): string {
  if (n >= 1e7) return (n / 1e7).toFixed(1) + " Cr";
  if (n >= 1e5) return (n / 1e5).toFixed(1) + " L";
  return n.toLocaleString("en-IN");
}

const statusColor: Record<string, string> = {
  "Under Construction": "bg-yellow-500/15 text-yellow-600",
  "Ready to Move": "bg-green-500/15 text-green-600",
  "Upcoming": "bg-blue-500/15 text-blue-600",
};
</script>

<template>
  <div class="space-y-6 p-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">My Projects</h1>
        <p class="mt-1 text-sm text-muted-foreground">Manage your real estate projects and marketing collateral</p>
      </div>
      <button
        @click="goToCreate"
        class="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        New Project
      </button>
    </div>

    <!-- Personalised Microsite Feature Banner -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-5 text-white shadow-sm">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white ring-1 ring-white/30">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
            Live
          </span>
          <span class="text-xs font-bold uppercase tracking-wider text-white/80">Personalised Broker Microsites</span>
        </div>
        <h2 class="text-lg font-bold">Vida Realty &amp; Project Microsites</h2>
        <p class="text-xs text-white/80 max-w-xl">
          Share live project links featuring your own name, phone number, and WhatsApp. Every enquiry is credited directly to you.
        </p>
      </div>
      <router-link
        to="/my-microsite"
        class="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-emerald-800 shadow-md hover:bg-white/90 active:scale-95 transition whitespace-nowrap"
      >
        <Globe class="h-4 w-4 text-emerald-600" />
        Explore Microsites
      </router-link>
    </div>

    <!-- Stats bar -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div class="rounded-xl border bg-card p-4">
        <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</p>
        <p class="mt-1 text-2xl font-bold">{{ store.projects.length }}</p>
      </div>
      <div class="rounded-xl border bg-card p-4">
        <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">With Collateral</p>
        <p class="mt-1 text-2xl font-bold text-primary">{{ store.projects.filter(p => p.marketingCollateralSpots?.length).length }}</p>
      </div>
      <div class="rounded-xl border bg-card p-4">
        <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Under Construction</p>
        <p class="mt-1 text-2xl font-bold text-yellow-500">{{ store.projects.filter(p => p.projectStatus === 'Under Construction').length }}</p>
      </div>
      <div class="rounded-xl border bg-card p-4">
        <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ready to Move</p>
        <p class="mt-1 text-2xl font-bold text-green-500">{{ store.projects.filter(p => p.projectStatus === 'Ready to Move').length }}</p>
      </div>
    </div>

    <!-- Search -->
    <div class="relative max-w-sm">
      <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input v-model="search" placeholder="Search projects..." class="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading" class="flex items-center justify-center py-20">
      <svg class="h-8 w-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/></svg>
    </div>

    <!-- Empty -->
    <div v-else-if="!filtered.length" class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-20 text-center">
      <div class="mb-4 rounded-full bg-primary/10 p-5">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </div>
      <h3 class="text-lg font-semibold">{{ search ? "No projects found" : "No projects yet" }}</h3>
      <p class="mt-1 text-sm text-muted-foreground">{{ search ? "Try different keywords" : "Create your first project to get started" }}</p>
      <button v-if="!search" @click="goToCreate" class="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition">Create Project</button>
    </div>

    <!-- Project grid -->
    <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="project in filtered"
        :key="project._id"
        class="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
        @click="goToDetail(project)"
      >
        <!-- Top accent -->
        <div class="h-1.5 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/30" />

        <div class="flex flex-1 flex-col gap-3 p-5">
          <!-- Name + status -->
          <div class="flex items-start justify-between gap-2">
            <h2 class="text-base font-bold leading-snug group-hover:text-primary transition-colors">{{ project.projectName }}</h2>
            <span v-if="project.projectStatus" class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium" :class="statusColor[project.projectStatus] || 'bg-muted text-muted-foreground'">
              {{ project.projectStatus }}
            </span>
          </div>

          <!-- Location -->
          <div v-if="project.city || project.state" class="flex items-center gap-1.5 text-sm text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            {{ [project.city, project.state].filter(Boolean).join(", ") }}
          </div>

          <!-- Price -->
          <p class="text-sm font-semibold text-primary">{{ priceLabel(project) }}</p>

          <!-- Amenities chips -->
          <div v-if="project.amenities?.length" class="flex flex-wrap gap-1.5">
            <span
              v-for="am in project.amenities.slice(0, 4)"
              :key="am"
              class="rounded-full border bg-muted/50 px-2 py-0.5 text-xs"
            >{{ am }}</span>
            <span v-if="project.amenities.length > 4" class="rounded-full border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
              +{{ project.amenities.length - 4 }} more
            </span>
          </div>

          <!-- Footer -->
          <div class="mt-auto flex items-center justify-between border-t pt-3">
            <button
              type="button"
              @click.stop="openMicrosite(project)"
              class="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/20 transition border border-emerald-500/20"
            >
              <Globe class="h-3.5 w-3.5" />
              Get Microsite
            </button>
            <div class="flex items-center gap-1 text-xs font-medium text-primary">
              Manage
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Microsite Modal -->
    <Teleport to="body">
      <div
        v-if="activeMicrositeProject"
        class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        @click.self="activeMicrositeProject = null"
      >
        <div class="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
          <button
            type="button"
            @click="activeMicrositeProject = null"
            class="absolute right-4 top-4 z-10 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60 transition"
          >
            <X class="h-4 w-4" />
          </button>
          <MicrositeShareCard
            :project-id="activeMicrositeProject._id"
            :user-id="brokerId"
            :project-name="activeMicrositeProject.projectName"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>
