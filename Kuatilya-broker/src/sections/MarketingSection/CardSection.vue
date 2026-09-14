<script setup lang="ts">
// import { Button } from '@/components/ui/button'
// import { 
//   ArrowRight 
// } from 'lucide-vue-next'
import GenerateImages from './Cards/GenerateImages.vue';
import GenerateWhatsapp from './Cards/GenerateWhatsapp.vue';
import GeneratePpt from './Cards/GeneratePpt.vue';
import GenerateVideo from './Cards/GenerateVideo.vue';
</script>

<template>
  <div class="px-6 space-y-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-2">
        <h1 class="text-3xl font-bold text-foreground tracking-tight">Marketing AI Content Creation</h1>
        <p class="opacity-70">
          Select a specialized AI tool to generate professional marketing materials for your real estate listings and social media.
        </p>
      </div>
      <!-- <Button variant="outline" class="w-fit border-border hover:bg-accent text-foreground gap-2">
        <ArrowRight class="w-4 h-4" />
        Connect with AI
      </Button> -->
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <GenerateImages/>
      <GenerateWhatsapp/>
      <GeneratePpt/>
      <GenerateVideo/>
    </div>
  </div>
</template>

<style scoped>
/* Any additional custom styles can be added here */
</style>
