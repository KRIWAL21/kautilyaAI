<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps({
  y: { type: Number, default: 30 },
  duration: { type: Number, default: 0.9 },
  delay: { type: Number, default: 0 },
  start: { type: String, default: 'top 85%' },
  once: { type: Boolean, default: true },
  as: { type: String, default: 'div' },
})

const root = ref(null)
let trigger = null

onMounted(() => {
  if (!root.value) return
  gsap.set(root.value, { opacity: 0, y: props.y })
  trigger = ScrollTrigger.create({
    trigger: root.value,
    start: props.start,
    once: props.once,
    onEnter: () => {
      gsap.to(root.value, {
        opacity: 1,
        y: 0,
        duration: props.duration,
        delay: props.delay,
        ease: 'power3.out',
      })
    },
  })
})

onBeforeUnmount(() => {
  if (trigger) trigger.kill()
})
</script>

<template>
  <component :is="as" ref="root">
    <slot />
  </component>
</template>
