<script setup>
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { usePropertyStore } from "@/stores/propertyStore";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import ProjectCard from "@/components/ProjectCard.vue";

const propertyStore = usePropertyStore();
const { propertyData } = storeToRefs(propertyStore);

const projects = computed(() => {
  const list = Array.isArray(propertyData.value)
    ? propertyData.value
    : propertyData.value?.properties || propertyData.value?.results || [];

  return list.map((p) => ({
    _id: p._id || p.id,
    propertyPictures: p.media?.images || [],
    projectName: p.title || "Property",
    builderName: [p.property_details?.bhk, p.property_details?.unit_type]
      .filter(Boolean)
      .join(" • "),
    venue:
      [p.location?.locality, p.location?.city, p.location?.state]
        .filter(Boolean)
        .join(", ") || "—",
    minPrice: p.price || p.property_details?.price || null,
    maxPrice: null,
    projectReraNumber: p.rera_number || null,
    projectStatus: p.status || p.property_details?.status || null,
  }));
});

const swiperRef = ref(null);

onMounted(async () => {
  if (!propertyData.value || propertyData.value.length === 0) {
    await propertyStore.getProperty();
  }
});
</script>

<template>
  <section class="max-w-7xl mx-auto py-10 px-4 2xl:px-0">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 class="title-text">Properties For Sale</h1>
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
      No properties available right now.
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
      <SwiperSlide v-for="(project, i) in projects" :key="project._id || i" class="pb-4 !h-auto">
        <ProjectCard
          :project="project"
          :show-group-buy="false"
          detail-path="/property-details"
        />
      </SwiperSlide>
    </Swiper>
  </section>
</template>
