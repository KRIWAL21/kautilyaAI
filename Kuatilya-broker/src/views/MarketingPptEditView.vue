<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { tokenStorage } from "@/request/request";
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Presentation,
  Sparkles,
  Download,
  Eye,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAiContentCreatorStore, type GammaGeneration } from "@/store/AiContentCreatorStore";

const route = useRoute();
const router = useRouter();
const store = useAiContentCreatorStore();

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4007";
const generationId = computed(() => route.params.id as string);
const isPolling = ref(false);
const isDownloading = ref(false);
const previewBlobUrl = ref<string | null>(null);
const showPreview = ref(false);

const statusData = ref<{
  status: string;
  gammaUrl?: string | null;
  exportUrl?: string | null;
  title?: string | null;
  creditsDeducted?: number | null;
  creditsRemaining?: number | null;
} | null>(null);

const generation = computed<GammaGeneration | undefined>(() =>
  store.generations.find((g) => g.generationId === generationId.value)
);

const currentStatus = computed(() => statusData.value?.status ?? generation.value?.status ?? "pending");
const exportUrl = computed(() => statusData.value?.exportUrl ?? generation.value?.exportUrl);
const title = computed(() => statusData.value?.title ?? generation.value?.title ?? "Untitled Presentation");
const isPdf = computed(() => generation.value?.exportAs === "pdf" || exportUrl.value?.includes(".pdf"));
const isCompleted = computed(() => currentStatus.value === "completed");
const isPending = computed(() => currentStatus.value === "queued" || currentStatus.value === "pending");

// Build the backend proxy URL with auth token
const proxyDownloadUrl = computed(() => {
  return `${API_BASE}/ai-content-creator/download/${generationId.value}`;
});


const statusIcon = computed(() => {
  if (isCompleted.value) return CheckCircle2;
  if (isPending.value) return Loader2;
  if (currentStatus.value === "failed") return AlertCircle;
  return Clock;
});

const statusColor = computed(() => {
  if (isCompleted.value) return "text-green-500";
  if (isPending.value) return "text-yellow-500";
  if (currentStatus.value === "failed") return "text-red-500";
  return "text-muted-foreground";
});

const pollStatus = async () => {
  isPolling.value = true;
  try {
    const result = await store.getStatus(generationId.value);
    statusData.value = result.data;
    if (result.data.status === "completed") {
      toast.success(result.data.exportUrl ? "Presentation ready — view or download below!" : "Presentation is ready!");
    } else {
      toast.info(`Status: ${result.data.status} — still generating...`);
    }
  } catch (err: any) {
    toast.error(err?.response?.data?.message || "Failed to check status");
  } finally {
    isPolling.value = false;
  }
};

// Fetch the file through backend and create a blob URL (handles JWT auth)
const fetchAndCreateBlobUrl = async (): Promise<string> => {
  const token = tokenStorage.getAccessToken();
  const response = await fetch(proxyDownloadUrl.value, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

// Download the file (streamed through our backend)
const downloadFile = async () => {
  if (!isCompleted.value) { toast.warning("Presentation not ready yet — check status first"); return; }
  isDownloading.value = true;
  try {
    const blobUrl = await fetchAndCreateBlobUrl();
    const ext = isPdf.value ? "pdf" : "pptx";
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `${title.value.replace(/\s+/g, "-")}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    toast.success("Download started!");
  } catch (e: any) {
    toast.error(e.message || "Download failed");
  } finally {
    isDownloading.value = false;
  }
};

// Preview: load the PDF via blob URL in an iframe
const openPreview = async () => {
  if (previewBlobUrl.value) { showPreview.value = true; return; }
  isDownloading.value = true;
  try {
    previewBlobUrl.value = await fetchAndCreateBlobUrl();
    showPreview.value = true;
  } catch (e: any) {
    toast.error(e.message || "Failed to load preview");
  } finally {
    isDownloading.value = false;
  }
};

const formatDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  } catch { return iso; }
};

onMounted(() => { if (isPending.value) pollStatus(); });
</script>

<template>
  <section class="min-h-screen bg-background px-4 py-6 lg:px-6">
    <!-- Back nav -->
    <Button variant="ghost" size="sm" class="mb-5 -ml-1" @click="router.push('/marketing/ppt?tab=list')">
      <ArrowLeft class="size-4 mr-1" /> Back to My Presentations
    </Button>

    <!-- Not found -->
    <div v-if="!generation" class="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      <AlertCircle class="mx-auto mb-3 size-10 text-muted-foreground opacity-40" />
      <p class="text-muted-foreground text-sm">Presentation not found. It may have been removed.</p>
      <Button class="mt-4" @click="router.push('/marketing/ppt')">
        <Sparkles class="size-4 mr-1" /> Create a New One
      </Button>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="mb-6 flex flex-wrap items-start gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <Presentation class="size-6 text-primary shrink-0" />
            <h1 class="text-2xl font-bold text-foreground truncate">{{ title }}</h1>
          </div>
          <p class="text-sm text-muted-foreground">
            Generation ID: <code class="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{{ generationId }}</code>
          </p>
        </div>

        <!-- Status badge -->
        <div :class="['flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border', statusColor, 'border-current/30 bg-current/5']">
          <component :is="statusIcon" class="size-4" :class="{ 'animate-spin': isPending }" />
          {{ currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1) }}
        </div>
      </div>

      <!-- Details cards -->
      <div class="grid gap-4 md:grid-cols-2 mb-6">
        <Card class="border-border/70 shadow-sm">
          <CardHeader><CardTitle class="text-base">Details</CardTitle></CardHeader>
          <CardContent class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Created</span>
              <span class="font-medium">{{ formatDate(generation.createdAt) }}</span>
            </div>
            <div v-if="generation.numCards" class="flex justify-between">
              <span class="text-muted-foreground">Slides</span>
              <span class="font-medium">{{ generation.numCards }}</span>
            </div>
            <div v-if="generation.format" class="flex justify-between">
              <span class="text-muted-foreground">Format</span>
              <span class="font-medium capitalize">{{ generation.format }}</span>
            </div>
            <div v-if="generation.exportAs" class="flex justify-between">
              <span class="text-muted-foreground">Export As</span>
              <span class="font-medium uppercase">{{ generation.exportAs }}</span>
            </div>
            <div v-if="statusData?.creditsDeducted != null" class="flex justify-between">
              <span class="text-muted-foreground">Credits Used</span>
              <span class="font-medium">{{ statusData.creditsDeducted }}</span>
            </div>
          </CardContent>
        </Card>

        <Card class="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle class="text-base">Prompt Used</CardTitle>
            <CardDescription class="text-xs">Input sent to Gamma AI</CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{{ generation.prompt }}</p>
          </CardContent>
        </Card>
      </div>

      <!-- Action card -->
      <Card class="border-border/70 shadow-sm">
        <CardContent class="pt-6">
          <div class="flex flex-wrap items-center gap-3">
            <!-- Preview (PDF only — renders in iframe below) -->
            <Button v-if="isCompleted && isPdf" :disabled="isDownloading" @click="openPreview">
              <Eye class="size-4 mr-2" />
              {{ isDownloading && !showPreview ? "Loading..." : "Preview PDF" }}
            </Button>

            <!-- Download via backend proxy — no Gamma redirect -->
            <Button :disabled="!isCompleted || isDownloading" @click="downloadFile">
              <Download class="size-4 mr-2" :class="{ 'animate-pulse': isDownloading }" />
              {{ isDownloading ? "Downloading..." : isCompleted ? (isPdf ? "📄 Download PDF" : "📊 Download PPTX") : "Not Ready Yet" }}
            </Button>

            <!-- Check status -->
            <Button variant="outline" :disabled="isPolling || isCompleted" @click="pollStatus">
              <RefreshCw class="size-4 mr-2" :class="{ 'animate-spin': isPolling }" />
              {{ isPolling ? "Checking..." : "Check Status" }}
            </Button>

            <!-- Generate new -->
            <Button variant="ghost" @click="router.push('/marketing/ppt')">
              <Sparkles class="size-4 mr-2" /> Generate New PPT
            </Button>
          </div>

          <p v-if="isPending" class="mt-4 text-sm text-muted-foreground">
            ⏳ Gamma is generating your presentation (30–90 sec). Click <strong>Check Status</strong> to refresh.
          </p>

          <!-- Inline PDF preview via blob URL — zero Gamma redirect -->
          <div v-if="showPreview && previewBlobUrl" class="mt-5">
            <div class="flex items-center justify-between mb-2">
              <p class="text-sm font-medium text-foreground">📄 In-App Preview</p>
              <Button variant="ghost" size="sm" @click="showPreview = false">Hide</Button>
            </div>
            <iframe
              :src="previewBlobUrl"
              class="w-full border border-border rounded-xl"
              style="height: 600px;"
              title="Presentation Preview"
            />
          </div>

          <!-- PPTX ready hint (Office Online viewer) -->
          <div v-if="isCompleted && !isPdf && exportUrl" class="mt-4">
            <p class="text-sm font-medium text-foreground mb-2">📊 In-App Viewer (read-only)</p>
            <iframe
              :src="`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(exportUrl)}`"
              class="w-full border border-border rounded-xl"
              style="height: 560px;"
              title="PPTX Viewer"
            />
          </div>

          <div v-if="isCompleted && !exportUrl" class="mt-4 p-3 rounded-lg border border-blue-500/20 bg-blue-500/5 text-sm text-blue-700 dark:text-blue-400">
            ✅ Generation complete. The export file will appear here once available — check status again if needed.
          </div>
        </CardContent>
      </Card>
    </template>
  </section>
</template>
