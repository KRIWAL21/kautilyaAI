<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { Card, CardTitle } from '@/components/ui/card'
import { makeRequest } from '@/request/request'
import endpoints from '@/request/endpoints'

const invoices = ref<any[]>([])

onMounted(async () => {
  try {
    const res = await makeRequest(endpoints.invoices, 'GET')
    if (res?.data) invoices.value = res.data
  } catch {
    // silently fail on dashboard
  }
})

const totalEarnings = computed(() =>
  invoices.value
    .filter((i: any) => i.status?.toLowerCase() === 'paid' || i.status?.toLowerCase() === 'approved')
    .reduce((sum: number, i: any) => sum + (i.amount || 0), 0)
)

const potentialEarnings = computed(() =>
  invoices.value.reduce((sum: number, i: any) => sum + (i.amount || 0), 0)
)

const formatInr = (amount: number) => {
  if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L INR`
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K INR`
  return `${amount} INR`
}

// Build score meter bars (out of 10)
const filledBars = computed(() => {
  if (!potentialEarnings.value) return 0
  return Math.min(10, Math.round((totalEarnings.value / potentialEarnings.value) * 10))
})
</script>

<template>
  <div class="px-6 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
    <!-- Banner -->
    <Card class="bg-card overflow-hidden relative min-h-[250px] border-border rounded-xl">
      <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000" alt="Building" class="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" />
      <div class="relative z-10 p-6 flex flex-col justify-center h-full">
        <h2 class="text-white font-black text-2xl mb-4 uppercase leading-tight drop-shadow-md">EARN MORE<br/>BROKERAGE !</h2>
        <div class="space-y-2">
          <div class="bg-yellow-400 text-black font-bold text-sm px-3 py-1 w-fit rounded-sm shadow-md">3 DEAL - 7%</div>
          <div class="bg-yellow-400 text-black font-bold text-sm px-3 py-1 w-fit rounded-sm shadow-md">2 DEAL - 6%</div>
          <div class="bg-yellow-400 text-black font-bold text-sm px-3 py-1 w-fit rounded-sm shadow-md">1 DEAL - 5%</div>
        </div>
      </div>
    </Card>

    <!-- Growth Scoremeter -->
    <Card class="bg-card border-border flex flex-col p-6 rounded-xl">
      <CardTitle class="text-lg mb-6">Growth Scoremeter</CardTitle>
      
      <!-- Score meter bars -->
      <div class="flex-1 flex items-center justify-center mb-8">
        <div class="w-full flex gap-1 h-10">
          <div
            v-for="i in 10"
            :key="i"
            class="flex-1 rounded-sm transition-colors duration-500"
            :class="i <= filledBars ? 'bg-green-500' : 'bg-zinc-800'"
          ></div>
        </div>
      </div>

      <div class="flex justify-between items-end mt-auto">
        <div>
          <div class="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">TOTAL INCOME GENERATED</div>
          <div class="text-xl font-bold">{{ formatInr(totalEarnings) }}</div>
        </div>
        <div class="text-right">
          <div class="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">YOUR POTENTIAL INCOME</div>
          <div class="text-xl font-bold">{{ formatInr(potentialEarnings || 1000000) }}</div>
        </div>
      </div>
    </Card>
  </div>
</template>
