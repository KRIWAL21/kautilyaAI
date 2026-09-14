<script setup>
import { onMounted, onBeforeUnmount } from "vue"
import gsap from "gsap"

let tl = null

onMounted(() => {
  const box1 = document.querySelector('#box1')
  const box2 = document.querySelector('#box2')

  gsap.set([box1, box2], { y: 0, rotation: 0 })

  tl = gsap.timeline({ repeat: -1, yoyo: true })
    .to([box1, box2], {
      y: -15,
      rotation: 1,
      duration: 2.5,
      ease: "power2.inOut"
    })
})

onBeforeUnmount(() => {
  if (tl) tl.kill()
})
</script>

<template>
  <section
    class="max-w-7xl mx-auto py-12 px-4 lg:py-20 lg:px-4 2xl:px-0 relative overflow-hidden"
  >
    <div class="text-center px-2">
      <h1
        class="font-instument italic text-orange-600 text-3xl sm:text-4xl lg:text-[60px] leading-tight"
      >
        The best real estate CRM
      </h1>
      <h1 class="title-text text-lg sm:text-xl lg:text-2xl">
        Everything you need in one place
      </h1>
    </div>

    <!-- Images: column on mobile, row on md+ -->
    <div
      class="mt-10 lg:mt-20 flex flex-col md:flex-row items-center justify-between gap-8 mx-auto relative z-10"
    >
      <div class="w-full md:w-1/2 flex justify-center">
        <img
          id="box1"
          src="/svg/channelPage/box1.svg"
          alt=""
          class="w-full max-w-sm sm:max-w-md"
        >
      </div>
      <div class="w-full md:w-1/2 flex justify-center">
        <img
          id="box2"
          src="/svg/channelPage/box2.svg"
          alt=""
          class="w-full max-w-sm sm:max-w-md"
        >
      </div>
    </div>

    <!-- Background circle, scaled down on mobile -->
    <div
      class="absolute -top-10 sm:top-0 left-1/2 -translate-x-1/2 pointer-events-none"
    >
      <img
        src="/svg/channelPage/circle.svg"
        alt=""
        class="w-[260px] sm:w-[340px] lg:w-auto"
      >
    </div>
  </section>
</template>
