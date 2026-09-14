<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Building2 } from "lucide-vue-next";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useProjectStore } from "@/store/ProjectStore";
import { useInvitationStore } from "@/store/InvitationStore";
import { storeToRefs } from "pinia";
import { useDebounce } from "@/lib/debounce";

const projectStore = useProjectStore();
const invitationStore = useInvitationStore();
const router = useRouter();
const { projectData, totalPages, currentPage, pageSize } =
  storeToRefs(projectStore);
const { builderSuggestions } = storeToRefs(invitationStore);
const activeFilter = ref("");
const selectedBuilderId = ref("");
const searchQuery = ref("");

const builderOptions = computed(() => {
  return (builderSuggestions.value || [])
    .map((builder) => ({
      id: builder?._id || "",
      label: builder?.companyName || "Unknown Builder",
    }))
    .filter((builder) => Boolean(builder.id));
});

const requestFilters = () => ({
  search: searchQuery.value,
  status: activeFilter.value,
  companyId: selectedBuilderId.value,
});

onMounted(async () => {
  await Promise.all([
    projectStore.getProjectData(pageSize.value, currentPage.value, requestFilters()),
    invitationStore.getAvailableBuilders(),
  ]);
});

const fetchProjects = () => {
  projectStore.getProjectData(
    pageSize.value,
    currentPage.value,
    requestFilters(),
  );
};

watch([activeFilter, selectedBuilderId], () => {
  currentPage.value = 1;
  fetchProjects();
});

watch(currentPage, fetchProjects);

interface Project {
  id: string;
  name: string;
  image: string;
  status: string;
  priceRange: string;
  location: string;
  type: string;
}

const debouncedSearch = useDebounce(() => {
  currentPage.value = 1;
  projectStore.getProjectData(
    pageSize.value,
    currentPage.value,
    requestFilters(),
  );
}, 400);

watch(searchQuery, () => {
  debouncedSearch();
});

const getStatusColor = (status?: Project["status"]) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("pre")) {
    return "bg-blue-500 hover:bg-blue-600";
  }
  if (normalized.includes("ongoing") || normalized.includes("active")) {
    return "bg-green-500 hover:bg-green-600";
  }
  if (normalized.includes("complete") || normalized.includes("ready")) {
    return "bg-orange-500 hover:bg-orange-600";
  }
  return "bg-gray-500 hover:bg-gray-600";
};

const formatINR = (value: number) => {
  if (!value) return "";
  return Number(value).toLocaleString("en-IN");
};

const openProjectPage = (projectId?: string) => {
  if (!projectId) return;
  router.push(`/projects/${projectId}`);
};
</script>

<template>
  <section class="px-6">
    <!-- Header with Title and Filter Projects Button -->
    <div
      class="flex flex-col sm:flex-row items-start md:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6"
    >
      <div>
        <h1 class="text-3xl font-bold text-foreground tracking-tight">
          Project Catalog
        </h1>
        <p class="text-muted-foreground text-xs sm:text-sm mt-1">
          Manage and browse your active real estate developments
        </p>
      </div>
    </div>

    <!-- Search and Status Filters -->
    <div class="flex flex-col lg:flex-row gap-3 mb-4 sm:mb-6">
      <!-- Search Bar -->
      <div class="relative w-full">
        <Search
          class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          v-model="searchQuery"
          placeholder="Search by name, location or configuration..."
          class="pl-11 pr-4 text-sm rounded-lg"
        />
      </div>

      <div class="w-full lg:w-72">
        <select
          v-model="selectedBuilderId"
          class="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="">All Builders</option>
          <option
            v-for="builder in builderOptions"
            :key="builder.id"
            :value="builder.id"
          >
            {{ builder.label }}
          </option>
        </select>
      </div>

      <!-- Status Filter Buttons -->
      <div class="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
        <Button
          :variant="activeFilter === '' ? 'default' : 'outline'"
          @click="activeFilter = ''"
          size="default"
        >
          All
        </Button>
        <Button
          :variant="activeFilter === 'Ongoing' ? 'default' : 'outline'"
          @click="activeFilter = 'Ongoing'"
          size="default"
        >
          Ongoing
        </Button>
        <Button
          :variant="activeFilter === 'Completed' ? 'default' : 'outline'"
          @click="activeFilter = 'Completed'"
          size="default"
        >
          Completed
        </Button>
        <Button
          :variant="activeFilter === 'Pre-launch' ? 'default' : 'outline'"
          @click="activeFilter = 'Pre-launch'"
          size="default"
        >
          Pre-launch
        </Button>
      </div>
    </div>

    <!-- Project Grid - Responsive: 1 col mobile, 2 cols tablet, 3 cols desktop -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6"
    >
      <Card
        v-for="project in projectData"
        :key="project._id"
        class="overflow-hidden transition-all group hover:shadow-lg"
      >
        <!-- Project Image -->
        <div class="relative h-40 sm:h-44 lg:h-48 overflow-hidden">
          <img
            :src="project.propertyPictures?.[0] || ''"
            :alt="project.projectName"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Badge
            :class="getStatusColor(project.projectStatus)"
            class="absolute top-2 sm:top-3 left-2 sm:left-3 font-semibold text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 text-white border-0 uppercase"
          >
            {{ project.projectStatus }}
          </Badge>
        </div>

        <!-- Project Details -->
        <div class="p-3">
          <div class="flex items-start justify-between mb-2 sm:mb-3 gap-2">
            <h3
              class="text-base sm:text-lg font-bold text-foreground line-clamp-1"
            >
              {{ project.projectName }}
            </h3>
            <p
              class="text-sm sm:text-lg font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap"
            >
              ₹{{ formatINR(project?.minPrice) }}
            </p>
          </div>

          <div class="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
            <div
              class="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground"
            >
              <MapPin class="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span class="line-clamp-1">{{ project.venue }}</span>
            </div>
            <div
              class="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground"
            >
              <Building2 class="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span class="line-clamp-1">{{ project.builderName }}</span>
            </div>
          </div>

          <Button class="flex-1 w-full" @click="openProjectPage(project._id)">
            View Details
          </Button>
        </div>
      </Card>
    </div>

    <!-- PAGINATION -->
    <div class="flex justify-end mt-4">
      <Pagination
        :page="currentPage"
        :items-per-page="pageSize"
        :total="totalPages * pageSize"
        @update:page="(page) => (currentPage = page)"
      >
        <PaginationContent>
          <PaginationPrevious
            :disabled="currentPage === 1"
            @click="currentPage--"
          />

          <PaginationItem
            v-for="page in totalPages"
            :key="page"
            :value="page"
            :is-active="page === currentPage"
            @click="currentPage = page"
          >
            {{ page }}
          </PaginationItem>

          <PaginationNext
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          />
        </PaginationContent>
      </Pagination>
    </div>
  </section>
</template>
