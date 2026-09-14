<script setup lang="ts">
import { ref } from 'vue'
import { Search, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const activeStatus = ref('All')
const statuses = ['All', 'Ongoing', 'Completed', 'Pre-launch']
</script>

<template>
  <div class="h-full flex flex-col p-6 space-y-6 max-w-[1400px]">
    <!-- Search Bar -->
    <div class="relative w-full">
      <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input 
        placeholder="Search by name, location..." 
        class="pl-12 h-12 bg-[#121212] border-border/40 rounded-full text-foreground placeholder:text-muted-foreground text-[15px]"
      />
    </div>

    <!-- Filters -->
    <div class="flex items-center space-x-3">
      <Select>
        <SelectTrigger class="w-[140px] h-10 bg-[#121212] border-border/40 rounded-full text-sm">
          <SelectValue placeholder="All Builders" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Builders</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger class="w-[130px] h-10 bg-[#121212] border-border/40 rounded-full text-sm">
          <SelectValue placeholder="All Cities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Cities</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Status Pills -->
    <div class="flex items-center space-x-3">
      <button 
        v-for="status in statuses" 
        :key="status"
        @click="activeStatus = status"
        class="px-5 py-2 rounded-full text-[14px] transition-colors"
        :class="activeStatus === status ? 'bg-[#ff4d4f] hover:bg-[#ff7875] text-white' : 'bg-[#121212] hover:bg-[#1f1f1f] text-muted-foreground border border-border/40'"
      >
        {{ status }}
      </button>
    </div>

    <!-- Empty State -->
    <div class="flex-1 flex flex-col items-center justify-center min-h-[400px]">
      <p class="text-[15px] text-muted-foreground">
        No projects found.
      </p>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-center space-x-2 pb-8">
      <Button variant="ghost" class="text-muted-foreground hover:text-foreground text-[14px] px-3" disabled>
        <ChevronLeft class="w-4 h-4 mr-1" /> Previous
      </Button>
      <div class="flex items-center justify-center w-8 h-8 rounded-md bg-[#222] text-foreground text-sm font-medium">
        1
      </div>
      <Button variant="ghost" class="text-muted-foreground hover:text-foreground text-[14px] px-3" disabled>
        Next <ChevronRight class="w-4 h-4 ml-1" />
      </Button>
    </div>
  </div>
</template>
