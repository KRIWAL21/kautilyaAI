<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { blogs } from "@/data/blogsData";

const router = useRouter();

const blogList = blogs.slice(0, 10);

const swiperInstance = ref(null);
const isBeginning = ref(true);
const isEnd = ref(false);

const onSwiper = (swiper) => {
  swiperInstance.value = swiper;
  isBeginning.value = swiper.isBeginning;
  isEnd.value = swiper.isEnd;
};
const onSlideChange = (swiper) => {
  isBeginning.value = swiper.isBeginning;
  isEnd.value = swiper.isEnd;
};
const slidePrev = () => swiperInstance.value?.slidePrev();
const slideNext = () => swiperInstance.value?.slideNext();

const goToBlog = (slug) => {
  router.push(`/blog-details/${slug}`);
};
</script>

<template>
  <section class="max-w-7xl mx-auto py-14 px-4 xl:px-0">
    <!-- Header -->
    <div class="flex items-center justify-between mb-7">
      <div>
        <h2 class="font-intertight font-bold text-[26px] md:text-[32px] text-gray-900">
          Blogs & Insights
        </h2>
        <router-link to="/blogs" class="text-sm text-[#EB3131] font-medium hover:underline mt-0.5 inline-block">
          View all articles →
        </router-link>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button
          @click="slidePrev"
          :disabled="isBeginning"
          class="w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200"
          :class="isBeginning
            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
            : 'border-gray-300 text-gray-600 hover:border-[#EB3131] hover:text-[#EB3131] hover:bg-red-50'"
        >
          <i class="pi pi-angle-left text-sm"></i>
        </button>
        <button
          @click="slideNext"
          :disabled="isEnd"
          class="w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200"
          :class="isEnd
            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
            : 'border-gray-300 text-gray-600 hover:border-[#EB3131] hover:text-[#EB3131] hover:bg-red-50'"
        >
          <i class="pi pi-angle-right text-sm"></i>
        </button>
      </div>
    </div>

    <!-- Swiper -->
    <Swiper
      :space-between="20"
      :breakpoints="{
        320:  { slidesPerView: 1.1 },
        480:  { slidesPerView: 1.5 },
        768:  { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
        1280: { slidesPerView: 3 },
      }"
      @swiper="onSwiper"
      @slideChange="onSlideChange"
    >
      <SwiperSlide
        v-for="blog in blogList"
        :key="blog.blog_id"
        class="!h-auto"
      >
        <article
          @click="goToBlog(blog.slug)"
          class="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-full flex flex-col"
        >
          <!-- Full-width cover image — no text overlay -->
          <div class="h-52 overflow-hidden shrink-0 relative bg-gray-100">
            <img
              :src="blog.img"
              :alt="blog.title"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              @error="$event.target.src='/dummy/dummy-case2.webp'"
            />
            <!-- Category pill over image bottom-left -->
            <span class="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-gray-600 uppercase tracking-wider px-2.5 py-1 rounded-full">
              {{ blog.category }}
            </span>
          </div>

          <!-- Body -->
          <div class="p-5 flex flex-col gap-3 flex-1">
            <!-- Title -->
            <h3 class="font-bold text-gray-900 text-[15px] leading-snug line-clamp-2 flex-1">
              {{ blog.title }}
            </h3>

            <!-- Description -->
            <p class="text-[12px] text-gray-500 leading-relaxed line-clamp-2">
              {{ blog.description }}
            </p>

            <!-- Footer -->
            <div class="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-gray-100">
              <span class="text-[11px] font-semibold text-[#EB3131]">Read More →</span>
              <div class="flex items-center gap-1 text-[10px] text-gray-400">
                <i class="pi pi-clock text-[9px]"></i>
                <span>{{ blog.reading_time_min }} min read</span>
              </div>
            </div>
          </div>
        </article>
      </SwiperSlide>
    </Swiper>

    <!-- Progress dots -->
    <div class="flex items-center gap-1.5 mt-6">
      <div class="h-1.5 w-8 rounded-full bg-[#EB3131]"></div>
      <div class="h-1.5 w-2 rounded-full bg-gray-200"></div>
      <div class="h-1.5 w-2 rounded-full bg-gray-200"></div>
    </div>
  </section>
</template>
