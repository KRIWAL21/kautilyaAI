<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { Card, CardTitle } from '@/components/ui/card'
import { useLeadStore } from '@/store/LeadStore'
import { useSiteVisitStore } from '@/store/SiteVisitStore'
import { storeToRefs } from 'pinia'

const leadStore = useLeadStore()
const siteVisitStore = useSiteVisitStore()
const { leadStatsData } = storeToRefs(leadStore)
const { siteVisits } = storeToRefs(siteVisitStore)

onMounted(async () => {
  await Promise.all([
    leadStore.getLeadStats(),
    siteVisitStore.getSiteVisitsByUserId(),
  ])
})

const bookingDone = computed(() =>
  siteVisits.value.filter((v: any) => v.status?.toLowerCase() === 'complete').length
)
const visited = computed(() =>
  siteVisits.value.filter((v: any) => v.status?.toLowerCase() === 'pending' || v.status?.toLowerCase() === 'complete').length
)
const notVisited = computed(() =>
  siteVisits.value.filter((v: any) => v.status?.toLowerCase() === 'incomplete').length
)
</script>

<template>
  <div class="px-6 mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
    <!-- R Circle Score Card -->
    <Card class="bg-card border-border p-6 flex flex-col justify-between rounded-xl">
      <div>
        <CardTitle class="text-lg uppercase mb-4">R CIRCLE SCORE CARD</CardTitle>
        <div class="text-[11px] text-muted-foreground uppercase mb-1 font-semibold tracking-wider">APPOINTMENTS</div>
        <div class="text-4xl font-bold mb-8">{{ siteVisits.length }}</div>
      </div>
      
      <div class="space-y-4">
        <div class="flex items-center justify-between text-sm bg-black/20 p-2 px-3 rounded-md">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            <span class="uppercase text-[11px] font-bold tracking-wider">BOOKING DONE</span>
          </div>
          <span class="font-bold">{{ String(bookingDone).padStart(2, '0') }}</span>
        </div>
        <div class="flex items-center justify-between text-sm bg-black/20 p-2 px-3 rounded-md">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-cyan-500"></div>
            <span class="uppercase text-[11px] font-bold tracking-wider">VISITED</span>
          </div>
          <span class="font-bold">{{ String(visited).padStart(2, '0') }}</span>
        </div>
        <div class="flex items-center justify-between text-sm bg-black/20 p-2 px-3 rounded-md">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <span class="uppercase text-[11px] font-bold tracking-wider">NOT VISITED</span>
          </div>
          <span class="font-bold">{{ String(notVisited).padStart(2, '0') }}</span>
        </div>
      </div>
    </Card>

    <!-- Your Leads Scorecard -->
    <Card class="bg-card border-border p-6 flex flex-col justify-between rounded-xl">
      <div>
        <CardTitle class="text-lg uppercase mb-4">YOUR LEADS SCORECARD</CardTitle>
        <div class="text-[11px] text-muted-foreground uppercase mb-1 font-semibold tracking-wider">TOTAL LEADS</div>
        <div class="text-4xl font-bold mb-8">{{ leadStatsData.totalLeads }}</div>
      </div>
      
      <div class="space-y-4">
        <div class="flex items-center justify-between text-sm bg-black/20 p-2 px-3 rounded-md">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <span class="uppercase text-[11px] font-bold tracking-wider">HOT LEADS</span>
          </div>
          <span class="font-bold">{{ String(leadStatsData.hot ?? 0).padStart(2, '0') }}</span>
        </div>
        <div class="flex items-center justify-between text-sm bg-black/20 p-2 px-3 rounded-md">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
            <span class="uppercase text-[11px] font-bold tracking-wider">WARM LEADS</span>
          </div>
          <span class="font-bold">{{ String(leadStatsData.warm ?? 0).padStart(2, '0') }}</span>
        </div>
        <div class="flex items-center justify-between text-sm bg-black/20 p-2 px-3 rounded-md">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-zinc-600"></div>
            <span class="uppercase text-[11px] font-bold tracking-wider">COLD LEADS</span>
          </div>
          <span class="font-bold">{{ String(leadStatsData.cold ?? 0).padStart(2, '0') }}</span>
        </div>
      </div>
    </Card>
  </div>
</template>
