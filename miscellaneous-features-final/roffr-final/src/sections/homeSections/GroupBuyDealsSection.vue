<script setup>
import { ref, computed, onMounted } from "vue";
import { useGroupBuyStore } from "@/stores/groupBuyStore";
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

const groupBuyStore = useGroupBuyStore();
const { activeCampaigns, loading } = storeToRefs(groupBuyStore);

onMounted(async () => {
  await groupBuyStore.fetchActiveCampaigns();
});

// API returns projectId as a populated object. Pass it to ProjectCard so
// ProjectCard can find the campaign in the store cache without extra calls.
const deals = computed(() =>
  activeCampaigns.value.filter(c => c.projectId?._id).map(c => c.projectId)
);
</script>

<template>
  <section class="max-w-7xl mx-auto py-14 px-4 xl:px-0">

    <!-- Header row -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <span class="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#EB3131] text-white uppercase tracking-wide mb-3">
          <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block"></span>
          Live Now
        </span>
        <h2 class="font-intertight font-bold text-[26px] md:text-[34px] xl:text-[40px] text-[#1a2b5f] leading-tight">
          Group Buying Deals
        </h2>
        <p class="text-sm text-gray-500 mt-1">Join a group and unlock exclusive discounts — more buyers, bigger savings</p>
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

    <!-- Loading skeleton -->
    <div v-if="loading" class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="n in 3"
        :key="n"
        class="rounded-3xl border border-gray-100 bg-white h-[480px] animate-pulse"
      >
        <div class="h-64 bg-gray-100 rounded-t-3xl"></div>
        <div class="p-5 space-y-3">
          <div class="h-4 bg-gray-100 rounded w-3/4"></div>
          <div class="h-3 bg-gray-100 rounded w-1/2"></div>
          <div class="h-10 bg-gray-100 rounded-xl mt-4"></div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!deals.length" class="text-center py-20 text-gray-400">
      <i class="pi pi-tag text-4xl mb-4 block opacity-30"></i>
      <p class="text-sm font-medium">No active group buying deals right now — check back soon</p>
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
          v-for="project in deals"
          :key="project._id"
          class="!h-auto"
        >
          <ProjectCard :project="project" :show-group-buy="true" />
        </SwiperSlide>
      </Swiper>
    </div>

  </section>
</template>
