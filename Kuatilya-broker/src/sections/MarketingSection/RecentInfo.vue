<script setup lang="ts">
import { useMarketingStore } from "@/store/MarketingStore";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";

onMounted(async () => {
  await marketingStore.getMarketingData();
});

const marketingStore = useMarketingStore();
const { marketingData } = storeToRefs(marketingStore);

const recentItems = [
  {
    title: "Modern Penthouse Render",
    time: "2 hours ago",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Q3 Market Report Deck",
    time: "5 hours ago",
    image:
      "https://images.unsplash.com/photo-1551288049-bbbda5366391?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Skyline Villas Reel",
    time: "Yesterday",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Lead Follow-up Script",
    time: "Yesterday",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800",
  },
];

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
};
</script>

<template>
  <div class="p-6 md:p-10 space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-semibold text-foreground">Recent Generations</h2>
      <a
        href="#"
        class="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
      >
        View All Library
      </a>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="item in marketingData"
        :key="item._id"
        class="group cursor-pointer"
      >
        <div
          class="relative aspect-square overflow-hidden rounded-2xl bg-muted"
        >
          <img
            :src="item.contentUrl"
            :alt="item.projectName"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 shadow-lg"
          />
          <div
            class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"
          />
        </div>

        <div class="mt-4 space-y-1">
          <h3
            class="text-foreground font-medium text-sm transition-colors group-hover:text-primary"
          >
            {{ item.title }}
          </h3>
          <p class="text-muted-foreground text-xs">
            Created At :- {{ formatDate(item.createdAt) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth transition for images */
img {
  will-change: transform;
}
</style>
