<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useSearchStore } from "@/stores/SearchStore";
import { useProjectStore } from "@/stores/projectStore";
import { debounce } from "@/utils/debounce";
import ProjectCard from "@/components/ProjectCard.vue";

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
const STATUS_OPTIONS = ["Under Construction", "Ready to Move", "New Launch"];

const localPriceKey = ref(String(route.query.priceKey || "any"));
const localStatus = ref(
  STATUS_OPTIONS.includes(String(route.query.projectStatus))
    ? String(route.query.projectStatus)
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
  if (localStatus.value) n++;
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
    return `No exact match. Showing nearby projects in ${c}.`;
  }
  return "No exact match. Showing recent projects you might like.";
});

const formatINR = (n) => {
  const num = Number(n || 0);
  if (!num) return "Price on request";
  if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹ ${(num / 100000).toFixed(1)} L`;
  return `₹ ${num.toLocaleString("en-IN")}`;
};

const goToProject = (item) => {
  if (!item?.id) return;
  router.push(`/project-details/${item.id}`);
};

const syncUrl = () => {
  const q = {};
  if (localTerm.value?.trim()) q.q = localTerm.value.trim();
  if (localCity.value) q.city = localCity.value;
  if (localPriceKey.value && localPriceKey.value !== "any") q.priceKey = localPriceKey.value;
  if (localStatus.value) q.projectStatus = localStatus.value;
  if (localSort.value && localSort.value !== "newest") q.sortBy = localSort.value;
  if (page.value > 1) q.page = page.value;
  router.replace({ path: "/project", query: q });
};

const runFromState = async () => {
  await searchStore.runSearch({
    type: "project",
    term: localTerm.value,
    city: localCity.value,
    priceMin: resolvedPrice.value.min,
    priceMax: resolvedPrice.value.max,
    projectStatus: localStatus.value,
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

const setStatus = async (s) => {
  localStatus.value = localStatus.value === s ? "" : s;
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
  localStatus.value = "";
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
    if (route.path !== "/project") return;
    localTerm.value = String(route.query.q || "");
    localCity.value = String(route.query.city || "");
    localPriceKey.value = String(route.query.priceKey || "any");
    localStatus.value = STATUS_OPTIONS.includes(String(route.query.projectStatus))
      ? String(route.query.projectStatus)
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
        <h1 class="text-3xl font-marcellus text-gray-900">Projects</h1>
        <p class="text-sm text-gray-500 mt-1 mb-5">
          Discover developer-led projects across cities — from new launches to ready-to-move.
        </p>

        <div class="flex flex-col md:flex-row md:items-center gap-3">
          <div class="flex-1 flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 bg-white">
            <i class="pi pi-search text-gray-400"></i>
            <input
              v-model="localTerm"
              @keyup.enter="onSubmit"
              type="text"
              placeholder="Search project name, builder, locality…"
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

        <!-- Status quick chips -->
        <div class="mt-4 flex items-center gap-2 flex-wrap">
          <button
            v-for="s in STATUS_OPTIONS"
            :key="s"
            @click="setStatus(s)"
            class="px-4 py-1.5 rounded-full text-sm border transition"
            :class="
              localStatus === s
                ? 'bg-black text-white border-black'
                : 'bg-white border-gray-300 text-gray-700 hover:border-gray-900'
            "
          >
            {{ s }}
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

        <!-- Filter panel -->
        <div
          v-if="showFilters"
          class="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
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
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
            <select
              v-model="localStatus"
              class="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">Any status</option>
              <option v-for="s in STATUS_OPTIONS" :key="s" :value="s">{{ s }}</option>
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
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>

          <div class="sm:col-span-2 lg:col-span-3 flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
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
          <span v-if="loading">Loading projects…</span>
          <span v-else-if="total === 0">No projects found</span>
          <span v-else>
            {{ total }} project{{ total === 1 ? "" : "s" }}
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
        <i class="pi pi-building text-5xl text-gray-300 mb-3 block"></i>
        <p>No projects match your filters.</p>
        <p class="text-sm mt-1">Try resetting filters or picking a different city.</p>
      </div>

      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <ProjectCard
          v-for="item in items"
          :key="item.id"
          :project="item.doc"
          :show-group-buy="true"
        />
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
