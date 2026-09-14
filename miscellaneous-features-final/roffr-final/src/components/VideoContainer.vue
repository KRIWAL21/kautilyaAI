<script setup>
import { ref } from 'vue'

const showVideo = ref(true)

const closeVideo = () => {
  showVideo.value = false
}
</script>

<template>
  <section
    v-if="showVideo"
    class="w-[150px] h-[350px]"
  >
    <button
      @click="closeVideo"
      class="absolute -top-2 -right-2 z-10 h-6 w-6 rounded-full bg-black/70 text-white text-xs flex items-center justify-center pi pi-times"
    >
    </button>

    <video
      src="/video/demo-video.mp4"
      class="rounded-2xl"
      autoplay
      muted
      loop
      playsinline
    ></video>
  </section>
</template>
