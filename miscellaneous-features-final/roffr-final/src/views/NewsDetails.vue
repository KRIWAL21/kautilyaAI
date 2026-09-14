<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed } from "vue";
import { useNewsStore } from "@/stores/newsStore";

const route = useRoute();
const newsStore = useNewsStore();

const news = computed(() => {
  return newsStore.getNewsById(route.params.id);
});
</script>

<template>
  <div class="px-4 2xl:px-0 py-6 max-w-7xl mx-auto mt-20">
    
    <div v-if="news">
      
      <!-- 🔥 Title + Badge -->
      <div class="flex items-center gap-3">
        <span
          class="text-xs px-3 py-1 rounded-full"
          :style="{ backgroundColor: news.card.badge_color, color: '#fff' }"
        >
          {{ news.category.icon }} {{ news.category.name }}
        </span>

        <span class="text-sm font-semibold text-gray-500">
          {{ news.date.published }}
        </span>
      </div>

      <div class="">
        <img :src="news.img" :alt="news.title" class="w-full h-[450px] rounded-lg mt-4 object-cover" />
      </div>

      <h1 class="text-3xl font-bold mt-3 leading-snug">
        {{ news.title }}
      </h1>

      <p class="mt-3 text-gray-600 text-lg">
        {{ news.summary }}
      </p>

      <!-- 📍 Location + Language -->
      <div class="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
        <span>📍 {{ news.location.city }}, {{ news.location.state }}</span>
        <span>🌐 {{ news.language }}</span>
      </div>

      <!-- 🏷 Tags -->
      <div class="mt-4 flex flex-wrap gap-2">
        <span
          v-for="tag in news.tags"
          :key="tag"
          class="text-xs border px-2 py-1 rounded-full"
        >
          #{{ tag }}
        </span>
      </div>

      <!-- 📊 Impact Section -->
      <div class="mt-6 p-4 rounded-xl border">
        <h2 class="font-semibold text-lg mb-2">Market Impact</h2>

        <div class="flex items-center gap-3">
          <span
            class="text-xs px-2 py-1 rounded-full text-white"
            :style="{ backgroundColor: news.impact.color }"
          >
            {{ news.impact.label }}
          </span>

          <span class="text-sm text-gray-500 capitalize">
            {{ news.impact.sentiment }}
          </span>
        </div>

        <p class="mt-3 text-gray-600">
          {{ news.impact.market_effect }}
        </p>

        <p class="mt-2 text-gray-500 text-sm">
          {{ news.impact.buyer_effect }}
        </p>
      </div>

      <!-- 📈 Relevance -->
      <div class="mt-6">
        <span
          class="text-xs px-3 py-1 rounded-full text-white"
          :style="{ backgroundColor: news.relevance_to_raipur.color }"
        >
          {{ news.relevance_to_raipur.label }}
        </span>
      </div>

      <!-- 📰 Source -->
      <div class="mt-6 border-t pt-4">
        <h2 class="font-semibold mb-2">Source</h2>

        <div class="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p class="font-medium">{{ news.source.name }}</p>
            <p class="text-sm text-gray-500">
              {{ news.source.status }}
            </p>
          </div>

          <a
            :href="news.source.url"
            target="_blank"
            class="text-blue-600 underline text-sm"
          >
            Read Full Article →
          </a>
        </div>
      </div>

      <!-- 🔍 SEO (optional, dev/debug or hidden) -->
      <div class="mt-8 p-4 bg-black/10 rounded-lg text-sm">
        <p><strong>Meta Title:</strong> {{ news.seo.meta_title }}</p>
        <p><strong>Description:</strong> {{ news.seo.meta_description }}</p>
      </div>

    </div>

    <div v-else class="text-center py-20 text-gray-500">
      News not found
    </div>

  </div>
</template>