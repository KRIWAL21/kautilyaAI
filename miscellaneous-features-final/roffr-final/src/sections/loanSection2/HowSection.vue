<script setup>
import { onMounted, ref, onUnmounted } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sectionRef = ref(null);
let ctx = null;

const steps = [
  {
    num: '01',
    title: 'Discovery',
    desc: 'Financial assessment and initial rate discovery based on your profile architecture.',
    active: true
  },
  {
    num: '02',
    title: 'Underwriting',
    desc: 'Our precision engine validates your documentation against market benchmarks.',
    active: false
  },
  {
    num: '03',
    title: 'Validation',
    desc: 'Final risk assessment and structural confirmation of your loan agreement.',
    active: false
  },
  {
    num: '04',
    title: 'Disbursement',
    desc: 'Immediate fund transfer to your designated accounts, completing the blueprint.',
    active: false
  }
];

onMounted(() => {
  ctx = gsap.context(() => {
    // Header reveal
    gsap.from('.header-content > *', {
      scrollTrigger: { trigger: sectionRef.value, start: 'top 80%' },
      y: 30, opacity: 0, stagger: 0.2, duration: 0.8, ease: 'power3.out'
    });

    // Watermark reveal
    gsap.from('.watermark', {
      scrollTrigger: { trigger: sectionRef.value, start: 'top 80%' },
      x: 50, opacity: 0, duration: 1, ease: 'power3.out'
    });

    // Cards reveal
    gsap.from('.step-card', {
      scrollTrigger: { trigger: '.steps-grid', start: 'top 85%' },
      y: 40, opacity: 0, stagger: 0.15, duration: 1, ease: 'power3.out'
    });
  }, sectionRef.value);
});

onUnmounted(() => { if (ctx) ctx.kill(); });
</script>

<template>
  <section ref="sectionRef" class="how-section">
    <div class="max-w-7xl mx-auto px-4">
      
      <!-- Top Row -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 relative">
        <div class="header-content max-w-xl">
          <h2 class="title mb-4">The Architecture of Progress</h2>
          <p class="subtitle">
            A linear, transparent path from discovery to disbursement.<br class="hidden md:block" />
            No hidden steps, no architectural flaws.
          </p>
        </div>
        <div class="watermark lg:absolute lg:right-0 lg:top-0">
          04 STEPS
        </div>
      </div>

      <!-- Steps Grid -->
      <div class="steps-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="(step, i) in steps" 
          :key="i"
          class="step-card"
          :class="{ 'active-card': step.active }"
        >
          <div class="step-num">{{ step.num }}</div>
          <h3 class="step-title">{{ step.title }}</h3>
          <p class="step-desc">{{ step.desc }}</p>
          
          <div v-if="step.active" class="active-badge mt-auto pt-6">
            ACTIVE STATE <span class="dot">●</span>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.how-section {
  background-color: #f8f9fb;
  padding: 8rem 0;
  overflow: hidden;
}

.title {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 800;
  color: #0c1c28;
  line-height: 1.2;
}

.subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: #5b6771;
  line-height: 1.6;
}

.watermark {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(3rem, 8vw, 6.5rem);
  font-weight: 900;
  color: #fcece3;
  letter-spacing: 0.05em;
  pointer-events: none;
  line-height: 1;
}

.step-card {
  background: #ffffff;
  padding: 3rem 2.25rem;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  min-height: 340px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  border-left: 1px solid transparent;
}

.step-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.04);
}

.active-card {
  border-left: 6px solid #0c1c28;
}

.step-num {
  font-family: 'Outfit', sans-serif;
  font-size: 2.75rem;
  font-weight: 800;
  color: #e2e8f0;
  margin-bottom: 2rem;
  line-height: 1;
}

.active-card .step-num {
  color: #0c1c28;
}

.step-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0c1c28;
  margin-bottom: 1rem;
}

.step-desc {
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  color: #5b6771;
  line-height: 1.65;
}

.active-badge {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #0c1c28;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dot { font-size: 0.6rem; }

@media (max-width: 1024px) {
  .watermark { position: static; margin-top: 2rem; }
}
</style>
