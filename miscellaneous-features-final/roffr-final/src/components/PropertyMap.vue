<script setup>
import { computed, ref, onMounted, watch } from "vue";
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const props = defineProps({
  projects: {
    type: Array,
    default: () => [],
  },
  center: {
    type: Array,
    default: () => [19.076, 72.8777], // Mumbai default
  },
  zoom: {
    type: Number,
    default: 12,
  },
});

const map = ref(null);
const zoomLevel = ref(props.zoom);
const centerPosition = ref(props.center);

// Fix for default marker icons in Leaflet with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

const ready = ref(false);

onMounted(() => {
  setTimeout(() => {
    ready.value = true;
    if (map.value && map.value.leafletObject) {
      map.value.leafletObject.invalidateSize();
    }
  }, 200);
});

const formatPrice = (price) => {
  if (!price) return "";
  if (typeof price === 'string' && (price.includes('Cr') || price.includes('L'))) return price;
  
  const val = Number(price);
  if (isNaN(val)) return price;
  
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)}Cr`;
  } else if (val >= 100000) {
    return `₹${(val / 100000).toFixed(0)}L`;
  }
  return `₹${val.toLocaleString("en-IN")}`;
};

const createCustomIcon = (price) => {
  const formattedPrice = formatPrice(price);
  return L.divIcon({
    className: "custom-price-marker",
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="background-color: #ef4444; color: white; font-size: 12px; font-weight: 700; padding: 6px 10px; border-radius: 6px; box-shadow: 0 3px 8px rgba(0,0,0,0.4); white-space: nowrap; border: 2px solid white;">
          ${formattedPrice}
        </div>
        <div style="width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid #ef4444; margin-top: -2px;"></div>
      </div>
    `,
    iconSize: [80, 50],
    iconAnchor: [40, 50],
  });
};

// Get coordinates from project data or use fallback
const getCoordinates = (project) => {
  if (project.latitude && project.longitude) {
    return [Number(project.latitude), Number(project.longitude)];
  }
  // Fallback: Generate stable offset from center based on project ID
  const hash = (project._id || project.title || "").split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const latOffset = (hash % 100) / 1000;
  const lngOffset = ((hash >> 8) % 100) / 1000;
  
  return [props.center[0] + latOffset, props.center[1] + lngOffset];
};

const markers = computed(() => {
  return props.projects.map((p) => ({
    ...p,
    latLng: getCoordinates(p),
    icon: createCustomIcon(p.priceMin || p.price),
  }));
});

watch(() => props.center, (newCenter) => {
  centerPosition.value = newCenter;
});

const flyToProject = (project) => {
  if (!map.value || !map.value.leafletObject) return;
  const coords = getCoordinates(project);
  map.value.leafletObject.flyTo(coords, 15, {
    animate: true,
    duration: 1.5
  });
};

defineExpose({
  flyToProject
});
</script>

<template>
  <div class="h-full w-full min-h-[400px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 relative z-0">
    <l-map
      ref="map"
      v-model:zoom="zoomLevel"
      :center="centerPosition"
      :use-global-leaflet="false"
      class="h-full w-full"
      style="min-height: 400px;"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      ></l-tile-layer>

      <l-marker
        v-for="project in markers"
        :key="project._id"
        :lat-lng="project.latLng"
        :icon="project.icon"
      >
        <l-popup>
          <div class="min-w-[150px]">
            <img 
              v-if="project.thumbnail || project.images?.[0] || project.imageUrl"
              :src="project.thumbnail || project.images?.[0] || project.imageUrl" 
              class="w-full h-24 object-cover rounded-t-lg mb-2"
            />
            <h3 class="font-bold text-sm">{{ project.projectName || project.title }}</h3>
            <p class="text-xs text-gray-600">{{ project.location }}</p>
            <p class="text-sm font-bold text-red-600 mt-1">{{ formatPrice(project.priceMin || project.price) }}</p>
          </div>
        </l-popup>
      </l-marker>
    </l-map>
  </div>
</template>

<style>
.custom-price-marker {
  background: transparent;
  border: none;
}
</style>
