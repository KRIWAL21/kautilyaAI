<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
</script>

<template>
  <div class="h-full flex flex-col p-6 space-y-6 max-w-[1000px]">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Group Buy</h1>
      <p class="text-[14px] text-muted-foreground mt-2">
        Add customers to active group-buy campaigns, collect the token offline, and track each lead through to acceptance.
      </p>
    </div>

    <!-- Add Customer Card -->
    <div class="rounded-2xl border border-border/40 bg-[#121212] p-6 space-y-6">
      <h2 class="text-xl font-bold">Add a customer to a group buy</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="text-xs text-muted-foreground">Customer (your lead)</label>
          <Select>
            <SelectTrigger class="w-full h-12 bg-[#1A1A1A] border-border/40 rounded-xl text-[14px]">
              <SelectValue placeholder="— select a lead —" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lead_1">Lead 1</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div class="space-y-2">
          <label class="text-xs text-muted-foreground">Campaign</label>
          <Select>
            <SelectTrigger class="w-full h-12 bg-[#1A1A1A] border-border/40 rounded-xl text-[14px]">
              <SelectValue placeholder="— select an active campaign —" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="camp_1">Campaign 1</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p class="text-[12px] text-muted-foreground">
        The token amount is computed by the builder from the project price. You'll see the exact figure on the row below once submitted.
      </p>

      <Button class="bg-[#8b2b35] hover:bg-[#a93340] text-white/90 rounded-xl h-11 px-6 font-medium border border-red-900/50">
        Add to group buy
      </Button>
    </div>

    <!-- Referrals Card -->
    <div class="rounded-2xl border border-border/40 bg-[#121212] p-6 flex flex-col">
      <h2 class="text-xl font-bold mb-8">My group-buy referrals</h2>
      
      <div class="flex-1 flex items-center justify-center min-h-[150px]">
        <p class="text-[14px] text-muted-foreground">
          You haven't referred any customers to a group buy yet.
        </p>
      </div>
    </div>
  </div>
</template>
