<script setup>
import { onMounted, ref, onUnmounted } from 'vue';
import gsap from 'gsap';

const sectionRef = ref(null);
let ctx = null;

// Arc donut math
const radius = 88;
const circumference = 2 * Math.PI * radius;
const totalArc = 270; // degrees
const trackDash = (totalArc / 360) * circumference;
const trackGap = circumference - trackDash;

// Segmented orange progress (3 segments)
const segmentLength = 50;
const gapWidth = 10;

onMounted(() => {
  ctx = gsap.context(() => {
    // Entrance animations
    gsap.from('.loan-content > *', {
      y: 40, opacity: 0, stagger: 0.15, duration: 1, ease: 'power4.out'
    });
    
    gsap.from('.loan-card', {
      x: 60, opacity: 0, duration: 1.2, delay: 0.2, ease: 'power4.out'
    });

    // Animate donut segments
    gsap.from('.progress-segments', {
      strokeDashoffset: trackDash,
      duration: 2,
      delay: 0.6,
      ease: 'power3.out'
    });

    // Stat lines reveal
    gsap.from('.stat-line', {
      scaleX: 0, opacity: 0, transformOrigin: 'left', stagger: 0.2, duration: 0.8, delay: 1.2, ease: 'power3.out'
    });
  }, sectionRef.value);
});

onUnmounted(() => { if (ctx) ctx.kill(); });
</script>

<template>
  <section ref="sectionRef" class="hero-wrapper">
    <div class="max-w-7xl mx-auto px-4 2xl:px-0 py-10 flex flex-col lg:flex-row items-center gap-16 mt-10">
      
      <!-- Left Content -->
      <div class="loan-content w-full lg:w-1/2 flex flex-col items-start gap-4">
        <div class="tag-label">INTELLIGENT CAPITAL</div>

        <h1 class="main-title leading-tight">
          The Blueprint of<br />
          Financial Freedom.
        </h1>

        <p class="sub-desc">
          Our architectural approach to lending removes the friction of
          traditional finance, replacing it with precision-engineered
          rates and transparent structures.
        </p>

        <div class="feature-badges flex flex-wrap gap-4">
          <div class="badge-item">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Fixed APR 4.25%
          </div>
          <div class="badge-item">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
               <polyline points="20 6 9 17 4 12" />
            </svg>
            Instantly Approved
          </div>
        </div>
      </div>

      <!-- Right Card -->
      <div class="w-full lg:w-1/2 flex justify-center lg:justify-end">
        <div class="loan-card">
          
          <!-- Donut Graphic -->
          <div class="donut-section relative flex items-center justify-center mb-10">
            <svg width="220" height="220" viewBox="0 0 220 220" class="donut-svg">
              <!-- Background Gray Track -->
              <circle
                cx="110" cy="110" :r="radius"
                fill="none" stroke="#f1f3f7" stroke-width="15" stroke-linecap="round"
                :stroke-dasharray="`${trackDash} ${trackGap}`"
                transform="rotate(135 110 110)"
              />
              <!-- Segmented Orange Progress -->
              <circle
                class="progress-segments"
                cx="110" cy="110" :r="radius"
                fill="none" stroke="#ff5a20" stroke-width="15" stroke-linecap="round"
                :stroke-dasharray="`${segmentLength} ${gapWidth} ${segmentLength} ${gapWidth} ${segmentLength} ${circumference}`"
                transform="rotate(135 110 110)"
              />
            </svg>
            
            <div class="absolute flex flex-col items-center">
              <span class="donut-label">MONTHLY PAYMENT</span>
              <span class="donut-value">$2,450</span>
            </div>
          </div>

          <!-- Bottom Stats -->
          <div class="stats-box w-full space-y-6">
            <div class="flex justify-between items-center text-group">
              <span class="s-label">LOAN AMOUNT</span>
              <span class="s-value">$150,000</span>
            </div>
            <div class="h-px bg-[#eaecf4] w-full stat-line"></div>
            <div class="flex justify-between items-center text-group">
              <span class="s-label">AMORTIZATION PERIOD</span>
              <span class="s-value">15 Years</span>
            </div>
            <div class="h-px bg-[#eaecf4] w-full stat-line"></div>
          </div>

        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.hero-wrapper {
  background-color: #f8f9fb;
  overflow: hidden;
}

.tag-label {
  background: #eae5ff;
  color: #634efc;
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  padding: 0.45rem 1.1rem;
  border-radius: 9999px;
  text-transform: uppercase;
}

.main-title {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(2.5rem, 6vw, 4.25rem);
  font-weight: 800;
  color: #0c1c28;
}

.sub-desc {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: #5b6771;
  line-height: 1.75;
  max-width: 440px;
}

.badge-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1.5px solid #d4d8e2;
  border-radius: 999px;
  padding: 0.5rem 1.25rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #0c1c28;
}

.icon {
  width: 1rem;
  height: 1rem;
  color: #1a202c;
}

/* Right Card */
.loan-card {
  background: #ffffff;
  border-radius: 2rem;
  padding: 3.5rem 3rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 40px 100px rgba(0,0,0,0.03), 0 15px 35px rgba(0,0,0,0.01);
}

.donut-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #8c9aab;
  margin-bottom: 0.25rem;
}

.donut-value {
  font-family: 'Outfit', sans-serif;
  font-size: 2.65rem;
  font-weight: 800;
  color: #0c1c28;
  line-height: 1;
}

/* Stats */
.s-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #8c9aab;
}

.s-value {
  font-family: 'Outfit', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #0c1c28;
}
</style>
