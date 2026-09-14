<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import type { CollateralSpot } from "@/types/project";

interface Props {
  imageUrl: string;
  initialSpots?: CollateralSpot[];
}

const props = withDefaults(defineProps<Props>(), { initialSpots: () => [] });
const emit = defineEmits<{ (e: "spots-updated", spots: CollateralSpot[]): void }>();

const spots = ref<CollateralSpot[]>(props.initialSpots.map(s => ({ ...s })));
const containerEl = ref<HTMLElement | null>(null);
const imgEl = ref<HTMLImageElement | null>(null);
const selectedId = ref<string | null>(null);
const imgLoaded = ref(false);
const imgError = ref(false);

// -- New spot defaults ---------------------------------------
const defaults = reactive({
  label: "both" as "name" | "number" | "both",
  fontSize: 18,
  color: "#ffffff",
  fontWeight: "bold",
  bgColor: "#000000",
  bgOpacity: 0.6,
});

// -- Drag state ----------------------------------------------
let dragging: { id: string; startX: number; startY: number; origX: number; origY: number } | null = null;

function generateId() {
  return `spot_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function getRelativeCoords(e: MouseEvent): { x: number; y: number } | null {
  if (!containerEl.value || !imgEl.value) return null;
  const rect = imgEl.value.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
}

function onImageClick(e: MouseEvent) {
  if (dragging) return;
  const coords = getRelativeCoords(e);
  if (!coords) return;
  const spot: CollateralSpot = {
    id: generateId(),
    x: coords.x,
    y: coords.y,
    label: defaults.label,
    fontSize: defaults.fontSize,
    color: defaults.color,
    fontWeight: defaults.fontWeight,
    bgColor: defaults.bgColor,
    bgOpacity: defaults.bgOpacity,
  };
  spots.value.push(spot);
  selectedId.value = spot.id;
  emit("spots-updated", spots.value);
}

function onSpotMousedown(e: MouseEvent, id: string) {
  e.stopPropagation();
  e.preventDefault();
  const spot = spots.value.find(s => s.id === id);
  if (!spot) return;
  selectedId.value = id;
  dragging = { id, startX: e.clientX, startY: e.clientY, origX: spot.x, origY: spot.y };

  function onMove(me: MouseEvent) {
    if (!dragging || !imgEl.value) return;
    const rect = imgEl.value.getBoundingClientRect();
    const dx = ((me.clientX - dragging.startX) / rect.width) * 100;
    const dy = ((me.clientY - dragging.startY) / rect.height) * 100;
    const target = spots.value.find(s => s.id === dragging!.id);
    if (target) {
      target.x = Math.max(0, Math.min(100, dragging.origX + dx));
      target.y = Math.max(0, Math.min(100, dragging.origY + dy));
    }
  }

  function onUp() {
    dragging = null;
    emit("spots-updated", spots.value);
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  }

  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
}

function deleteSpot(id: string) {
  spots.value = spots.value.filter(s => s.id !== id);
  if (selectedId.value === id) selectedId.value = null;
  emit("spots-updated", spots.value);
}

const selectedSpot = computed(() => spots.value.find(s => s.id === selectedId.value) ?? null);

function labelText(spot: CollateralSpot) {
  if (spot.label === "name") return "Broker Name";
  if (spot.label === "number") return "Broker Number";
  return "Name & Number";
}

// -- Canvas preview & download -------------------------------
const previewCanvas = ref<HTMLCanvasElement | null>(null);
const sampleName = ref("Rajesh Kumar");
const sampleNumber = ref("98765 43210");

async function drawPreview() {
  await nextTick();
  const canvas = previewCanvas.value;
  if (!canvas || !imgEl.value) return;
  const img = imgEl.value;
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  for (const spot of spots.value) {
    const px = (spot.x / 100) * canvas.width;
    const py = (spot.y / 100) * canvas.height;
    const fs = spot.fontSize || 18;
    const lines: string[] =
      spot.label === "name" ? [sampleName.value] :
      spot.label === "number" ? [sampleNumber.value] :
      [sampleName.value, sampleNumber.value];

    ctx.font = `${spot.fontWeight || "bold"} ${fs}px Inter, sans-serif`;
    const maxW = lines.reduce((m, l) => Math.max(m, ctx.measureText(l).width), 0);
    const lineH = fs * 1.4;
    const totalH = lineH * lines.length;
    const pad = 10;

    // Background
    const alpha = spot.bgOpacity ?? 0.6;
    const hex = spot.bgColor || "#000000";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.beginPath();
    ctx.roundRect(px - pad, py - pad, maxW + pad * 2, totalH + pad * 2, 6);
    ctx.fill();

    // Text
    ctx.fillStyle = spot.color || "#ffffff";
    ctx.font = `${spot.fontWeight || "bold"} ${fs}px Inter, sans-serif`;
    ctx.textBaseline = "top";
    lines.forEach((line, i) => ctx.fillText(line, px, py + i * lineH));
  }
}

async function downloadPreview() {
  await drawPreview();
  await nextTick();
  const canvas = previewCanvas.value;
  if (!canvas) return;
  const link = document.createElement("a");
  link.download = "preview-collateral.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}
</script>

<template>
  <div class="flex flex-col gap-6 lg:flex-row">
    <!-- Left: Image Canvas -->
    <div class="flex-1 space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-sm">Click on the image to place a spot</h3>
        <span class="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{{ spots.length }} spots placed</span>
      </div>

      <!-- Spot tool defaults -->
      <div class="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2">
        <div class="flex items-center gap-2">
          <label class="text-xs font-medium text-muted-foreground">Label:</label>
          <select v-model="defaults.label" class="rounded border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="both">Name + Number</option>
            <option value="name">Name only</option>
            <option value="number">Number only</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-xs font-medium text-muted-foreground">Size:</label>
          <input type="range" v-model.number="defaults.fontSize" min="10" max="60" class="w-20 accent-primary" />
          <span class="text-xs">{{ defaults.fontSize }}px</span>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-xs font-medium text-muted-foreground">Text:</label>
          <input type="color" v-model="defaults.color" class="h-6 w-6 cursor-pointer rounded border" />
        </div>
        <div class="flex items-center gap-2">
          <label class="text-xs font-medium text-muted-foreground">BG:</label>
          <input type="color" v-model="defaults.bgColor" class="h-6 w-6 cursor-pointer rounded border" />
          <input type="range" v-model.number="defaults.bgOpacity" min="0" max="1" step="0.05" class="w-16 accent-primary" />
        </div>
      </div>

      <!-- Image area with overlay spots -->
      <div ref="containerEl" class="relative cursor-crosshair overflow-hidden rounded-xl border shadow" @click="onImageClick">
        <img
          ref="imgEl"
          :src="imageUrl"
          crossorigin="anonymous"
          alt="Collateral"
          class="block h-auto w-full select-none"
          :class="{ 'opacity-0 h-0': !imgLoaded && !imgError }"
          draggable="false"
          @load="imgLoaded = true; imgError = false"
          @error="imgError = true; imgLoaded = false"
        />
        <!-- Loading placeholder -->
        <div v-if="!imgLoaded && !imgError" class="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
          <svg class="h-8 w-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/></svg>
          <p class="text-xs">Loading image...</p>
        </div>
        <!-- Error state -->
        <div v-if="imgError" class="flex flex-col items-center justify-center h-48 bg-destructive/5 rounded-lg gap-3 p-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p class="text-xs text-center text-destructive font-medium">Image failed to load.</p>
          <p class="text-[11px] text-center text-muted-foreground break-all">URL: {{ imageUrl }}</p>
          <p class="text-[11px] text-center text-muted-foreground">Make sure the S3 bucket is public and CORS is configured.</p>
        </div>

        <!-- Spot overlays -->
        <div
          v-for="spot in spots"
          :key="spot.id"
          class="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
          :style="{ left: spot.x + '%', top: spot.y + '%' }"
          @mousedown="(e) => onSpotMousedown(e, spot.id)"
        >
          <div
            class="relative select-none rounded px-2 py-1 text-center leading-snug transition-shadow"
            :style="{
              backgroundColor: `rgba(${parseInt(spot.bgColor.slice(1,3),16)}, ${parseInt(spot.bgColor.slice(3,5),16)}, ${parseInt(spot.bgColor.slice(5,7),16)}, ${spot.bgOpacity})`,
              color: spot.color,
              fontSize: spot.fontSize + 'px',
              fontWeight: spot.fontWeight,
              boxShadow: selectedId === spot.id ? '0 0 0 2px hsl(var(--primary))' : 'none',
            }"
          >
            <div>{{ spot.label !== 'number' ? 'Broker Name' : '' }}</div>
            <div v-if="spot.label !== 'name'">{{ spot.label === 'number' ? 'Broker Number' : '9876543210' }}</div>
            <!-- Delete button -->
            <button
              type="button"
              class="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs shadow hover:opacity-90"
              @mousedown.stop @click.stop="deleteSpot(spot.id)"
            >×</button>
          </div>
        </div>
      </div>
      <p class="text-xs text-muted-foreground text-center">Drag spots to reposition. Click × to delete. Spots are saved as % coordinates — they work at any resolution.</p>
    </div>

    <!-- Right: Spot list + Preview -->
    <div class="w-full lg:w-72 space-y-4">
      <!-- Spot list -->
      <div class="rounded-xl border bg-card">
        <div class="border-b px-4 py-3">
          <h3 class="font-semibold text-sm">Placed Spots</h3>
        </div>
        <div class="divide-y max-h-60 overflow-y-auto">
          <div v-if="!spots.length" class="px-4 py-6 text-center text-xs text-muted-foreground">
            No spots yet. Click the image to add one.
          </div>
          <div
            v-for="(spot, i) in spots"
            :key="spot.id"
            class="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition"
            :class="{ 'bg-primary/5': selectedId === spot.id }"
            @click="selectedId = spot.id"
          >
            <div class="space-y-0.5">
              <p class="text-xs font-semibold">Spot {{ i + 1 }} — {{ labelText(spot) }}</p>
              <p class="text-[11px] text-muted-foreground font-mono">x: {{ spot.x.toFixed(1) }}% &nbsp; y: {{ spot.y.toFixed(1) }}%</p>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="h-4 w-4 rounded border" :style="{ backgroundColor: spot.bgColor }"></div>
              <button type="button" @click.stop="deleteSpot(spot.id)" class="text-destructive hover:opacity-80 text-sm font-bold">×</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit selected spot -->
      <div v-if="selectedSpot" class="rounded-xl border bg-card p-4 space-y-3">
        <h3 class="font-semibold text-sm">Edit Selected Spot</h3>
        <div class="space-y-2 text-xs">
          <div class="flex items-center justify-between gap-2">
            <label class="text-muted-foreground">Label</label>
            <select v-model="selectedSpot.label" class="rounded border bg-background px-2 py-1 text-xs focus:outline-none" @change="emit('spots-updated', spots)">
              <option value="both">Name + Number</option>
              <option value="name">Name only</option>
              <option value="number">Number only</option>
            </select>
          </div>
          <div class="flex items-center justify-between gap-2">
            <label class="text-muted-foreground">Font size</label>
            <div class="flex items-center gap-1">
              <input type="range" v-model.number="selectedSpot.fontSize" min="10" max="80" class="w-20 accent-primary" @input="emit('spots-updated', spots)" />
              <span>{{ selectedSpot.fontSize }}px</span>
            </div>
          </div>
          <div class="flex items-center justify-between gap-2">
            <label class="text-muted-foreground">Text color</label>
            <input type="color" v-model="selectedSpot.color" class="h-7 w-10 rounded border cursor-pointer" @input="emit('spots-updated', spots)" />
          </div>
          <div class="flex items-center justify-between gap-2">
            <label class="text-muted-foreground">BG color</label>
            <input type="color" v-model="selectedSpot.bgColor" class="h-7 w-10 rounded border cursor-pointer" @input="emit('spots-updated', spots)" />
          </div>
          <div class="flex items-center justify-between gap-2">
            <label class="text-muted-foreground">BG opacity</label>
            <div class="flex items-center gap-1">
              <input type="range" v-model.number="selectedSpot.bgOpacity" min="0" max="1" step="0.05" class="w-20 accent-primary" @input="emit('spots-updated', spots)" />
              <span>{{ Math.round(selectedSpot.bgOpacity * 100) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview section -->
      <div class="rounded-xl border bg-card p-4 space-y-3">
        <h3 class="font-semibold text-sm">Preview with Sample Info</h3>
        <div class="space-y-2">
          <input v-model="sampleName" placeholder="Broker Name" class="w-full rounded border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
          <input v-model="sampleNumber" placeholder="Broker Number" class="w-full rounded border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <button
          type="button"
          @click="downloadPreview"
          class="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Preview & Download
        </button>
        <canvas ref="previewCanvas" class="hidden" />
      </div>
    </div>
  </div>
</template>
