<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useProjectStore } from "@/stores/projectStore";
import { storeToRefs } from "pinia";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import ProjectCard from "@/components/ProjectCard.vue";

const swiperInstance = ref(null);
const isBeginning = ref(true);
const isEnd = ref(false);

const onSwiper = (swiper) => {
  swiperInstance.value = swiper;
  isBeginning.value = swiper.isBeginning;
  isEnd.value = swiper.isEnd;
};
const onSlideChange = (swiper) => {
  isBeginning.value = swiper.isBeginning;
  isEnd.value = swiper.isEnd;
};
const slidePrev = () => swiperInstance.value?.slidePrev();
const slideNext = () => swiperInstance.value?.slideNext();

const projectStore = useProjectStore();
const { projectPropertyListData } = storeToRefs(projectStore);

onMounted(async () => {
  await projectStore.getProjectList();
  document.addEventListener("click", closeAllDropdowns);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", closeAllDropdowns);
});

// ── Filters ──────────────────────────────────────────────────────────
const selectedType       = ref("");
const selectedBudget     = ref("");
const selectedPossession = ref("");
const selectedSort       = ref("Popular");

const filterOptions = {
  type:       ["Apartment", "Villa", "Plot", "Commercial", "Studio"],
  budget:     ["Under 50L", "50L – 1Cr", "1Cr – 2Cr", "2Cr – 5Cr", "5Cr+"],
  possession: ["Ready to Move", "Under Construction", "New Launch"],
  sort:       ["Popular", "Price: Low to High", "Price: High to Low", "Newest"],
};

const openDropdown = ref("");
const toggleDropdown = (name, e) => {
  e.stopPropagation();
  openDropdown.value = openDropdown.value === name ? "" : name;
};
const closeAllDropdowns = () => { openDropdown.value = ""; };

const select = (filter, value) => {
  if (filter === "type")       selectedType.value = value;
  else if (filter === "budget")      selectedBudget.value = value;
  else if (filter === "possession")  selectedPossession.value = value;
  else if (filter === "sort")        selectedSort.value = value;
  openDropdown.value = "";
};

const clearFilter = (filter, e) => {
  e.stopPropagation();
  if (filter === "type")       selectedType.value = "";
  else if (filter === "budget")      selectedBudget.value = "";
  else if (filter === "possession")  selectedPossession.value = "";
};

const activeCount = computed(() =>
  [selectedType.value, selectedBudget.value, selectedPossession.value].filter(Boolean).length
);

// ── Filtered + sorted list ───────────────────────────────────────────
const filteredProjects = computed(() => {
  if (!projectPropertyListData.value?.length) return [];
  let list = [...projectPropertyListData.value];

  if (selectedType.value)
    list = list.filter((p) => p.propertyType === selectedType.value);

  if (selectedPossession.value)
    list = list.filter((p) => p.projectStatus === selectedPossession.value);

  if (selectedBudget.value) {
    list = list.filter((p) => {
      const price = p.minPrice;
      if (!price) return true;
      if (selectedBudget.value === "Under 50L")  return price < 5_000_000;
      if (selectedBudget.value === "50L – 1Cr")  return price >= 5_000_000  && price < 10_000_000;
      if (selectedBudget.value === "1Cr – 2Cr")  return price >= 10_000_000 && price < 20_000_000;
      if (selectedBudget.value === "2Cr – 5Cr")  return price >= 20_000_000 && price < 50_000_000;
      if (selectedBudget.value === "5Cr+")        return price >= 50_000_000;
      return true;
    });
  }

  if (selectedSort.value === "Price: Low to High")
    list.sort((a, b) => (a.minPrice || 0) - (b.minPrice || 0));
  else if (selectedSort.value === "Price: High to Low")
    list.sort((a, b) => (b.minPrice || 0) - (a.minPrice || 0));

  return list;
});
</script>

<template>
  <section class="max-w-7xl mx-auto py-14 px-4 xl:px-0">

    <!-- ── Header row ─────────────────────────────────────────── -->
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="font-intertight font-bold text-[26px] md:text-[34px] xl:text-[40px] bg-gradient-to-r from-[#DDA439] to-[#E8820C] bg-clip-text text-transparent leading-tight">
          Deal Of The Day
        </h2>
        <p class="text-sm text-gray-500 mt-0.5">Handpicked group deals refreshed daily</p>
      </div>

      <!-- Nav buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <button
          @click="slidePrev"
          :disabled="isBeginning"
          class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border"
          :class="isBeginning
            ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white'
            : 'border-gray-200 bg-white text-gray-600 hover:bg-[#EB3131] hover:border-[#EB3131] hover:text-white shadow-sm'"
        >
          <i class="pi pi-angle-left text-sm"></i>
        </button>
        <button
          @click="slideNext"
          :disabled="isEnd"
          class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border"
          :class="isEnd
            ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white'
            : 'border-gray-200 bg-white text-gray-600 hover:bg-[#EB3131] hover:border-[#EB3131] hover:text-white shadow-sm'"
        >
          <i class="pi pi-angle-right text-sm"></i>
        </button>
      </div>
    </div>

    <!-- ── Filter row ─────────────────────────────────────────── -->
    <div class="flex items-center justify-between flex-wrap gap-3 mt-6">

      <!-- Left filter pills -->
      <div class="flex items-center gap-2 flex-wrap">

        <!-- Active count badge -->
        <div v-if="activeCount" class="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
          <span class="bg-[#EB3131] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">{{ activeCount }}</span>
          filters active
          <button
            @click="selectedType = ''; selectedBudget = ''; selectedPossession = ''"
            class="text-[#EB3131] hover:underline ml-1"
          >Clear all</button>
        </div>

        <!-- Property Type -->
        <div class="relative">
          <button
            @click="toggleDropdown('type', $event)"
            class="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200"
            :class="selectedType
              ? 'bg-[#EB3131] text-white border-[#EB3131] shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-800'"
          >
            <i class="pi pi-home text-[11px]"></i>
            <span>{{ selectedType || 'Property Type' }}</span>
            <button v-if="selectedType" @click.stop="clearFilter('type', $event)" class="hover:opacity-70 ml-0.5">
              <i class="pi pi-times text-[9px]"></i>
            </button>
            <i v-else class="pi pi-angle-down text-[10px] opacity-60"></i>
          </button>
          <transition name="dropdown">
            <div v-if="openDropdown === 'type'"
                 class="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 min-w-[170px] py-1.5 overflow-hidden">
              <button
                v-for="opt in filterOptions.type" :key="opt"
                @click="select('type', opt)"
                class="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-3 transition-colors"
                :class="selectedType === opt ? 'text-[#EB3131] font-semibold bg-red-50' : 'text-gray-700 hover:bg-gray-50'"
              >
                {{ opt }}
                <i v-if="selectedType === opt" class="pi pi-check text-[10px]"></i>
              </button>
            </div>
          </transition>
        </div>

        <!-- Budget -->
        <div class="relative">
          <button
            @click="toggleDropdown('budget', $event)"
            class="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200"
            :class="selectedBudget
              ? 'bg-[#EB3131] text-white border-[#EB3131] shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-800'"
          >
            <i class="pi pi-indian-rupee text-[11px]"></i>
            <span>{{ selectedBudget || 'Budget' }}</span>
            <button v-if="selectedBudget" @click.stop="clearFilter('budget', $event)" class="hover:opacity-70 ml-0.5">
              <i class="pi pi-times text-[9px]"></i>
            </button>
            <i v-else class="pi pi-angle-down text-[10px] opacity-60"></i>
          </button>
          <transition name="dropdown">
            <div v-if="openDropdown === 'budget'"
                 class="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 min-w-[170px] py-1.5 overflow-hidden">
              <button
                v-for="opt in filterOptions.budget" :key="opt"
                @click="select('budget', opt)"
                class="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-3 transition-colors"
                :class="selectedBudget === opt ? 'text-[#EB3131] font-semibold bg-red-50' : 'text-gray-700 hover:bg-gray-50'"
              >
                {{ opt }}
                <i v-if="selectedBudget === opt" class="pi pi-check text-[10px]"></i>
              </button>
            </div>
          </transition>
        </div>

        <!-- Possession -->
        <div class="relative">
          <button
            @click="toggleDropdown('possession', $event)"
            class="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200"
            :class="selectedPossession
              ? 'bg-[#EB3131] text-white border-[#EB3131] shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-800'"
          >
            <i class="pi pi-calendar text-[11px]"></i>
            <span>{{ selectedPossession || 'Possession' }}</span>
            <button v-if="selectedPossession" @click.stop="clearFilter('possession', $event)" class="hover:opacity-70 ml-0.5">
              <i class="pi pi-times text-[9px]"></i>
            </button>
            <i v-else class="pi pi-angle-down text-[10px] opacity-60"></i>
          </button>
          <transition name="dropdown">
            <div v-if="openDropdown === 'possession'"
                 class="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 min-w-[190px] py-1.5 overflow-hidden">
              <button
                v-for="opt in filterOptions.possession" :key="opt"
                @click="select('possession', opt)"
                class="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-3 transition-colors"
                :class="selectedPossession === opt ? 'text-[#EB3131] font-semibold bg-red-50' : 'text-gray-700 hover:bg-gray-50'"
              >
                {{ opt }}
                <i v-if="selectedPossession === opt" class="pi pi-check text-[10px]"></i>
              </button>
            </div>
          </transition>
        </div>
      </div>

      <!-- Sort By -->
      <div class="relative">
        <button
          @click="toggleDropdown('sort', $event)"
          class="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-gray-400 transition-all duration-200 shadow-sm"
        >
          <i class="pi pi-sort-alt text-[11px] text-gray-400"></i>
          <span class="text-gray-400">Sort:</span>
          <span class="font-semibold text-gray-800">{{ selectedSort }}</span>
          <i class="pi pi-angle-down text-[10px] opacity-60"></i>
        </button>
        <transition name="dropdown">
          <div v-if="openDropdown === 'sort'"
               class="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 min-w-[210px] py-1.5 overflow-hidden">
            <button
              v-for="opt in filterOptions.sort" :key="opt"
              @click="select('sort', opt)"
              class="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-3 transition-colors"
              :class="selectedSort === opt ? 'text-[#EB3131] font-semibold bg-red-50' : 'text-gray-700 hover:bg-gray-50'"
            >
              {{ opt }}
              <i v-if="selectedSort === opt" class="pi pi-check text-[10px]"></i>
            </button>
          </div>
        </transition>
      </div>
    </div>

    <!-- ── Empty state ────────────────────────────────────────── -->
    <div v-if="!filteredProjects.length" class="text-center py-20 text-gray-400">
      <i class="pi pi-filter-slash text-4xl mb-4 block opacity-30"></i>
      <p class="text-sm font-medium">No projects match the selected filters</p>
      <button
        @click="selectedType = ''; selectedBudget = ''; selectedPossession = ''"
        class="mt-3 text-[#EB3131] text-sm font-semibold hover:underline"
      >Clear all filters</button>
    </div>

    <!-- ── Swiper ─────────────────────────────────────────────── -->
    <div v-else class="mt-8">
      <Swiper
        :space-between="20"
        :breakpoints="{
          320:  { slidesPerView: 1 },
          640:  { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }"
        class="!pb-2"
        @swiper="onSwiper"
        @slideChange="onSlideChange"
      >
        <SwiperSlide
          v-for="(project, index) in filteredProjects"
          :key="project._id || index"
          class="!h-auto"
        >
          <ProjectCard :project="project" :show-group-buy="true" />
        </SwiperSlide>
      </Swiper>
    </div>
  </section>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>
