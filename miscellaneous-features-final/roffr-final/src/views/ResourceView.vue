<script setup>
import { computed, watch, onMounted } from "vue";
import { useBlogStore } from "@/stores/blogsStore";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

const blogStore = useBlogStore();
const { blogData, pageNumber, totalpages, pageSize } = storeToRefs(blogStore);
const router = useRouter();

const fetchBlogs = async () => {
  await blogStore.getBlogData();
};

onMounted(fetchBlogs);

// refetch when page or page size changes
watch([pageNumber, pageSize], fetchBlogs);


const goToBlog = (slug) => {
  router.push(`/blog-details/${slug}`);
};

const canPrev = computed(() => pageNumber.value > 1);
const canNext = computed(() => pageNumber.value < totalpages.value);

const prevPage = () => {
  if (canPrev.value) pageNumber.value -= 1;
};

const nextPage = () => {
  if (canNext.value) pageNumber.value += 1;
};
</script>

<template>
  <main class="py-20 max-w-7xl mx-auto px-4 2xl:px-0">
    <div class="text-center mb-10">
      <h1 class="title-text">Blogs</h1>
      <p class="font-outfit">
        Stay updated with the latest real estate insights and trends
      </p>
    </div>

    <section class="px-4">
      <div class="">
        <!-- Heading -->
        <div class="px-6 mt-6">
          <!-- Carousel Wrapper -->
          <div class="mt-6 overflow-x-auto scrollbar-hide">
            <div class="flex gap-6 snap-x snap-mandatory scroll-smooth">
              <div
                v-for="blog in blogs"
                :key="blog.id"
                class="min-w-[85%] sm:min-w-[48%] lg:min-w-[32%] snap-start"
              >
                <!-- Card -->
                <div
                  class="border rounded-2xl overflow-hidden flex flex-col h-full bg-white"
                >
                  <!-- Image -->
                  <div class="h-60 w-full">
                    <img
                      :src="blog.img"
                      alt="Blog Image"
                      class="h-full w-full object-cover"
                    />
                  </div>

                  <!-- Content -->
                  <div class="p-4 flex flex-col flex-1">
                    <h2 class="font-semibold text-lg leading-relaxed">
                      {{ blog.title }}
                    </h2>

                    <p class="text-sm text-gray-500 mt-2 flex-1">
                      {{ blog.description?.slice(0, 100) }}...
                    </p>

                    <!-- Button -->
                    <button
                      class="mt-4 w-full border rounded-lg py-2 text-sm font-medium hover:bg-gray-100 transition"
                      @click="goToBlog(blog.slug)"
                    >
                      Read More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Prev / Page X of Y / Next -->
    <div
      v-if="totalpages > 1"
      class="mt-8 flex items-center justify-center gap-4 text-sm font-outfit"
    >
      <button
        class="px-4 py-1.5 rounded-full border border-gray-300 text-gray-700 disabled:opacity-40 flex items-center gap-1"
        :disabled="!canPrev"
        @click="prevPage"
      >
        <i class="pi pi-angle-left text-xs"></i>
        <span>Previous</span>
      </button>

      <span class="text-gray-700">
        Page
        <span class="font-semibold">{{ pageNumber }}</span>
        of
        <span class="font-semibold">{{ totalpages }}</span>
      </span>

      <button
        class="px-4 py-1.5 rounded-full border border-gray-300 text-gray-700 disabled:opacity-40 flex items-center gap-1"
        :disabled="!canNext"
        @click="nextPage"
      >
        <span>Next</span>
        <i class="pi pi-angle-right text-xs"></i>
      </button>
    </div>
    <!-- SUCCESS STORIES SECTION -->
  </main>
</template>
