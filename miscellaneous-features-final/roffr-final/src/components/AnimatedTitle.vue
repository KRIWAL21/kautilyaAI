<!-- src/components/AnimatedTitle.vue -->
<template>
  <h1 
    :class="['animated-title', customClass, { 'is-revealed': isRevealed }]" 
    ref="titleRef"
  >
    <span
      v-for="(word, index) in words"
      :key="index"
      class="animated-word"
      :style="{ '--word-delay': `${index * 0.06}s` }"
    >
      {{ word }}&nbsp;
    </span>
  </h1>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount, computed, nextTick } from "vue";

const props = defineProps({
  text: { type: String, required: true },
  customClass: { type: String, default: "" },
});

const titleRef = ref(null);
const isRevealed = ref(false);

// Split text into words
const words = computed(() => props.text.split(" "));

// Intersection Observer for Lenis-style scroll reveal
let observer = null;

onMounted(() => {
  nextTick(() => {
    if (!titleRef.value) return;

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isRevealed.value) {
            isRevealed.value = true;
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    observer.observe(titleRef.value);
  });
});

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
});
</script>

<style>
/* Lenis-style animated title - using global styles for reliability */
.animated-title {
  overflow: hidden;
  display: block;
}

.animated-word {
  display: inline-block;
  transform: translateY(100%);
  opacity: 0;
  transition: 
    transform 0.8s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: var(--word-delay, 0s);
}

/* Revealed state */
.animated-title.is-revealed .animated-word {
  transform: translateY(0);
  opacity: 1;
}
</style>
