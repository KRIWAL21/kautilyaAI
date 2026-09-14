<script setup lang="ts">
import { Button } from "@/components/ui/button";
</script>

<template>
  <div class="px-6 pt-4 pb-2 flex items-center justify-end">
    <div class="flex items-center gap-3">
      <Button variant="default" size="default" class="">
        Add New Project
      </Button>
      <Button variant="outline" size="icon" class="h-10 w-10 rounded-full border-gray-700 hover:bg-gray-800 bg-white">
        <span class="text-xl">👤</span>
      </Button>
    </div>
  </div>
</template>
