<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useSearchStore } from "@/stores/SearchStore";
import { useProjectStore } from "@/stores/projectStore";
import { debounce } from "@/utils/debounce";

const router = useRouter();
const route = useRoute();

const searchStore = useSearchStore();
const { items, total, loading, error, fallback, fallbackReason, page, limit } =
  storeToRefs(searchStore);

const projectStore = useProjectStore();
const { uniqueCitiesData } = storeToRefs(projectStore);

const localTerm = ref(String(route.query.q || ""));
const localCity = ref(String(route.query.city || ""));

const PRICE_RANGES = [
  { key: "any", label: "Any price", min: null, max: null },
  { key: "u50", label: "Under ₹50L", min: 0, max: 5_000_000 },
  { key: "50to100", label: "₹50L – ₹1Cr", min: 5_000_000, max: 10_000_000 },
  { key: "100to300", label: "₹1Cr – ₹3Cr", min: 10_000_000, max: 30_000_000 },
  { key: "above300", label: "Above ₹3Cr", min: 30_000_000, max: null },
];
const BHK_OPTIONS = ["1BHK", "2BHK", "3BHK", "4BHK", "5BHK"];
const UNIT_TYPES = ["Apartment", "Villa", "Studio", "Plot", "Commercial"];

const localPriceKey = ref(String(route.query.priceKey || "any"));
const localBhk = ref(
  BHK_OPTIONS.includes(String(route.query.bhk)) ? String(route.query.bhk) : "",
);
const localUnitType = ref(
  UNIT_TYPES.includes(String(route.query.unitType))
    ? String(route.query.unitType)
    : "",
);
const localSort = ref(String(route.query.sortBy || "newest"));

const showFilters = ref(false);

const resolvedPrice = computed(() => {
  const r = PRICE_RANGES.find((p) => p.key === localPriceKey.value);
  return r ? { min: r.min, max: r.max } : { min: null, max: null };
});

const activeFilterCount = computed(() => {
  let n = 0;
  if (localPriceKey.value !== "any") n++;
  if (localBhk.value) n++;
  if (localUnitType.value) n++;
  if (localSort.value !== "newest") n++;
  return n;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil((total.value || 0) / (limit.value || 12))),
);

const fallbackMessage = computed(() => {
  if (!fallback.value) return "";
  if (fallbackReason.value === "nearby-in-city") {
    const c = localCity.value || "this area";
    return `No exact match. Showing nearby properties in ${c}.`;
  }
  return "No exact match. Showing recent properties you might like.";
});

const goToProperty = (item) => {
  if (!item?.id) return;
  router.push(`/property-details/${item.id}`);
};

const syncUrl = () => {
  const q = {};
  if (localTerm.value?.trim()) q.q = localTerm.value.trim();
  if (localCity.value) q.city = localCity.value;
  if (localPriceKey.value && localPriceKey.value !== "any") q.priceKey = localPriceKey.value;
  if (localBhk.value) q.bhk = localBhk.value;
  if (localUnitType.value) q.unitType = localUnitType.value;
  if (localSort.value && localSort.value !== "newest") q.sortBy = localSort.value;
  if (page.value > 1) q.page = page.value;
  router.replace({ path: "/properties", query: q });
};

const runFromState = async () => {
  await searchStore.runSearch({
    type: "property",
    term: localTerm.value,
    city: localCity.value,
    priceMin: resolvedPrice.value.min,
    priceMax: resolvedPrice.value.max,
    bhk: localBhk.value,
    unitType: localUnitType.value,
    sortBy: localSort.value,
    page: page.value,
    limit: limit.value || 12,
  });
};

const onSubmit = async () => {
  page.value = 1;
  syncUrl();
  await runFromState();
};

const liveSearch = debounce(async () => {
  page.value = 1;
  syncUrl();
  await runFromState();
}, 400);
watch(localTerm, () => liveSearch());

const setCity = async (c) => {
  localCity.value = c;
  page.value = 1;
  syncUrl();
  await runFromState();
};

const applyFilters = async () => {
  page.value = 1;
  syncUrl();
  await runFromState();
};

const resetFilters = async () => {
  localPriceKey.value = "any";
  localBhk.value = "";
  localUnitType.value = "";
  localSort.value = "newest";
  page.value = 1;
  syncUrl();
  await runFromState();
};

const goToPage = async (p) => {
  if (p < 1 || p > totalPages.value || p === page.value) return;
  page.value = p;
  syncUrl();
  await runFromState();
  if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
};

watch(
  () => route.fullPath,
  () => {
    if (route.path !== "/properties") return;
    localTerm.value = String(route.query.q || "");
    localCity.value = String(route.query.city || "");
    localPriceKey.value = String(route.query.priceKey || "any");
    localBhk.value = BHK_OPTIONS.includes(String(route.query.bhk))
      ? String(route.query.bhk)
      : "";
    localUnitType.value = UNIT_TYPES.includes(String(route.query.unitType))
      ? String(route.query.unitType)
      : "";
    localSort.value = String(route.query.sortBy || "newest");
    page.value = parseInt(String(route.query.page || "1"), 10) || 1;
    runFromState();
  },
);

onMounted(async () => {
  page.value = parseInt(String(route.query.page || "1"), 10) || 1;
  await Promise.all([projectStore.getProjectCities(), runFromState()]);
});
</script>

<template>
  <main class="bg-gray-50 min-h-screen mt-10 md:mt-0">
    <!-- Search bar -->
    <section class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 pt-24 pb-6">
        <h1 class="text-3xl font-marcellus text-gray-900">Properties</h1>
        <p class="text-sm text-gray-500 mt-1 mb-5">
          Browse every listing on Roffr — from new launches to ready-to-move homes.
        </p>

        <div class="flex flex-col md:flex-row md:items-center gap-3">
          <div class="flex-1 flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 bg-white">
            <i class="pi pi-search text-gray-400"></i>
            <input
              v-model="localTerm"
              @keyup.enter="onSubmit"
              type="text"
              placeholder="Search title, locality, building…"
              class="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
            />
            <button
              v-if="localTerm"
              @click="localTerm = ''"
              class="text-gray-400 hover:text-gray-600"
            >
              <i class="pi pi-times-circle"></i>
            </button>
          </div>

          <select
            v-model="localCity"
            @change="setCity(localCity)"
            class="border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-700 bg-white"
          >
            <option value="">All cities</option>
            <option v-for="c in uniqueCitiesData" :key="c" :value="c">{{ c }}</option>
          </select>

          <button
            @click="showFilters = !showFilters"
            class="border border-gray-300 text-gray-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:border-orange-400 transition"
            :class="showFilters ? 'bg-gray-900 text-white border-gray-900' : 'bg-white'"
          >
            <i class="pi pi-sliders-h text-xs"></i> Filters
            <span
              v-if="activeFilterCount > 0"
              class="bg-orange-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            >
              {{ activeFilterCount }}
            </span>
          </button>

          <button
            @click="onSubmit"
            class="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow"
          >
            Search
          </button>
        </div>

        <!-- Filter panel -->
        <div
          v-if="showFilters"
          class="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div>
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Price</label>
            <select
              v-model="localPriceKey"
              class="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option v-for="r in PRICE_RANGES" :key="r.key" :value="r.key">
                {{ r.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">BHK</label>
            <div class="mt-1 flex flex-wrap gap-1.5">
              <button
                @click="localBhk = ''"
                class="px-3 py-1 rounded-full text-xs border transition"
                :class="
                  !localBhk
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-white border-gray-300 text-gray-600'
                "
              >
                Any
              </button>
              <button
                v-for="b in BHK_OPTIONS"
                :key="b"
                @click="localBhk = b"
                class="px-3 py-1 rounded-full text-xs border transition"
                :class="
                  localBhk === b
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-white border-gray-300 text-gray-600'
                "
              >
                {{ b }}
              </button>
            </div>
          </div>

          <div>
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Unit type</label>
            <select
              v-model="localUnitType"
              class="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">Any</option>
              <option v-for="u in UNIT_TYPES" :key="u" :value="u">{{ u }}</option>
            </select>
          </div>

          <div>
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Sort by</label>
            <select
              v-model="localSort"
              class="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          <div class="sm:col-span-2 lg:col-span-4 flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
            <button
              @click="resetFilters"
              class="px-4 py-1.5 rounded-full text-sm text-gray-600 hover:text-gray-900"
            >
              Reset
            </button>
            <button
              @click="applyFilters"
              class="bg-black text-white px-5 py-1.5 rounded-full text-sm font-medium"
            >
              Apply filters
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Results -->
    <section class="max-w-7xl mx-auto px-4 py-8">
      <div
        v-if="fallback && !loading"
        class="mb-4 flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800"
      >
        <i class="pi pi-info-circle mt-0.5"></i>
        <span>{{ fallbackMessage }}</span>
      </div>

      <div class="flex items-center justify-between mb-4">
        <p class="text-sm text-gray-600">
          <span v-if="loading">Loading properties…</span>
          <span v-else-if="total === 0">No properties found</span>
          <span v-else>
            {{ total }} propert{{ total === 1 ? "y" : "ies" }}
            <span v-if="localTerm"> for "{{ localTerm }}"</span>
            <span v-if="localCity"> in {{ localCity }}</span>
          </span>
        </p>
        <p v-if="totalPages > 1 && !fallback" class="text-xs text-gray-500">
          Page {{ page }} of {{ totalPages }}
        </p>
      </div>

      <div v-if="error" class="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4">
        {{ error }}
      </div>

      <div
        v-if="loading"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div
          v-for="n in 6"
          :key="n"
          class="rounded-2xl bg-white border overflow-hidden animate-pulse"
        >
          <div class="h-44 bg-gray-100"></div>
          <div class="p-4 space-y-2">
            <div class="h-4 bg-gray-100 rounded w-3/4"></div>
            <div class="h-3 bg-gray-100 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <div
        v-else-if="!items.length"
        class="text-center py-16 text-gray-500 bg-white rounded-2xl border"
      >
        <i class="pi pi-home text-5xl text-gray-300 mb-3 block"></i>
        <p>No properties match your filters.</p>
        <p class="text-sm mt-1">Try resetting filters or picking a different city.</p>
      </div>

      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        <article
          v-for="item in items"
          :key="item.id"
          @click="goToProperty(item)"
          class="group rounded-3xl border border-gray-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col overflow-hidden"
        >
          <!-- Image -->
          <div class="relative h-56 bg-gray-100 overflow-hidden shrink-0">
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.title"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              v-else
              class="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center gap-2"
            >
              <i class="pi pi-home text-4xl text-slate-400"></i>
              <span class="text-xs text-slate-400 font-medium">No photo available</span>
            </div>

            <!-- Gradient overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>

            <!-- Top badges -->
            <div class="absolute top-3 left-3 flex items-center gap-1.5">
              <span class="text-[10px] uppercase font-bold px-2.5 py-1 rounded-md bg-white/90 text-gray-700 backdrop-blur-sm shadow-sm">
                {{ item.unitType || "Property" }}
              </span>
              <span
                v-if="item.doc?.visit_details?.showing_status"
                class="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-blue-500 text-white shadow-sm"
              >
                {{ item.doc.visit_details.showing_status }}
              </span>
            </div>

            <!-- BHK pill bottom-right -->
            <span
              v-if="item.bhk"
              class="absolute bottom-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-sm"
            >
              {{ item.bhk }}
            </span>
          </div>

          <!-- Body -->
          <div class="px-5 pt-4 pb-5 flex flex-col flex-1">

            <!-- Title + location -->
            <h3 class="font-bold text-gray-900 text-[17px] leading-snug line-clamp-1">
              {{ item.title }}
            </h3>
            <div class="flex items-center gap-1.5 mt-1.5 mb-4">
              <i class="pi pi-map-marker text-gray-400 text-xs shrink-0"></i>
              <span class="text-sm text-gray-500 truncate">{{ item.subtitle || "Location not specified" }}</span>
            </div>

            <!-- Divider -->
            <div class="border-t border-gray-100 mb-3"></div>

            <!-- Specs row -->
            <div class="flex items-center gap-4 text-xs text-gray-600 mb-3 flex-wrap">
              <div v-if="item.bhk" class="flex items-center gap-1.5">
                <i class="pi pi-th-large text-gray-400 text-[11px]"></i>
                <span class="font-semibold">{{ item.bhk }}</span>
              </div>
              <div
                v-if="item.doc?.property_details?.area?.usable_area?.value"
                class="flex items-center gap-1.5"
              >
                <i class="pi pi-arrows-alt text-gray-400 text-[11px]"></i>
                <span class="font-semibold">
                  {{ item.doc.property_details.area.usable_area.value }}
                  {{ item.doc.property_details.area.usable_area.unit || "sqft" }}
                </span>
              </div>
              <div
                v-if="item.doc?.property_details?.structure?.bathrooms"
                class="flex items-center gap-1.5"
              >
                <i class="pi pi-droplet text-gray-400 text-[11px]"></i>
                <span class="font-semibold">{{ item.doc.property_details.structure.bathrooms }} Bath</span>
              </div>
              <div
                v-if="item.doc?.property_details?.structure?.parkings"
                class="flex items-center gap-1.5"
              >
                <i class="pi pi-car text-gray-400 text-[11px]"></i>
                <span class="font-semibold">{{ item.doc.property_details.structure.parkings }} Parking</span>
              </div>
            </div>

            <!-- Price -->
            <div v-if="item.doc?.listing_details?.price" class="mb-2">
              <span class="text-xl font-bold text-gray-900">
                ₹ {{ Number(item.doc.listing_details.price).toLocaleString("en-IN") }}
              </span>
            </div>

            <!-- Available from -->
            <p
              v-if="item.doc?.visit_details?.available_from"
              class="text-xs text-gray-400 mb-2 flex items-center gap-1"
            >
              <i class="pi pi-calendar text-[10px]"></i>
              Available {{ item.doc.visit_details.available_from }}
            </p>

            <!-- Button -->
            <div class="mt-auto pt-4 border-t border-gray-100">
              <button
                class="w-full bg-[#EB3131] hover:bg-[#c72828] text-white text-[15px] font-bold py-3 rounded-2xl transition-colors duration-200 active:scale-[0.98]"
                @click.stop="goToProperty(item)"
              >
                View Property
              </button>
            </div>
          </div>
        </article>
      </div>

      <div
        v-if="totalPages > 1 && !fallback"
        class="mt-8 flex items-center justify-center gap-2"
      >
        <button
          @click="goToPage(page - 1)"
          :disabled="page === 1"
          class="px-3 py-1.5 rounded-full text-sm border border-gray-300 disabled:opacity-50"
        >
          <i class="pi pi-chevron-left text-xs"></i> Prev
        </button>
        <span class="text-sm text-gray-600 px-2">{{ page }} / {{ totalPages }}</span>
        <button
          @click="goToPage(page + 1)"
          :disabled="page === totalPages"
          class="px-3 py-1.5 rounded-full text-sm border border-gray-300 disabled:opacity-50"
        >
          Next <i class="pi pi-chevron-right text-xs"></i>
        </button>
      </div>
    </section>
  </main>
</template>
