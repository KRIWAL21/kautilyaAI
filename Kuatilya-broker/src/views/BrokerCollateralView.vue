<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from "vue";
import { useProfileStore } from "@/store/ProfileStore";
import { storeToRefs } from "pinia";
import { makeRequest } from "@/request/request";
import type { Project, ProjectCollateral } from "@/types/project";

/* ── stores ──────────────────────────────────────────────── */
const profileStore = useProfileStore();
const { profileData } = storeToRefs(profileStore);

/* ── state ───────────────────────────────────────────────── */
const projects    = ref<Project[]>([]);
const loadingProj = ref(false);

const selectedProject    = ref<Project | null>(null);
const selectedCollateral = ref<ProjectCollateral | null>(null);

const brokerName   = ref("");
const brokerNumber = ref("");

const canvasEl   = ref<HTMLCanvasElement | null>(null);
const previewUrl = ref<string>("");
const rendering  = ref(false);
const imgLoaded  = ref(false);
const imgError   = ref(false);
const hiddenImg  = ref<HTMLImageElement | null>(null);

/* ── boot ────────────────────────────────────────────────── */
onMounted(async () => {
  await profileStore.getProfileData();
  brokerName.value   = (profileData.value as any)?.name  || "";
  brokerNumber.value = (profileData.value as any)?.phone || (profileData.value as any)?.number || "";

  loadingProj.value = true;
  try {
    const res = await makeRequest("/projects/broker", "GET", {}, {}, {}, 0);
    projects.value = (res.data || []).filter((p: Project) => p.marketingCollateralSpots?.length);
  } finally {
    loadingProj.value = false;
  }
});

/* ── computed ────────────────────────────────────────────── */
const collaterals = computed(() => selectedProject.value?.marketingCollateralSpots || []);
const hasSpots    = computed(() => (selectedCollateral.value?.spots?.length ?? 0) > 0);
const canDownload = computed(() => !!previewUrl.value);

/* ── watchers ────────────────────────────────────────────── */
watch(selectedCollateral, () => {
  if (selectedCollateral.value) loadImage();
});

/* ── load source image ───────────────────────────────────── */
function loadImage() {
  const col = selectedCollateral.value;
  if (!col?.imageUrl) return;
  imgLoaded.value  = false;
  imgError.value   = false;
  previewUrl.value = "";

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = col.imageUrl;

  img.onload = async () => {
    imgLoaded.value = true;
    hiddenImg.value = img;
    await renderCanvas();
  };
  img.onerror = () => { imgError.value = true; };
}

/* ── render canvas ───────────────────────────────────────── */
async function renderCanvas() {
  const col = selectedCollateral.value;
  const img = hiddenImg.value;
  if (!col || !img) return;

  rendering.value = true;
  await nextTick();

  const canvas = canvasEl.value!;
  canvas.width  = img.naturalWidth  || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const name   = brokerName.value.trim()   || "Broker Name";
  const number = brokerNumber.value.trim() || "Broker Number";

  for (const spot of (col.spots || [])) {
    const px = (spot.x / 100) * canvas.width;
    const py = (spot.y / 100) * canvas.height;
    const fs = spot.fontSize || 18;
    const fw = spot.fontWeight || "bold";

    const lines: string[] =
      spot.label === "name"   ? [name]   :
      spot.label === "number" ? [number] :
      [name, number];

    ctx.font = `${fw} ${fs}px Inter, sans-serif`;
    const maxW  = lines.reduce((m, l) => Math.max(m, ctx.measureText(l).width), 0);
    const lineH = fs * 1.4;
    const pad   = 10;

    // background
    const alpha = spot.bgOpacity ?? 0.6;
    const hex   = spot.bgColor || "#000000";
    const r     = parseInt(hex.slice(1, 3), 16);
    const g     = parseInt(hex.slice(3, 5), 16);
    const b     = parseInt(hex.slice(5, 7), 16);
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.beginPath();
    ctx.roundRect(px - pad, py - pad, maxW + pad * 2, lineH * lines.length + pad * 2, 6);
    ctx.fill();

    // text
    ctx.fillStyle    = spot.color || "#ffffff";
    ctx.font         = `${fw} ${fs}px Inter, sans-serif`;
    ctx.textBaseline = "top";
    lines.forEach((line, i) => ctx.fillText(line, px, py + i * lineH));
  }

  previewUrl.value = canvas.toDataURL("image/png");
  rendering.value  = false;
}

/* ── download ────────────────────────────────────────────── */
function downloadStamped() {
  if (!previewUrl.value) return;
  const a      = document.createElement("a");
  a.href       = previewUrl.value;
  a.download   = `${selectedProject.value?.projectName || "collateral"}-stamped.png`;
  a.click();
}

/* ── nav helpers ─────────────────────────────────────────── */
function selectProject(p: Project) {
  selectedProject.value    = p;
  selectedCollateral.value = null;
  previewUrl.value         = "";
  imgLoaded.value          = false;
  imgError.value           = false;
}

function selectCollateral(col: ProjectCollateral) {
  selectedCollateral.value = col;
}
</script>

<template>
  <div class="min-h-screen space-y-8 p-6">
    <!-- Header -->
    <div class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Personalised Marketing Material</h1>
      <p class="text-sm text-muted-foreground">
        Pick a project and template, enter your details — download your stamped image instantly.
      </p>
    </div>

    <!-- Step 1 – Project -->
    <section class="space-y-4">
      <div class="flex items-center gap-3">
        <span class="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
        <h2 class="font-semibold">Select a Project</h2>
      </div>

      <div v-if="loadingProj" class="flex justify-center py-10">
        <svg class="h-7 w-7 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
        </svg>
      </div>

      <div v-else-if="!projects.length" class="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
        No projects with marketing collateral available yet.
      </div>

      <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="p in projects"
          :key="p._id"
          type="button"
          class="group relative flex flex-col gap-2 overflow-hidden rounded-xl border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          :class="selectedProject?._id === p._id ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/40'"
          @click="selectProject(p)"
        >
          <div class="h-1 w-full rounded-full bg-gradient-to-r from-primary to-primary/30" />
          <p class="font-semibold leading-snug group-hover:text-primary transition-colors">{{ p.projectName }}</p>
          <p class="text-xs text-muted-foreground">{{ [p.city, p.state].filter(Boolean).join(", ") }}</p>
          <span class="mt-auto inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {{ p.marketingCollateralSpots.length }} template{{ p.marketingCollateralSpots.length !== 1 ? 's' : '' }}
          </span>
          <div v-if="selectedProject?._id === p._id" class="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </button>
      </div>
    </section>

    <!-- Step 2 – Template -->
    <section v-if="selectedProject" class="space-y-4">
      <div class="flex items-center gap-3">
        <span class="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
        <h2 class="font-semibold">Choose a Template</h2>
      </div>

      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <button
          v-for="col in collaterals"
          :key="col._id"
          type="button"
          class="group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          :class="selectedCollateral?._id === col._id ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/40'"
          @click="selectCollateral(col)"
        >
          <img :src="col.imageUrl" :alt="col.title" class="h-32 w-full object-cover" />
          <div class="p-2">
            <p class="truncate text-xs font-medium">{{ col.title || 'Marketing Collateral' }}</p>
            <p class="text-[10px] text-muted-foreground">{{ col.spots?.length || 0 }} spots</p>
          </div>
          <div v-if="selectedCollateral?._id === col._id" class="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </button>
      </div>

      <div v-if="selectedCollateral && !hasSpots" class="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 text-sm text-yellow-600">
        ⚠️ This template has no spots. Ask the builder to add name/number spots first.
      </div>
    </section>

    <!-- Step 3 – Details + Preview -->
    <section v-if="selectedCollateral && hasSpots" class="space-y-4">
      <div class="flex items-center gap-3">
        <span class="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
        <h2 class="font-semibold">Enter Your Details &amp; Download</h2>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Inputs -->
        <div class="space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
          <div class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Your Name</label>
              <input
                v-model="brokerName"
                placeholder="e.g. Rajesh Kumar"
                class="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                @input="previewUrl = ''"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Your Phone Number</label>
              <input
                v-model="brokerNumber"
                placeholder="e.g. 98765 43210"
                class="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                @input="previewUrl = ''"
              />
            </div>
          </div>

          <button
            @click="renderCanvas"
            :disabled="rendering || !imgLoaded"
            class="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20 transition disabled:opacity-50"
          >
            <svg v-if="rendering" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            {{ rendering ? "Generating…" : "Preview Stamped Image" }}
          </button>

          <button
            @click="downloadStamped"
            :disabled="!canDownload || rendering"
            class="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-md shadow-primary/30 hover:bg-primary/90 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download Stamped Image (.png)
          </button>

          <p class="text-[11px] text-center text-muted-foreground">
            🔒 Rendering happens in your browser. No data is uploaded to any server.
          </p>
        </div>

        <!-- Preview -->
        <div class="space-y-3">
          <div class="overflow-hidden rounded-2xl border bg-card shadow-sm min-h-[200px] flex items-center justify-center">
            <div v-if="imgError" class="flex flex-col items-center gap-3 p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p class="text-sm text-destructive font-medium">Failed to load template image</p>
            </div>

            <div v-else-if="!imgLoaded && !previewUrl" class="flex flex-col items-center gap-2 text-muted-foreground p-8">
              <svg class="h-7 w-7 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
              </svg>
              <p class="text-xs">Loading template…</p>
            </div>

            <div v-else-if="imgLoaded && !previewUrl" class="flex flex-col items-center gap-2 text-muted-foreground p-8">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              <p class="text-xs">Click "Preview Stamped Image" to see result</p>
            </div>

            <img
              v-else-if="previewUrl"
              :src="previewUrl"
              alt="Stamped preview"
              class="block h-auto w-full rounded-2xl"
            />
          </div>

          <p v-if="previewUrl" class="text-center text-xs text-green-600 font-medium">
            ✅ Preview ready — your name &amp; number are stamped on the image!
          </p>
        </div>
      </div>
    </section>

    <!-- Hidden canvas for off-screen rendering -->
    <canvas ref="canvasEl" class="hidden" />
  </div>
</template>
