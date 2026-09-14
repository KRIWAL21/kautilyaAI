<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { toast } from "vue-sonner";
import { Wand2, Video, RefreshCw, Play, Trash2, Plus, CheckCircle2, Loader2, AlertCircle, Clock, Download } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAiContentCreatorStore, type VideoGeneration } from "@/store/AiContentCreatorStore";

const store = useAiContentCreatorStore();

const form = ref({
  prompt: "",
  duration: "5" as "5" | "10" | "20" | "30" | "40",
  aspectRatio: "16:9" as "16:9" | "9:16" | "1:1",
});

const slideshowForm = ref({
  propertyName: "",
  location: "",
  price: "",
  configuration: "",
  tagline: "",
  images: ["", "", "", ""],
});

const isGenerating = ref(false);
const pollingIds = ref<Set<string>>(new Set());

const videos = computed(() => store.videoGenerations);
const historyVideos = computed(() => store.historyVideos);

const activeTab = ref("ai-video");

onMounted(() => {
  store.fetchVideoHistory();
});

const statusColor = (status: VideoGeneration["status"]) => {
  switch (status) {
    case "completed": return "text-green-500";
    case "queued": case "pending": case "in_progress": return "text-yellow-500";
    case "failed": return "text-red-500";
    default: return "text-muted-foreground";
  }
};

const statusIcon = (status: VideoGeneration["status"]) => {
  switch (status) {
    case "completed": return CheckCircle2;
    case "queued": case "pending": case "in_progress": return Loader2;
    case "failed": return AlertCircle;
    default: return Clock;
  }
};

const statusLabel = (s: VideoGeneration["status"]) => {
  const map: Record<string, string> = { queued: "Queued", pending: "Processing", in_progress: "Generating", completed: "Done", failed: "Failed" };
  return map[s] ?? s;
};

const formatDate = (iso: string) => {
  try { return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)); }
  catch { return iso; }
};

const generate = async () => {
  if (!form.value.prompt.trim()) { toast.warning("Please enter a prompt"); return; }
  isGenerating.value = true;
  try {
    const res = await store.generateVideo({ prompt: form.value.prompt, duration: form.value.duration, aspectRatio: form.value.aspectRatio });
    toast.success(res.message || "Video generation queued! Check status below.");
    form.value.prompt = "";
  } catch (e: any) {
    toast.error(e?.response?.data?.message || "Failed to start video generation");
  } finally { isGenerating.value = false; }
};

const generateSlideshow = async () => {
  if (!slideshowForm.value.propertyName.trim() || !slideshowForm.value.location.trim()) {
    toast.warning("Property Name and Location are required");
    return;
  }
  isGenerating.value = true;
  try {
    const imageUrls = slideshowForm.value.images.filter(img => img.trim() !== "");
    const res = await store.generateSlideshow({
      propertyName: slideshowForm.value.propertyName,
      location: slideshowForm.value.location,
      price: slideshowForm.value.price,
      configuration: slideshowForm.value.configuration,
      tagline: slideshowForm.value.tagline,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
    });
    toast.success(res.message || "Slideshow queued!");
    // Reset form
    slideshowForm.value = {
      propertyName: "", location: "", price: "", configuration: "", tagline: "", images: ["", "", "", ""]
    };
  } catch (e: any) {
    toast.error(e?.response?.data?.message || "Failed to start slideshow generation");
  } finally { isGenerating.value = false; }
};

const pollHistoryStatus = async (vid: any) => {
  if (!vid.contentUrl) return;
  const requestId = vid.contentUrl.split(':')[1];
  if (!requestId) return;
  
  if (pollingIds.value.has(requestId)) return;
  pollingIds.value.add(requestId);
  
  try {
    const isFalAi = vid.contentUrl.startsWith('fal-request:');
    let res;
    
    if (isFalAi) {
      res = await store.getVideoStatus(requestId);
    } else {
      res = await store.getSlideshowStatus(requestId);
    }
    
    if (res.data.status === "completed") {
      toast.success("🎬 Video is ready!");
      store.fetchVideoHistory(); // Refresh the list to grab the new S3 URL
    } else {
      toast.info(`Status: ${res.data.status}`);
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.message || "Failed to check status");
  } finally { 
    pollingIds.value.delete(requestId); 
  }
};

const pollStatus = async (requestId: string) => {
  if (pollingIds.value.has(requestId)) return;
  pollingIds.value.add(requestId);
  try {
    // Determine if it's a fal.ai UUID (has hyphens) or json2video project ID (32-char hex, no hyphens)
    const isFalAi = requestId.includes('-');
    
    let res;
    if (isFalAi) {
      res = await store.getVideoStatus(requestId);
    } else {
      res = await store.getSlideshowStatus(requestId);
    }

    if (res.data.status === "completed") {
      toast.success("🎬 Video is ready!");
      store.fetchVideoHistory(); // Refresh history because it might have moved to DB Published state
    }
    else toast.info(`Status: ${res.data.status}`);
  } catch (e: any) {
    toast.error(e?.response?.data?.message || "Failed to check status");
  } finally { pollingIds.value.delete(requestId); }
};

const downloadVideo = (url: string) => {
  const a = document.createElement("a");
  a.href = url;
  a.download = "property-video.mp4";
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
</script>

<template>
  <section class="min-h-screen bg-background px-4 py-6 lg:px-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-foreground">AI Video Generation</h1>
      <p class="text-muted-foreground text-sm mt-1">Generate cinematic property marketing videos powered by fal.ai Kling V2</p>
    </div>

    <div class="mb-6 flex rounded-full bg-zinc-900 border border-zinc-800 p-1 w-fit gap-1">
      <button
        v-for="tab in [
          { key: 'ai-video', label: 'Generate' },
          { key: 'history', label: 'My Videos' }
        ]"
        :key="tab.key"
        class="px-6 py-2 rounded-full text-sm font-medium transition-all"
        :class="activeTab === tab.key ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'"
        @click="activeTab = tab.key"
      >{{ tab.label }}</button>
    </div>

    <div>
      <div v-if="activeTab === 'ai-video'">
        <Card class="border-border/70 shadow-sm">
          <CardHeader>
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-primary/10 p-2"><Video class="h-5 w-5 text-primary" /></div>
              <div>
                <CardTitle>Generate AI Video</CardTitle>
                <CardDescription>Enter the property name or a short phrase. Our AI will automatically research it and produce a cinematic video.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label for="vprompt">Property Name or Prompt</Label>
              <Textarea id="vprompt" v-model="form.prompt" placeholder="e.g. Lodha Bellissimo Mumbai" class="min-h-28" />
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-1.5">
                <Label>Duration</Label>
                <select v-model="form.duration" class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="5">5 seconds</option>
                  <option value="10">10 seconds</option>
                  <option value="20">20 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="40">40 seconds</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <Label>Aspect Ratio</Label>
                <select v-model="form.aspectRatio" class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="16:9">16:9 — Landscape</option>
                  <option value="9:16">9:16 — Portrait / Reel</option>
                  <option value="1:1">1:1 — Square</option>
                </select>
              </div>
            </div>

            <div class="w-full pt-2">
              <Button class="w-full" :disabled="isGenerating || !form.prompt.trim()" @click="generate">
                <Wand2 v-if="isGenerating" class="size-4 mr-2 animate-pulse" />
                <Video v-else class="size-4 mr-2" />
                {{ isGenerating ? "Researching Property & Generating AI Video..." : "✨ Generate AI Video" }}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- History Tab -->

      <div v-else-if="activeTab === 'history'">
        <div class="mb-4 flex items-center justify-between mt-2">
          <h2 class="text-lg font-semibold text-foreground">My Videos</h2>
          <Button variant="outline" size="sm" @click="store.fetchVideoHistory()">
            <RefreshCw class="size-3.5 mr-2" /> Refresh
          </Button>
        </div>

        <div v-if="videos.length === 0 && historyVideos.length === 0" class="rounded-2xl border border-dashed border-zinc-800 bg-[#111113] p-16 flex items-center justify-center">
          <div class="text-center">
            <Video class="mx-auto mb-4 size-12 text-zinc-600 opacity-50" />
            <p class="text-sm text-zinc-500">No videos yet. Generate your first one above!</p>
          </div>
        </div>

        <div v-else class="space-y-6">
          <!-- Active Polling Videos -->
          <div v-if="videos.length > 0" class="space-y-4 border-b pb-6">
            <h3 class="text-sm font-medium text-muted-foreground">Currently Generating (Local Session)</h3>
            <Card v-for="vid in videos.filter(v => v.status !== 'completed')" :key="vid.requestId" class="border-border/70 shadow-sm border-primary/20 bg-primary/5">
              <CardContent class="pt-5 flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-foreground">{{ vid.prompt }}</p>
                  <p class="text-xs text-muted-foreground mt-1">{{ formatDate(vid.createdAt) }}</p>
                </div>
                <div class="flex items-center gap-3">
                  <div :class="['flex items-center gap-1 text-xs font-medium', statusColor(vid.status)]">
                    <component :is="statusIcon(vid.status)" class="size-3.5 animate-spin" />
                    {{ statusLabel(vid.status) }}
                  </div>
                  <Button size="sm" variant="outline" :disabled="pollingIds.has(vid.requestId)" @click="pollStatus(vid.requestId)">
                    <RefreshCw class="size-3.5 mr-1" :class="{ 'animate-spin': pollingIds.has(vid.requestId) }" /> Look up Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- History from DB -->
          <div v-if="historyVideos.length > 0" class="space-y-4">
            <h3 class="text-sm font-medium text-muted-foreground">Saved Videos</h3>
            <Card v-for="vid in historyVideos" :key="vid._id" class="border-border/70 shadow-sm">
              <CardContent class="pt-5 space-y-3">
                <!-- Video player (when done) -->
                <video
                  v-if="(vid.status === 'Published' || vid.status === 'completed') && vid.contentUrl && !vid.contentUrl.startsWith('fal-request') && !vid.contentUrl.startsWith('j2v-project')"
                  :src="vid.contentUrl"
                  :poster="vid.thumbnailUrl ?? undefined"
                  controls
                  class="w-full rounded-xl max-h-72 bg-black"
                />

                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-foreground line-clamp-2">{{ vid.projectName || vid.aiPrompt }}</p>
                    <p class="text-xs text-muted-foreground mt-1">{{ formatDate(vid.createdAt) }}</p>
                  </div>

                  <div v-if="vid.status === 'Published' || vid.status === 'completed'" class="flex items-center gap-1 text-xs font-medium text-green-500">
                    <CheckCircle2 class="size-3.5" /> Ready
                  </div>
                  <div v-else class="flex items-center gap-1 text-xs font-medium text-yellow-500">
                    <Loader2 class="size-3.5 animate-spin" /> Processing
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex flex-wrap items-center gap-2">
                  <Button 
                    v-if="vid.contentUrl && (vid.contentUrl.startsWith('fal-request:') || vid.contentUrl.startsWith('j2v-project:'))" 
                    size="sm" 
                    variant="outline" 
                    :disabled="pollingIds.has(vid.contentUrl.split(':')[1])" 
                    @click="pollHistoryStatus(vid)">
                    <RefreshCw class="size-3.5 mr-1" :class="{ 'animate-spin': pollingIds.has(vid.contentUrl.split(':')[1]) }" /> 
                    Look up Status
                  </Button>
                  
                  <template v-if="vid.contentUrl && !vid.contentUrl.startsWith('fal-request') && !vid.contentUrl.startsWith('j2v-project')">
                    <Button size="sm" variant="outline" @click="window.open(vid.contentUrl, '_blank')">
                      <Play class="size-3.5 mr-1" /> View Video
                    </Button>
                    <Button size="sm" variant="outline" @click="downloadVideo(vid.contentUrl)">
                      <Download class="size-3.5 mr-1" /> Download MP4
                    </Button>
                  </template>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
