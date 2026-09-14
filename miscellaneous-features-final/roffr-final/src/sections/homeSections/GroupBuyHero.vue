<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const partners = [
  { name: "DLF", abbr: "DLF", projects: 128, bg: "bg-gray-100", textColor: "text-gray-800" },
  { name: "Godrej Properties", abbr: "Godrej", projects: 95, bg: "bg-black", textColor: "text-white" },
  { name: "Lodha", abbr: "LODHA", projects: 112, bg: "bg-gray-50", textColor: "text-gray-700" },
  { name: "Prestige Group", abbr: "Prestige", projects: 87, bg: "bg-gray-50", textColor: "text-gray-800" },
  { name: "Metropolis", abbr: "Metro", projects: 64, bg: "bg-[#f5ede0]", textColor: "text-gray-700" },
  { name: "Omaxe", abbr: "OMAXE", projects: 76, bg: "bg-[#0057a8]", textColor: "text-white" },
  { name: "World Street", abbr: "WS", projects: 43, bg: "bg-gray-50", textColor: "text-gray-800" },
];

const stats = [
  { icon: "pi-percentage", iconBg: "bg-purple-100", iconColor: "text-purple-600", value: "Up to 15%", label: "Better pricing" },
  { icon: "pi-tag",        iconBg: "bg-red-100",    iconColor: "text-[#EB3131]",   value: "₹ 2 Cr+",   label: "Total savings" },
  { icon: "pi-users",      iconBg: "bg-teal-100",   iconColor: "text-teal-600",    value: "500+",       label: "Deals completed" },
];
</script>

<template>
  <section class="max-w-7xl mx-auto px-4 xl:px-0 py-6 mt-24">

    <!-- ── Hero card ────────────────────────────────────────────── -->
    <div class="rounded-3xl overflow-hidden flex flex-col md:flex-row md:h-[320px] xl:h-[360px]"
         style="background: linear-gradient(135deg, #ddeeff 0%, #f4f8ff 45%, #e6efff 100%);">

      <!-- ── Left content ──────────────────────────────────────── -->
      <div class="flex flex-col justify-center px-8 md:px-12 py-10 w-full md:w-[55%] shrink-0">

        <!-- Eyebrow badge -->
        <div class="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-blue-100 text-[#1a2b5f] text-[11px] font-semibold px-3 py-1.5 rounded-full w-fit mb-4 shadow-sm">
          <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block"></span>
          India's #1 Group Buying Platform
        </div>

        <!-- Headline -->
        <h1 class="font-intertight font-bold leading-tight">
          <span class="block text-[28px] md:text-[38px] xl:text-[46px] text-[#1a2b5f]">Group Buying</span>
          <span class="block text-[32px] md:text-[44px] xl:text-[54px] text-[#EB3131]">Property Deals</span>
        </h1>

        <p class="mt-2 text-gray-500 text-sm md:text-[15px] font-medium">
          Buy together. Save up to <span class="font-bold text-[#1a2b5f]">15%</span> on your dream home.
        </p>

        <!-- Trust chips -->
        <div class="flex items-center gap-3 mt-5 flex-wrap">
          <div class="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
            <i class="pi pi-verified text-green-500 text-xs"></i>
            <span class="text-[11px] font-semibold text-gray-700">RERA Verified</span>
          </div>
          <div class="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
            <span class="text-amber-500 font-bold text-[11px]">%</span>
            <span class="text-[11px] font-semibold text-gray-700">Lowest Group Price</span>
          </div>
          <div class="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
            <i class="pi pi-shield text-blue-500 text-xs"></i>
            <span class="text-[11px] font-semibold text-gray-700">100% Transparent</span>
          </div>
        </div>

        <!-- CTA -->
        <button
          @click="router.push('/project')"
          class="mt-7 w-fit flex items-center gap-2 bg-[#EB3131] hover:bg-[#c72828] text-white font-semibold text-sm px-7 py-3.5 rounded-xl transition-all duration-200 shadow-md shadow-red-200 hover:shadow-red-300 hover:-translate-y-0.5"
        >
          Explore Deals
          <i class="pi pi-arrow-right text-xs"></i>
        </button>
      </div>

      <!-- ── Right: image + stat cards ────────────────────────── -->
      <div class="relative flex-1 flex items-end justify-center min-h-[220px]">
        <img
          src="/images/heroSection/building-hero.webp"
          alt="Properties"
          class="h-full w-full object-contain object-bottom"
        />

        <!-- Stat cards — desktop only -->
        <div class="absolute right-5 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2.5 z-10">
          <div
            v-for="stat in stats"
            :key="stat.value"
            class="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg shadow-blue-100/60 min-w-[185px] border border-white"
          >
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" :class="stat.iconBg">
              <i class="pi text-sm" :class="[stat.icon, stat.iconColor]"></i>
            </div>
            <div>
              <div class="text-[14px] font-bold text-gray-900 leading-tight">{{ stat.value }}</div>
              <div class="text-[10px] text-gray-400 leading-none mt-0.5">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Developer Partners ───────────────────────────────────── -->
    <div class="mt-12">
      <div class="flex items-center gap-4">
        <div class="flex-1 border-t border-dashed border-gray-300"></div>
        <h3 class="text-xs font-bold text-[#1a2b5f] tracking-widest uppercase whitespace-nowrap">
          Our Top Developer Partners
        </h3>
        <div class="flex-1 border-t border-dashed border-gray-300"></div>
      </div>

      <div class="mt-8 flex items-start justify-between gap-4 overflow-x-auto pb-2">
        <div
          v-for="partner in partners"
          :key="partner.name"
          class="flex flex-col items-center gap-2.5 min-w-[90px] group cursor-pointer"
        >
          <div
            class="w-[68px] h-[68px] rounded-full flex items-center justify-center shrink-0 shadow-sm ring-2 ring-transparent group-hover:ring-blue-200 transition-all duration-200"
            :class="partner.bg"
          >
            <span class="text-[11px] font-bold text-center leading-tight px-1" :class="partner.textColor">
              {{ partner.abbr }}
            </span>
          </div>
          <div class="text-center">
            <p class="text-[12px] font-semibold text-gray-800 leading-tight">{{ partner.name }}</p>
            <p class="text-[10px] text-gray-400 mt-0.5">{{ partner.projects }} Projects</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
