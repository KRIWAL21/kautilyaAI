<script setup></script>

<template>
  <section class="max-w-7xl mx-auto flex flex-col py-20 px-4 2xl:px-0">
    <div class="text-center">
      <h1 class="title-text">
        Why Group Buying is the Future
      </h1>
      <p class="font-inter text-[18px]">
        Stop paying retail prices for your biggest investment. See how group buying stacks up against the traditional route.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-20">
      <!-- Left card: Traditional Buying -->
      <div class="p-10 rounded-2xl shadow-xl bg-white">
        <div class="flex items-center gap-3 mb-8 mt-2">
          <i class="pi pi-user bg-slate-200 text-black p-4 rounded-md"></i>
          <p class="font-outfit text-[25px]">Traditional Buying</p>
        </div>

        <div class="space-y-6 text-[15px] font-inter border-t pt-6">
          <div class="flex justify-between">
            <span class="text-slate-500">Price</span>
            <span class="text-slate-900">Full Retail</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Leverage</span>
            <span class="text-slate-900">Low (Individual)</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Selection</span>
            <span class="text-slate-900">Public Listings</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Hidden Fees</span>
            <span class="text-red-500">Often High</span>
          </div>
        </div>
      </div>

      <!-- Right card: Community Group Buy -->
      <div
        class="relative p-10 rounded-2xl shadow-xl border-2 border-orange-600"
      >
        <!-- Recommended badge -->
        <div
          class="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-400 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-md"
        >
          RECOMMENDED
        </div>

        <div class="flex items-center gap-3 mb-8">
          <div class="bg-amber-100 text-amber-600 p-4 rounded-md">
            <i class="pi pi-users text-[25px]"></i>
          </div>
          <p class="font-outfit text-[25px]">Community Group Buy</p>
        </div>

        <div class="space-y-6 text-[15px] font-inter border-t pt-6">
          <div class="flex justify-between">
            <span class="text-slate-500">Price</span>
            <span class="text-orange-500">Wholesale Discount</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Leverage</span>
            <span class="text-slate-900">High (Bulk Power)</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Selection</span>
            <span class="text-slate-900">Pre-Market Access</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Hidden Fees</span>
            <span class="text-emerald-500">Minimized</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
