<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps({
  direction: {
    type: String,
    default: 'bottom', // 'top' | 'bottom' | 'left' | 'right'
  },
  duration: {
    type: Number,
    default: 0.5,
  },
  delay: {
    type: String,
    default: 0,
  },
  once: {
    type: Boolean,
    default: true, // Play animation only once
  },
  triggerOffset: {
    type: Number,
    default: 100, // Pixels from viewport bottom to start animation
  }
})

const wrapper = ref(null)

onMounted(() => {
  const directions = {
    top: { y: -25 },
    bottom: { y: 25 },
    left: { x: -25 },
    right: { x: 25 },
  }

  const fromVars = {
    opacity: 0,
    ...directions[props.direction],
  }

  const toVars = {
    opacity: 1,
    x: 0,
    y: 0,
    duration: props.duration,
    delay: props.delay,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: wrapper.value,
      start: `top bottom-=${props.triggerOffset}`,
      toggleActions: props.once ? 'play none none none' : 'play reverse play reverse',
      once: props.once,
    },
  }

  gsap.fromTo(wrapper.value, fromVars, toVars)
})

onBeforeUnmount(() => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill())
})
</script>

<template>
  <div ref="wrapper">
    <slot />
  </div>
</template>
