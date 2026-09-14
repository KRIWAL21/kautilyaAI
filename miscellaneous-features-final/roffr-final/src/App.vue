<script setup>
import { RouterView } from "vue-router";
import LoginModal from "@/components/LoginModal.vue";
import BenefitsModal from "@/components/BenefitsModal.vue";
import { onMounted, onBeforeUnmount } from "vue";
import Lenis from "lenis";

let lenis = null;

onMounted(() => {
  // Initialize Lenis smooth scroll
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: "vertical",
    gestureOrientation: "vertical",
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
  });

  // Animation frame loop
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
});

onBeforeUnmount(() => {
  if (lenis) {
    lenis.destroy();
  }
});
</script>

<template>
  <RouterView />
  <LoginModal />
  <BenefitsModal />
</template>

<style>
/* Lenis smooth scroll styles */
html.lenis, html.lenis body {
  height: auto;
}

.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}

.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}

.lenis.lenis-stopped {
  overflow: hidden;
}

.lenis.lenis-scrolling iframe {
  pointer-events: none;
}
</style>
