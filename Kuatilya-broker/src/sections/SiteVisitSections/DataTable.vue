<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useSiteVisitStore } from "@/store/SiteVisitStore";
import { useLeadStore } from "@/store/LeadStore";
import { useProjectStore } from "@/store/ProjectStore";
import type { Lead } from "@/types/leads";
import { Button } from "@/components/ui/button";
import { toast } from "vue-sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const siteVisitStore = useSiteVisitStore();
const leadStore = useLeadStore();
const projectStore = useProjectStore();

const { siteVisits, loading, creating, updating, error } = storeToRefs(siteVisitStore);
const { leadData } = storeToRefs(leadStore);
const { projectData } = storeToRefs(projectStore);

const isCreateDialogOpen = ref(false);
const searchQuery = ref("");
const statusFilter = ref<"all" | "pending" | "complete" | "incomplete">("all");
const pageSize = ref(10);
const currentPage = ref(1);

const statusDrafts = ref<Record<string, "pending" | "complete" | "incomplete">>({});
const updatingVisitId = ref<string | null>(null);

const normalizeStatus = (status: string) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "cancelled" || normalized === "incomplete") return "incomplete";
  if (normalized === "complete") return "complete";
  return "pending";
};

const getDraftStatus = (visit: any): "pending" | "complete" | "incomplete" => {
  return (
    statusDrafts.value[visit._id] ||
    (normalizeStatus(visit.status) as "pending" | "complete" | "incomplete")
  );
};

watch(
  () => siteVisits.value,
  (visits) => {
    const nextDrafts = { ...statusDrafts.value };
    for (const visit of visits) {
      if (!nextDrafts[visit._id]) {
        nextDrafts[visit._id] = normalizeStatus(String(visit.status || "")) as
          | "pending"
          | "complete"
          | "incomplete";
      }
    }
    statusDrafts.value = nextDrafts;
  },
  { immediate: true },
);

const updateVisitStatus = async (visit: any) => {
  const nextStatus = getDraftStatus(visit);
  const currentStatus = normalizeStatus(visit.status);

  if (nextStatus === currentStatus) {
    toast.info("Status is already up to date");
    return;
  }

  try {
    updatingVisitId.value = visit._id;
    await siteVisitStore.updateSiteVisitStatusForBroker(visit._id, nextStatus);
    toast.success("Site visit status updated successfully");
  } catch (err: any) {
    toast.error(err?.response?.data?.message || "Failed to update status");
  } finally {
    updatingVisitId.value = null;
  }
};

const projectOptions = computed(() => {
  return (projectData.value || [])
    .map((project: any) => ({
      id: project?._id || project?.id || "",
      label:
        project?.name ||
        project?.projectName ||
        project?.title ||
        "Unnamed Project",
    }))
    .filter((project) => Boolean(project.id));
});

  const NEW_LEAD_OPTION = "__new_lead__";

const normalizePhone = (value: unknown): string => {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  return digits;
};

const form = ref({
  leadId: "",
  manualLeadName: "",
  manualLeadPhone: "",
  projectId: "",
  visitDate: "",
  visitTime: "",
  purposeOfVisit: "",
  remark: "",
});

const isNewLeadSelected = computed(() => form.value.leadId === NEW_LEAD_OPTION);

const selectedLead = computed<Lead | null>(() => {
  if (!form.value.leadId || form.value.leadId === NEW_LEAD_OPTION) return null;
  return leadData.value.find((lead) => lead._id === form.value.leadId) ?? null;
});

const canSchedule = computed(() => {
  const lead = selectedLead.value;
  const hasExistingLead = Boolean(lead?._id);
  const manualName = String(form.value.manualLeadName || "").trim();
  const manualPhone = normalizePhone(form.value.manualLeadPhone);
  const hasManualLead =
    isNewLeadSelected.value && manualName.length >= 2 && manualPhone.length === 10;

  return Boolean(
    (hasExistingLead || hasManualLead) &&
      String(form.value.projectId || "").trim() &&
      String(form.value.visitDate || "").trim() &&
      String(form.value.visitTime || "").trim() &&
      form.value.purposeOfVisit.trim(),
  );
});

watch(
  () => form.value.leadId,
  (leadId) => {
    if (leadId !== NEW_LEAD_OPTION) {
      form.value.manualLeadName = "";
      form.value.manualLeadPhone = "";
    }
  },
);

onMounted(() => {
  siteVisitStore.getSiteVisitsByUserId();
  leadStore.getLeadData(200, 1);
  projectStore.getProjectData(200, 1);
});

const resetCreateForm = () => {
  form.value = {
    leadId: "",
    manualLeadName: "",
    manualLeadPhone: "",
    projectId: "",
    visitDate: "",
    visitTime: "",
    purposeOfVisit: "",
    remark: "",
  };
};

const scheduleSiteVisit = async () => {
  const lead = selectedLead.value;

  if (!form.value.leadId) {
    toast.error("Please select an existing lead or choose New Lead.");
    return;
  }

  if (!canSchedule.value) {
    toast.error("Select or enter lead details, project, date, time and purpose.");
    return;
  }

  let clientName = String(lead?.name || form.value.manualLeadName || "").trim();
  let normalizedPhone = normalizePhone(lead?.phone || form.value.manualLeadPhone);

  if (clientName.length < 2) {
    toast.error("Enter a valid lead/client name.");
    return;
  }

  if (normalizedPhone.length !== 10) {
    toast.error("Enter a valid 10-digit mobile number.");
    return;
  }

  let customerId = String(lead?._id || "").trim();

  if (isNewLeadSelected.value) {
    const existingLead = await leadStore.findLeadByPhone(normalizedPhone);
    if (existingLead?._id) {
      customerId = String(existingLead._id).trim();
      clientName = String(existingLead.name || clientName).trim();
      normalizedPhone = normalizePhone(existingLead.phone || normalizedPhone);
      toast.info("Lead already exists. Using existing lead for site visit.");
    }
  }

  if (isNewLeadSelected.value && !customerId) {
    try {
      const createdLead: any = await leadStore.createLead({
        name: clientName,
        phone: normalizedPhone,
        source: "broker_dashboard",
        sourceDetails: "Created while scheduling site visit",
        projectId: form.value.projectId,
        projectIds: [form.value.projectId],
      });

      customerId = String(
        createdLead?.data?._id ||
          createdLead?.data?.id ||
          createdLead?.data?.lead?._id ||
          "",
      ).trim();

      if (customerId) {
        toast.success("New lead created and selected for site visit.");
      } else {
        toast.info("Lead create response had no ID. Continuing with phone-based lead mapping.");
      }
    } catch {
      toast.info("Could not create lead directly. Trying existing lead mapping by phone.");
    }
  }

  try {
    const payload: any = {
      projectId: form.value.projectId,
      visitDate: form.value.visitDate,
      visitTime: form.value.visitTime,
      clientName,
      clientPhoneNumber: Number(normalizedPhone),
      purposeOfVisit: form.value.purposeOfVisit.trim(),
      status: "pending",
      remark: form.value.remark.trim() || undefined,
      tagged: false,
      isActive: true,
      validityDays: 45,
    };

    if (customerId) {
      payload.customerId = customerId;
    }

    const response: any = await siteVisitStore.createSiteVisitForBroker(payload);

    const createdVisits = Array.isArray(response?.data?.createdSiteVisits)
      ? response.data.createdSiteVisits
      : response?.data?._id
        ? [response.data]
        : [];

    const createdCount = createdVisits.length;
    const skippedProjects = Array.isArray(response?.data?.skippedProjects)
      ? response.data.skippedProjects
      : [];

    const verificationTokens = createdVisits
      .map((visit: any) => String(visit?.verificationToken || "").trim())
      .filter((token: string) => /^\d{6}$/.test(token));

    if (!createdCount && skippedProjects.length) {
      toast.error(skippedProjects[0]?.reason || "Site visit was not created");
      return;
    }

    if (createdCount && skippedProjects.length) {
      toast.success(
        verificationTokens.length
          ? `Site visit created. Verification code(s): ${verificationTokens.join(", ")} (some entries were skipped).`
          : "Site visit created, but some entries were skipped.",
      );
    } else {
      toast.success(
        verificationTokens.length
          ? `Site visit scheduled. Verification code(s): ${verificationTokens.join(", ")}`
          : "Site visit scheduled successfully",
      );
    }

    resetCreateForm();
    isCreateDialogOpen.value = false;
  } catch (err: any) {
    toast.error(err?.response?.data?.message || "Failed to schedule site visit");
  }
};

const formatDate = (value: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { dateStyle: "medium" });
};

const statusVariant = (status: string) => {
  const normalized = status?.toLowerCase();
  if (normalized === "complete") return "default";
  if (normalized === "pending") return "secondary";
  return "outline";
};

const projectName = (projectId: any) => {
  if (!projectId) return "-";
  if (typeof projectId === "string") return projectId;
  return projectId.name || projectId.projectName || projectId._id || "-";
};

const sortedSiteVisits = computed(() => {
  return [...siteVisits.value].sort((a, b) => {
    const createdA = new Date(String(a.createdAt || "")).getTime();
    const createdB = new Date(String(b.createdAt || "")).getTime();
    const hasCreatedA = Number.isFinite(createdA) && createdA > 0;
    const hasCreatedB = Number.isFinite(createdB) && createdB > 0;

    if (hasCreatedA || hasCreatedB) {
      return (hasCreatedB ? createdB : 0) - (hasCreatedA ? createdA : 0);
    }

    const left = new Date(`${a.visitDate}T${a.visitTime || "00:00"}`).getTime();
    const right = new Date(`${b.visitDate}T${b.visitTime || "00:00"}`).getTime();
    return right - left;
  });
});

const filteredSiteVisits = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  return sortedSiteVisits.value.filter((visit: any) => {
    const visitStatus = normalizeStatus(String(visit.status || ""));
    if (selectedStatus !== "all" && visitStatus !== selectedStatus) {
      return false;
    }

    if (!query) {
      return true;
    }

    const searchableFields = [
      String(visit.clientName || ""),
      String(visit.clientPhoneNumber || ""),
      String(projectName(visit.projectId) || ""),
      String(visit.purposeOfVisit || ""),
      String(visit.visitTime || ""),
      String(visit.status || ""),
      String(formatDate(visit.visitDate) || ""),
    ]
      .map((value) => value.toLowerCase())
      .filter(Boolean);

    return searchableFields.some((value) => value.includes(query));
  });
});

const totalFiltered = computed(() => filteredSiteVisits.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalFiltered.value / pageSize.value)));

const paginatedSiteVisits = computed(() => {
  const safePage = Math.min(currentPage.value, totalPages.value);
  const start = (safePage - 1) * pageSize.value;
  return filteredSiteVisits.value.slice(start, start + pageSize.value);
});

watch([searchQuery, statusFilter, pageSize], () => {
  currentPage.value = 1;
});

watch(totalPages, (nextTotalPages) => {
  if (currentPage.value > nextTotalPages) {
    currentPage.value = nextTotalPages;
  }
});
</script>

<template>
  <section class="space-y-4 px-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Site Visits</h1>
      <div class="flex items-center gap-2">
        <Button variant="outline" @click="siteVisitStore.getSiteVisitsByUserId()">Refresh</Button>
        <Button @click="isCreateDialogOpen = true">Schedule Site Visit</Button>
      </div>
    </div>

    <Dialog v-model:open="isCreateDialogOpen">
      <DialogContent class="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Schedule Site Visit</DialogTitle>
        </DialogHeader>

        <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div class="space-y-1">
            <label class="text-xs text-muted-foreground">Lead</label>
            <select
              v-model="form.leadId"
              class="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select lead</option>
              <option :value="NEW_LEAD_OPTION">+ New Lead</option>
              <option v-for="lead in leadData" :key="lead._id" :value="lead._id">
                {{ lead.name || "Unnamed" }} - {{ lead.phone || "No phone" }}
              </option>
            </select>
          </div>

          <div v-if="isNewLeadSelected" class="space-y-1">
            <label class="text-xs text-muted-foreground">Lead Name</label>
            <input
              v-model="form.manualLeadName"
              type="text"
              placeholder="Enter lead name"
              class="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div v-if="isNewLeadSelected" class="space-y-1">
            <label class="text-xs text-muted-foreground">Lead Phone</label>
            <input
              v-model="form.manualLeadPhone"
              type="tel"
              placeholder="10-digit mobile number"
              class="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs text-muted-foreground">Project Site</label>
            <select
              v-model="form.projectId"
              class="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select project</option>
              <option v-for="project in projectOptions" :key="project.id" :value="project.id">
                {{ project.label }}
              </option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="text-xs text-muted-foreground">Visit Date</label>
            <input
              v-model="form.visitDate"
              type="date"
              class="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs text-muted-foreground">Visit Time</label>
            <input
              v-model="form.visitTime"
              type="time"
              class="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div class="space-y-1 md:col-span-2">
            <label class="text-xs text-muted-foreground">Purpose</label>
            <input
              v-model="form.purposeOfVisit"
              type="text"
              placeholder="Site inspection, inventory walkthrough, etc."
              class="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div class="space-y-1 md:col-span-2 lg:col-span-3">
            <label class="text-xs text-muted-foreground">Remark (optional)</label>
            <input
              v-model="form.remark"
              type="text"
              placeholder="Any additional instructions"
              class="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div class="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            @click="
              resetCreateForm();
              isCreateDialogOpen = false;
            "
          >
            Cancel
          </Button>
          <Button :disabled="!canSchedule || creating" @click="scheduleSiteVisit">
            {{ creating ? "Scheduling..." : "Schedule Site Visit" }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <div
      v-if="error"
      class="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
    >
      {{ error }}
    </div>

    <div class="rounded-md border bg-card p-4">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div class="space-y-1 md:col-span-2">
          <label class="text-xs text-muted-foreground">Search</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search lead, phone, project, purpose..."
            class="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs text-muted-foreground">Status Filter</label>
          <select
            v-model="statusFilter"
            class="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="complete">Complete</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </div>

        <div class="space-y-1">
          <label class="text-xs text-muted-foreground">Rows per page</label>
          <select
            v-model.number="pageSize"
            class="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
        </div>
      </div>

      <p class="mt-3 text-xs text-muted-foreground">
        Showing {{ paginatedSiteVisits.length }} of {{ totalFiltered }} site visits
      </p>
    </div>

    <div class="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lead</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Visit Date</TableHead>
            <TableHead>Visit Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Update Status</TableHead>
            <TableHead>Purpose</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="8" class="h-20 text-center">
              Loading site visits...
            </TableCell>
          </TableRow>

          <TableRow v-for="visit in paginatedSiteVisits" :key="visit._id">
            <TableCell>{{ visit.clientName || "-" }}</TableCell>
            <TableCell>{{ visit.clientPhoneNumber || "-" }}</TableCell>
            <TableCell>{{ projectName(visit.projectId) }}</TableCell>
            <TableCell>{{ formatDate(visit.visitDate) }}</TableCell>
            <TableCell>{{ visit.visitTime || "-" }}</TableCell>
            <TableCell>
              <Badge :variant="statusVariant(visit.status)">
                {{ visit.status || "-" }}
              </Badge>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <select
                  v-model="statusDrafts[visit._id]"
                  class="rounded-md border bg-background px-2 py-1 text-xs"
                >
                  <option value="pending">Pending</option>
                  <option value="complete">Complete</option>
                  <option value="incomplete">Incomplete</option>
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  :disabled="creating || updating || updatingVisitId === visit._id"
                  @click="updateVisitStatus(visit)"
                >
                  {{ updatingVisitId === visit._id ? "Updating..." : "Update" }}
                </Button>
              </div>
            </TableCell>
            <TableCell class="max-w-55 truncate">{{ visit.purposeOfVisit || "-" }}</TableCell>
          </TableRow>

          <TableRow v-if="!loading && !paginatedSiteVisits.length">
            <TableCell colspan="8" class="h-20 text-center text-muted-foreground">
              No site visits found.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="flex items-center justify-between">
      <p class="text-sm text-muted-foreground">
        Page {{ currentPage }} of {{ totalPages }}
      </p>
      <div class="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          :disabled="currentPage === 1"
          @click="currentPage -= 1"
        >
          Previous
        </Button>
        <Button
          size="sm"
          variant="outline"
          :disabled="currentPage === totalPages"
          @click="currentPage += 1"
        >
          Next
        </Button>
      </div>
    </div>
  </section>
</template>
