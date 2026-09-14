<script setup lang="ts">
import { onMounted, computed } from 'vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useSiteVisitStore } from '@/store/SiteVisitStore'
import { storeToRefs } from 'pinia'

const siteVisitStore = useSiteVisitStore()
const { siteVisits, loading } = storeToRefs(siteVisitStore)

onMounted(async () => {
  await siteVisitStore.getSiteVisitsByUserId()
})

const recentVisits = computed(() => siteVisits.value.slice(0, 5))

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatTime = (dateStr?: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

const getStatusVariant = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'complete': return 'default'
    case 'pending': return 'secondary'
    case 'incomplete': return 'destructive'
    default: return 'secondary'
  }
}
</script>

<template>
  <div class="px-6 mt-8">
    <h2 class="text-xl font-bold mb-4">Recent Site Visits</h2>
    <div class="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader class="bg-black/20">
          <TableRow class="h-12 border-border/50 hover:bg-transparent">
            <TableHead class="font-semibold text-foreground">Lead</TableHead>
            <TableHead class="font-semibold text-foreground">Phone</TableHead>
            <TableHead class="font-semibold text-foreground">Project</TableHead>
            <TableHead class="font-semibold text-foreground">Visit Date</TableHead>
            <TableHead class="font-semibold text-foreground">Visit Time</TableHead>
            <TableHead class="font-semibold text-foreground">Status</TableHead>
            <TableHead class="font-semibold text-foreground">Purpose</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="loading">
            <TableRow class="hover:bg-transparent border-none">
              <TableCell colspan="7" class="h-32 text-center text-muted-foreground text-sm">
                Loading...
              </TableCell>
            </TableRow>
          </template>
          <template v-else-if="recentVisits.length">
            <TableRow
              v-for="visit in recentVisits"
              :key="visit._id"
              class="h-14 hover:bg-muted/40 transition-colors"
            >
              <TableCell class="font-medium">{{ (visit as any).leadName || (visit as any).lead?.name || '-' }}</TableCell>
              <TableCell class="text-muted-foreground">{{ (visit as any).leadPhone || (visit as any).lead?.phone || '-' }}</TableCell>
              <TableCell class="text-muted-foreground">{{ (visit as any).projectName || (visit as any).project?.projectName || '-' }}</TableCell>
              <TableCell class="text-muted-foreground">{{ formatDate((visit as any).visitDate || (visit as any).scheduledAt) }}</TableCell>
              <TableCell class="text-muted-foreground">{{ formatTime((visit as any).visitDate || (visit as any).scheduledAt) }}</TableCell>
              <TableCell>
                <Badge :variant="getStatusVariant((visit as any).status)">
                  {{ (visit as any).status || 'Pending' }}
                </Badge>
              </TableCell>
              <TableCell class="text-muted-foreground">{{ (visit as any).purpose || '-' }}</TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow class="hover:bg-transparent border-none">
              <TableCell colspan="7" class="h-32 text-center text-muted-foreground text-sm">
                No site visits yet
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
