<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from "vue"
import gsap from "gsap"
import AnimatedTitle from "@/components/AnimatedTitle.vue"

// Swiper
import { Swiper, SwiperSlide } from "swiper/vue"
import { Autoplay, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"

const modules = [Autoplay, Pagination]

const steps = ref([
  "/svg/WorkSection/1.svg",
  "/svg/WorkSection/2.svg",
  "/svg/WorkSection/3.svg",
  "/svg/WorkSection/4.svg",
  "/svg/WorkSection/5.svg",
  "/svg/WorkSection/6.svg",
])

const isMobile = ref(false)

let ctx
onMounted(() => {
  const mq = window.matchMedia("(min-width: 768px)")
  const updateIsMobile = (e) => (isMobile.value = !e.matches)
  updateIsMobile(mq)
  mq.addEventListener("change", updateIsMobile)

  // GSAP only for desktop/tablet
  ctx = gsap.context(() => {
    const items = gsap.utils.toArray(".step-item")
    if (!items.length) return

    gsap.set(items, { scale: 0.85, opacity: 1 })

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 })

    items.forEach((item, i) => {
      tl.to(
        item,
        { scale: 1, opacity: 1, duration: 0.5, ease: "power2.out" },
        i === 0 ? 0 : ">-=0.1"
      ).to(item, {
        scale: 0.85,
        opacity: 1,
        duration: 0.5,
        ease: "power2.in",
        delay: 1,
      })
    })
  })

  // store media query listener for cleanup
  window.__stepsMq__ = mq
})

onBeforeUnmount(() => {
  ctx && ctx.revert()
  if (window.__stepsMq__) {
    window.__stepsMq__.removeEventListener("change", () => {})
  }
})
</script>

<template>
  <section class="max-w-7xl mx-auto py-10 px-4 xl:px-0">
    <div class="text-center title-text">
      <AnimatedTitle
        text="How Does Group Roffr Work?"
        customClass="text-[25px] md:text-[40px]"
      />
      <AnimatedTitle
        class="text-[#0D0D0D80]"
        text="Follow the simple to you Dream Home"
      />
    </div>

    <!-- Desktop / Tablet: original GSAP grid -->
    <div
      class="mt-10 hidden md:grid grid-cols-6 gap-2 justify-items-center"
    >
      <img
        v-for="(step, index) in steps"
        :key="index"
        :src="step"
        alt=""
        class="step-item"
      />
    </div>

    <!-- Mobile: Swiper, 1 slide at a time, autoplay -->
    <div class="mt-8 md:hidden">
      <Swiper
        :modules="modules"
        :slides-per-view="1"
        :space-between="16"
        :loop="true"
        :autoplay="{ delay: 2000, disableOnInteraction: false }"
        :pagination="{ clickable: true }"
        class="w-full max-w-xs mx-auto"
      >
        <SwiperSlide
          v-for="(step, index) in steps"
          :key="index"
          class="flex justify-center"
        >
          <img :src="step" alt="" class="w-64 mx-auto" />
        </SwiperSlide>
      </Swiper>
    </div>
  </section>
</template>
