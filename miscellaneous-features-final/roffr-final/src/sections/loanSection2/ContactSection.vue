<script setup>
import { onMounted, ref, onUnmounted } from "vue";
import gsap from "gsap";

const sectionRef = ref(null);
let ctx = null;

onMounted(() => {
  ctx = gsap.context(() => {
    // Reveal animations
    gsap.from(".cta-content > *", {
      scrollTrigger: {
        trigger: sectionRef.value,
        start: "top 85%",
      },
      y: 40,
      opacity: 0,
      stagger: 0.15,
      duration: 1,
      ease: "power3.out",
    });
  }, sectionRef.value);
});

onUnmounted(() => {
  if (ctx) ctx.kill();
});
</script>

<template>
  <section ref="sectionRef" class="contact-cta">
    <div
      class="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center text-center"
    >
      <div class="cta-content max-w-3xl flex flex-col items-center gap-6">
        <h2 class="title-text font-bold leading-tight">Ready to build your financial future?</h2>

        <p class="subtitle-text">
          Join 50,000+ borrowers who chose architectural precision over
          traditional confusion.
        </p>

        <div class="flex flex-wrap justify-center gap-4 mt-8">
          <button
            class="bg-black px-16 py-4 text-white font-semibold rounded-md w-full xl:w-fit z-10"
          >
            Begin Application
          </button>
          <button
            class="bg-gray-200 px-16 py-4 font-semibold rounded-md w-full xl:w-fit z-10"
          >
            Save Quote
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact-cta {
  background: white; /* Clean white as seen in image */
  position: relative;
  overflow: hidden;
}

/* Subtle glow effect on the right as seen in screenshot */
.contact-cta::after {
  content: "";
  position: absolute;
  top: 0;
  right: -10%;
  width: 40%;
  height: 100%;
  background: radial-gradient(
    circle,
    rgba(254, 243, 232, 0.5) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.title-text {
  font-family: "Outfit", sans-serif;
  font-size: clamp(2.5rem, 6vw, 5rem);
  color: #111111;
  margin: 0;
}

.subtitle-text {
  font-family: "Inter", sans-serif;
  font-size: 1.1rem;
  color: #555555;
  line-height: 1.5;
  margin: 0;
}

.btn-dark:hover {
  background-color: #000000;
  transform: translateY(-2px);
}

.btn-light {
  background-color: #e8e8e8;
  color: #1a1a1a;
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  font-weight: 700;
  padding: 1.25rem 2.5rem;
  border-radius: 4px;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
}

.btn-light:hover {
  background-color: #dddddd;
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .title-text {
    font-size: 2.25rem;
  }
  .btn-dark,
  .btn-light {
    width: 100%;
  }
}
</style>
