<script setup>
import { onMounted, ref, onUnmounted } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sectionRef = ref(null);
let ctx = null;

const pillars = [
  {
    title: 'Precision Pricing',
    desc: 'No more "ballpark" figures. We use micro-market data to ensure every deal is structurally sound from day one.',
    icon: 'target'
  },
  {
    title: 'Structural Transparency',
    desc: 'Full disclosure of all architectural plans and financial foundations. We hide nothing under the drywall.',
    icon: 'shield'
  },
  {
    title: 'Architectural Growth',
    desc: 'Investments designed to appreciate. We build long-term value into the blueprint of every project.',
    icon: 'trending-up'
  }
];

onMounted(() => {
  ctx = gsap.context(() => {
    // Header reveal
    gsap.from('.pillars-header > *', {
      scrollTrigger: { trigger: sectionRef.value, start: 'top 80%' },
      y: 30, opacity: 0, stagger: 0.15, duration: 1, ease: 'power4.out'
    });

    // Cards reveal
    gsap.from('.pillar-card', {
      scrollTrigger: { trigger: '.pillars-grid', start: 'top 85%' },
      y: 40, opacity: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out'
    });
  }, sectionRef.value);
});

onUnmounted(() => { if (ctx) ctx.kill(); });
</script>

<template>
  <section ref="sectionRef" class="pillars-section">
    <div class="max-w-7xl mx-auto px-4">
      
      <div class="pillars-header text-center mb-16 lg:mb-24">
        <h2 class="title mb-6">Built on Better Foundations</h2>
        <p class="subtitle max-w-2xl mx-auto">
          We approach real estate investment like architecture: with precision, 
          unwavering integrity, and a vision for the future.
        </p>
      </div>

      <div class="pillars-grid grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        <div v-for="(pillar, i) in pillars" :key="i" class="pillar-card">
          <div class="card-glow"></div>
          <h3 class="pillar-title">{{ pillar.title }}</h3>
          <p class="pillar-desc">{{ pillar.desc }}</p>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.pillars-section {
  background: #ffffff;
  padding: 8rem 0;
  overflow: hidden;
}

.title {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  font-weight: 800;
  color: #0c1c28;
}

.subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  color: #5b6771;
  line-height: 1.7;
}

.pillars-grid {
  position: relative;
}

.pillar-card {
  position: relative;
  background: #ffffff;
  padding: 3rem 2.5rem;
  border-radius: 1.25rem;
  border: 1px solid #f1f3f7;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.pillar-card:hover {
  transform: translateY(-8px);
  border-color: #0c1c28;
  box-shadow: 0 30px 60px -15px rgba(12, 28, 40, 0.08);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #0c1c28 0%, rgba(12, 28, 40, 0) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.pillar-card:hover .card-glow {
  opacity: 1;
}

.pillar-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0c1c28;
  margin-bottom: 1rem;
}

.pillar-desc {
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  color: #5b6771;
  line-height: 1.7;
}

@media (max-width: 768px) {
  .pillars-section { padding: 5rem 0; }
}
</style>
