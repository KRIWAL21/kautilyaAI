<script setup>
import { onMounted, ref, onUnmounted } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sectionRef = ref(null);

const pillars = [
  {
    number: "01",
    title: "INTENTIONAL DESIGN",
    description: "We believe every interaction should serve a purpose. We remove the noise to highlight the essential."
  },
  {
    number: "02",
    title: "DEEP TECH ROOTS",
    description: "Underneath our refined UI lies a beast of performance. We never sacrifice speed for aesthetics."
  },
  {
    number: "03",
    title: "RADICAL CLARITY",
    description: "Complexity is the enemy. Our mission is to provide clarity in an increasingly cluttered digital world."
  }
];

let ctx = null;

onMounted(() => {
  ctx = gsap.context(() => {
    // Animate Left Text
    gsap.from(".pillar-left", {
      scrollTrigger: {
        trigger: sectionRef.value,
        start: "top 80%",
      },
      x: -50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });

    // Animate Right List Items
    gsap.from(".pillar-item", {
      scrollTrigger: {
        trigger: sectionRef.value,
        start: "top 75%",
      },
      x: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out'
    });
  }, sectionRef.value);
});

onUnmounted(() => {
  if (ctx) ctx.kill();
});
</script>

<template>
  <section ref="sectionRef" class="bg-[#f8f9fb] py-20 px-4">
    <div class="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">
      
      <!-- Left Column -->
      <div class="pillar-left w-full lg:w-[35%] py-4">
        <h2 class="pillar-main-title">
          The Core<br/>Pillars
        </h2>
        <p class="pillar-main-desc mt-6">
          Our philosophy is built on three unshakeable
          principles that guide every pixel we place
          and every line of code we write.
        </p>
      </div>

      <!-- Right Column -->
      <div class="w-full lg:w-[65%] flex flex-col gap-12 lg:gap-16">
        
        <div v-for="(pillar, index) in pillars" :key="index" class="pillar-item flex items-start gap-6 lg:gap-10">
          <div class="pillar-number">
            {{ pillar.number }}
          </div>
          <div class="pillar-content pt-2">
            <h3 class="pillar-item-title">{{ pillar.title }}</h3>
            <p class="pillar-item-desc mt-3">
              {{ pillar.description }}
            </p>
          </div>
        </div>

      </div>

    </div>
  </section>
</template>

<style scoped>
.pillar-main-title {
  color: #0c1c28;
  font-family: 'Outfit', sans-serif;
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  font-weight: 700;
  line-height: 1.1;
}

.pillar-main-desc {
  color: #55606a;
  font-family: 'Inter', sans-serif;
  font-size: 1.05rem;
  line-height: 1.7;
}

.pillar-number {
  color: #dae6fa;
  font-family: 'Outfit', sans-serif;
  font-size: clamp(4rem, 8vw, 6rem);
  font-weight: 700;
  line-height: 0.8;
  flex-shrink: 0;
}

.pillar-item-title {
  color: #0c1c28;
  font-family: 'Outfit', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.pillar-item-desc {
  color: #55606a;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  line-height: 1.6;
}
</style>
