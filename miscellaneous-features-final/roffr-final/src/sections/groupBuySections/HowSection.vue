<script setup>
const steps = [
  {
    icon: '/svg/GroupBuy/1.svg',
    title: 'Register Interest',
    description: 'Sign up and tell us your budget, preferred location, and property type.'
  },
  {
    icon: '/svg/GroupBuy/2.svg',
    title: 'Join a Cohort',
    description: "We'll match you with other like-minded buyers in your development."
  },
  {
    icon: '/svg/GroupBuy/3.svg',
    title: 'Negotiation',
    description: 'We negotiate bulk pricing on behalf of the group.'
  },
  {
    icon: '/svg/GroupBuy/4.svg',
    title: 'Purchase & Save',
    description: 'Secure your unit at the unbeatable group price.'
  }
]
</script>

<template>
  <section class="max-w-7xl mx-auto flex flex-col py-20 px-4 2xl:px-0">
    <div class="text-center mb-12">
      <h1 class="title-text">How It Works</h1>
      <p>Four simple steps to your new home.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 mt-28 items-stretch">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        class="flex items-center relative min-h-[160px] md:min-h-[180px] xl:min-h-[200px]"
      >
        <!-- Icon - positioned to the left consistently -->
        <div class="absolute left-0 -top-6 md:-top-8 xl:-top-10 min-w-[150px] flex-shrink-0 z-10">
          <img :src="step.icon" :alt="step.title" class="w-full h-full object-contain" />
        </div>
        
        <!-- Content with padding to accommodate icon -->
        <div class="relative z-10 pl-20 md:pl-16 xl:pl-14 font-outfit w-full">
          <p class="font-semibold text-[20px] md:text-lg xl:text-base leading-tight mb-2">
            {{ step.title }}
          </p>
          <p class="text-[14px] md:text-sm text-slate-600 leading-relaxed">
            {{ step.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
