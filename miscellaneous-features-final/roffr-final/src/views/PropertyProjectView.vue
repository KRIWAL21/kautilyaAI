<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from "vue";
import { useProjectStore } from "@/stores/projectStore";
import { storeToRefs } from "pinia";
import { useRouter, useRoute } from "vue-router";
import { useSearchStore } from "@/stores/SearchStore";
import { debounce } from "@/utils/debounce";
import { useShare } from "@/utils/useShare";
import ShareModal from "@/components/ShareModal.vue";
import PropertyMap from "@/components/PropertyMap.vue";

const router = useRouter();

const {
  showShareModal,
  shareUrl,
  shareTitle,
  openShareModal,
  closeShareModal,
} = useShare();

const route = useRoute();

const projectStore = useProjectStore();
const {
  projectPropertyListData,
  uniqueCitiesData,
  pageNumber,
  totalpages,
  pageSize,
} = storeToRefs(projectStore);

const searchStore = useSearchStore();
const { searchSuggestionData, term } = storeToRefs(searchStore);

// UI state
const searchInput = ref("");
const suggestionsVisible = ref(false);
const containerRef = ref(null);

const selectedCity = ref("");
const cityDropdownOpen = ref(false);
const showBestDealsOnly = ref(false);
const selectedType = ref("project");

// status filter
const selectedStatuses = ref([]);

// New Filters
const filterFreeCancellation = ref(false);
const filterInstantBook = ref(false);
const priceDropdownOpen = ref(false);
const selectedPriceRange = ref(null);

const priceRanges = [
  { label: "Under ₹50L", min: 0, max: 5000000 },
  { label: "₹50L - ₹1Cr", min: 5000000, max: 10000000 },
  { label: "₹1Cr - ₹3Cr", min: 10000000, max: 30000000 },
  { label: "Above ₹3Cr", min: 30000000, max: Infinity },
];

const togglePriceRange = (range) => {
  if (selectedPriceRange.value?.label === range.label) {
    selectedPriceRange.value = null;
  } else {
    selectedPriceRange.value = range;
  }
  priceDropdownOpen.value = false;
};

const imageErrors = ref({});
const handleImageError = (key) => {
  imageErrors.value[key] = true;
};

const suggestionsList = computed(() => {
  if (Array.isArray(searchSuggestionData.value))
    return searchSuggestionData.value;
  return searchSuggestionData.value?.data || [];
});

const performSearch = async () => {
  await projectStore.getProjectPropertyList(
    "project",
    searchInput.value,
    selectedCity.value
  );
};

onMounted(async () => {
  if (route.query.city) {
    selectedCity.value = route.query.city;
  }

  if (route.query.q || route.query.city) {
    if (route.query.q) searchInput.value = route.query.q;
    await performSearch();
  } else {
    await projectStore.getProjectPropertyList();
  }
  await projectStore.getProjectCities();
});

const formatINR = (num) => `₹ ${Number(num || 0).toLocaleString("en-IN")}`;

const redirect = (id, type = selectedType.value) => {
  if (type === "property") {
    router.push(`/property-details/${id}`);
  } else {
    router.push(`/project-details/${id}`);
  }
};

// suggestions
const updateTermDebounced = debounce((value) => {
  const v = value.trim();
  if (!v) {
    suggestionsVisible.value = false;
    return;
  }
  term.value = v;
  searchStore.getSearchSuggestion();
}, 300);

watch(searchInput, (newVal) => {
  updateTermDebounced(newVal);
  suggestionsVisible.value = newVal.trim().length > 0;
});

const suggestionRedirect = (suggestion) => {
  if (!suggestion || !suggestion._id) return;
  const type = (suggestion.itsTypeIs || "").toUpperCase();
  if (type === "PROJECT") {
    router.push(`/project-details/${suggestion._id}`);
  } else if (type === "PROPERTY") {
    router.push(`/property-details/${suggestion._id}`);
  } else {
    router.push(`/project-details/${suggestion._id}`);
  }
};

const onSuggestionClick = (s) => {
  router.push(`/project-details/${s}`)
  suggestionsVisible.value = false;
};

const onSearchButtonClicked = () => {
  suggestionsVisible.value = false;
  performSearch();
};

// city filter (server request)
async function fetchByCity(city) {
  await projectStore.getProjectPropertyList(
    "project",
    searchInput.value,
    city || ""
  );
}

function onCitySelect(city) {
  selectedCity.value = city;
  cityDropdownOpen.value = false;
  fetchByCity(city);
}

// close dropdowns on outside click
const handleClickOutside = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    suggestionsVisible.value = false;
    cityDropdownOpen.value = false;
  }
};

onMounted(() => document.addEventListener("click", handleClickOutside));
onBeforeUnmount(() =>
  document.removeEventListener("click", handleClickOutside)
);

// helpers
const normalize = (str = "") => str.toString().toLowerCase().trim();

const isBestDeal = (project) => {
  if (project.bestDeal || project.negotiable) return true;
  const tags = project.tags || [];
  return tags.some((t) => {
    const txt = normalize(t.text);
    return (
      txt.includes("best deal") ||
      txt.includes("negotiable") ||
      txt.includes("offer") ||
      txt.includes("exclusive")
    );
  });
};

const matchesStatus = (project) => {
  if (!selectedStatuses.value.length) return true;
  const status = normalize(project.projectStatus || "");
  return selectedStatuses.value.some((s) => status.includes(normalize(s)));
};

// final list
const filteredProjects = computed(() => {
  const q = normalize(searchInput.value);
  let list = projectPropertyListData.value || [];

  // text search
  if (q) {
    list = list.filter((p) => {
      const name = normalize(p.projectName || p.title);
      const loc = normalize(p.location);
      const city = normalize(p.city);
      const region = normalize(p.region);
      const builder = normalize(p.builder?.name);
      const priceStr = normalize(
        `${p.priceMin || ""} ${p.priceMax || ""} ${p.price || ""}`
      );
      const amenities = (p.amenities || [])
        .map((a) => normalize(a.text))
        .join(" ");
      const crmName = normalize(p.crmDetails?.crmName);

      return (
        name.includes(q) ||
        loc.includes(q) ||
        city.includes(q) ||
        region.includes(q) ||
        builder.includes(q) ||
        priceStr.includes(q) ||
        amenities.includes(q) ||
        crmName.includes(q)
      );
    });
  }

  // Price Filter
  if (selectedPriceRange.value) {
    list = list.filter((p) => {
      const price = p.priceMin || p.price || 0;
      return (
        price >= selectedPriceRange.value.min &&
        price <= selectedPriceRange.value.max
      );
    });
  }

  // Free Cancellation
  if (filterFreeCancellation.value) {
    list = list.filter(
      (p) =>
        p.freeCancellation ||
        (p.tags &&
          p.tags.some((t) =>
            t.text.toLowerCase().includes("free cancellation")
          ))
    );
  }

  // Instant Book
  if (filterInstantBook.value) {
    list = list.filter(
      (p) =>
        p.instantBook ||
        (p.tags &&
          p.tags.some((t) => t.text.toLowerCase().includes("instant book")))
    );
  }

  // best-deal / negotiable
  if (showBestDealsOnly.value) {
    list = list.filter((p) => isBestDeal(p));
  }

  // status
  list = list.filter((p) => matchesStatus(p));

  return list;
});

const locationPills = computed(() => {
  if (!projectPropertyListData.value) return [];
  const regions = projectPropertyListData.value
    .map((p) => p.region)
    .filter((r) => r && r.trim().length > 0);
  return [...new Set(regions)].slice(0, 5);
});

const selectLocation = (loc) => {
  searchInput.value = loc;
};

const fetchProjects = async () => {
  await projectStore.getProjectPropertyList(
    selectedType.value,
    "",
    selectedCity.value || ""
  );
};

watch([pageNumber, pageSize, selectedType], fetchProjects);

const canPrev = computed(() => pageNumber.value > 1);
const canNext = computed(() => pageNumber.value < totalpages.value);

const prevPage = () => {
  if (canPrev.value) pageNumber.value -= 1;
};

const nextPage = () => {
  if (canNext.value) pageNumber.value += 1;
};

// Map Sync
const mapRef = ref(null);
const onCardHover = (project) => {
  if (mapRef.value) {
    mapRef.value.flyToProject(project);
  }
};
</script>

<template>
  <main class="max-w-[1920px] mx-auto px-4 2xl:px-8 mt-20 pb-10">
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Left Side: Property List -->
      <div class="w-full lg:w-[60%] xl:w-[55%]">
        <!-- Search & Filters -->
        <div class="pb-4 bg-white z-20" ref="containerRef">
          <div class="w-full flex flex-col">
            <!-- Search Bar -->
            <div
              class="w-full p-[1px] rounded-full bg-gradient-to-r from-orange-500 to-red-600 shadow-md relative"
            >
              <div
                class="w-full flex items-center bg-white rounded-full px-2 py-2 gap-2"
              >
                <!-- City dropdown -->
                <div class="relative flex items-center shrink-0">
                  <button
                    type="button"
                    class="flex items-center gap-2 px-3 py-1 text-gray-700 font-medium outline-none hover:text-orange-600 transition-colors text-sm"
                    @click.stop="cityDropdownOpen = !cityDropdownOpen"
                  >
                    <span class="truncate max-w-[100px]">
                      {{ selectedCity || "All cities" }}
                    </span>
                    <i
                      class="pi text-[10px]"
                      :class="
                        cityDropdownOpen ? 'pi-chevron-up' : 'pi-chevron-down'
                      "
                    ></i>
                  </button>

                  <!-- Vertical Divider -->
                  <div class="h-5 w-px bg-gray-300 mx-2"></div>

                  <ul
                    v-if="cityDropdownOpen"
                    class="absolute top-full left-0 mt-2 w-48 max-h-64 overflow-auto bg-white text-black rounded-xl shadow-lg border border-gray-200 z-30 text-sm"
                  >
                    <li
                      class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      @click.stop="onCitySelect('')"
                    >
                      All cities
                    </li>
                    <li
                      v-for="city in uniqueCitiesData"
                      :key="city"
                      class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      @click.stop="onCitySelect(city)"
                    >
                      {{ city }}
                    </li>
                  </ul>
                </div>

                <!-- search input -->
                <input
                  v-model="searchInput"
                  type="text"
                  class="w-full outline-none px-2 text-gray-600 placeholder-gray-400 text-sm"
                  placeholder="Search..."
                  autocomplete="off"
                />
                <button
                  @click="onSearchButtonClicked"
                  class="h-8 w-8 min-w-[2rem] rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white flex items-center justify-center shadow hover:shadow-md transition-shadow"
                >
                  <i class="pi pi-search text-xs"></i>
                </button>

                <!-- suggestions dropdown -->
                <ul
                  v-if="suggestionsVisible && suggestionsList.length"
                  class="absolute left-0 right-0 top-full mt-2 max-h-60 overflow-auto bg-white text-black rounded-xl shadow-lg border border-gray-200 z-50"
                >
                  <li
                    v-for="(suggestion, index) in suggestionsList"
                    :key="suggestion._id || index"
                    class="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    @click="onSuggestionClick(suggestion?._id)"
                  >
                    {{ suggestion.title }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Filters Row -->
            <div
              class="w-full mt-4 flex items-center justify-start gap-3 flex-wrap"
            >
              <!-- Free Cancellation -->
              <button
                @click="filterFreeCancellation = !filterFreeCancellation"
                class="px-4 py-2 rounded-full border text-sm font-medium transition-all"
                :class="
                  filterFreeCancellation
                    ? 'bg-orange-50 border-orange-500 text-orange-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                "
              >
                Negotiable
              </button>

              <!-- Price Dropdown -->
              <div class="relative">
                <button
                  @click.stop="priceDropdownOpen = !priceDropdownOpen"
                  class="px-4 py-2 rounded-full border text-sm font-medium transition-all flex items-center gap-2"
                  :class="
                    selectedPriceRange
                      ? 'bg-orange-50 border-orange-500 text-orange-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  "
                >
                  {{ selectedPriceRange ? selectedPriceRange.label : "Price" }}
                  <i class="pi pi-angle-down text-xs"></i>
                </button>

                <div
                  v-if="priceDropdownOpen"
                  class="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-30 overflow-hidden"
                >
                  <button
                    v-for="range in priceRanges"
                    :key="range.label"
                    @click="togglePriceRange(range)"
                    class="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                    :class="
                      selectedPriceRange?.label === range.label
                        ? 'text-orange-600 font-medium bg-orange-50'
                        : 'text-gray-700'
                    "
                  >
                    {{ range.label }}
                  </button>
                </div>
              </div>

              <!-- Instant Book -->
              <button
                @click="filterInstantBook = !filterInstantBook"
                class="px-4 py-2 rounded-full border text-sm font-medium transition-all"
                :class="
                  filterInstantBook
                    ? 'bg-orange-50 border-orange-500 text-orange-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                "
              >
                Best Deal
              </button>


              <!-- New Launch -->
              <button
                @click="filterInstantBook = !filterInstantBook"
                class="px-4 py-2 rounded-full border text-sm font-medium transition-all"
                :class="
                  filterInstantBook
                    ? 'bg-orange-50 border-orange-500 text-orange-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                "
              >
                New Launch
              </button>


              <!-- Under Construction -->
              <button
                @click="filterInstantBook = !filterInstantBook"
                class="px-4 py-2 rounded-full border text-sm font-medium transition-all"
                :class="
                  filterInstantBook
                    ? 'bg-orange-50 border-orange-500 text-orange-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                "
              >
                Under Construction
              </button>
            </div>
          </div>
        </div>

        <!-- Property Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
  <article
    v-for="project in filteredProjects"
    :key="project._id"
    class="relative w-full overflow-hidden rounded-2xl bg-black text-white cursor-pointer group"
    @mouseenter="onCardHover(project)"
    @click="redirect(project._id)"
  >
    <!-- Image Section -->
    <div class="relative h-60 md:h-64"> <!-- increased from h-48 -->
      <img
        :src="
          project.thumbnail || project.images?.[0] || project.imageUrl
        "
        :alt="project.projectName || project.title"
        class="h-full w-full object-cover"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
      ></div>

      <!-- Tags -->
      <div class="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
        <span
          v-for="tag in (project.tags || []).slice(0, 2)"
          :key="tag.text"
          class="px-2 py-0.5 rounded-full text-[10px] font-medium"
          :class="
            tag.variant === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-orange-500 text-white'
          "
        >
          {{ tag.text }}
        </span>
      </div>

      <!-- Share Button -->
      <div class="absolute top-3 right-3 z-10">
        <button
          @click.stop="
            openShareModal(
              `/project-details/${project._id}`,
              project.projectName || project.title
            )
          "
          class="h-8 w-8 rounded-full bg-white/80 flex items-center justify-center text-orange-500 shadow hover:bg-white transition-colors"
        >
          <i class="pi pi-share-alt text-sm"></i>
        </button>
      </div>

      <!-- Project Name -->
      <div class="absolute bottom-3 left-3 right-3 z-10">
        <h3 class="text-base font-semibold leading-tight line-clamp-1">
          {{ project.projectName || project.title }}
        </h3>
        <p class="text-xs text-gray-300 mt-0.5 line-clamp-1">
          {{ project.location || `${project.region}, ${project.city}` }}
        </p>
      </div>

      <!-- Possession Badge -->
      <div class="absolute top-3 right-14 z-10">
        <span
          class="px-2 py-0.5 rounded text-[10px] font-medium bg-teal-500 text-white"
        >
          {{ project.readyToPossessDate || "2025" }}
        </span>
      </div>
    </div>

    <!-- Info Section -->
    <div class="p-4 bg-black">
      <!-- Price -->
      <div class="mb-3">
        <p class="text-[10px] text-gray-400 uppercase">
          Group Target Price
        </p>
        <p class="text-lg font-bold text-white">
          {{ formatINR(project.priceMin) }}
        </p>
        <p class="text-xs text-gray-400">
          Market price up to
          <span class="line-through">{{
            formatINR(project.priceMax)
          }}</span>
        </p>
      </div>

      <!-- Join Button -->
      <button
        class="w-full rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
        @click.stop="redirect(project._id, 'project')"
      >
        Join Group
        <i class="pi pi-arrow-right text-xs"></i>
      </button>

      <!-- Carpet Area -->
      <p class="text-xs text-green-400 mt-3">
        ● {{ project.minCarpetArea }}–{{ project.maxCarpetArea }} sq.ft
        carpet area
      </p>

      <!-- Amenities -->
      <div
        v-if="project.amenities && project.amenities.length"
        class="flex flex-wrap items-center gap-1.5 mt-2"
      >
        <span
          v-for="(a, idx) in project.amenities.slice(0, 3)"
          :key="a.text + idx"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[10px]"
        >
          <img
            v-if="!imageErrors[project._id + a.text]"
            :src="a.iconLocation"
            :alt="a.text"
            class="h-2.5 w-2.5 object-contain"
            @error="handleImageError(project._id + a.text)"
          />
          <span>{{ a.text }}</span>
        </span>
        <span
          v-if="project.amenities.length > 3"
          class="text-[10px] text-gray-400"
        >
          +{{ project.amenities.length - 3 }} more
        </span>
      </div>

      <!-- CRM -->
      <div
        v-if="project.crmDetails"
        class="mt-3 flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1.5"
      >
        <img
          :src="project.crmDetails.crmProfileImageUrl"
          alt="CRM"
          class="h-6 w-6 rounded-full object-cover"
        />
        <div>
          <p class="text-[10px] font-semibold">Roffr Expert</p>
          <p class="text-[9px] text-gray-400">
            Responds in {{ project.crmDetails.crmResponseTime }}
          </p>
        </div>
      </div>
    </div>
  </article>
</div>


        <!-- Pagination -->
        <div class="my-6 flex items-center justify-center gap-4 text-sm">
          <button
            class="px-4 py-1.5 rounded-full border border-gray-300 text-gray-700 disabled:opacity-40 flex items-center gap-1 hover:bg-gray-50"
            :disabled="!canPrev"
            @click="prevPage"
          >
            <i class="pi pi-angle-left text-xs"></i>
            <span>Previous</span>
          </button>

          <span class="text-gray-700">
            Page
            <span class="font-semibold">{{ pageNumber }}</span>
            of
            <span class="font-semibold">{{ totalpages }}</span>
          </span>

          <button
            class="px-4 py-1.5 rounded-full border border-gray-300 text-gray-700 disabled:opacity-40 flex items-center gap-1 hover:bg-gray-50"
            :disabled="!canNext"
            @click="nextPage"
          >
            <span>Next</span>
            <i class="pi pi-angle-right text-xs"></i>
          </button>
        </div>
      </div>

      <!-- Right Side: Sticky Map -->
      <div class="hidden lg:block lg:w-[40%] xl:w-[45%]">
        <div class="sticky top-24 h-[calc(100vh-120px)]">
          <div
            class="w-full h-full rounded-2xl overflow-hidden bg-gray-100 shadow-lg border border-gray-200"
          >
            <PropertyMap ref="mapRef" :projects="filteredProjects" />
          </div>
        </div>
      </div>
    </div>

    <ShareModal
      :show="showShareModal"
      :url="shareUrl"
      :title="shareTitle"
      @close="closeShareModal"
    />
  </main>
</template>
