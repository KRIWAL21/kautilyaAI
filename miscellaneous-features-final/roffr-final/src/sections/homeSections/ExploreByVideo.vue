<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";

// ── Swiper nav ────────────────────────────────────────────────────────
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

// ── YouTube dialog ────────────────────────────────────────────────────
const activeVideo = ref(null);

const openVideo = (video) => { activeVideo.value = video; };
const closeVideo = () => { activeVideo.value = null; };

const handleKeydown = (e) => {
  if (e.key === "Escape") closeVideo();
};

onMounted(() => document.addEventListener("keydown", handleKeydown));
onBeforeUnmount(() => document.removeEventListener("keydown", handleKeydown));

// ── Video data ─────────────────────────────────────────────────────────
// Verified working YouTube real estate tour videos
const videos = [
  {
    id: "VNt9lOMEnPo",
    title: "Luxury Apartment Tour – Mumbai",
    tag: "LUXURY",
  },
  {
    id: "NbHzqTlvm3c",
    title: "Modern Villa Walkthrough – Bangalore",
    tag: "",
  },
  {
    id: "FD4S4SYVmmA",
    title: "Premium 3BHK Interior – Pune",
    tag: "",
  },
  {
    id: "UUdf2vJVEAQ",
    title: "High-Rise Living – Hyderabad",
    tag: "NEW",
  },
  {
    id: "sBupgd2k_OE",
    title: "Gated Community Tour – Chennai",
    tag: "",
  },
  {
    id: "vWuoK0X32qg",
    title: "Affordable Homes – Raipur",
    tag: "",
  },
  {
    id: "jde1DiWl4yA",
    title: "Luxury Penthouse – Delhi NCR",
    tag: "LUXURY",
  },
];

const thumbUrl = (id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
const embedUrl = (id) => `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
</script>

<template>
  <section class="max-w-7xl mx-auto py-14 px-4 xl:px-0">
    <!-- Header -->
    <div class="flex items-center justify-between mb-7">
      <h2 class="font-intertight font-bold text-[26px] md:text-[32px] text-gray-900">
        Explore Projects Through Video
      </h2>

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
      :space-between="14"
      :breakpoints="{
        320:  { slidesPerView: 1.2 },
        480:  { slidesPerView: 1.8 },
        768:  { slidesPerView: 2.6 },
        1024: { slidesPerView: 3.5 },
        1280: { slidesPerView: 4 },
      }"
      @swiper="onSwiper"
      @slideChange="onSlideChange"
    >
      <SwiperSlide v-for="video in videos" :key="video.id">
        <div
          class="relative rounded-2xl overflow-hidden cursor-pointer group h-[420px] bg-gray-200"
          @click="openVideo(video)"
        >
          <!-- YouTube thumbnail -->
          <img
            :src="thumbUrl(video.id)"
            :alt="video.title"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <!-- Dark overlay -->
          <div class="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors duration-300"></div>

          <!-- Play button -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-200">
              <i class="pi pi-play text-gray-800 text-lg ml-1"></i>
            </div>
          </div>

          <!-- Tag badge -->
          <span
            v-if="video.tag"
            class="absolute bottom-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-sm tracking-widest uppercase shadow"
          >
            {{ video.tag }}
          </span>

          <!-- Title on hover -->
          <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <p class="text-white text-[11px] font-medium leading-tight line-clamp-2">{{ video.title }}</p>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- Progress dots -->
    <div class="flex items-center gap-1.5 mt-5">
      <div class="h-1.5 w-8 rounded-full bg-[#EB3131]"></div>
      <div class="h-1.5 w-2 rounded-full bg-gray-200"></div>
      <div class="h-1.5 w-2 rounded-full bg-gray-200"></div>
    </div>
  </section>

  <!-- ── YouTube Dialog ───────────────────────────────────────────── -->
  <teleport to="body">
    <transition name="dialog-fade">
      <div
        v-if="activeVideo"
        class="fixed inset-0 z-[999] flex items-center justify-center p-4"
        @click.self="closeVideo"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="closeVideo"></div>

        <!-- Dialog box -->
        <div class="relative w-full max-w-4xl z-10 rounded-2xl overflow-hidden shadow-2xl bg-black">
          <!-- Close button -->
          <button
            @click="closeVideo"
            class="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <i class="pi pi-times text-sm"></i>
          </button>

          <!-- YouTube iframe (16:9) -->
          <div class="aspect-video w-full">
            <iframe
              :src="embedUrl(activeVideo.id)"
              :title="activeVideo.title"
              class="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>

          <!-- Video title bar -->
          <div class="px-5 py-3 bg-gray-900">
            <p class="text-white text-sm font-medium">{{ activeVideo.title }}</p>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.25s ease;
}
.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
.dialog-fade-enter-active .relative,
.dialog-fade-leave-active .relative {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.dialog-fade-enter-from .relative,
.dialog-fade-leave-to .relative {
  transform: scale(0.95);
  opacity: 0;
}
</style>
