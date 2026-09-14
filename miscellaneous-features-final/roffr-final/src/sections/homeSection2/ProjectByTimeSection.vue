<script setup>
import { ref, computed, onMounted } from "vue";
import { useProjectStore } from "@/stores/projectStore";
import { storeToRefs } from "pinia";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import ProjectCard from "@/components/ProjectCard.vue";

const projectStore = useProjectStore();
const { projectPropertyListData } = storeToRefs(projectStore);

onMounted(async () => {
  await projectStore.getProjectList();
});

// Tabs
const tabs = [
  { label: "Under Construction", key: "under" },
  { label: "Ready to Move", key: "ready" },
  { label: "New Launches", key: "upcoming" },
];

const activeTab = ref("under");

// ✅ Filter projects based on tab
const filteredProjects = computed(() => {
  if (!projectPropertyListData.value) return [];

  return projectPropertyListData.value.filter((project) => {
    if (activeTab.value === "under") {
      return project.projectStatus === "Under Construction";
    }
    if (activeTab.value === "ready") {
      return project.projectStatus === "Ready to Move";
    }
    if (activeTab.value === "upcoming") {
      return project.projectStatus === "New Launch";
    }
    return true;
  });
});

const activeCards = computed(() => filteredProjects.value);
</script>

<template>
  <section class="max-w-7xl mx-auto py-10 px-4 2xl:px-0">
    <h1 class="title-text text-center">Projects by Time</h1>

    <!-- Tabs -->
    <div
      class="flex items-center justify-center w-fit gap-6 border border-black p-1 rounded-full mx-auto mt-6"
    >
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        :class="[
          'px-5 py-2 rounded-full transition text-[11px] md:text-sm',
          activeTab === tab.key ? 'bg-black text-white' : 'text-gray-600',
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="!activeCards.length" class="text-center py-10 text-gray-500">
      No projects found
    </div>

    <!-- Swiper -->
    <div v-else class="mt-6">
      <Swiper
        :space-between="20"
        :slides-per-view="4"
        :breakpoints="{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 3 },
        }"
      >
        <SwiperSlide v-for="(card, index) in activeCards" :key="index" class="pb-4 !h-auto">
          <ProjectCard :project="card" />
        </SwiperSlide>
      </Swiper>
    </div>
  </section>
</template>
