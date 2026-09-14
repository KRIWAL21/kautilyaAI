<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProjectStore } from "@/store/ProjectStore";
import { toast } from "vue-sonner";
import SpotEditor from "@/sections/ProjectSections/SpotEditor.vue";
import type { CollateralSpot } from "@/types/project";

const route = useRoute();
const router = useRouter();
const store = useProjectStore();

const projectId = route.params.id as string;
const colId = route.params.colId as string;

const currentSpots = ref<CollateralSpot[]>([]);
const isSaving = ref(false);

onMounted(async () => {
  if (!store.currentProject || store.currentProject._id !== projectId) {
    await store.fetchProject(projectId);
  }
});

const collateral = computed(() =>
  store.currentProject?.marketingCollateralSpots?.find(c => c._id === colId) ?? null
);

function onSpotsUpdated(spots: CollateralSpot[]) {
  currentSpots.value = spots;
}

async function saveSpots() {
  isSaving.value = true;
  try {
    await store.updateSpots(projectId, colId, { spots: currentSpots.value });
    toast.success(`Saved ${currentSpots.value.length} spot(s) successfully!`);
  } catch {
    toast.error("Failed to save spots");
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div class="space-y-5 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <button @click="router.push({ name: 'builder-project-detail', params: { id: projectId } })" class="rounded-lg border p-2 hover:bg-muted transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h1 class="text-xl font-bold tracking-tight">Spot Editor</h1>
          <p class="text-sm text-muted-foreground">
            {{ collateral?.title || "Marketing Collateral" }} —
            <span class="font-medium text-primary">{{ currentSpots.length }} spots placed</span>
          </p>
        </div>
      </div>
      <button
        @click="saveSpots"
        :disabled="isSaving"
        class="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 active:scale-95 disabled:opacity-50"
      >
        <svg v-if="isSaving" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        {{ isSaving ? "Saving..." : "Save Spots" }}
      </button>
    </div>

    <!-- Info banner -->
    <div class="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
      <svg xmlns="http://www.w3.org/2000/svg" class="mt-0.5 h-4 w-4 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
      <div class="space-y-1 text-muted-foreground">
        <p>Click anywhere on the image to place a spot. Drag spots to reposition them. Use the toolbar to configure label type, font size, text color, and background.</p>
        <p>When a broker requests marketing media, the system will stamp their name/number into these spots automatically.</p>
      </div>
    </div>

    <!-- Loading / missing -->
    <div v-if="store.isLoading" class="flex justify-center py-20">
      <svg class="h-8 w-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/></svg>
    </div>
    <div v-else-if="!collateral" class="rounded-xl border bg-card p-10 text-center text-muted-foreground">
      Collateral not found. It may have been removed.
    </div>

    <!-- Spot Editor component -->
    <div v-else class="rounded-2xl border bg-card p-5 shadow-sm">
      <SpotEditor
        :image-url="collateral.imageUrl"
        :initial-spots="collateral.spots || []"
        @spots-updated="onSpotsUpdated"
      />
    </div>

    <!-- Sticky save bar -->
    <div class="sticky bottom-4 flex justify-end">
      <button
        @click="saveSpots"
        :disabled="isSaving"
        class="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg ring-2 ring-primary/20 transition hover:bg-primary/90 disabled:opacity-50"
      >
        {{ isSaving ? "Saving..." : `Save ${currentSpots.length} Spots` }}
      </button>
    </div>
  </div>
</template>
