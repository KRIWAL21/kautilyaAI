<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<template>
  <section class="bg-black py-20 px-4 relative overflow-hidden">
    <!-- Subtle background accent -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#EB3131]/10 rounded-full blur-[100px]"></div>
    </div>

    <div class="max-w-7xl mx-auto text-center relative z-10">
      <p class="text-[#EB3131] text-xs font-bold uppercase tracking-[0.2em] mb-5">
        Verified Partner Network
      </p>
      <h2 class="text-white text-[32px] md:text-[48px] xl:text-[56px] font-bold leading-tight mb-5">
        Find Your Perfect Realtor
      </h2>
      <p class="text-white/50 text-base md:text-lg max-w-lg mx-auto mb-10 leading-relaxed">
        Connect with trusted channel partners and expert realtors who understand your property goals.
      </p>
      <button
        @click="router.push('/channel-partners')"
        class="inline-flex items-center gap-3 bg-[#EB3131] hover:bg-[#c72828] text-white px-8 py-4 rounded-full text-base font-semibold transition-all duration-200 hover:scale-105 shadow-lg shadow-red-900/40 group"
      >
        <i class="pi pi-users text-sm"></i>
        Find a Realtor
        <i class="pi pi-arrow-right text-sm transition-transform duration-200 group-hover:translate-x-1"></i>
      </button>
    </div>
  </section>
</template>
