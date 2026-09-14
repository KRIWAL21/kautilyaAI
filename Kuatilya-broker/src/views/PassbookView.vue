<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { makeRequest } from '@/request/request'
import endpoints from '@/request/endpoints'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye } from 'lucide-vue-next'

const invoices = ref([] as any[])

const fetchInvoices = async () => {
  try {
    const res = await makeRequest(endpoints.invoices, 'GET')
    if (res?.data) {
      invoices.value = res.data
    }
  } catch (err) {
    console.error('Failed to fetch invoices', err)
  }
}

onMounted(() => {
  fetchInvoices()
})

const stats = computed(() => {
  const totalInvoices = invoices.value.length
  const paid = invoices.value.filter(i => i.status?.toLowerCase() === 'paid').length
  const totalEarnings = invoices.value.reduce((acc, curr) => {
    if (curr.status?.toLowerCase() === 'paid' || curr.status?.toLowerCase() === 'approved') {
      return acc + (curr.amount || 0)
    }
    return acc
  }, 0)
  const waitingApproval = invoices.value.filter(i => i.status?.toLowerCase() === 'pending').length
  const approved = invoices.value.filter(i => i.status?.toLowerCase() === 'approved').length
  const cancelled = invoices.value.filter(i => i.status?.toLowerCase() === 'cancelled').length

  return [
    { label: 'Invoice', value: totalInvoices.toString() },
    { label: 'Paid', value: paid.toString() },
    { label: 'Total Earnings', value: `₹ ${(totalEarnings / 100000).toFixed(2)} L` },
    { label: 'Waiting for Approval', value: waitingApproval.toString() },
    { label: 'Approved - Awaiting Payment', value: approved.toString() },
    { label: 'Cancellation', value: cancelled.toString() },
  ]
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatAmount = (amt: number) => {
  if (!amt) return '₹ 0'
  return `₹ ${amt.toLocaleString('en-IN')}`
}
</script>

<template>
  <div class="h-full flex flex-col p-6 space-y-8 max-w-[1400px]">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Your Passbook</h1>
      <p class="text-[14px] text-muted-foreground mt-1">
        Net earnings from approved & paid invoices: <span class="font-medium text-foreground">{{ stats[2].value }}</span>
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div 
        v-for="stat in stats" 
        :key="stat.label"
        class="rounded-xl border border-border/40 bg-[#121212] p-5 flex flex-col justify-center space-y-2 min-h-[110px]"
      >
        <p class="text-[13px] text-muted-foreground font-medium">{{ stat.label }}</p>
        <p class="text-3xl font-bold">{{ stat.value }}</p>
      </div>
    </div>

    <!-- Transactions Section -->
    <div class="flex flex-col space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold">Transactions</h2>
        <Button class="bg-[#ff4d4f] hover:bg-[#ff7875] text-white rounded-md font-medium">
          Generate Invoice
        </Button>
      </div>

      <!-- Data Table -->
      <div class="rounded-xl border border-border/40 bg-[#121212] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow class="hover:bg-transparent border-b-border/40">
              <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4">Invoice #</TableHead>
              <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center py-4">Builder</TableHead>
              <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center py-4">Date</TableHead>
              <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center py-4">Amount</TableHead>
              <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center py-4">Status</TableHead>
              <TableHead class="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right py-4">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="invoices.length === 0" class="hover:bg-transparent">
              <TableCell colspan="6" class="h-24 text-center">
                <p class="text-[14px] text-muted-foreground">
                  No invoices yet. Hit "Generate Invoice" to raise your first one.
                </p>
              </TableCell>
            </TableRow>
            <TableRow v-for="invoice in invoices" :key="invoice._id" class="hover:bg-[#1a1a1a] transition-colors">
              <TableCell class="font-medium text-foreground py-4">{{ invoice.invoiceNumber }}</TableCell>
              <TableCell class="text-center py-4 text-muted-foreground">{{ invoice.customerName }}</TableCell>
              <TableCell class="text-center py-4 text-muted-foreground">{{ formatDate(invoice.invoiceDate) }}</TableCell>
              <TableCell class="text-center py-4 font-semibold text-[#ff4d4f]">{{ formatAmount(invoice.amount) }}</TableCell>
              <TableCell class="text-center py-4">
                <span class="px-2.5 py-1 text-xs rounded-full font-medium"
                  :class="{
                    'bg-green-500/10 text-green-500': invoice.status?.toLowerCase() === 'paid' || invoice.status?.toLowerCase() === 'approved',
                    'bg-yellow-500/10 text-yellow-500': invoice.status?.toLowerCase() === 'pending',
                    'bg-red-500/10 text-red-500': invoice.status?.toLowerCase() === 'cancelled'
                  }">
                  {{ invoice.status }}
                </span>
              </TableCell>
              <TableCell class="text-right py-4">
                <Button variant="ghost" size="sm" class="h-8 text-muted-foreground hover:text-white rounded-lg">
                  <Eye class="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
</template>
