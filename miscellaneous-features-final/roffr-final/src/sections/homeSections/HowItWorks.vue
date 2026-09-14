<template>
  <section class="max-w-7xl mx-auto py-14 px-4 xl:px-0">
    <!-- Header -->
    <h2 class="font-intertight font-bold text-[26px] md:text-[32px] text-gray-900">How it works?</h2>
    <p class="text-gray-500 mt-1.5 text-sm md:text-base">Buy property together in 3 simple steps and save more.</p>

    <!-- Steps -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 relative">
      <div
        v-for="step in steps"
        :key="step.number"
        class="flex items-center gap-4 relative z-10"
      >
        <!-- Number badge -->
        <div class="w-16 h-16 rounded-full bg-[#EB3131] text-white font-medium text-[28px] flex items-center justify-center shrink-0 shadow-md shadow-red-200">
          {{ step.number }}
        </div>

        <!-- Content -->
        <div class="pt-1">
          <h3 class="font-semibold text-gray-900 text-[15px] md:text-base">{{ step.title }}</h3>
          <p class="text-sm text-gray-500 mt-1.5 leading-relaxed">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const steps = [
  {
    number: 1,
    title: "Find a Deal",
    description: "Browse verified properties and active group deals.",
  },
  {
    number: 2,
    title: "Join the Group",
    description: "Reserve your spot with a token amount and track group progress.",
  },
  {
    number: 3,
    title: "Save More Together",
    description: "Once the group is full, we negotiate better prices for everyone.",
  },
];
</script>
