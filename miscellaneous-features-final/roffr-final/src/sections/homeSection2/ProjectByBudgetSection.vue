<script setup>
import { onMounted, computed, ref } from "vue";
import { useProjectStore } from "@/stores/projectStore";
import { storeToRefs } from "pinia";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import ProjectCard from "@/components/ProjectCard.vue";

const projectStore = useProjectStore();
const { projectAffordablityData } = storeToRefs(projectStore);

const projects = computed(() =>
  Array.isArray(projectAffordablityData.value) ? projectAffordablityData.value : []
);

const swiperRef = ref(null);

onMounted(async () => {
  if (!projectAffordablityData.value || projectAffordablityData.value.length === 0) {
    await projectStore.getProjectAffordiablityData();
  }
});
</script>

<template>
  <section class="max-w-7xl mx-auto py-10 px-4 2xl:px-0">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 class="title-text">Projects by Budget</h1>
      <div class="flex gap-2">
        <button
          @click="swiperRef?.slidePrev()"
          class="w-10 h-10 rounded-full border border-black/20 flex items-center justify-center hover:bg-black hover:text-white transition"
          aria-label="Previous"
        >
          <i class="pi pi-chevron-left text-sm"></i>
        </button>
        <button
          @click="swiperRef?.slideNext()"
          class="w-10 h-10 rounded-full border border-black/20 flex items-center justify-center hover:bg-black hover:text-white transition"
          aria-label="Next"
        >
          <i class="pi pi-chevron-right text-sm"></i>
        </button>
      </div>
    </div>

    <div v-if="projects.length === 0" class="text-center py-10 text-gray-500">
      No budget-sorted projects to show right now.
    </div>

    <Swiper
      v-else
      :space-between="20"
      :breakpoints="{
        320: { slidesPerView: 1 },
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
        1280: { slidesPerView: 3 },
      }"
      @swiper="(s) => (swiperRef = s)"
    >
      <SwiperSlide v-for="project in projects" :key="project._id || project.id" class="pb-4 !h-auto">
        <ProjectCard :project="project" :show-group-buy="false" />
      </SwiperSlide>
    </Swiper>
  </section>
</template>
