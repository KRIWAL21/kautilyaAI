<script setup lang="ts">
import { ref } from 'vue'
import { Search } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
</script>

<template>
  <div class="h-full flex flex-col p-6 space-y-6 max-w-[1400px]">
    <!-- Header -->
    <h1 class="text-2xl font-bold tracking-tight">Ongoing Events</h1>

    <!-- Stats Card -->
    <div class="w-full rounded-2xl bg-[#1A1A1A] border border-[#333] p-6 flex flex-col space-y-4">
      <div class="flex justify-between items-center text-sm font-medium">
        <span class="text-muted-foreground">Total</span>
        <span class="text-red-500 font-bold text-lg">00</span>
      </div>
      
      <!-- Progress Bar -->
      <div class="w-full h-3 rounded-full bg-[#333] overflow-hidden">
        <div class="h-full bg-yellow-400 w-full rounded-full"></div>
      </div>
      
      <div class="flex justify-between items-center pt-2">
        <div class="flex flex-col space-y-1">
          <div class="flex items-center text-xs text-muted-foreground">
            <span class="w-2 h-2 rounded-full bg-gray-500 mr-2"></span>
            Participated
          </div>
          <span class="text-xl font-bold font-mono">00</span>
        </div>
        
        <div class="flex flex-col space-y-1 items-end">
          <div class="flex items-center text-xs text-muted-foreground">
            <span class="w-2 h-2 rounded-full bg-yellow-400 mr-2"></span>
            Upcoming
          </div>
          <span class="text-xl font-bold font-mono">00</span>
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="relative w-full">
      <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input 
        placeholder="Search by name, location..." 
        class="pl-12 h-12 bg-[#121212] border-border/40 rounded-full text-foreground placeholder:text-muted-foreground text-[15px]"
      />
    </div>

    <!-- Error Banner -->
    <div class="rounded-lg border border-red-900/50 bg-red-950/20 p-4">
      <p class="text-[14px] text-red-500 font-medium">Network Error</p>
    </div>

    <!-- Empty State -->
    <div class="flex-1 rounded-lg border border-border/40 bg-[#121212] flex items-center justify-center min-h-[200px]">
      <p class="text-[15px] text-muted-foreground">
        No ongoing events found.
      </p>
    </div>
  </div>
</template>
