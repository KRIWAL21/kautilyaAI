<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sectionRef = ref(null);
let ctx = null;

const founders = [
  {
    image: "/images/AboutPage/ankit-sir.png",           // replace with: "/images/founder-1.jpg"
    name: "Ankit Shah",
    role: "Co-Founder",
  },
  {
    image: "/images/AboutPage/arpan-sir.png",           // replace with: "/images/founder-2.jpg"
    name: "Arpan Dengla",
    role: "Co-Founder",
  },
];

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.from('.founders-heading', {
      scrollTrigger: { trigger: sectionRef.value, start: 'top 80%' },
      y: 30, opacity: 0, duration: 0.9, ease: 'power3.out',
    });
    gsap.from('.founder-card', {
      scrollTrigger: { trigger: sectionRef.value, start: 'top 75%' },
      y: 50, opacity: 0, duration: 1, stagger: 0.2, ease: 'power3.out',
    });
  }, sectionRef.value);
});

onUnmounted(() => { if (ctx) ctx.kill(); });
</script>

<template>
  <section ref="sectionRef" class="bg-white py-20 px-4">
    <div class="max-w-7xl mx-auto">

      <!-- Heading -->
      <div class="founders-heading text-center mb-14">
        <p class="section-label">The People Behind ROFFR</p>
        <h2 class="section-title mt-2">Meet the Founders</h2>
        <p class="section-desc mt-4 max-w-xl mx-auto">
          Built by people who believe the real estate industry deserves better tools,
          more transparency, and technology that actually works.
        </p>
      </div>

      <!-- Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <div
          v-for="(founder, i) in founders"
          :key="i"
          class="founder-card flex flex-col items-center text-center"
        >
          <!-- Image -->
          <div class="relative w-48 h-48 rounded-full overflow-hidden mb-6 shadow-md bg-gray-100">
            <img
              v-if="founder.image"
              :src="founder.image"
              :alt="founder.name"
              class="w-full h-full object-cover"
            />
            <!-- Placeholder shown until image is provided -->
            <div
              v-else
              class="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300"
            >
              <svg class="w-14 h-14" fill="none" stroke="currentColor" stroke-width="1.2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.5-1.632z" />
              </svg>
              <span class="text-xs font-medium text-gray-400 tracking-wide">Photo coming soon</span>
            </div>
            <!-- Subtle accent bar at bottom -->
            <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-red-500"></div>
          </div>

          <!-- Info -->
          <h3 class="founder-name">{{ founder.name }}</h3>
          <p class="founder-role mt-1">{{ founder.role }}</p>
          <p class="founder-bio mt-3">{{ founder.bio }}</p>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.section-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #eb3131;
}

.section-title {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  color: #0c1c28;
  line-height: 1.15;
}

.section-desc {
  font-family: 'Inter', sans-serif;
  font-size: 1.05rem;
  line-height: 1.7;
  color: #55606a;
}

.founder-name {
  font-family: 'Outfit', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0c1c28;
}

.founder-role {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #eb3131;
  text-transform: uppercase;
}

.founder-bio {
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  line-height: 1.65;
  color: #55606a;
  max-width: 320px;
}
</style>
