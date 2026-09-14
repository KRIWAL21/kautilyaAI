<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useProjectStore } from "@/stores/projectStore";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";

const router = useRouter();
const projectStore = useProjectStore();
const { groupBuyingData } = storeToRefs(projectStore);

const colors = [
  "bg-[#E8DFC8]",
  "bg-[#EADDE3]",
  "bg-[#DCEBE3]",
  "bg-[#DCE3EC]",
  "bg-[#F1E4D3]",
  "bg-[#FCE7F3]",
];

const cards = computed(() => {
  const list = Array.isArray(groupBuyingData.value)
    ? groupBuyingData.value
    : groupBuyingData.value?.data || [];
  return list.map((project, idx) => ({
    id: project._id || project.id,
    title: project.projectName || "Project",
    venue: project.venue || project.glocation || "",
    minPrice: Number(project.minPrice ?? 0),
    maxPrice: Number(project.maxPrice ?? 0),
    image: project.propertyPictures?.[0] || project.floorPlan?.[0] || "",
    bg: colors[idx % colors.length],
  }));
});

const formatINR = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN")}`;

const goToProject = (id) => {
  if (!id) return;
  router.push(`/project-details/${id}`);
};

onMounted(async () => {
  if (!groupBuyingData.value || groupBuyingData.value.length === 0) {
    await projectStore.getGroupBuyingData();
  }
});
</script>

<template>
  <section class="max-w-7xl mx-auto py-10 px-4 2xl:px-0">
    <h1 class="title-text text-center">Exclusive Projects</h1>

    <div v-if="cards.length === 0" class="text-center mt-10 text-gray-500">
      No exclusive projects to show right now.
    </div>

    <div v-else class="mt-6">
      <Swiper
        :space-between="20"
        :slides-per-view="3"
        :breakpoints="{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 3 },
        }"
      >
        <SwiperSlide v-for="card in cards" :key="card.id">
          <div
            class="rounded-2xl h-[320px] flex flex-col justify-between shadow-sm overflow-hidden cursor-pointer relative"
            :class="card.image ? 'text-white' : card.bg + ' text-gray-900'"
            @click="goToProject(card.id)"
          >
            <img
              v-if="card.image"
              :src="card.image"
              :alt="card.title"
              class="absolute inset-0 w-full h-full object-cover"
            />
            <div
              v-if="card.image"
              class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
            ></div>

            <div class="relative z-10 p-5 flex flex-col justify-between h-full">
              <span
                class="self-start text-[11px] uppercase tracking-wider px-3 py-1 rounded-full bg-white/90 text-orange-600 font-semibold"
              >
                Exclusive
              </span>

              <div>
                <h2 class="text-lg font-semibold line-clamp-2">{{ card.title }}</h2>
                <p class="text-sm opacity-90 mt-1">{{ card.venue }}</p>
                <p class="text-sm font-semibold mt-2">
                  {{ formatINR(card.minPrice) }}
                  <span v-if="card.maxPrice" class="opacity-90">
                    – {{ formatINR(card.maxPrice) }}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  </section>
</template>
