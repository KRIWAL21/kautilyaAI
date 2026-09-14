<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue";
import { useLeadStore } from "@/store/LeadStore";
import { useProjectStore } from "@/store/ProjectStore";
import { storeToRefs } from "pinia";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-vue";
import { VueTelInput } from "vue-tel-input";
import "vue-tel-input/vue-tel-input.css";
import type {
  CreateLeadPayload,
  LeadLookingTo,
  LeadProjectStatusPreference,
  LeadProjectTypePreference,
  LeadPropertyType,
  LeadStage,
  LeadStatus,
} from "@/types/leads";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Button from "@/components/ui/button/Button.vue";
import { Download, FileUp, UserPlus } from "lucide-vue-next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "vue-sonner";

const leadStore = useLeadStore();
const projectStore = useProjectStore();
const { leadStatsData } = storeToRefs(leadStore);
const { projectData } = storeToRefs(projectStore);

onMounted(async () => {
  await Promise.all([
    leadStore.getLeadStats(),
    projectStore.getProjectData(200, 1).catch(() => undefined),
  ]);
});

const buildDefaultLeadPayload = (): CreateLeadPayload & { projectId?: string } => ({
  name: "",
  phone: "",
  email: "",
  source: "broker_dashboard",
  sourceDetails: "",
  preferredLocation: "",
  city: "",
  region: "",
  subRegion: "",
  locality: "",
  budget: {
    min: 0,
    max: 0,
  },
  status: "Warm",
  propertyType: undefined,
  lookingTo: undefined,
  stage: "new_lead",
  notes: "",
  internalNote: "",
  projectId: "",
  projectIds: [],
  projectStatusPreferences: [],
  projectTypePreferences: [],
  brokerIds: [],
  builderIds: [],
});

const isCreateDialogOpen = ref(false);
const isCreateSubmitting = ref(false);
const currentCreateStep = ref(0);

const createLeadSteps = [
  {
    id: "contact",
    title: "Contact",
    subtitle: "Who is the lead and where did they come from?",
  },
  {
    id: "preferences",
    title: "Preferences",
    subtitle: "Capture property intent, stage, and location choices.",
  },
  {
    id: "assignment",
    title: "Assignment",
    subtitle: "Assign projects, then add notes.",
  },
] as const;

const leadSourceOptions: Array<{ value: string; label: string }> = [
  { value: "microsite", label: "Microsite" },
  { value: "meta", label: "Meta" },
  { value: "crm", label: "CRM" },
  { value: "realestate_website", label: "Real Estate Website" },
  { value: "broker_dashboard", label: "Broker Dashboard" },
  { value: "99_acres", label: "99acres" },
  { value: "magic_bricks", label: "MagicBricks" },
  { value: "housing", label: "Housing" },
  { value: "squareyards", label: "Squareyards" },
  { value: "my_website", label: "My Website" },
  { value: "rezide", label: "Rezide" },
  { value: "walk_in", label: "Walk-In" },
  { value: "broker_reference", label: "Broker Reference" },
  { value: "personal_reference", label: "Personal Reference" },
  { value: "client_reference", label: "Client Reference" },
  { value: "existing_customer", label: "Existing Customer" },
  { value: "whatsapp_broadcast", label: "WhatsApp Broadcast" },
  { value: "sms_marketing", label: "SMS Marketing" },
  { value: "email_marketing", label: "Email Marketing" },
  { value: "rcs_broadcast", label: "RCS Broadcast" },
  { value: "portals_others", label: "Portals Others" },
  { value: "other", label: "Other" },
];

const leadStatusOptions: Array<{ value: LeadStatus; label: string }> = [
  { value: "Hot", label: "Hot" },
  { value: "Warm", label: "Warm" },
  { value: "Cold", label: "Cold" },
];

const leadPropertyTypeOptions: Array<{ value: LeadPropertyType; label: string }> = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
];

const leadLookingToOptions: Array<{ value: LeadLookingTo; label: string }> = [
  { value: "buy", label: "Buy" },
  { value: "rent", label: "Rent" },
  { value: "sell", label: "Sell" },
  { value: "lease_out", label: "Lease Out" },
];

const leadStageOptions: Array<{ value: LeadStage; label: string }> = [
  { value: "new_lead", label: "New Lead" },
  { value: "prospecting", label: "Prospecting" },
  { value: "visits", label: "Visits" },
  { value: "negotiations", label: "Negotiations" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "junk", label: "Junk" },
  { value: "closed", label: "Closed" },
];

const leadProjectStatusPreferenceOptions: Array<{
  value: LeadProjectStatusPreference;
  label: string;
}> = [
  { value: "under_construction", label: "Under Construction" },
  { value: "ready_to_move", label: "Ready to Move" },
  { value: "newly_launched", label: "Newly Launched" },
];

const leadProjectTypePreferenceOptions: Array<{
  value: LeadProjectTypePreference;
  label: string;
}> = [
  { value: "gated_amenities", label: "Gated - Amenities" },
  { value: "standalone", label: "Standalone" },
  { value: "gated_no_amenities", label: "Gated - No Amenities" },
  { value: "standalone_amenities", label: "Standalone - Amenities" },
];

const newLead = ref<CreateLeadPayload & { projectId?: string }>(
  buildDefaultLeadPayload(),
);

const projectOptions = computed(() =>
  projectData.value
    .map((project) => {
      const id = String(project?._id ?? "").trim();
      if (!id) return null;

      const label =
        String(project?.projectName ?? "").trim() ||
        String(project?.builderName ?? "").trim() ||
        `Project ${id.slice(-6)}`;

      return { value: id, label };
    })
    .filter((project): project is { value: string; label: string } => Boolean(project)),
);

const selectedProjectOptions = computed(() => {
  const selectedIds = new Set(newLead.value.projectIds ?? []);
  return projectOptions.value.filter((option) => selectedIds.has(option.value));
});

const primaryProjectOptions = computed(() => {
  const selectedIds = new Set(newLead.value.projectIds ?? []);

  if (!selectedIds.size) {
    return projectOptions.value;
  }

  return projectOptions.value.filter((option) => selectedIds.has(option.value));
});

const isBulkDialogOpen = ref(false);
const selectedBulkFile = ref<File | null>(null);
const isBulkUploading = ref(false);
const bulkUploadSummary = ref<{
  totalRows: number;
  successful: number;
  failed: number;
  errors: string[];
} | null>(null);

const BULK_TEMPLATE_HEADERS = [
  "name",
  "phone",
  "email",
  "source",
  "preferredLocation",
  "budgetMin",
  "budgetMax",
  "status",
  "notes",
];

const BULK_TEMPLATE_SAMPLE = [
  "Aarav Sharma",
  "+919876543210",
  "aarav@example.com",
  "broker_dashboard",
  "Noida Extension",
  "3500000",
  "6500000",
  "Warm",
  "Interested in 3BHK near metro",
];

const bulkTemplatePreview = computed(
  () => `${BULK_TEMPLATE_HEADERS.join(",")}\n${BULK_TEMPLATE_SAMPLE.join(",")}`,
);

const resetCreateLeadForm = () => {
  newLead.value = buildDefaultLeadPayload();
  currentCreateStep.value = 0;
};

watch(isCreateDialogOpen, (isOpen) => {
  if (!isOpen) {
    resetCreateLeadForm();
  }
});

const resetBulkUploadState = () => {
  selectedBulkFile.value = null;
  bulkUploadSummary.value = null;
};

const closeCreateLeadDialog = () => {
  isCreateDialogOpen.value = false;
  resetCreateLeadForm();
};

const goToCreateStep = (stepIndex: number) => {
  if (stepIndex < 0 || stepIndex > createLeadSteps.length - 1) {
    return;
  }

  if (stepIndex > 0 && !newLead.value.name?.trim()) {
    toast.error("Lead name is required before moving to the next step.");
    return;
  }

  currentCreateStep.value = stepIndex;
};

const goToPreviousCreateStep = () => {
  goToCreateStep(currentCreateStep.value - 1);
};

const goToNextCreateStep = () => {
  goToCreateStep(currentCreateStep.value + 1);
};

const toggleArrayValue = <T extends string>(
  values: T[] | undefined,
  selectedValue: T,
): T[] => {
  const currentValues = Array.isArray(values) ? values : [];

  if (currentValues.includes(selectedValue)) {
    return currentValues.filter((value) => value !== selectedValue);
  }

  return [...currentValues, selectedValue];
};

const toggleProjectSelection = (projectId: string) => {
  const normalizedProjectId = String(projectId).trim();
  if (!normalizedProjectId) return;

  const nextProjectIds = toggleArrayValue(newLead.value.projectIds, normalizedProjectId);
  newLead.value.projectIds = nextProjectIds;

  if (
    newLead.value.projectId &&
    !nextProjectIds.includes(String(newLead.value.projectId))
  ) {
    newLead.value.projectId = nextProjectIds[0] ?? "";
  }
};

const setPrimaryProject = (projectId: string) => {
  const normalizedProjectId = String(projectId ?? "").trim();

  if (!normalizedProjectId) {
    newLead.value.projectId = "";
    return;
  }

  newLead.value.projectId = normalizedProjectId;
  if (!newLead.value.projectIds?.includes(normalizedProjectId)) {
    newLead.value.projectIds = [...(newLead.value.projectIds ?? []), normalizedProjectId];
  }
};

const toggleProjectStatusPreference = (value: LeadProjectStatusPreference) => {
  newLead.value.projectStatusPreferences = toggleArrayValue(
    newLead.value.projectStatusPreferences,
    value,
  );
};

const toggleProjectTypePreference = (value: LeadProjectTypePreference) => {
  newLead.value.projectTypePreferences = toggleArrayValue(
    newLead.value.projectTypePreferences,
    value,
  );
};

const submitCreateLead = async () => {
  const hasName = Boolean(newLead.value.name?.trim());

  if (!hasName) {
    toast.error("Name is required");
    return;
  }

  const normalizedProjectIds = Array.from(
    new Set(
      [...(newLead.value.projectIds ?? []), String(newLead.value.projectId ?? "")]
        .map((value) => String(value).trim())
        .filter(Boolean),
    ),
  );

  const payload: CreateLeadPayload & { projectId?: string } = {
    ...newLead.value,
    name: newLead.value.name.trim(),
    projectIds: normalizedProjectIds,
    projectId:
      String(newLead.value.projectId ?? "").trim() || normalizedProjectIds[0] || undefined,
  };

  try {
    isCreateSubmitting.value = true;
    const response = await leadStore.createLead(payload);

    closeCreateLeadDialog();
    toast.success((response as any)?.message ?? "Lead created");
  } catch (error: any) {
      const data = error?.response?.data;
      let message = "Failed to create lead";

      if (Array.isArray(data?.message)) {
        message = data.message.join(", "); // ✅ convert array → string
      } else if (typeof data?.message === "string") {
        message = data.message;
      } else if (data?.error) {
        message = data.error;
      } else if (error?.message) {
        message = error.message;
      }

      toast.error(message);
    // toast.error(
    //   error?.response?.data?.message ?? error?.message ?? "Failed to create lead",
    // );
  } finally {
    isCreateSubmitting.value = false;
  }
};

const parseCsvLine = (line: string): string[] => {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  cells.push(current.trim());
  return cells;
};

const normalizeHeader = (header: string) =>
  header.toLowerCase().replace(/\s+/g, "").replace(/_/g, "");

const normalizeLeadStatus = (statusValue?: string): LeadStatus => {
  const normalized = String(statusValue ?? "Warm").trim().toLowerCase();
  if (normalized === "hot") return "Hot";
  if (normalized === "cold") return "Cold";
  return "Warm";
};

const parseBulkLeadCsv = (content: string) => {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (!lines.length) {
    throw new Error("CSV file is empty.");
  }

  const rawHeaders = parseCsvLine(lines[0]).map((header) =>
    header.replace(/^\uFEFF/, "").trim(),
  );
  const headers = rawHeaders.map(normalizeHeader);

  if (!headers.includes("name")) {
    throw new Error('CSV must include a "name" column.');
  }

  const rows: Array<{
    rowNumber: number;
    payload: CreateLeadPayload & { projectId?: string };
  }> = [];
  const errors: string[] = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const rowNumber = lineIndex + 1;
    const values = parseCsvLine(lines[lineIndex]);
    const row: Record<string, string> = {};

    headers.forEach((header, headerIndex) => {
      row[header] = (values[headerIndex] ?? "").trim();
    });

    const name = row.name?.trim();
    if (!name) {
      errors.push(`Row ${rowNumber}: name is required.`);
      continue;
    }

    const minBudget = Number.parseFloat(row.budgetmin || "0");
    const maxBudget = Number.parseFloat(row.budgetmax || "0");

    rows.push({
      rowNumber,
      payload: {
        name,
        phone: row.phone || "",
        email: row.email || "",
        source: row.source || undefined,
        preferredLocation: row.preferredlocation || "",
        budget: {
          min: Number.isFinite(minBudget) ? minBudget : 0,
          max: Number.isFinite(maxBudget) ? maxBudget : 0,
        },
        status: row.status ? normalizeLeadStatus(row.status) : undefined,
        notes: row.notes || "",
        projectIds: [],
        brokerIds: [],
        builderIds: [],
      },
    });
  }

  return { rows, errors };
};

const handleBulkFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  selectedBulkFile.value = target.files?.[0] ?? null;
  bulkUploadSummary.value = null;
};

const downloadBulkTemplate = () => {
  const blob = new Blob([`${bulkTemplatePreview.value}\n`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "lead_bulk_upload_template.csv";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const submitBulkUpload = async () => {
  if (!selectedBulkFile.value) {
    toast.error("Please choose a CSV file first.");
    return;
  }

  isBulkUploading.value = true;
  bulkUploadSummary.value = null;

  try {
    const csvContent = await selectedBulkFile.value.text();
    const parsed = parseBulkLeadCsv(csvContent);

    if (!parsed.rows.length) {
      bulkUploadSummary.value = {
        totalRows: parsed.errors.length,
        successful: 0,
        failed: parsed.errors.length,
        errors: parsed.errors,
      };
      toast.error("No valid rows found. Please use the standard template.");
      return;
    }

    const result = await leadStore.createLeadBulk(
      parsed.rows.map((row) => row.payload),
    );

    const apiErrors = result.errors.map((error) => {
      const originalRow = parsed.rows[error.row]?.rowNumber;
      return `Row ${originalRow ?? error.row + 2}: ${error.message}`;
    });

    const allErrors = [...parsed.errors, ...apiErrors];

    bulkUploadSummary.value = {
      totalRows: parsed.rows.length + parsed.errors.length,
      successful: result.successfulRecords,
      failed: allErrors.length,
      errors: allErrors,
    };

    if (result.successfulRecords > 0) {
      toast.success(`${result.successfulRecords} lead(s) uploaded successfully.`);
    }

    if (allErrors.length > 0) {
      toast.error(`${allErrors.length} row(s) failed during upload.`);
    }

    if (allErrors.length === 0) {
      isBulkDialogOpen.value = false;
      resetBulkUploadState();
    }
  } catch (error: any) {
    toast.error(error?.message ?? "Failed to process bulk upload.");
  } finally {
    isBulkUploading.value = false;
  }
};
</script>

<template>
  <div class="px-6 flex flex-col md:flex-row items-start md:items-center justify-between space-y-4">
    <h1 class="font-bold text-[24px] md:text-[30px]">Lead Management Directory</h1>
    <div class="flex items-center gap-2">
      <Dialog v-model:open="isBulkDialogOpen">
        <DialogTrigger as-child>
          <Button variant="outline">
            <FileUp class="h-4 w-4" />
            Bulk Upload Leads
          </Button>
        </DialogTrigger>

        <DialogContent class="sm:max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Bulk Upload Leads</DialogTitle>
          </DialogHeader>

          <div class="space-y-4">
            <div class="rounded-md border bg-card/40 p-3">
              <p class="text-sm font-medium">Standard CSV Format</p>
              <p class="text-xs text-muted-foreground mt-1">
                Required column: <span class="font-medium">name</span>. All other columns are optional.
              </p>
              <pre class="mt-3 rounded-md border bg-background p-3 text-xs overflow-x-auto">{{ bulkTemplatePreview }}</pre>

              <Button variant="outline" class="mt-3" @click="downloadBulkTemplate">
                <Download class="h-4 w-4" />
                Download Template
              </Button>
            </div>

            <div>
              <Label>Upload CSV File</Label>
              <input
                type="file"
                accept=".csv,text/csv"
                class="mt-2 file:text-foreground placeholder:text-muted-foreground border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs"
                @change="handleBulkFileChange"
              />
              <p class="text-xs text-muted-foreground mt-1">
                Accepted format: <span class="font-medium">.csv</span>
              </p>
              <p v-if="selectedBulkFile" class="text-xs mt-1">
                Selected: {{ selectedBulkFile.name }}
              </p>
            </div>

            <div v-if="bulkUploadSummary" class="rounded-md border bg-card/40 p-3 text-sm">
              <div class="font-medium">Upload Summary</div>
              <div class="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>Total Rows: {{ bulkUploadSummary.totalRows }}</div>
                <div>Successful: {{ bulkUploadSummary.successful }}</div>
                <div>Failed: {{ bulkUploadSummary.failed }}</div>
              </div>

              <div
                v-if="bulkUploadSummary.errors.length"
                class="mt-3 max-h-32 overflow-y-auto rounded-md border p-2 text-xs text-destructive"
              >
                <p
                  v-for="(error, index) in bulkUploadSummary.errors"
                  :key="`${error}-${index}`"
                  class="mb-1 last:mb-0"
                >
                  {{ error }}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              @click="
                isBulkDialogOpen = false;
                resetBulkUploadState();
              "
            >
              Cancel
            </Button>
            <Button :disabled="isBulkUploading || !selectedBulkFile" @click="submitBulkUpload">
              {{ isBulkUploading ? "Uploading..." : "Upload Leads" }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog v-model:open="isCreateDialogOpen">
        <DialogTrigger as-child>
          <Button>
            <UserPlus />
            Create Lead
          </Button>
        </DialogTrigger>

        <DialogContent class="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Lead</DialogTitle>
            <p class="text-sm text-muted-foreground">
              {{ createLeadSteps[currentCreateStep].subtitle }}
            </p>
          </DialogHeader>

          <div class="space-y-5">
            <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                v-for="(step, index) in createLeadSteps"
                :key="step.id"
                type="button"
                class="flex items-center gap-3 rounded-md border px-3 py-2 text-left transition"
                :class="
                  index === currentCreateStep
                    ? 'border-primary bg-primary/10 text-primary'
                    : index < currentCreateStep
                      ? 'border-primary/50 bg-primary/5 text-foreground'
                      : 'border-border bg-background text-muted-foreground'
                "
                @click="goToCreateStep(index)"
              >
                <span
                  class="inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold"
                  :class="
                    index <= currentCreateStep
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border'
                  "
                >
                  {{ index + 1 }}
                </span>
                <span class="text-xs font-semibold uppercase tracking-wide">
                  {{ step.title }}
                </span>
              </button>
            </div>

            <div v-if="currentCreateStep === 0" class="space-y-5">
              <div class="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Lead Source</Label>
                  <Select
                    :model-value="newLead.source ?? 'broker_dashboard'"
                    @update:model-value="(value) => (newLead.source = String(value))"
                  >
                    <SelectTrigger class="mt-2">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="option in leadSourceOptions"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Source Details</Label>
                  <Input
                    v-model="newLead.sourceDetails"
                    class="mt-2"
                    placeholder="Campaign or referral details"
                  />
                </div>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Lead Name *</Label>
                  <Input
                    v-model="newLead.name"
                    class="mt-2"
                    placeholder="Enter lead name"
                  />
                </div>

                <div>
                  <Label>Working Status</Label>
                  <Select
                    :model-value="newLead.status ?? 'Warm'"
                    @update:model-value="(value) => (newLead.status = value as LeadStatus)"
                  >
                    <SelectTrigger class="mt-2">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="option in leadStatusOptions"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Phone Number</Label>
                  <!-- <Input
                    v-model="newLead.phone"
                    class="mt-2"
                    placeholder="+91..."
                  /> -->
                  <VueTelInput
                    v-model="newLead.phone"
                    mode="international"
                    class="mt-2"
                    :default-country="'IN'"
                    :enabled-country-code="true"
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    v-model="newLead.email"
                    class="mt-2"
                    placeholder="lead@example.com"
                  />
                </div>
              </div>
            </div>

            <div v-else-if="currentCreateStep === 1" class="space-y-5">
              <div class="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Property Type</Label>
                  <Select
                    :model-value="newLead.propertyType ?? 'none'"
                    @update:model-value="
                      (value) =>
                        (newLead.propertyType =
                          value === 'none' ? undefined : (value as LeadPropertyType))
                    "
                  >
                    <SelectTrigger class="mt-2">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not selected</SelectItem>
                      <SelectItem
                        v-for="option in leadPropertyTypeOptions"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Looking To</Label>
                  <Select
                    :model-value="newLead.lookingTo ?? 'none'"
                    @update:model-value="
                      (value) =>
                        (newLead.lookingTo =
                          value === 'none' ? undefined : (value as LeadLookingTo))
                    "
                  >
                    <SelectTrigger class="mt-2">
                      <SelectValue placeholder="Select intent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not selected</SelectItem>
                      <SelectItem
                        v-for="option in leadLookingToOptions"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Lead Stage</Label>
                  <Select
                    :model-value="newLead.stage ?? 'new_lead'"
                    @update:model-value="(value) => (newLead.stage = value as LeadStage)"
                  >
                    <SelectTrigger class="mt-2">
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="option in leadStageOptions"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>City</Label>
                  <Input v-model="newLead.city" class="mt-2" placeholder="City" />
                </div>

                <div>
                  <Label>Region</Label>
                  <Input v-model="newLead.region" class="mt-2" placeholder="Region" />
                </div>
              </div>

              <div class="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Sub Region</Label>
                  <Input v-model="newLead.subRegion" class="mt-2" placeholder="Sub region" />
                </div>

                <div>
                  <Label>Locality</Label>
                  <Input v-model="newLead.locality" class="mt-2" placeholder="Locality" />
                </div>

                <div>
                  <Label>Preferred Location</Label>
                  <Input
                    v-model="newLead.preferredLocation"
                    class="mt-2"
                    placeholder="Preferred area"
                  />
                </div>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Project Status Preferences</Label>
                  <div class="mt-2 space-y-2 rounded-md border p-3">
                    <label
                      v-for="option in leadProjectStatusPreferenceOptions"
                      :key="option.value"
                      class="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        class="h-4 w-4"
                        :checked="(newLead.projectStatusPreferences ?? []).includes(option.value)"
                        @change="toggleProjectStatusPreference(option.value)"
                      />
                      <span>{{ option.label }}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Project Type Preferences</Label>
                  <div class="mt-2 space-y-2 rounded-md border p-3">
                    <label
                      v-for="option in leadProjectTypePreferenceOptions"
                      :key="option.value"
                      class="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        class="h-4 w-4"
                        :checked="(newLead.projectTypePreferences ?? []).includes(option.value)"
                        @change="toggleProjectTypePreference(option.value)"
                      />
                      <span>{{ option.label }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="space-y-5">
              <div class="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Projects</Label>
                  <div class="mt-2 max-h-44 space-y-2 overflow-y-auto rounded-md border p-3">
                    <label
                      v-for="project in projectOptions"
                      :key="project.value"
                      class="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        class="h-4 w-4"
                        :checked="(newLead.projectIds ?? []).includes(project.value)"
                        @change="toggleProjectSelection(project.value)"
                      />
                      <span>{{ project.label }}</span>
                    </label>

                    <p v-if="projectOptions.length === 0" class="text-xs text-muted-foreground">
                      No projects available for assignment.
                    </p>
                  </div>

                  <div v-if="selectedProjectOptions.length" class="mt-2 flex flex-wrap gap-2">
                    <Badge
                      v-for="project in selectedProjectOptions"
                      :key="project.value"
                      variant="outline"
                    >
                      {{ project.label }}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>Primary Project</Label>
                  <Select
                    :model-value="String(newLead.projectId ?? '').trim() || 'none'"
                    @update:model-value="
                      (value) => setPrimaryProject(value === 'none' ? '' : String(value))
                    "
                  >
                    <SelectTrigger class="mt-2">
                      <SelectValue placeholder="Select primary project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No primary project</SelectItem>
                      <SelectItem
                        v-for="project in primaryProjectOptions"
                        :key="project.value"
                        :value="project.value"
                      >
                        {{ project.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    v-model="newLead.notes"
                    class="mt-2"
                    placeholder="Public notes for this lead"
                    rows="4"
                  />
                </div>

                <div>
                  <Label>Internal Note</Label>
                  <Textarea
                    v-model="newLead.internalNote"
                    class="mt-2"
                    placeholder="Private team notes"
                    rows="4"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter class="gap-2">
            <Button
              variant="outline"
              :disabled="isCreateSubmitting"
              @click="closeCreateLeadDialog"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              :disabled="isCreateSubmitting || currentCreateStep === 0"
              @click="goToPreviousCreateStep"
            >
              Previous
            </Button>
            <Button
              v-if="currentCreateStep < createLeadSteps.length - 1"
              :disabled="isCreateSubmitting"
              @click="goToNextCreateStep"
            >
              Next
            </Button>
            <Button
              v-else
              :disabled="isCreateSubmitting"
              @click="submitCreateLead"
            >
              {{ isCreateSubmitting ? "Creating..." : "Create Lead" }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>

  <div
    class="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 mt-4"
  >
    <Card class="@container/card">
      <CardHeader>
        <CardDescription class="font-semibold text-[20px]"
          >Total Leads</CardDescription
        >
        <CardTitle
          class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
        >
          {{ leadStatsData.totalLeads }}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <IconTrendingUp />
            +12.5%
          </Badge>
        </CardAction>
      </CardHeader>
    </Card>
    <Card class="@container/card">
      <CardHeader>
        <CardDescription class="font-semibold text-[20px]"
          >Hot Lead</CardDescription
        >
        <CardTitle
          class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
        >
          {{ leadStatsData.hot }}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <IconTrendingDown />
            -20%
          </Badge>
        </CardAction>
      </CardHeader>
    </Card>
    <Card class="@container/card">
      <CardHeader>
        <CardDescription class="font-semibold text-[20px]"
          >Warm Lead</CardDescription
        >
        <CardTitle
          class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
        >
          {{ leadStatsData.warm }}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <IconTrendingUp />
            +12.5%
          </Badge>
        </CardAction>
      </CardHeader>
    </Card>
    <Card class="@container/card">
      <CardHeader>
        <CardDescription class="font-semibold text-[20px]"
          >Cold Lead</CardDescription
        >
        <CardTitle
          class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
        >
          {{ leadStatsData.cold }}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <IconTrendingUp />
            +4.5%
          </Badge>
        </CardAction>
      </CardHeader>
    </Card>
  </div>
</template>