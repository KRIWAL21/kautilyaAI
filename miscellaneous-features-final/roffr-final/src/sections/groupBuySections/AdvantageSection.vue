<script setup>
import { ref } from 'vue'

const advantages = ref([
  {
    color: 'from-orange-400 to-orange-500',
    img: "/svg/GroupBuy/rupee.svg",
    title: 'Below Market Prices',
    description: 'Access properties at 10-30% below market prices by pooling purchasing power with others.'
  },
  {
    color: 'from-emerald-400 to-emerald-500',
        img: "/svg/GroupBuy/hand.svg",
    title: 'Expert Negotiation',
    description: 'Our real estate veterans handle negotiations, ensuring optimal terms.'
  },
  {
    color: 'from-red-400 to-red-500',
        img: "/svg/GroupBuy/lock.svg",
    title: 'Reduced Risk',
    description: 'Comprehensive due diligence before it\'s offered to the group.'
  },
  {
    color: 'from-amber-400 to-amber-500',
        img: "/svg/GroupBuy/eye.svg",
    title: 'Transparency',
    description: 'No hidden margins, costs disclosed upfront.'
  },
  {
    color: 'from-blue-400 to-blue-500',
        img: "/svg/GroupBuy/community.svg",
    title: 'Curated Community',
    description: 'Like-minded individuals who value community and smart investments.'
  },
  {
    color: 'from-purple-400 to-purple-500',
        img: "/svg/GroupBuy/passkey.svg",
    title: 'Early Access',
    description: 'Get first pick of the best units before they hit the public market.'
  }
])
</script>

<template>
  <section class="bg-[#EBEBEB]">
    <div class="max-w-7xl mx-auto flex flex-col py-20 px-4 2xl:px-0">
      <h1 class="title-text text-center mb-20">Key Advantages for Home Buyers</h1>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="(advantage, index) in advantages" 
          :key="index"
          class="bg-white/80 backdrop-blur-sm px-8 py-12 rounded-xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div class="flex flex-col items-center gap-4">
            <div 
              :class="`w-16 h-16 rounded-2xl flex items-center justify-center `"
            >
            <img :src="advantage.img" alt="">
          </div>
            <div class="text-center">
              <h3 class="font-outfit text-xl font-semibold text-slate-900 mb-2">
                {{ advantage.title }}
              </h3>
              <p class="font-inter text-slate-600 leading-relaxed">
                {{ advantage.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
