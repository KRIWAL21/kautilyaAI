<script setup>
import { RouterLink } from 'vue-router';
import AnimatedTitle from "@/components/AnimatedTitle.vue";
</script>

<template>
  <section class="max-w-7xl mx-auto py-10 px-4 2xl:px-0">
    <!-- <div class="text-center mb-6">
      <AnimatedTitle
        text="Unlock unbeatable deals through group buyings"
        customClass="title-text"
      />
      <p class="font-inter opacity-50">
        Roffr brings buyers together to access exclusive discounts through collective power.
      </p>
    </div> -->

    <div
      class="relative mt-10 rounded-3xl overflow-hidden text-white min-h-[550px]"
    >
      <!-- background image -->
      <div
        class="absolute inset-0 bg-cover bg-center min-h-[550px]"
        style="background-image: url('/images/HomePage/dealSection/bg-image.webp');"
      ></div>

      <!-- optional gradient overlay to match tint -->
      <div class="absolute inset-0 bg-gradient-to-r from-[#7b1c1c]/70 to-[#7b1c1c]/20"></div>

      <!-- content -->
      <div class="relative p-8 md:py-12 md:px-32 space-y-4 mt-32">
        <h1 class="font-intertight text-[32px] md:text-[40px] font-bold leading-tight">
          What is Group Buying?
        </h1>
        <p class="font-outfit max-w-md text-[20px]">
          Roffr brings buyers together to access exclusive discounts through
          collective power. More people, stronger deals.
        </p>
        <RouterLink
          to="/contact"
          class="inline-block bg-white px-6 py-2 rounded-full font-outfit font-medium text-black"
        >
          Get in touch
        </RouterLink>
      </div>
    </div>
  </section>
</template>
