<script setup>
import { onMounted, ref } from 'vue';
import gsap from 'gsap';

const heroContent = ref(null);
const heroImage = ref(null);
const statsCard = ref(null);

onMounted(() => {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });

  tl.from(heroContent.value.children, {
    y: 40,
    opacity: 0,
    stagger: 0.2,
  })
  .from(heroImage.value, {
    x: 100,
    opacity: 0,
    duration: 1.5,
  }, "-=1")
  .from(statsCard.value, {
    scale: 0.8,
    opacity: 0,
    duration: 1,
  }, "-=0.8");
});
</script>

<template>
  <section class="hero-section py-20 px-4 overflow-hidden">
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <!-- Left Content -->
      <div ref="heroContent" class="hero-content order-2 lg:order-1">
        <span class="font-outfit text-orange-500 font-semibold tracking-wide">OUR VISION</span>
        <h1 class="font-bold leading-tight text-[80px]">
          Building the <br />
          <span class="text-accent">Digital Future</span>
        </h1>
        <p class="hero-description mt-4">
          We don't just develop software; we architect the infrastructure of 
          tomorrow's connectivity. Roffr is where engineering meets 
          editorial elegance.
        </p>
      </div>

      <!-- Right Content: Image & Card -->
      <div class="hero-visual order-1 lg:order-2 relative">
        <div ref="heroImage" class="h-[550px] rounded-2xl">
          <img 
            src="/images/AboutPage/aboutHero/about-bg.webp" 
            alt="Digital Architecture" 
            class="hero-img rounded-2xl"
          />
        </div>
        
        <!-- Floating Stats Card -->
        <div ref="statsCard" class="stats-card">
          <div class="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 21 1.9-1.9a10 10 0 1 1 14.2 0L21 21"/>
              <path d="M16.5 14.9a6.5 6.5 0 1 0-9 0"/>
              <circle cx="12" cy="9" r="2"/>
            </svg>
          </div>
          <div class="card-body">
            <h3 class="stat-number">100+</h3>
            <p class="stat-label">CORE ENGINEERS</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  background-color: #ffffff;
  min-height: 80vh;
  display: flex;
  align-items: center;
}

.hero-title {
  color: #0c1c28;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  line-height: 1.1;
  margin-bottom: 2rem;
}


.hero-description {
  color: #55606a;
  font-family: 'Inter', sans-serif;
  font-size: 1.125rem;
  line-height: 1.7;
  max-width: 500px;
}

.hero-visual {
  padding: 2rem;
}

.main-image-wrapper {
  position: relative;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.15);
  aspect-ratio: 4/5; /* Optimized for vertical/portrait images */
  max-width: 500px;
  margin-left: auto;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}

.main-image-wrapper:hover .hero-img {
  transform: scale(1.05);
}

.stats-card {
  position: absolute;
  bottom: 10%; /* Lifted slightly for vertical images */
  left: -8%;
  background: white;
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 40px 80px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 240px;
  z-index: 10;
}

.card-icon {
  color: #ff5a1f;
  background: rgba(255, 90, 31, 0.05);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
}

.stat-number {
  color: #0c1c28;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 2.5rem;
  margin: 0;
  line-height: 1;
}

.stat-label {
  color: #55606a;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0.5rem 0 0 0;
}

@media (max-width: 1024px) {
  .stats-card {
    position: relative;
    bottom: 0;
    left: 0;
    margin-top: -3rem;
    margin-left: 2rem;
  }
  
  .hero-visual {
    padding: 0 0 4rem 0;
  }
}
</style>
