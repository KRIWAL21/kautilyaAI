<script setup lang="ts">
import { onMounted, ref, watch } from "vue"
import { storeToRefs } from "pinia"
import { useFollowUpStore } from "@/store/FollowUpStore"
import type { FollowUpLeadSummary } from "@/types/followup"
import { CircleCheck, Edit, Eye, Search } from "lucide-vue-next"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Label from "@/components/ui/label/Label.vue"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { toast } from "vue-sonner"
import { useDebounce } from "@/lib/debounce"

const followUpStore = useFollowUpStore()
const {
  leadFollowUps,
  leadLoading,
  currentPage,
  totalPages,
  auditLogs,
  auditLoading,
} = storeToRefs(followUpStore)

const searchQuery = ref("")
const selectedStatus = ref("")
const pageSize = 10

const isEditDialogOpen = ref(false)
const editingFollowUpId = ref<string | null>(null)
const editForm = ref({
  scheduledAt: "",
  actionType: "",
  leadStatus: "Interested",
  note: "",
  status: "",
})

const isAuditDrawerOpen = ref(false)
const selectedLeadSummary = ref<FollowUpLeadSummary | null>(null)

const formatDate = (date?: string | null) => {
  if (!date) return "-"
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

const toTitleCase = (value?: string | null) => {
  const text = String(value || "").trim()
  if (!text) return "-"

  return text
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const getAuditFieldValue = (
  log: any,
  field: "actionType" | "leadStatus" | "status",
) => {
  const afterValue = String((log as any)?.afterState?.[field] || "").trim()
  if (afterValue) return toTitleCase(afterValue)

  const beforeValue = String((log as any)?.beforeState?.[field] || "").trim()
  if (beforeValue) return toTitleCase(beforeValue)

  return toTitleCase(String((selectedLeadSummary.value?.currentFollowUp as any)?.[field] || "-"))
}

const getAuditNote = (log: any) => {
  const afterNote = String((log as any)?.afterState?.note || "").trim()
  if (afterNote) return toTitleCase(afterNote)

  const beforeNote = String((log as any)?.beforeState?.note || "").trim()
  if (beforeNote) return toTitleCase(beforeNote)

  return toTitleCase(String((selectedLeadSummary.value?.currentFollowUp as any)?.note || "-"))
}

const getUpdatedBy = (log: any) =>
  toTitleCase(String(log?.brokerName || log?.brokerPhone || log?.brokerId || "System"))

const getStatusVariant = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "default"
    case "pending":
      return "secondary"
    case "cancelled":
      return "outline"
    default:
      return "secondary"
  }
}

const fetchFollowUps = () => {
  followUpStore.getFollowUpsByLead(pageSize, currentPage.value, {
    search: searchQuery.value || undefined,
    status: selectedStatus.value || undefined,
  })
}

const debouncedSearch = useDebounce(() => {
  currentPage.value = 1
  fetchFollowUps()
}, 400)

watch(searchQuery, () => {
  debouncedSearch()
})

watch(selectedStatus, () => {
  currentPage.value = 1
  fetchFollowUps()
})

watch(currentPage, () => {
  fetchFollowUps()
})

const openEditDialog = (summary: FollowUpLeadSummary) => {
  editingFollowUpId.value = summary.currentFollowUp._id
  editForm.value = {
    scheduledAt: summary.currentFollowUp.scheduledAt
      ? new Date(summary.currentFollowUp.scheduledAt).toISOString().slice(0, 16)
      : "",
    actionType: summary.currentFollowUp.actionType ?? "",
    leadStatus: summary.currentFollowUp.leadStatus ?? "Interested",
    note: summary.currentFollowUp.note ?? "",
    status: summary.currentFollowUp.status ?? "",
  }
  isEditDialogOpen.value = true
}

const handleUpdate = async () => {
  if (!editingFollowUpId.value) return

  const response = await followUpStore.updateFollowUp(
    editingFollowUpId.value,
    editForm.value,
  )

  if (response?.status === 200) {
    toast.success(response.message)
  } else {
    toast.error(response?.message ?? "Failed to update follow-up")
  }

  isEditDialogOpen.value = false
}

const loadAuditLogs = async () => {
  if (!selectedLeadSummary.value?.leadId) return

  await followUpStore.getFollowUpAuditLogs(200, 1, {
    leadId: selectedLeadSummary.value.leadId,
  })
}

const openAuditDrawer = async (summary: FollowUpLeadSummary) => {
  selectedLeadSummary.value = summary
  isAuditDrawerOpen.value = true
  await loadAuditLogs()
}

watch(isAuditDrawerOpen, (open) => {
  if (!open) {
    selectedLeadSummary.value = null
  }
})

onMounted(fetchFollowUps)
</script>

<template>
  <div class="w-full space-y-6 p-6">
    <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <InputGroup class="md:max-w-lg">
        <InputGroupInput
          v-model="searchQuery"
          placeholder="Search leads, notes, or activity..."
        />
        <InputGroupAddon>
          <Search class="h-4 w-4" />
        </InputGroupAddon>
      </InputGroup>

      <ButtonGroup>
        <Button
          :variant="selectedStatus === '' ? 'default' : 'outline'"
          @click="selectedStatus = ''"
        >
          All
        </Button>
        <Button
          :variant="selectedStatus === 'Pending' ? 'default' : 'outline'"
          @click="selectedStatus = 'Pending'"
        >
          Pending
        </Button>
        <Button
          :variant="selectedStatus === 'Completed' ? 'default' : 'outline'"
          @click="selectedStatus = 'Completed'"
        >
          Completed
        </Button>
        <Button
          :variant="selectedStatus === 'Cancelled' ? 'default' : 'outline'"
          @click="selectedStatus = 'Cancelled'"
        >
          Cancelled
        </Button>
      </ButtonGroup>
    </div>

    <div class="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow class="h-14">
            <TableHead>Lead</TableHead>
            <TableHead>Current Follow-Up</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Lead Journey</TableHead>
            <TableHead class="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-if="leadLoading">
            <TableCell colspan="7" class="h-24 text-center">
              Loading follow-ups...
            </TableCell>
          </TableRow>

          <TableRow
            v-for="lead in leadFollowUps"
            :key="lead.leadId"
            class="h-16 cursor-pointer hover:bg-muted/50"
            @click="openAuditDrawer(lead)"
          >
            <TableCell>
              <div class="font-medium">{{ toTitleCase(lead.leadName || 'Unnamed Lead') }}</div>
              <div class="text-xs text-muted-foreground">
                {{ lead.leadPhone || lead.leadId }}
              </div>
            </TableCell>

            <TableCell>
              <div class="flex flex-col gap-1">
                <div class="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{{ toTitleCase(lead.currentFollowUp.actionType || 'Call') }}</Badge>
                  <span class="text-xs text-muted-foreground">
                    {{ formatDate(lead.currentFollowUp.scheduledAt) }}
                  </span>
                </div>
                <div class="max-w-90 truncate text-sm text-muted-foreground">
                  {{ toTitleCase(lead.currentFollowUp.note || 'No note added') }}
                </div>
              </div>
            </TableCell>

            <TableCell>
              <Badge variant="outline">
                {{ toTitleCase(lead.lastActivity || 'Initial follow-up') }}
              </Badge>
            </TableCell>

            <TableCell class="text-muted-foreground">
              {{ formatDate(lead.lastUpdated || lead.currentFollowUp.updatedAt) }}
            </TableCell>

            <TableCell>
              <Badge :variant="getStatusVariant(lead.currentFollowUp.status)">
                {{ toTitleCase(lead.currentFollowUp.status || 'Pending') }}
              </Badge>
            </TableCell>

            <TableCell>
              <Badge :variant="getStatusVariant(lead.currentFollowUp.leadStatus)">
                {{ toTitleCase(lead.currentFollowUp.leadStatus || 'Interested') }}
              </Badge>
            </TableCell>

            <TableCell>
              <div class="flex gap-1">
                <Button size="sm" variant="ghost" @click.stop="openEditDialog(lead)">
                  <Edit class="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" @click.stop="openAuditDrawer(lead)">
                  <Eye class="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>

          <TableRow v-if="!leadLoading && !leadFollowUps.length">
            <TableCell colspan="7" class="h-24 text-center text-muted-foreground">
              No follow-ups found
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="flex justify-end">
      <Pagination
        :page="currentPage"
        :items-per-page="pageSize"
        :total="totalPages * pageSize"
        @update:page="(page) => (currentPage = page)"
      >
        <PaginationContent>
          <PaginationPrevious
            :disabled="currentPage === 1"
            @click="currentPage--"
          />

          <PaginationItem
            v-for="page in totalPages"
            :key="page"
            :value="page"
            :is-active="page === currentPage"
            @click="currentPage = page"
          >
            {{ page }}
          </PaginationItem>

          <PaginationNext
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          />
        </PaginationContent>
      </Pagination>
    </div>

    <Dialog v-model:open="isEditDialogOpen">
      <DialogContent class="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Follow-Up</DialogTitle>
        </DialogHeader>

        <div class="grid grid-cols-1 gap-4 py-4">
          <div class="space-y-2">
            <Label>Scheduled At</Label>
            <Input v-model="editForm.scheduledAt" type="datetime-local" />
          </div>

          <div class="space-y-2">
            <Label>Action Type</Label>
            <Input
              v-model="editForm.actionType"
              placeholder="e.g. Call, Email, Meeting"
            />
          </div>

          <div class="space-y-2">
            <Label>Lead Journey Status</Label>
            <Select v-model="editForm.leadStatus">
              <SelectTrigger>
                <SelectValue placeholder="Select lead journey status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Interested">Interested</SelectItem>
                <SelectItem value="Site Visit Booking">Site Visit Booking</SelectItem>
                <SelectItem value="Meeting">Meeting</SelectItem>
                <SelectItem value="Booking Registration">Booking Registration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Note</Label>
            <Input v-model="editForm.note" placeholder="Add a note..." />
          </div>

          <div class="space-y-2">
            <Label>Status</Label>
            <Select v-model="editForm.status">
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="isEditDialogOpen = false">
            Cancel
          </Button>
          <Button @click="handleUpdate">Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Sheet v-model:open="isAuditDrawerOpen">
      <SheetContent side="right" class="w-full sm:max-w-2xl overflow-y-auto px-6 py-6">
        <SheetHeader>
          <SheetTitle>
            Lead Journey - {{ toTitleCase(selectedLeadSummary?.leadName || 'Lead') }}
          </SheetTitle>
          <SheetDescription>
            Lead ID: {{ selectedLeadSummary?.leadId || '-' }}
            <span class="mx-1">•</span>
            Total Submission: {{ auditLogs.length }}
          </SheetDescription>
        </SheetHeader>

        <div v-if="selectedLeadSummary" class="space-y-4">
          <div class="rounded-xl border border-muted/50 bg-muted/10 p-5 text-sm">
            <div class="grid gap-3 md:grid-cols-2">
              <div>
                <div class="text-xs uppercase tracking-wide text-muted-foreground">Current Status</div>
                <div class="mt-1">
                  <Badge :variant="getStatusVariant(selectedLeadSummary.currentFollowUp.status)">
                    {{ toTitleCase(selectedLeadSummary.currentFollowUp.status || 'Pending') }}
                  </Badge>
                </div>
              </div>
              <div>
                <div class="text-xs uppercase tracking-wide text-muted-foreground">Decision Date</div>
                <div class="font-medium mt-1">
                  {{ formatDate(selectedLeadSummary.lastUpdated || selectedLeadSummary.currentFollowUp.updatedAt) }}
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <CircleCheck class="h-4 w-4" />
            Complete Submission Timeline
          </div>

          <div v-if="auditLoading" class="rounded-md border p-4 text-sm text-muted-foreground">
            Loading audit logs...
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="log in auditLogs"
              :key="log._id"
              class="rounded-2xl border border-border/80 bg-card p-5 shadow-xs ring-1 ring-border/50"
            >
              <div class="grid gap-x-8 gap-y-3 text-sm md:grid-cols-2">
                <div>
                  <div class="text-xs uppercase tracking-wide text-muted-foreground">Date Updated</div>
                  <div class="mt-1 font-medium">{{ formatDate(log.createdAt) }}</div>
                </div>

                <div>
                  <div class="text-xs uppercase tracking-wide text-muted-foreground">Action Type</div>
                  <div class="mt-1">
                    <Badge variant="outline">{{ getAuditFieldValue(log, "actionType") }}</Badge>
                  </div>
                </div>

                <div>
                  <div class="text-xs uppercase tracking-wide text-muted-foreground">Lead Status</div>
                  <div class="mt-1">
                    <Badge variant="outline">
                      {{ getAuditFieldValue(log, "leadStatus") }}
                    </Badge>
                  </div>
                </div>

                <div>
                  <div class="text-xs uppercase tracking-wide text-muted-foreground">Status</div>
                  <div class="mt-1">
                    <Badge :variant="getStatusVariant(getAuditFieldValue(log, 'status'))">
                      {{ getAuditFieldValue(log, 'status') }}
                    </Badge>
                  </div>
                </div>

                <div>
                  <div class="text-xs uppercase tracking-wide text-muted-foreground">Changed By</div>
                  <div class="mt-1 font-medium">{{ getUpdatedBy(log) }}</div>
                </div>
              </div>

              <div class="mt-4 rounded-lg bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                {{ getAuditNote(log) }}
              </div>
            </div>

            <div v-if="!auditLogs.length" class="rounded-xl border border-muted/50 p-4 text-sm text-muted-foreground">
              No audit logs found for this lead.
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>