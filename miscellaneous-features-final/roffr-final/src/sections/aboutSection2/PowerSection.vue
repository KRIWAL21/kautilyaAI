<script setup>
import { onMounted, ref, onUnmounted } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const timelineSection = ref(null);

const timelineCards = [
  {
    yearText: "2018 \u2014 THE GENESIS",
    title: "The Blueprint",
    description: "Founded in a small studio, Roffr began as a technical challenge: how to make data infrastructure as intuitive as a well-designed publication.",
    imgSrc: "/images/AboutPage/aboutHero/about-bg.webp",
  },
  {
    yearText: "2021 \u2014 SCALING UP",
    title: "Structural Integrity",
    description: "We expanded into global markets, ensuring that our technical roots could support the weight of millions of concurrent connections.",
    imgSrc: "/images/AboutPage/aboutHero/about-bg.webp",
  },
  {
    yearText: "2024 \u2014 TODAY",
    title: "Digital Authority",
    description: "Today, Roffr stands as a leader in high-end tech solutions, merging editorial design with world-class engineering performance.",
    imgSrc: "/images/AboutPage/aboutHero/about-bg.webp",
  }
];

let ctx = null;

onMounted(() => {
  ctx = gsap.context(() => {
    // Animate section header
    gsap.from(".timeline-header", {
      scrollTrigger: {
        trigger: timelineSection.value,
        start: "top 80%",
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });

    // Animate cards
    gsap.from(".timeline-card", {
      scrollTrigger: {
        trigger: ".timeline-grid",
        start: "top 85%",
      },
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power4.out'
    });
  }, timelineSection.value);
});

onUnmounted(() => {
  if (ctx) ctx.kill();
});
</script>

<template>
  <section ref="timelineSection" class="timeline-wrapper bg-[#f8f9fb] py-20 px-4">
    <div class="max-w-7xl mx-auto">
      
      <!-- Section Header -->
      <div class="timeline-header">
        <span class="timeline-eyebrow">THE TIMELINE</span>
        <h2 class="timeline-title">Our Evolution</h2>
      </div>

      <!-- Timeline Grid -->
      <div class="timeline-grid grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6 mb-6">
        
        <div v-for="(card, index) in timelineCards" :key="index" :class="['card-wrapper flex', index === 1 ? 'staggered-card' : '']">
          <div class="timeline-card w-full">
            <div class="card-content">
              <p class="card-eyebrow">{{ card.yearText }}</p>
              <h3 class="card-title">{{ card.title }}</h3>
              <p class="card-description">{{ card.description }}</p>
            </div>
            
            <!-- Image Area -->
            <div class="card-image-box">
              <img :src="card.imgSrc" :alt="card.title" class="placeholder-graphic object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
              <!-- Fallback Gradient if image is not found -->
              <div class="fallback-graphic" style="display: none;"></div>
            </div>
          </div>
        </div>

      </div>

    </div>
  </section>
</template>

<style scoped>
/* Main typography and spacing */
.timeline-eyebrow {
  color: #ff5a1f; /* Orange accent */
  font-family: 'Outfit', sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  display: block;
  margin-bottom: 0.75rem;
}

.timeline-title {
  color: #0c1c28; /* Dark navy/black */
  font-family: 'Outfit', sans-serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1.2;
}

/* Card Wrapper & Grid Alignment */
.card-wrapper {
  height: 100%; /* forces wrapper to match grid height */
}

@media (min-width: 1024px) {
  .staggered-card {
    transform: translateY(3rem);
  }
}

/* Card Styling */
.timeline-card {
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden; 
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%; /* identical height enforcement via flex stretching */
}

.timeline-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.08);
}

.card-content {
  padding: 3rem 2.5rem 2rem 2.5rem;
  flex-grow: 1; /* Pushes image to bottom */
}

.card-eyebrow {
  color: #8c96a0; /* Subdued gray */
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.card-title {
  color: #0c1c28;
  font-family: 'Outfit', sans-serif;
  font-size: 1.625rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.card-description {
  color: #55606a;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  line-height: 1.6;
}

/* Card Image Box logic */
.card-image-box {
  width: 100%;
  padding: 0 2.5rem 2.5rem 2.5rem;
  margin-top: auto;
}

.placeholder-graphic, .fallback-graphic {
  border-radius: 0.5rem;
  width: 100%;
  height: 160px; /* Base height mimicking the screenshot */
  overflow: hidden;
}

.fallback-graphic {
  background: linear-gradient(135deg, #e7eaf0 0%, #d8dce6 100%);
  position: relative;
}

/* Subtle pseudo-element design for fallback */
.fallback-graphic::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: 
    linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px);
  background-size: 15px 15px;
  opacity: 0.5;
}
</style>
