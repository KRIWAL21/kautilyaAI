<script setup>
import { useRoute } from "vue-router";
import { computed } from "vue";
import { useBlogStore } from "@/stores/blogsStore";

const route = useRoute();
const blogStore = useBlogStore();

const blog = computed(() => blogStore.getBlogBySlug(route.params.slug));
</script>

<template>
  <div class="max-w-7xl mx-auto py-16 px-4 2xl:px-0">
    <div v-if="blog">
      <!-- 🔥 Category + Read Time -->
      <div class="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-10">
        <span class="bg-gray-100 px-3 py-1 rounded-full">
          {{ blog.category }}
        </span>

        <span>⏱ {{ blog.reading_time_min }} min read</span>
        <span>🌐 {{ blog.language }}</span>
      </div>

      <div class="">
        <img
          :src="blog.img"
          :alt="blog.title"
          class="h-[450px] w-full object-cover rounded-lg mt-4"
          @error="$event.target.src='/dummy/dummy-case2.webp'"
        />
      </div>

      <!-- 🧠 Title -->
      <h1 class="text-3xl md:text-4xl font-bold mt-4 leading-tight font-urbanist">
        {{ blog.title }}
      </h1>

      <!-- ✍️ Description -->
      <p class="mt-4 text-md font-urbanist">
        {{ blog.description }}
      </p>

      <!-- 🏷 Tags -->
      <div class="mt-4 flex flex-wrap gap-2">
        <span
          v-for="tag in blog.tags"
          :key="tag"
          class="text-xs border px-2 py-1 rounded-full"
        >
          #{{ tag }}
        </span>
      </div>

      <!-- 📖 Content -->
      <div
        class="prose prose-lg max-w-none mt-8 font-urbanist"
        v-html="blog.content_html"
      ></div>

    </div>

    <div v-else class="text-center py-20 text-gray-500">Blog not found</div>
  </div>
</template>
