<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useSearchStore } from "@/stores/SearchStore";
import { useProjectStore } from "@/stores/projectStore";
import { debounce } from "@/utils/debounce";

const router = useRouter();
const route = useRoute();

const searchStore = useSearchStore();
const {
  items,
  total,
  loading,
  error,
  page,
  limit,
  fallback,
  fallbackReason,
} = storeToRefs(searchStore);

const fallbackMessage = computed(() => {
  if (!fallback.value) return "";
  if (fallbackReason.value === "nearby-in-city") {
    const c = localCity.value || "this area";
    return `No exact match for your search. Showing nearby projects and properties in ${c}.`;
  }
  return "No exact match for your search. Showing recent projects and properties you might like.";
});

const projectStore = useProjectStore();
const { uniqueCitiesData } = storeToRefs(projectStore);

// UI-only refs (mirror the URL query)
const localTerm = ref(String(route.query.q || ""));
const localCity = ref(String(route.query.city || ""));
const localType = ref(
  ["all", "project", "property"].includes(String(route.query.type))
    ? String(route.query.type)
    : "all",
);

// Filter state (mirrors URL — defaults are "no filter")
const ALLOWED_SORT = ["newest", "oldest", "price-asc", "price-desc"];
const ALLOWED_BHK = ["1BHK", "2BHK", "3BHK", "4BHK", "5BHK"];
const ALLOWED_UNIT_TYPES = ["Apartment", "Villa", "Studio", "Plot", "Commercial"];
const ALLOWED_STATUS = ["Under Construction", "Ready to Move", "New Launch"];

const PRICE_RANGES = [
  { key: "any", label: "Any price", min: null, max: null },
  { key: "u50", label: "Under ₹50L", min: 0, max: 5_000_000 },
  { key: "50to100", label: "₹50L – ₹1Cr", min: 5_000_000, max: 10_000_000 },
  { key: "100to300", label: "₹1Cr – ₹3Cr", min: 10_000_000, max: 30_000_000 },
  { key: "above300", label: "Above ₹3Cr", min: 30_000_000, max: null },
];

const localPriceKey = ref(String(route.query.priceKey || "any"));
const localBhk = ref(
  ALLOWED_BHK.includes(String(route.query.bhk)) ? String(route.query.bhk) : "",
);
const localUnitType = ref(
  ALLOWED_UNIT_TYPES.includes(String(route.query.unitType))
    ? String(route.query.unitType)
    : "",
);
const localStatus = ref(
  ALLOWED_STATUS.includes(String(route.query.projectStatus))
    ? String(route.query.projectStatus)
    : "",
);
const localSort = ref(
  ALLOWED_SORT.includes(String(route.query.sortBy))
    ? String(route.query.sortBy)
    : "newest",
);

const showFilters = ref(false);

const activeFilterCount = computed(() => {
  let n = 0;
  if (localPriceKey.value && localPriceKey.value !== "any") n++;
  if (localBhk.value) n++;
  if (localUnitType.value) n++;
  if (localStatus.value) n++;
  if (localSort.value && localSort.value !== "newest") n++;
  return n;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil((total.value || 0) / (limit.value || 12))),
);

const filterTabs = [
  { key: "all", label: "All" },
  { key: "project", label: "Projects" },
  { key: "property", label: "Properties" },
];

const resolvedPrice = computed(() => {
  const range = PRICE_RANGES.find((r) => r.key === localPriceKey.value);
  if (!range) return { min: null, max: null };
  return { min: range.min, max: range.max };
});

const formatINR = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN")}`;

const goToItem = (item) => {
  if (!item?.id) return;
  if (item.kind === "project") router.push(`/project-details/${item.id}`);
  else router.push(`/property-details/${item.id}`);
};

const syncUrl = () => {
  const query = {};
  if (localTerm.value?.trim()) query.q = localTerm.value.trim();
  if (localCity.value) query.city = localCity.value;
  if (localType.value && localType.value !== "all") query.type = localType.value;
  if (page.value && page.value > 1) query.page = page.value;
  if (localPriceKey.value && localPriceKey.value !== "any") {
    query.priceKey = localPriceKey.value;
  }
  if (localBhk.value) query.bhk = localBhk.value;
  if (localUnitType.value) query.unitType = localUnitType.value;
  if (localStatus.value) query.projectStatus = localStatus.value;
  if (localSort.value && localSort.value !== "newest") {
    query.sortBy = localSort.value;
  }
  router.replace({ path: "/search", query });
};

const runFromState = async () => {
  await searchStore.runSearch({
    term: localTerm.value,
    city: localCity.value,
    type: localType.value,
    page: page.value,
    limit: limit.value,
    priceMin: resolvedPrice.value.min,
    priceMax: resolvedPrice.value.max,
    bhk: localBhk.value,
    unitType: localUnitType.value,
    projectStatus: localStatus.value,
    sortBy: localSort.value,
  });
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
  localStatus.value = "";
  localSort.value = "newest";
  page.value = 1;
  syncUrl();
  await runFromState();
};

const onSubmit = async () => {
  page.value = 1;
  syncUrl();
  await runFromState();
};

// Debounced live update — 400ms after the user stops typing.
const liveSearch = debounce(async () => {
  page.value = 1;
  syncUrl();
  await runFromState();
}, 400);

watch(localTerm, () => liveSearch());

const setFilter = async (key) => {
  localType.value = key;
  page.value = 1;
  syncUrl();
  await runFromState();
};

const setCity = async (c) => {
  localCity.value = c;
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

// React to direct URL navigation (e.g. user pastes /search?q=foo&bhk=2BHK).
watch(
  () => route.fullPath,
  () => {
    if (route.path !== "/search") return;
    localTerm.value = String(route.query.q || "");
    localCity.value = String(route.query.city || "");
    const t = String(route.query.type || "all");
    localType.value = ["all", "project", "property"].includes(t) ? t : "all";
    localPriceKey.value = String(route.query.priceKey || "any");
    localBhk.value = ALLOWED_BHK.includes(String(route.query.bhk))
      ? String(route.query.bhk)
      : "";
    localUnitType.value = ALLOWED_UNIT_TYPES.includes(
      String(route.query.unitType),
    )
      ? String(route.query.unitType)
      : "";
    localStatus.value = ALLOWED_STATUS.includes(
      String(route.query.projectStatus),
    )
      ? String(route.query.projectStatus)
      : "";
    localSort.value = ALLOWED_SORT.includes(String(route.query.sortBy))
      ? String(route.query.sortBy)
      : "newest";
    page.value = parseInt(String(route.query.page || "1"), 10) || 1;
    runFromState();
  },
);

onMounted(async () => {
  page.value = parseInt(String(route.query.page || "1"), 10) || 1;
  await Promise.all([
    projectStore.getProjectCities(),
    runFromState(),
  ]);
});
</script>

<template>
  <main class="bg-gray-50 min-h-screen">
    <!-- Search bar -->
    <section class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <div class="flex flex-col md:flex-row md:items-center gap-3">
          <div class="flex-1 flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 bg-white">
            <i class="pi pi-search text-gray-400"></i>
            <input
              v-model="localTerm"
              @keyup.enter="onSubmit"
              type="text"
              placeholder="Search projects, properties, locations…"
              class="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
            />
            <button
              v-if="localTerm"
              @click="localTerm = ''"
              class="text-gray-400 hover:text-gray-600"
              aria-label="Clear"
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
            <option v-for="c in uniqueCitiesData" :key="c" :value="c">
              {{ c }}
            </option>
          </select>

          <button
            @click="showFilters = !showFilters"
            class="border border-gray-300 text-gray-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:border-orange-400 transition"
            :class="showFilters ? 'bg-gray-900 text-white border-gray-900' : 'bg-white'"
          >
            <i class="pi pi-sliders-h text-xs"></i>
            Filters
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

        <!-- Filter tabs -->
        <div class="mt-4 flex items-center gap-2 flex-wrap">
          <button
            v-for="tab in filterTabs"
            :key="tab.key"
            @click="setFilter(tab.key)"
            class="px-4 py-1.5 rounded-full text-sm transition"
            :class="
              localType === tab.key
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
          >
            {{ tab.label }}
          </button>

          <div class="ml-auto flex items-center gap-2">
            <label class="text-xs text-gray-500">Sort by</label>
            <select
              v-model="localSort"
              @change="applyFilters"
              class="border border-gray-300 rounded-full px-3 py-1.5 text-xs text-gray-700 bg-white"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>
        </div>

        <!-- Filter panel (collapsible) -->
        <div
          v-if="showFilters"
          class="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div>
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </label>
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
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">
              BHK
            </label>
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
                v-for="b in ALLOWED_BHK"
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
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unit type
            </label>
            <select
              v-model="localUnitType"
              class="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">Any</option>
              <option v-for="u in ALLOWED_UNIT_TYPES" :key="u" :value="u">
                {{ u }}
              </option>
            </select>
          </div>

          <div>
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Project status
            </label>
            <select
              v-model="localStatus"
              class="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">Any</option>
              <option v-for="s in ALLOWED_STATUS" :key="s" :value="s">
                {{ s }}
              </option>
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
      <!-- Fallback banner: shown when the strict search returned 0 and the
           backend gave us nearby/recent items instead. -->
      <div
        v-if="fallback && !loading"
        class="mb-4 flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800"
      >
        <i class="pi pi-info-circle mt-0.5"></i>
        <span>{{ fallbackMessage }}</span>
      </div>

      <div class="flex items-center justify-between mb-4">
        <p class="text-sm text-gray-600">
          <span v-if="loading">Searching…</span>
          <span v-else-if="fallback">
            Showing {{ total }} suggested
            <span v-if="total === 1">listing</span>
            <span v-else>listings</span>
          </span>
          <span v-else-if="total === 0">No results</span>
          <span v-else>
            {{ total }} result{{ total === 1 ? "" : "s" }}
            <span v-if="localTerm"> for "{{ localTerm }}"</span>
            <span v-if="localCity"> in {{ localCity }}</span>
          </span>
        </p>
        <p v-if="totalPages > 1 && !fallback" class="text-xs text-gray-500">
          Page {{ page }} of {{ totalPages }}
        </p>
      </div>

      <div v-if="error" class="bg-red-50 text-red-600 text-sm rounded-md p-3 mb-4">
        {{ error }}
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="n in 6"
          :key="n"
          class="rounded-2xl bg-white border border-gray-200 overflow-hidden animate-pulse"
        >
          <div class="h-44 bg-gray-100"></div>
          <div class="p-4 space-y-2">
            <div class="h-4 bg-gray-100 rounded w-3/4"></div>
            <div class="h-3 bg-gray-100 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="!items.length"
        class="text-center py-16 text-gray-500"
      >
        <i class="pi pi-inbox text-5xl text-gray-300 mb-4 block"></i>
        <p>No projects or properties match your search.</p>
        <p class="text-sm mt-1">Try a different keyword or city.</p>
      </div>

      <!-- Results grid -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div
          v-for="item in items"
          :key="`${item.kind}-${item.id}`"
          @click="goToItem(item)"
          class="rounded-2xl bg-white border border-gray-200 overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition"
        >
          <div class="relative h-44 overflow-hidden bg-gray-100">
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.title"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900"
            ></div>
            <span
              class="absolute top-3 left-3 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-semibold"
              :class="
                item.kind === 'project'
                  ? 'bg-orange-50 text-orange-600 border border-orange-200'
                  : 'bg-blue-50 text-blue-600 border border-blue-200'
              "
            >
              {{ item.kind }}
            </span>
          </div>

          <div class="p-4 flex flex-col gap-1">
            <h3 class="text-sm font-semibold text-gray-900 line-clamp-2">
              {{ item.title }}
            </h3>
            <p class="text-xs text-gray-500 line-clamp-1">
              {{ item.subtitle || "—" }}
            </p>
            <p
              v-if="item.kind === 'project' && (item.minPrice || item.maxPrice)"
              class="text-sm font-semibold text-gray-900 mt-1"
            >
              {{ formatINR(item.minPrice) }}
              <span v-if="item.maxPrice" class="text-xs text-gray-500 font-normal">
                – {{ formatINR(item.maxPrice) }}
              </span>
            </p>
            <p
              v-else-if="item.kind === 'property'"
              class="text-xs text-gray-600 mt-1"
            >
              <span v-if="item.bhk">{{ item.bhk }}</span>
              <span v-if="item.bhk && item.unitType"> · </span>
              <span v-if="item.unitType">{{ item.unitType }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Pagination (hidden while showing fallback suggestions) -->
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

        <span class="text-sm text-gray-600 px-2">
          {{ page }} / {{ totalPages }}
        </span>

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
