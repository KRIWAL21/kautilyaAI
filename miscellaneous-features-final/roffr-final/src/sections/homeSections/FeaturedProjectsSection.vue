<script setup>
import { ref, computed, onMounted } from "vue";
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
const { featuredProjects } = storeToRefs(projectStore);

onMounted(async () => {
  // Pull the super-admin curated featured list. Previously this section
  // re-used the full project list, so every active project showed up
  // under "Featured" — the curation flag now drives the real feed.
  await projectStore.getFeaturedProjects();
});

const projects = computed(() => featuredProjects.value || []);
</script>

<template>
  <section class="max-w-7xl mx-auto py-14 px-4 xl:px-0">

    <!-- Header row -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <span class="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wide mb-3">
          <i class="pi pi-star-fill text-[9px]"></i>
          Featured
        </span>
        <h2 class="font-intertight font-bold text-[26px] md:text-[34px] xl:text-[40px] text-[#1a2b5f] leading-tight">
          Featured Projects
        </h2>
        <p class="text-sm text-gray-500 mt-1">Handpicked properties curated by our experts</p>
      </div>

      <!-- Nav buttons -->
      <div class="flex items-center gap-2 shrink-0 mt-2">
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

    <!-- Empty state -->
    <div v-if="!projects.length" class="text-center py-20 text-gray-400">
      <i class="pi pi-star text-4xl mb-4 block opacity-30"></i>
      <p class="text-sm font-medium">No featured projects available right now</p>
    </div>

    <!-- Swiper -->
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
          v-for="(project, index) in projects"
          :key="project._id || index"
          class="!h-auto"
        >
          <ProjectCard :project="project" :show-group-buy="true" />
        </SwiperSlide>
      </Swiper>
    </div>
  </section>
</template>
