<script setup>
import { onMounted, ref, onUnmounted } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sectionRef = ref(null);
let ctx = null;

const stats = [
  { value: '$0', label: 'ORIGINATION FEES' },
  { value: '24h', label: 'FUNDING WINDOW' },
  { value: 'None', label: 'PREPAYMENT PENALTIES' },
  { value: 'AA+', label: 'MARKET RATING' },
];

onMounted(() => {
  ctx = gsap.context(() => {
    // Large image reveal
    gsap.from('.image-container', {
      scrollTrigger: { trigger: sectionRef.value, start: 'top 80%' },
      x: -60, opacity: 0, duration: 1.2, ease: 'power4.out'
    });

    // Content reveal
    gsap.from('.content-box > *', {
      scrollTrigger: { trigger: sectionRef.value, start: 'top 75%' },
      y: 30, opacity: 0, stagger: 0.2, duration: 1, ease: 'power3.out'
    });

    // Stats staggered reveal
    gsap.from('.stat-item', {
      scrollTrigger: { trigger: '.stats-grid', start: 'top 90%' },
      y: 20, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power2.out', delay: 0.4
    });
  }, sectionRef.value);
});

onUnmounted(() => { if (ctx) ctx.kill(); });
</script>

<template>
  <section ref="sectionRef" class="transparency-section">
    <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
      
      <!-- Left: Featured Image -->
      <div class="image-container relative rounded-xl overflow-hidden aspect-[4/3] lg:aspect-square group">
        <img 
          src="/images/LoanPage/loan-hero.webp" 
          alt="Architectural Foundation" 
          class="w-full h-full object-cover grayscale brightness-50 contrast-125 transition-transform duration-700 group-hover:scale-105"
        />
        <div class="absolute bottom-10 left-10">
          <h3 class="img-text font-outfit text-white text-4xl lg:text-5xl font-extrabold leading-[1.05]">
            Concrete<br />Confidence.
          </h3>
        </div>
      </div>

      <!-- Right: Content -->
      <div class="content-box flex flex-col items-start">
        <h2 class="title font-outfit text-white text-4xl lg:text-6xl font-extrabold leading-[1.1] mb-8">
          Transparency by<br />Foundation.
        </h2>
        
        <p class="desc font-inter text-gray-400 text-base lg:text-lg leading-relaxed mb-12 max-w-lg">
          We don't hide behind legalese. Our contracts are as clear as a floor plan, 
          designed to be understood at a glance, and built to last the lifetime 
          of your investment.
        </p>

        <div class="h-px bg-white/10 w-full mb-12"></div>

        <!-- Stats Grid -->
        <div class="stats-grid grid grid-cols-2 gap-x-12 gap-y-10 w-full">
          <div v-for="(stat, i) in stats" :key="i" class="stat-item">
            <div class="value font-outfit text-white text-3xl font-bold mb-1">{{ stat.value }}</div>
            <div class="label font-inter text-gray-500 text-[10px] lg:text-xs font-bold tracking-[0.1em] uppercase">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.transparency-section {
  background-color: #111111;
  padding: 10rem 0;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .transparency-section { padding: 6rem 0; }
}
</style>
