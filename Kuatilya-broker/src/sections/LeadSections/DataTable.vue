<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useLeadStore } from "@/store/LeadStore";
import type { Lead } from "@/types/leads";
import type { FollowUp } from "@/types/followup";
import type { SiteVisit } from "@/types/sitevisit";
import { toast } from "vue-sonner";
import { useDebounce } from "@/lib/debounce";
import { makeRequest } from "@/request/request";
import endpoints from "@/request/endpoints";

import { Search, Edit, Eye, Trash2, Building2, FolderKanban, UserCircle2, Phone, Mail, IndianRupee, StickyNote, User } from "lucide-vue-next";

/* shadcn */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/* ---------------- STORE ---------------- */
const leadStore = useLeadStore();
const { leadData, totalPages, currentPage } = storeToRefs(leadStore);

/* ---------------- UI STATE ---------------- */
const searchQuery = ref("");
const selectedStatus = ref("");
const selectedLetter = ref("");
const pageSize = 12;

const filteredLeads = computed(() => {
  let result = leadData.value;
  
  if (selectedStatus.value) {
    result = result.filter(l => l.status?.toLowerCase() === selectedStatus.value.toLowerCase());
  }
  
  if (selectedLetter.value) {
    result = result.filter(l => l.name?.toUpperCase().startsWith(selectedLetter.value));
  }
  
  return result;
});

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Generate consistent gradient colors based on name string
const getAvatarGradient = (name: string) => {
  const colors = [
    'from-red-500 to-orange-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-purple-500 to-pink-500',
    'from-amber-500 to-yellow-500',
    'from-indigo-500 to-purple-500'
  ];
  if (!name) return colors[0];
  const charCode = name.charCodeAt(0);
  return colors[charCode % colors.length];
};


/* ---------------- EDIT STATE ---------------- */
const isEditDialogOpen = ref(false);
const editLead = ref<Lead | null>(null);
const isViewDialogOpen = ref(false);
const viewLead = ref<Lead | null>(null);
const leadFollowUps = ref<FollowUp[]>([]);
const leadSiteVisits = ref<SiteVisit[]>([]);
const loadingLeadFollowUps = ref(false);
const loadingLeadSiteVisits = ref(false);

type LeadProfileSection =
  | "contact"
  | "additional-info"
  | "assigned"
  // | "call-logs"
  // | "community"
  | "opportunity"
  | "inbox"
  | "site-visit"
  | "follow-up"
  | "notes"
  | "docs"
  // | "community-sessions"

const leadProfileSections: Array<{ key: LeadProfileSection; label: string }> = [
  { key: "contact", label: "Contact" },
  { key: "additional-info", label: "Additional Info" },
  { key: "assigned", label: "Assigned" },
  // { key: "call-logs", label: "Call Logs" },
  // { key: "community", label: "Community" },
  { key: "opportunity", label: "Opportunity" },
  { key: "inbox", label: "Inbox" },
  { key: "site-visit", label: "Site Visit" },
  { key: "follow-up", label: "Follow-Up" },
  { key: "notes", label: "Notes" },
  // { key: "docs", label: "Docs" },
  // { key: "community-sessions", label: "Community Sessions" },
];

const activeLeadProfileSection = ref<LeadProfileSection>("contact");

/* ---------------- FETCH DATA ---------------- */
const fetchLeads = () => {
  leadStore.getLeadData(pageSize, currentPage.value, {
    search: searchQuery.value,
    status: selectedStatus.value,
  });
};

onMounted(fetchLeads);

const debouncedSearch = useDebounce(() => {
  currentPage.value = 1;
  fetchLeads();
}, 400);

watch(searchQuery, () => {
  debouncedSearch();
});

/* ---------------- WATCHERS ---------------- */
watch([selectedStatus, currentPage], fetchLeads);

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const displayAssocName = (item: any) =>
  item?.name || item?.email || item?.phoneNumber || "Unnamed";

const displayAssocSub = (item: any) => {
  if (item?.email && item?.phoneNumber) {
    return `${item.email} • ${item.phoneNumber}`;
  }
  return item?.email || item?.phoneNumber || "No contact details";
};

/* ---------------- HELPERS ---------------- */
const getStatusVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case "hot":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "warm":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "cold":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
};

const getFollowUpStatusVariant = (status?: string) => {
  switch (String(status || "").toLowerCase()) {
    case "completed":
      return "default";
    case "pending":
      return "secondary";
    case "cancelled":
    case "missed":
      return "outline";
    default:
      return "secondary";
  }
};

const getJourneyStatusVariant = (status?: string) => {
  switch (String(status || "").toLowerCase()) {
    case "booking registration":
      return "default";
    case "site visit booking":
      return "secondary";
    case "meeting":
      return "outline";
    default:
      return "secondary";
  }
};

const getSiteVisitStatusVariant = (status?: string) => {
  switch (String(status || "").toLowerCase()) {
    case "cancelled":
      return "outline";
    case "complete":
      return "default";
    case "pending":
      return "secondary";
    case "incomplete":
      return "outline";
    default:
      return "secondary";
  }
};

const getSiteVisitApprovalVariant = (status?: string) => {
  switch (String(status || "").toLowerCase()) {
    case "approved":
      return "default";
    case "cancelled":
      return "outline";
    default:
      return "secondary";
  }
};

const normalizeSiteVisitStatus = (status?: string) => {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "cancelled") return "incomplete";
  if (normalized === "complete" || normalized === "incomplete") return normalized;
  return "pending";
};

const normalizeSiteVisitApproval = (status?: string) => {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "approved" || normalized === "cancelled") return normalized;
  return "pending";
};

const formatSiteVisitDate = (value?: string | null) => {
  const text = String(value || "").trim();
  if (!text) return "-";

  const dateOnly = text.includes("T") ? text.split("T")[0] : text.slice(0, 10);
  const parsedDate = new Date(`${dateOnly}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatSiteVisitTime = (value?: string | null) => {
  const text = String(value || "").trim();
  if (!text) return "-";

  const [hourText = "", minuteText = ""] = text.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return text;

  const parsedTime = new Date();
  parsedTime.setHours(hour, minute, 0, 0);
  return parsedTime.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatSiteVisitPurpose = (value?: string | null) => {
  const text = String(value || "").trim();
  if (!text) return "No purpose added";

  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getSiteVisitProjectName = (projectRef: SiteVisit["projectId"]) => {
  if (!projectRef) return "Project not linked";
  if (typeof projectRef === "string") return projectRef;
  return projectRef.name || projectRef._id || "Project not linked";
};

const getSiteVisitTimestamp = (visit: SiteVisit) => {
  const createdAt = new Date(String(visit.createdAt || "")).getTime();
  if (Number.isFinite(createdAt) && createdAt > 0) return createdAt;

  const dateValue = String(visit.visitDate || "").trim();
  const dateOnly = dateValue.includes("T") ? dateValue.split("T")[0] : dateValue;
  const timeValue = String(visit.visitTime || "00:00").trim() || "00:00";
  const visitAt = new Date(`${dateOnly}T${timeValue}`).getTime();
  return Number.isFinite(visitAt) ? visitAt : 0;
};

const sortedLeadSiteVisits = computed(() => {
  return [...leadSiteVisits.value].sort(
    (left, right) => getSiteVisitTimestamp(right) - getSiteVisitTimestamp(left),
  );
});

const fetchLeadFollowUps = async (leadId: string) => {
  if (!leadId) {
    leadFollowUps.value = [];
    return;
  }

  try {
    loadingLeadFollowUps.value = true;
    const response: any = await makeRequest(
      endpoints.followup,
      "GET",
      {},
      {},
      {
        pageSize: 100,
        pageNumber: 1,
        leadId,
      },
      0,
    );

    const list = response?.data?.followUps ?? response?.followUps ?? [];
    leadFollowUps.value = Array.isArray(list) ? list : [];
  } catch (error: any) {
    leadFollowUps.value = [];
    toast.error(
      error?.response?.data?.message ??
        "Failed to load follow-up history for this lead.",
    );
  } finally {
    loadingLeadFollowUps.value = false;
  }
};

const fetchLeadSiteVisits = async (leadId: string) => {
  if (!leadId) {
    leadSiteVisits.value = [];
    return;
  }

  try {
    loadingLeadSiteVisits.value = true;
    const response: any = await makeRequest(
      endpoints.siteVisits,
      "GET",
      {},
      {},
      {},
      0,
      leadId,
      "/customer",
    );

    const list = response?.data ?? [];
    leadSiteVisits.value = Array.isArray(list) ? list : [];
  } catch (error: any) {
    leadSiteVisits.value = [];
    toast.error(
      error?.response?.data?.message ??
        "Failed to load site visit history for this lead.",
    );
  } finally {
    loadingLeadSiteVisits.value = false;
  }
};

const closeViewDialog = () => {
  isViewDialogOpen.value = false;
  viewLead.value = null;
  leadFollowUps.value = [];
  leadSiteVisits.value = [];
  activeLeadProfileSection.value = "contact";
};

/* ---------------- EDIT HANDLERS ---------------- */
const openEditDialog = (lead: Lead) => {
  editLead.value = JSON.parse(JSON.stringify(lead)); // deep clone
  isEditDialogOpen.value = true;
};

const openViewDialog = async (lead: Lead) => {
  activeLeadProfileSection.value = "contact";
  await Promise.all([fetchLeadFollowUps(lead._id), fetchLeadSiteVisits(lead._id)]);

  try {
    const fullLead = await leadStore.getLeadById(lead._id);
    viewLead.value = fullLead ?? lead;
    isViewDialogOpen.value = true;
  } catch (error: any) {
    viewLead.value = lead;
    isViewDialogOpen.value = true;
    toast.error(error?.response?.data?.message ?? "Failed to load full lead details. Showing table data.");
  }
};

const submitEditLead = async () => {
  if (!editLead.value) return;

  try {
    const response = await leadStore.updateLead(editLead.value._id, editLead.value);
    if (response.status === 200) {
      toast.success(response.message ?? "Lead updated successfully");
    } else {
      toast.error(response.message ?? "Failed to update lead");
    }
    isEditDialogOpen.value = false;
  } catch (error: any) {
    toast.error(error?.response?.data?.message ?? error?.message ?? "Failed to update lead");
  }
};

const removeLead = async (lead: Lead) => {
  const confirmed = window.confirm(`Delete lead ${lead.name || lead._id}?`);
  if (!confirmed) return;

  try {
    const response = await leadStore.deleteLead(lead._id);
    toast.success(response?.message ?? "Lead deleted successfully");
    if (viewLead.value?._id === lead._id) {
      closeViewDialog();
    }
  } catch (error: any) {
    toast.error(error?.response?.data?.message ?? error?.message ?? "Failed to delete lead");
  }
};

watch(isViewDialogOpen, (open) => {
  if (!open) {
    viewLead.value = null;
    leadFollowUps.value = [];
    leadSiteVisits.value = [];
    loadingLeadFollowUps.value = false;
    loadingLeadSiteVisits.value = false;
    activeLeadProfileSection.value = "contact";
  }
});
</script>

<template>
  <div class="w-full space-y-6 p-6">
    <!-- SEARCH & FILTERS -->
    <div class="flex flex-col md:flex-row items-center justify-between gap-6">
      <InputGroup>
        <InputGroupInput placeholder="Search leads..." v-model="searchQuery" />
        <InputGroupAddon>
          <Search class="h-4 w-4" />
        </InputGroupAddon>
      </InputGroup>

      <ButtonGroup>
        <Button
          :variant="selectedStatus === '' ? 'default' : 'outline'"
          @click="
            selectedStatus = '';
            currentPage = 1;
          "
        >
          All
        </Button>

        <Button
          :variant="selectedStatus === 'Hot' ? 'default' : 'outline'"
          @click="
            selectedStatus = 'Hot';
            currentPage = 1;
          "
        >
          Hot
        </Button>

        <Button
          :variant="selectedStatus === 'Warm' ? 'default' : 'outline'"
          @click="
            selectedStatus = 'Warm';
            currentPage = 1;
          "
        >
          Warm
        </Button>

        <Button
          :variant="selectedStatus === 'Cold' ? 'default' : 'outline'"
          @click="
            selectedStatus = 'Cold';
            currentPage = 1;
          "
        >
          Cold
        </Button>
      </ButtonGroup>
    </div>

    <!-- ALPHABET FILTER -->
    <div class="flex flex-wrap items-center justify-center gap-1.5 py-2">
      <button
        @click="selectedLetter = ''"
        class="w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium transition-all"
        :class="selectedLetter === '' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'"
      >
        All
      </button>
      <button
        v-for="letter in alphabet"
        :key="letter"
        @click="selectedLetter = selectedLetter === letter ? '' : letter"
        class="w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium transition-all"
        :class="selectedLetter === letter ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'"
      >
        {{ letter }}
      </button>
    </div>

    <!-- DIRECTORY GRID -->
    <div v-if="!filteredLeads.length" class="rounded-2xl border border-dashed border-zinc-800 bg-[#111113] p-16 flex flex-col items-center justify-center">
      <User class="w-12 h-12 text-zinc-600 opacity-50 mb-4" />
      <p class="text-sm text-zinc-500">No leads found.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div 
        v-for="lead in filteredLeads" 
        :key="lead._id" 
        class="group relative rounded-2xl border border-white/5 bg-zinc-950/50 p-5 hover:bg-zinc-900/80 hover:border-white/10 transition-all duration-300 overflow-hidden flex flex-col"
      >
        <!-- Background subtle glow on hover -->
        <div class="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <div class="relative z-10 flex items-start justify-between mb-4">
          <div class="flex items-center gap-3 w-full">
            <div 
              class="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg bg-gradient-to-br shrink-0"
              :class="getAvatarGradient(lead?.name)"
            >
              {{ lead?.name ? lead.name.charAt(0).toUpperCase() : '?' }}
            </div>
            <div class="flex-1 min-w-0 pr-2">
              <h3 class="font-semibold text-white text-base truncate">{{ lead?.name || 'Unknown Lead' }}</h3>
              <div class="flex items-center gap-2 mt-1">
                <span 
                  class="text-xs px-2 py-0.5 rounded-full font-medium border"
                  :class="getStatusVariant(lead?.status)"
                >
                  {{ lead?.status || 'NEW' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="relative z-10 space-y-3 flex-1">
          <div class="flex items-center gap-3 text-sm text-zinc-400">
            <div class="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
              <Phone class="w-3.5 h-3.5 text-zinc-300" />
            </div>
            <span class="truncate">{{ lead?.phone || 'No phone provided' }}</span>
          </div>
          
          <div class="flex items-center gap-3 text-sm text-zinc-400">
            <div class="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
              <Mail class="w-3.5 h-3.5 text-zinc-300" />
            </div>
            <span class="truncate">{{ lead?.email || 'No email provided' }}</span>
          </div>

          <div class="flex items-center gap-3 text-sm text-zinc-400">
            <div class="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
              <IndianRupee class="w-3.5 h-3.5 text-zinc-300" />
            </div>
            <span class="truncate">{{ lead?.budget?.max ? `₹${lead.budget.max}` : 'Budget not specified' }}</span>
          </div>
        </div>

        <!-- Notes Footer -->
        <div class="relative z-10 mt-4 pt-4 border-t border-white/5">
          <div class="flex items-start gap-2 mb-4 h-8">
            <StickyNote class="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
            <p class="text-xs text-zinc-500 line-clamp-2 italic">
              {{ lead?.notes && lead.notes !== '-' ? lead.notes : 'No additional notes.' }}
            </p>
          </div>
          <div class="flex items-center gap-2 justify-end w-full">
            <Button size="sm" variant="secondary" class="flex-1 bg-zinc-800/50 hover:bg-zinc-800 text-xs" @click="openViewDialog(lead)">
              <Eye class="h-3.5 w-3.5 mr-1.5" /> View
            </Button>
            <Button size="sm" variant="secondary" class="flex-1 bg-zinc-800/50 hover:bg-zinc-800 text-xs" @click="openEditDialog(lead)">
              <Edit class="h-3.5 w-3.5 mr-1.5" /> Edit
            </Button>
            <Button size="sm" variant="ghost" class="px-2 hover:bg-red-500/10 hover:text-red-500" @click="removeLead(lead)">
              <Trash2 class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- PAGINATION -->
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

    <!-- EDIT LEAD DIALOG -->
    <Dialog v-model:open="isEditDialogOpen">
      <DialogContent class="sm:max-w-lg overflow-auto">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
        </DialogHeader>

        <div v-if="editLead" class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <Label>Name</Label>
            <Input class="mt-2" v-model="editLead.name" />
          </div>

          <div>
            <Label>Phone</Label>
            <Input class="mt-2" v-model="editLead.phone" />
          </div>

          <div>
            <Label>Email</Label>
            <Input class="mt-2" v-model="editLead.email" />
          </div>

          <div>
            <Label>Budget Min</Label>
            <Input type="number" class="mt-2" v-model="editLead.budget.min" />
          </div>

          <div>
            <Label>Budget Max</Label>
            <Input type="number" class="mt-2" v-model="editLead.budget.max" />
          </div>

          <div class="col-span-2">
            <Label>Preferred Location</Label>
            <Input class="mt-2" v-model="editLead.preferredLocation" />
          </div>

          <div class="col-span-2">
            <Label>Source</Label>
            <Select v-model="editLead.source">
              <SelectTrigger class="mt-2">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="broker_dashboard">Broker Dashboard</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="crm">CRM</SelectItem>
                <SelectItem value="meta">Meta</SelectItem>
                <SelectItem value="microsite">Microsite</SelectItem>
                <SelectItem value="realestate_website">Real Estate Website</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="col-span-2">
            <Label>Status</Label>
            <Select v-model="editLead.status">
              <SelectTrigger class="mt-2">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hot">Hot</SelectItem>
                <SelectItem value="Warm">Warm</SelectItem>
                <SelectItem value="Cold">Cold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="col-span-2">
            <Label>Notes</Label>
            <Textarea class="mt-2" v-model="editLead.notes" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="isEditDialogOpen = false">
            Cancel
          </Button>
          <Button @click="submitEditLead"> Save Changes </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- VIEW LEAD DIALOG -->
    <Dialog v-model:open="isViewDialogOpen">
      <DialogContent class="sm:max-w-6xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lead Profile</DialogTitle>
        </DialogHeader>

        <div
          v-if="viewLead"
          class="grid grid-cols-1 md:grid-cols-[220px,1fr] gap-4 min-h-[62vh]"
        >
          <aside class="rounded-lg border bg-card/40 p-2 overflow-y-auto">
            <button
              v-for="section in leadProfileSections"
              :key="section.key"
              type="button"
              class="w-full text-left px-3 py-2 rounded-md text-sm transition-colors"
              :class="
                activeLeadProfileSection === section.key
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'
              "
              @click="activeLeadProfileSection = section.key"
            >
              {{ section.label }}
            </button>
          </aside>

          <section class="rounded-lg border bg-card/70 p-4 overflow-y-auto min-h-[50vh]">
            <div
              v-if="activeLeadProfileSection === 'contact'"
              class="space-y-4"
            >
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div class="text-xl font-semibold">
                    {{ viewLead.name || "Unnamed Lead" }}
                  </div>
                  <div class="text-muted-foreground text-sm mt-1">
                    {{ viewLead.source || "-" }}
                  </div>
                </div>
                <Badge :variant="getStatusVariant(viewLead.status)">
                  {{ viewLead.status || "Warm" }}
                </Badge>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div class="rounded-md border bg-card/40 p-3">
                  <div class="text-xs text-muted-foreground">Phone</div>
                  <div class="font-medium mt-1">{{ viewLead.phone || "-" }}</div>
                </div>
                <div class="rounded-md border bg-card/40 p-3">
                  <div class="text-xs text-muted-foreground">Email</div>
                  <div class="font-medium mt-1">{{ viewLead.email || "-" }}</div>
                </div>
                <div class="rounded-md border bg-card/40 p-3">
                  <div class="text-xs text-muted-foreground">Source</div>
                  <div class="font-medium mt-1">{{ viewLead.source || "-" }}</div>
                </div>
                <div class="rounded-md border bg-card/40 p-3">
                  <div class="text-xs text-muted-foreground">Next Follow-Up</div>
                  <div class="font-medium mt-1">{{ formatDate(viewLead.nextFollowUpAt) }}</div>
                </div>
              </div>
            </div>

            <div
              v-else-if="activeLeadProfileSection === 'additional-info'"
              class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm"
            >
              <div class="rounded-md border bg-card/40 p-3">
                <div class="text-xs text-muted-foreground">Preferred Location</div>
                <div class="font-medium mt-1">{{ viewLead.preferredLocation || "-" }}</div>
              </div>
              <div class="rounded-md border bg-card/40 p-3">
                <div class="text-xs text-muted-foreground">Budget</div>
                <div class="font-medium mt-1">
                  {{ viewLead.budget?.min ?? 0 }} - {{ viewLead.budget?.max ?? 0 }}
                </div>
              </div>
              <div class="rounded-md border bg-card/40 p-3">
                <div class="text-xs text-muted-foreground">Created</div>
                <div class="font-medium mt-1">{{ formatDate(viewLead.createdAt) }}</div>
              </div>
              <div class="rounded-md border bg-card/40 p-3">
                <div class="text-xs text-muted-foreground">Updated</div>
                <div class="font-medium mt-1">{{ formatDate(viewLead.updatedAt) }}</div>
              </div>
              <div class="rounded-md border bg-card/40 p-3">
                <div class="text-xs text-muted-foreground">Converted</div>
                <div class="font-medium mt-1">
                  {{ viewLead.isConverted ? "Yes" : "No" }}
                </div>
              </div>
              <div class="rounded-md border bg-card/40 p-3">
                <div class="text-xs text-muted-foreground">Converted At</div>
                <div class="font-medium mt-1">{{ formatDate(viewLead.convertedAt) }}</div>
              </div>
            </div>

            <div
              v-else-if="activeLeadProfileSection === 'assigned'"
              class="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              <div class="rounded-lg border p-3 bg-card/40">
                <div class="flex items-center gap-2 font-medium mb-2">
                  <Building2 class="h-4 w-4" />
                  Builders
                  <Badge variant="outline">{{ viewLead.builders?.length || 0 }}</Badge>
                </div>
                <div v-if="viewLead.builders?.length" class="space-y-2">
                  <div
                    v-for="builder in viewLead.builders"
                    :key="builder._id"
                    class="rounded-md border px-2 py-1.5"
                  >
                    <div class="font-medium text-sm">{{ displayAssocName(builder) }}</div>
                    <div class="text-xs text-muted-foreground">{{ displayAssocSub(builder) }}</div>
                  </div>
                </div>
                <div v-else class="text-xs text-muted-foreground">No builders linked</div>
              </div>

              <div class="rounded-lg border p-3 bg-card/40">
                <div class="flex items-center gap-2 font-medium mb-2">
                  <FolderKanban class="h-4 w-4" />
                  Projects
                  <Badge variant="outline">{{ viewLead.projects?.length || 0 }}</Badge>
                </div>
                <div v-if="viewLead.projects?.length" class="space-y-2">
                  <div
                    v-for="project in viewLead.projects"
                    :key="project._id"
                    class="rounded-md border px-2 py-1.5"
                  >
                    <div class="font-medium text-sm">{{ displayAssocName(project) }}</div>
                    <div class="text-xs text-muted-foreground">{{ displayAssocSub(project) }}</div>
                  </div>
                </div>
                <div v-else class="text-xs text-muted-foreground">No projects linked</div>
              </div>

              <div class="rounded-lg border p-3 bg-card/40">
                <div class="flex items-center gap-2 font-medium mb-2">
                  <UserCircle2 class="h-4 w-4" />
                  Brokers
                  <Badge variant="outline">{{ viewLead.brokers?.length || 0 }}</Badge>
                </div>
                <div v-if="viewLead.brokers?.length" class="space-y-2">
                  <div
                    v-for="broker in viewLead.brokers"
                    :key="broker._id"
                    class="rounded-md border px-2 py-1.5"
                  >
                    <div class="font-medium text-sm">{{ displayAssocName(broker) }}</div>
                    <div class="text-xs text-muted-foreground">{{ displayAssocSub(broker) }}</div>
                  </div>
                </div>
                <div v-else class="text-xs text-muted-foreground">No brokers linked</div>
              </div>
            </div>

            <div
              v-else-if="activeLeadProfileSection === 'follow-up'"
              class="rounded-lg border p-3 bg-card/40"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="font-medium">Follow-Up History</div>
                <Badge variant="outline">{{ leadFollowUps.length }}</Badge>
              </div>

              <div v-if="loadingLeadFollowUps" class="text-sm text-muted-foreground">
                Loading follow-up history...
              </div>

              <div
                v-else-if="!leadFollowUps.length"
                class="text-sm text-muted-foreground"
              >
                No follow-ups linked with this lead.
              </div>

              <div v-else class="space-y-2 max-h-[52vh] overflow-y-auto pr-1">
                <div
                  v-for="followUp in leadFollowUps"
                  :key="followUp._id"
                  class="rounded-md border p-2.5"
                >
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="text-sm font-medium">
                      {{ formatDate(followUp.scheduledAt) }}
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <Badge variant="secondary">{{ followUp.actionType || "Follow-Up" }}</Badge>
                      <Badge :variant="getJourneyStatusVariant(followUp.leadStatus)">
                        {{ followUp.leadStatus || "Interested" }}
                      </Badge>
                      <Badge :variant="getFollowUpStatusVariant(followUp.status)">
                        {{ followUp.status || "Pending" }}
                      </Badge>
                    </div>
                  </div>
                  <p class="mt-2 text-sm text-muted-foreground">
                    {{ followUp.note || "No note added" }}
                  </p>
                </div>
              </div>
            </div>

            <div
              v-else-if="activeLeadProfileSection === 'notes'"
              class="rounded-lg border p-3 bg-card/40"
            >
              <div class="font-medium mb-2">Lead Notes</div>
              <p class="text-sm text-muted-foreground whitespace-pre-wrap">
                {{ viewLead.notes || "No notes added yet." }}
              </p>
            </div>

            <div
              v-else-if="activeLeadProfileSection === 'site-visit'"
              class="rounded-lg border p-3 bg-card/40"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="font-medium">Site Visit History</div>
                <Badge variant="outline">{{ sortedLeadSiteVisits.length }}</Badge>
              </div>

              <div v-if="loadingLeadSiteVisits" class="text-sm text-muted-foreground">
                Loading site visit history...
              </div>

              <div
                v-else-if="!sortedLeadSiteVisits.length"
                class="text-sm text-muted-foreground"
              >
                No site visits linked with this lead.
              </div>

              <div v-else class="space-y-2 max-h-[52vh] overflow-y-auto pr-1">
                <div
                  v-for="siteVisit in sortedLeadSiteVisits"
                  :key="siteVisit._id"
                  class="rounded-md border p-2.5"
                >
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div class="text-sm font-medium">
                        {{ siteVisit.clientName || "Unnamed Client" }}
                      </div>
                      <div class="text-xs text-muted-foreground mt-0.5">
                        {{ siteVisit.clientPhoneNumber || "Phone not available" }}
                      </div>
                    </div>

                    <div class="flex flex-wrap gap-2">
                      <Badge :variant="getSiteVisitStatusVariant(normalizeSiteVisitStatus(siteVisit.status))">
                        {{ normalizeSiteVisitStatus(siteVisit.status) }}
                      </Badge>
                      <Badge
                        :variant="getSiteVisitApprovalVariant(normalizeSiteVisitApproval(siteVisit.builderApprovalStatus))"
                      >
                        approval: {{ normalizeSiteVisitApproval(siteVisit.builderApprovalStatus) }}
                      </Badge>
                    </div>
                  </div>

                  <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <p>
                      <span class="font-medium text-foreground">Project:</span>
                      {{ getSiteVisitProjectName(siteVisit.projectId) }}
                    </p>
                    <p>
                      <span class="font-medium text-foreground">Visit Count:</span>
                      {{ siteVisit.visitCount || 1 }}
                    </p>
                    <p>
                      <span class="font-medium text-foreground">Visit Date:</span>
                      {{ formatSiteVisitDate(siteVisit.visitDate) }}
                    </p>
                    <p>
                      <span class="font-medium text-foreground">Visit Time:</span>
                      {{ formatSiteVisitTime(siteVisit.visitTime) }}
                    </p>
                    <p class="sm:col-span-2">
                      <span class="font-medium text-foreground">Purpose:</span>
                      {{ formatSiteVisitPurpose(siteVisit.purposeOfVisit) }}
                    </p>
                    <p v-if="siteVisit.remark" class="sm:col-span-2">
                      <span class="font-medium text-foreground">Remark:</span>
                      {{ siteVisit.remark }}
                    </p>
                    <p v-if="siteVisit.verificationToken" class="sm:col-span-2">
                      <span class="font-medium text-foreground">Verification Token:</span>
                      {{ siteVisit.verificationToken }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-else-if="activeLeadProfileSection === 'opportunity'"
              class="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <div class="rounded-md border bg-card/40 p-3">
                <div class="text-xs text-muted-foreground">Current Status</div>
                <div class="font-medium mt-1">{{ viewLead.status || "Warm" }}</div>
              </div>
              <div class="rounded-md border bg-card/40 p-3">
                <div class="text-xs text-muted-foreground">Lead Conversion</div>
                <div class="font-medium mt-1">{{ viewLead.isConverted ? "Converted" : "Open" }}</div>
              </div>
              <div class="rounded-md border bg-card/40 p-3 sm:col-span-2">
                <div class="text-xs text-muted-foreground">Opportunity Note</div>
                <p class="font-medium mt-1 text-sm">{{ viewLead.notes || "No opportunity context available." }}</p>
              </div>
            </div>

            <div v-else class="rounded-lg border p-4 bg-card/40 text-sm text-muted-foreground">
              {{
                      activeLeadProfileSection === "inbox"
                      ? "Lead inbox messages will appear here."
                      : activeLeadProfileSection === "docs"
                        ? "Lead documents will appear here."
                        : "Community session timeline will appear here."
              }}
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeViewDialog">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
