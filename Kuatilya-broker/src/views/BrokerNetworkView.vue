<script setup lang="ts">
import { ref } from 'vue'
import { Search, RefreshCw, Users, UserPlus } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const filters = [
  { label: 'All', count: 0 },
  { label: 'Connected', count: 0 },
  { label: 'Invitations', count: 0 },
  { label: 'Sent', count: 0 },
  { label: 'Discover', count: 0 },
]
const activeFilter = ref('All')
</script>

<template>
  <div class="h-full flex flex-col p-6 space-y-6 max-w-[1400px]">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">My network</h1>
        <p class="text-[15px] text-muted-foreground mt-1">
          Find, connect, and chat with other brokers across the platform.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <Button variant="outline" class="bg-transparent border-border/40 text-foreground hover:bg-[#1f1f1f] rounded-full h-10 px-4">
          <RefreshCw class="w-4 h-4 mr-2" />
          Refresh
        </Button>
        <Button class="bg-[#ff4d4f] hover:bg-[#ff7875] text-white rounded-full h-10 px-5 font-semibold">
          Open inbox
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="rounded-xl border border-border/40 bg-[#121212] p-5 flex items-center space-x-4">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-orange-900/20 text-orange-500">
          <Users class="w-6 h-6" />
        </div>
        <div>
          <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider">Connections</p>
          <p class="text-2xl font-bold">0</p>
        </div>
      </div>
      
      <div class="rounded-xl border border-border/40 bg-[#121212] p-5 flex items-center space-x-4">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-purple-900/20 text-purple-500">
          <UserPlus class="w-6 h-6" />
        </div>
        <div>
          <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider">Brokers in network</p>
          <p class="text-2xl font-bold">0</p>
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="relative w-full">
      <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input 
        placeholder="Search by name, firm, or RERA..." 
        class="pl-12 h-12 bg-[#121212] border-border/40 rounded-full text-foreground placeholder:text-muted-foreground text-[15px]"
      />
    </div>

    <!-- Filter Pills -->
    <div class="flex flex-wrap items-center gap-2">
      <button 
        v-for="filter in filters" 
        :key="filter.label"
        @click="activeFilter = filter.label"
        class="px-4 py-2 rounded-full text-[13px] font-medium transition-colors border"
        :class="activeFilter === filter.label ? 'bg-white text-black border-white' : 'bg-[#121212] hover:bg-[#1f1f1f] text-gray-300 border-border/40'"
      >
        {{ filter.label }} · {{ filter.count }}
      </button>
    </div>

    <!-- People you may know section -->
    <div class="pt-2 flex flex-col space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-semibold">People you may know</h2>
        <span class="text-xs text-muted-foreground">0 brokers</span>
      </div>

      <!-- Error Banner -->
      <div class="rounded-lg border border-red-900/50 bg-red-950/20 p-4">
        <p class="text-[14px] text-red-500 font-medium">Failed to load brokers</p>
      </div>

      <!-- Empty State -->
      <div class="flex-1 rounded-xl border border-border/40 bg-[#121212] flex items-center justify-center min-h-[250px]">
        <p class="text-[15px] text-muted-foreground">
          No brokers match this filter.
        </p>
      </div>
    </div>
  </div>
</template>
