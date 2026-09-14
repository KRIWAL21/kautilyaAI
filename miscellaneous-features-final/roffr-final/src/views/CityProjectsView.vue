<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProjectStore } from "@/stores/projectStore";
import { storeToRefs } from "pinia";
import ProjectCard from "@/components/ProjectCard.vue";

const route  = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const { projectPropertyListData } = storeToRefs(projectStore);

const loading = ref(false);

const fetchProjects = async () => {
  loading.value = true;
  await projectStore.getProjectList("project", "", route.params.city);
  loading.value = false;
};

onMounted(fetchProjects);
watch(() => route.params.city, fetchProjects);

const cityLabel = () => {
  const c = route.params.city || "";
  return c.charAt(0).toUpperCase() + c.slice(1);
};
</script>

<template>
  <main class="max-w-7xl mx-auto px-4 xl:px-0 py-10 mt-24 md:mt-0">

    <!-- Breadcrumb / Back -->
    <div class="flex items-center gap-2 mb-6">
      <button
        @click="router.back()"
        class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <i class="pi pi-arrow-left text-xs"></i>
        Back
      </button>
      <span class="text-gray-300">/</span>
      <span class="text-sm text-gray-400">Cities</span>
      <span class="text-gray-300">/</span>
      <span class="text-sm font-semibold text-gray-800 capitalize">{{ cityLabel() }}</span>
    </div>

    <!-- Header -->
    <div class="mb-8">
      <h1 class="font-intertight font-bold text-[28px] md:text-[36px] text-gray-900 capitalize">
        Projects in {{ cityLabel() }}
      </h1>
      <p class="text-sm text-gray-500 mt-1">
        Browse all available group buy deals in {{ cityLabel() }}
      </p>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="h-[320px] rounded-2xl bg-gray-100 animate-pulse"></div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!projectPropertyListData?.length"
      class="text-center py-20 text-gray-400"
    >
      <i class="pi pi-building text-5xl opacity-25 block mb-4"></i>
      <p class="text-base font-medium">No projects found in {{ cityLabel() }}</p>
      <button
        @click="router.push('/cities')"
        class="mt-4 text-sm text-[#EB3131] font-semibold hover:underline"
      >
        Browse other cities
      </button>
    </div>

    <!-- Project grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProjectCard
        v-for="project in projectPropertyListData"
        :key="project._id"
        :project="project"
        :show-group-buy="true"
      />
    </div>

  </main>
</template>
