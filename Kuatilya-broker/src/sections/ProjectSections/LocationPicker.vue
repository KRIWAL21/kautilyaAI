<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue with Vite bundling
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

interface LocationData {
  lat: number;
  lng: number;
  city: string;
  state: string;
  address: string;
}

const props = defineProps<{
  modelValue?: LocationData | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: LocationData): void;
}>();

const mapEl = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
let marker: L.Marker | null = null;

const city = ref(props.modelValue?.city || "");
const state = ref(props.modelValue?.state || "");
const address = ref(props.modelValue?.address || "");
const lat = ref(props.modelValue?.lat || 20.5937);
const lng = ref(props.modelValue?.lng || 78.9629);
const isGeocoding = ref(false);
const geoError = ref("");

// -- Initialize Leaflet --------------------------------------
onMounted(() => {
  if (!mapEl.value) return;
  map = L.map(mapEl.value).setView([lat.value, lng.value], 5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  if (props.modelValue?.lat) {
    placeMarker(lat.value, lng.value);
  }

  map.on("click", (e: L.LeafletMouseEvent) => {
    lat.value = e.latlng.lat;
    lng.value = e.latlng.lng;
    placeMarker(lat.value, lng.value);
    emitLocation();
  });
});

onUnmounted(() => {
  map?.remove();
  map = null;
});

function placeMarker(lt: number, lg: number) {
  if (!map) return;
  if (marker) marker.remove();
  marker = L.marker([lt, lg], { draggable: true }).addTo(map);
  marker.on("dragend", (e: any) => {
    const pos = e.target.getLatLng();
    lat.value = pos.lat;
    lng.value = pos.lng;
    emitLocation();
  });
}

// -- Geocode city + state ------------------------------------
async function geocode() {
  const q = [address.value, city.value, state.value].filter(Boolean).join(", ");
  if (!q) return;
  isGeocoding.value = true;
  geoError.value = "";
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    const data = await res.json();
    if (data.length === 0) {
      geoError.value = "Location not found. Try a different query.";
      return;
    }
    lat.value = parseFloat(data[0].lat);
    lng.value = parseFloat(data[0].lon);
    map?.setView([lat.value, lng.value], 14, { animate: true });
    placeMarker(lat.value, lng.value);
    emitLocation();
  } catch {
    geoError.value = "Geocoding failed. Please try again.";
  } finally {
    isGeocoding.value = false;
  }
}

function emitLocation() {
  emit("update:modelValue", {
    lat: lat.value,
    lng: lng.value,
    city: city.value,
    state: state.value,
    address: address.value,
  });
}

watch([city, state, address], () => emitLocation());
</script>

<template>
  <div class="space-y-4">
    <!-- City / State / Address inputs -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div class="space-y-1">
        <label class="text-sm font-medium">City *</label>
        <input
          v-model="city"
          placeholder="e.g. Raipur"
          class="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium">State *</label>
        <input
          v-model="state"
          placeholder="e.g. Chhattisgarh"
          class="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium">Address / Landmark</label>
        <input
          v-model="address"
          placeholder="e.g. Near Airport Road"
          class="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>

    <!-- Find on map button -->
    <div class="flex items-center gap-3">
      <button
        type="button"
        @click="geocode"
        :disabled="isGeocoding || (!city && !state && !address)"
        class="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
      >
        <svg v-if="!isGeocoding" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <svg v-else class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/></svg>
        {{ isGeocoding ? "Searching..." : "Find on Map" }}
      </button>
      <p class="text-xs text-muted-foreground">Or click directly on the map to pin a location</p>
    </div>

    <p v-if="geoError" class="text-sm text-destructive">{{ geoError }}</p>

    <!-- Map -->
    <div
      ref="mapEl"
      class="h-72 w-full overflow-hidden rounded-xl border shadow-sm"
      style="z-index: 0;"
    />

    <!-- Coordinates display -->
    <div v-if="lat && lng" class="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs font-mono text-muted-foreground">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      <span>Lat: {{ lat.toFixed(6) }} &nbsp;|&nbsp; Lng: {{ lng.toFixed(6) }}</span>
    </div>
  </div>
</template>
