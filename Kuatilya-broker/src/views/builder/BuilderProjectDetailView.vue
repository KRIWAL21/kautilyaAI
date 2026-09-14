<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProjectStore } from "@/store/ProjectStore";
import { useAuthStore } from "@/store/AuthStore";
import { toast } from "vue-sonner";
import type { ProjectCollateral } from "@/types/project";
import MicrositeShareCard from "@/sections/ProjectSections/MicrositeShareCard.vue";

const route = useRoute();
const router = useRouter();
const store = useProjectStore();
const authStore = useAuthStore();
const brokerId = computed(() => authStore.userId || localStorage.getItem("userId") || "dummy");

const projectId = route.params.id as string;
const showUploadModal = ref(false);
const uploadForm = ref({ file: null as File | null, title: "", previewUrl: "" });
const isUploading = ref(false);
const removingId = ref<string | null>(null);

onMounted(async () => {
  await store.fetchProject(projectId);
});

const project = computed(() => store.currentProject);

function openEditor(col: ProjectCollateral) {
  router.push({ name: "builder-collateral-editor", params: { id: projectId, colId: col._id } });
}

async function submitUpload() {
  if (!uploadForm.value.file) { toast.error("An image file is required"); return; }
  isUploading.value = true;
  try {
    const formData = new FormData();
    formData.append("file", uploadForm.value.file);
    if (uploadForm.value.title.trim()) {
      formData.append("title", uploadForm.value.title.trim());
    } else {
      formData.append("title", "Marketing Collateral");
    }

    await store.addCollateral(projectId, formData);
    toast.success("Collateral added! Now open the editor to place spots.");
    showUploadModal.value = false;
    
    // Revoke object URL to prevent memory leaks
    if (uploadForm.value.previewUrl) {
      URL.revokeObjectURL(uploadForm.value.previewUrl);
    }
    uploadForm.value = { file: null, title: "", previewUrl: "" };
  } catch {
    toast.error("Failed to add collateral");
  } finally {
    isUploading.value = false;
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    uploadForm.value.file = file;
    
    if (uploadForm.value.previewUrl) {
      URL.revokeObjectURL(uploadForm.value.previewUrl);
    }
    uploadForm.value.previewUrl = URL.createObjectURL(file);
  }
}

async function removeCollateral(colId: string) {
  if (!confirm("Remove this collateral image?")) return;
  removingId.value = colId;
  try {
    await store.removeCollateral(projectId, colId);
    toast.success("Removed");
  } catch {
    toast.error("Failed to remove");
  } finally {
    removingId.value = null;
  }
}

function fmt(n?: number): string {
  if (!n) return "—";
  if (n >= 1e7) return "?" + (n / 1e7).toFixed(2) + " Cr";
  if (n >= 1e5) return "?" + (n / 1e5).toFixed(2) + " L";
  return "?" + n.toLocaleString("en-IN");
}

const statusColor: Record<string, string> = {
  "Under Construction": "bg-yellow-500/15 text-yellow-600",
  "Ready to Move": "bg-green-500/15 text-green-600",
  "Upcoming": "bg-blue-500/15 text-blue-600",
};
</script>

<template>
  <div class="space-y-6 p-6">
    <!-- Back + header -->
    <div class="flex items-center gap-4">
      <button @click="router.push({ name: 'builder-projects' })" class="rounded-lg border p-2 hover:bg-muted transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <div v-if="project" class="flex-1">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold tracking-tight">{{ project.projectName }}</h1>
          <span v-if="project.projectStatus" class="rounded-full px-2 py-0.5 text-xs font-medium" :class="statusColor[project.projectStatus] || 'bg-muted text-muted-foreground'">
            {{ project.projectStatus }}
          </span>
        </div>
        <p class="text-sm text-muted-foreground">{{ [project.city, project.state].filter(Boolean).join(", ") }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading && !project" class="flex justify-center py-20">
      <svg class="h-8 w-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/></svg>
    </div>

    <template v-else-if="project">
      <!-- ── Personalised Microsite Share Card ────────────────── -->
      <MicrositeShareCard
        :project-id="projectId"
        :user-id="brokerId"
        :project-name="project.projectName"
      />

      <!-- Info grid -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-xl border bg-card p-4">
          <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Type</p>
          <p class="mt-1 font-semibold">{{ project.projectType || "—" }}</p>
        </div>
        <div class="rounded-xl border bg-card p-4">
          <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Min Price</p>
          <p class="mt-1 font-semibold text-primary">{{ fmt(project.minPrice) }}</p>
        </div>
        <div class="rounded-xl border bg-card p-4">
          <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Max Price</p>
          <p class="mt-1 font-semibold text-primary">{{ fmt(project.maxPrice) }}</p>
        </div>
        <div class="rounded-xl border bg-card p-4">
          <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">RERA</p>
          <p class="mt-1 font-mono text-sm">{{ project.reraNo || "—" }}</p>
        </div>
      </div>

      <!-- Description -->
      <div v-if="project.description" class="rounded-xl border bg-card p-5">
        <h2 class="font-semibold">About the Project</h2>
        <p class="mt-2 text-sm text-muted-foreground leading-relaxed">{{ project.description }}</p>
      </div>

      <!-- Amenities -->
      <div v-if="project.amenities?.length" class="rounded-xl border bg-card p-5">
        <h2 class="mb-3 font-semibold">Amenities ({{ project.amenities.length }})</h2>
        <div class="flex flex-wrap gap-2">
          <span v-for="a in project.amenities" :key="a" class="rounded-full border bg-muted/50 px-3 py-1 text-sm">{{ a }}</span>
        </div>
      </div>

      <!-- Location map preview -->
      <div v-if="project.coordinates?.lat" class="rounded-xl border bg-card p-5">
        <h2 class="mb-3 font-semibold">Location</h2>
        <p class="text-sm text-muted-foreground mb-3">{{ [project.address, project.city, project.state].filter(Boolean).join(", ") }}</p>
        <a
          :href="`https://www.openstreetmap.org/?mlat=${project.coordinates.lat}&mlon=${project.coordinates.lng}&zoom=15`"
          target="_blank"
          class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          View on OpenStreetMap
          <span class="font-mono text-xs text-muted-foreground">({{ project.coordinates.lat.toFixed(4) }}, {{ project.coordinates.lng.toFixed(4) }})</span>
        </a>
      </div>

      <!-- ------------------------------------------------------
           MARKETING COLLATERAL SECTION (separate from AI content)
           ------------------------------------------------------ -->
      <div class="rounded-xl border bg-card">
        <div class="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 class="font-semibold">Marketing Collateral</h2>
            <p class="text-xs text-muted-foreground mt-0.5">Upload images and define spots where broker name/number will be stamped. Separate from AI-generated content.</p>
          </div>
          <button
            @click="showUploadModal = true"
            class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            Add Collateral
          </button>
        </div>

        <div v-if="!project.marketingCollateralSpots?.length" class="flex flex-col items-center justify-center px-4 py-12 text-center">
          <div class="mb-3 rounded-full bg-muted p-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
          <p class="font-medium">No collateral images uploaded yet</p>
          <p class="mt-1 text-sm text-muted-foreground">Upload a marketing image to get started with the spot editor</p>
        </div>

        <div v-else class="grid grid-cols-1 gap-0 divide-y">
          <div
            v-for="col in project.marketingCollateralSpots"
            :key="col._id"
            class="flex items-center gap-4 p-4 hover:bg-muted/20 transition"
          >
            <!-- Thumbnail -->
            <div class="h-16 w-24 shrink-0 overflow-hidden rounded-lg border bg-muted">
              <img :src="col.imageUrl" alt="" class="h-full w-full object-cover" />
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0 space-y-1">
              <p class="font-medium truncate">{{ col.title || "Marketing Collateral" }}</p>
              <div class="flex items-center gap-2 text-xs text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {{ col.uploadedAt ? new Date(col.uploadedAt).toLocaleDateString('en-IN') : "—" }}
                <span class="rounded-full bg-primary/10 px-2 py-0.5 text-primary font-medium">{{ col.spots?.length || 0 }} spots</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 shrink-0">
              <button
                @click="openEditor(col)"
                class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit Spots
              </button>
              <button
                @click="removeCollateral(col._id)"
                :disabled="removingId === col._id"
                class="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/5 transition disabled:opacity-50"
              >Remove</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Upload Modal -->
    <Teleport to="body">
      <div v-if="showUploadModal" class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <div class="w-full max-w-md rounded-2xl border bg-card shadow-2xl">
          <div class="flex items-center justify-between border-b px-6 py-4">
            <h3 class="font-semibold">Add Marketing Collateral</h3>
            <button @click="showUploadModal = false" class="rounded-lg p-1.5 hover:bg-muted"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
          </div>
          <div class="space-y-4 p-6">
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Select Image <span class="text-destructive">*</span></label>
              <input type="file" accept="image/*" @change="handleFileSelect" class="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
              <p class="text-xs text-muted-foreground">Select a file from your device to upload.</p>
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Label / Title</label>
              <input v-model="uploadForm.title" placeholder="e.g. Main Banner, WhatsApp Flyer..." class="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div v-if="uploadForm.previewUrl" class="overflow-hidden rounded-lg border">
              <img :src="uploadForm.previewUrl" alt="Preview" class="h-32 w-full object-cover" @error="($event.target as HTMLImageElement).style.display='none'" />
            </div>
          </div>
          <div class="flex gap-3 border-t px-6 py-4">
            <button @click="showUploadModal = false" class="flex-1 rounded-lg border py-2 text-sm hover:bg-muted transition">Cancel</button>
            <button @click="submitUpload" :disabled="isUploading || !uploadForm.file" class="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50">
              {{ isUploading ? "Adding..." : "Add & Open Editor" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
