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

const redirect = (id) => {
  router.push(`/blog-details/${id}`);
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
      <h1 class="title-text">Articles</h1>
      <p class="font-outfit">
        Stay updated with the latest real estate insights and trends
      </p>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <article
        v-for="blog in blogData"
        :key="blog._id"
        class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group"
        @click="redirect(blog._id)"
      >
        <div class="flex flex-col sm:flex-row h-full">
          <!-- Image Section -->
          <div class="w-full sm:w-2/5 h-48 sm:h-auto flex-shrink-0">
            <img
              :src="blog.coverImage"
              :alt="blog.title"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Content Section -->
          <div class="flex-1 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <h2
                class="font-outfit font-bold text-base sm:text-lg md:text-xl line-clamp-2 mb-2 group-hover:text-[#EB3131] transition-colors"
              >
                {{ blog.title }}
              </h2>
              <p class="text-xs sm:text-sm text-gray-600 line-clamp-3 mb-4">
                {{ blog.description }}
              </p>
            </div>

            <!-- Footer with Author and Date -->
            <div class="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-semibold">
                  {{ blog.author?.name?.charAt(0) || 'D' }}
                </div>
                <span class="text-xs sm:text-sm font-medium text-gray-700">
                  {{ blog.author?.name || 'Roffr Team' }}
                </span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs text-gray-500">
                  {{
                    new Date(blog.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                </span>
                <i class="pi pi-bookmark text-gray-400 text-sm hover:text-[#EB3131] transition-colors"></i>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>

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
  </main>
</template>
