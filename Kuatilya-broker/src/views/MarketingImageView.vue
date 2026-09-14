<script setup lang="ts">
import { ref } from "vue";
import { toast } from "vue-sonner";
import { Wand2, Image, Download, Building2, Sparkles } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAiContentCreatorStore } from "@/store/AiContentCreatorStore";
import { makeRequest } from "@/request/request";
import endpoints from "@/request/endpoints";

const store = useAiContentCreatorStore();

type Tab = "poster" | "custom" | "ai-smart";
const activeTab = ref<Tab>("poster");

// Property Poster form
const posterForm = ref({
  propertyName: "",
  location: "",
  configuration: "",
  price: "",
  amenities: "",
  style: "luxury" as "luxury" | "premium" | "affordable" | "commercial",
});
const isGeneratingPoster = ref(false);
const posterResult = ref<{ contentUrl: string; prompt: string } | null>(null);

// Custom image prompt form  
const customForm = ref({ prompt: "" });
const isEnhancing = ref(false);
const isGeneratingCustom = ref(false);
const customResult = ref<{ contentUrl: string } | null>(null);

const generatePoster = async () => {
  if (!posterForm.value.propertyName.trim() || !posterForm.value.location.trim()) {
    toast.warning("Property name and location are required");
    return;
  }
  isGeneratingPoster.value = true;
  posterResult.value = null;
  try {
    const res = await store.generatePoster({
      propertyName: posterForm.value.propertyName,
      location: posterForm.value.location,
      configuration: posterForm.value.configuration || undefined,
      price: posterForm.value.price || undefined,
      amenities: posterForm.value.amenities || undefined,
      style: posterForm.value.style,
    });
    posterResult.value = res.data;
    toast.success("Property poster generated! 🎨");
  } catch (e: any) {
    toast.error(e?.response?.data?.message || "Failed to generate poster");
  } finally {
    isGeneratingPoster.value = false;
  }
};

const enhanceCustomPrompt = async () => {
  if (!customForm.value.prompt.trim()) { toast.warning("Enter a prompt first"); return; }
  isEnhancing.value = true;
  try {
    const res = await store.enhancePrompt(customForm.value.prompt, "image");
    customForm.value.prompt = res.data.enhancedPrompt;
    toast.success("Prompt enhanced by Gemini ✨");
  } catch (e: any) {
    toast.error("Failed to enhance prompt");
  } finally { isEnhancing.value = false; }
};

const generateCustomImage = async () => {
  if (!customForm.value.prompt.trim()) { toast.warning("Enter a prompt"); return; }
  isGeneratingCustom.value = true;
  customResult.value = null;
  try {
    const res = await store.generatePoster({
      propertyName: "Custom Image",
      location: customForm.value.prompt,
      style: "luxury",
    });
    customResult.value = res.data;
    toast.success("Image generated! 🎨");
  } catch (e: any) {
    toast.error(e?.response?.data?.message || "Failed to generate image");
  } finally { isGeneratingCustom.value = false; }
};

const downloadImage = async (url: string, name = "property-poster") => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const ext = url.split('.').pop()?.split('?')[0] || "jpg";
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${name}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    toast.error("Failed to download image");
  }
};
// ─── AI Smart Poster (our NestJS backend → Perplexity + Gemini) ───
const aiForm = ref({
  propertyName: "",
  brokerName: "",
  brokerNumber: "",
  stylingDesc: "standard",
});
const isGeneratingAi = ref(false);
const aiResult = ref<{ url: string; thumb: string } | null>(null);

const generateAiPoster = async () => {
  if (!aiForm.value.propertyName.trim()) {
    toast.warning("Property name is required");
    return;
  }
  if (!aiForm.value.brokerName.trim() || !aiForm.value.brokerNumber.trim()) {
    toast.warning("Broker name and number are required for the CTA");
    return;
  }
  isGeneratingAi.value = true;
  aiResult.value = null;
  try {
    const result = await makeRequest(
      endpoints.marketingImageGenerate,
      "POST",
      {
        propertyName: aiForm.value.propertyName,
        brokerName: aiForm.value.brokerName,
        brokerNumber: aiForm.value.brokerNumber,
        stylingDesc: aiForm.value.stylingDesc || "standard",
      }
    );
    aiResult.value = result;
    toast.success("AI poster generated successfully! 🎨");
    fetchMyImages(); // Refresh images list
  } catch (e: any) {
    toast.error(e?.response?.data?.message || "Poster generation failed. Please try again.");
  } finally {
    isGeneratingAi.value = false;
  }
};

// ─── My Images History ───
const myImages = ref<any[]>([]);
const isLoadingHistory = ref(false);

const fetchMyImages = async () => {
  isLoadingHistory.value = true;
  try {
    const response = await makeRequest(
      `${endpoints.marketing}?type=Image&sortBy=createdAt&sortOrder=desc`,
      "GET"
    );
    if ((response as any)?.marketingContent) {
      myImages.value = (response as any).marketingContent;
    } else if ((response as any)?.data?.marketingContent) {
      myImages.value = (response as any).data.marketingContent;
    }
  } catch (e) {
    console.error("Failed to fetch image history", e);
  } finally {
    isLoadingHistory.value = false;
  }
};

import { onMounted } from 'vue';
onMounted(() => {
  fetchMyImages();
});
</script>

<template>
  <section class="min-h-screen bg-background px-4 py-6 lg:px-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-foreground">AI Image & Poster Generation</h1>
      <p class="text-muted-foreground text-sm mt-1">Generate property marketing posters and visuals using Gemini AI</p>
    </div>

    <!-- Tabs -->
    <div class="mb-6 flex rounded-full bg-zinc-900 border border-zinc-800 p-1 w-fit gap-1">
      <button
        v-for="tab in [
          { key: 'poster', label: 'Generate' },
          { key: 'list', label: 'My Images' }
        ]"
        :key="tab.key"
        class="px-6 py-2 rounded-full text-sm font-medium transition-all"
        :class="activeTab === tab.key ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'"
        @click="activeTab = tab.key as Tab"
      >{{ tab.label }}</button>
    </div>

    <!-- ✨ AI Smart Poster Tab (backed by our NestJS backend → Perplexity + Gemini Image) -->
    <template v-if="activeTab === 'ai-smart'">
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Form -->
        <Card class="border-border/70 shadow-sm">
          <CardHeader>
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-primary/10 p-2"><Sparkles class="h-5 w-5 text-primary" /></div>
              <div>
                <CardTitle>AI Smart Poster</CardTitle>
                <CardDescription>Enter a property name — our backend will research it via Perplexity AI, fetch real photos from Google Places, and generate a premium 9:16 poster with Gemini.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-1.5">
              <Label for="ai-pname">Property Name *</Label>
              <Input id="ai-pname" v-model="aiForm.propertyName" placeholder="e.g. Raipur Investment Alpha, Prestige Lakeside" />
              <p class="text-xs text-muted-foreground">The AI will automatically research this property online.</p>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-1.5">
                <Label for="ai-broker-name">Your Name (for CTA) *</Label>
                <Input id="ai-broker-name" v-model="aiForm.brokerName" placeholder="e.g. Aayush Agarwal" />
              </div>
              <div class="space-y-1.5">
                <Label for="ai-broker-num">Your Phone (for CTA) *</Label>
                <Input id="ai-broker-num" v-model="aiForm.brokerNumber" placeholder="e.g. 9876543210" />
              </div>
            </div>

            <div class="space-y-1.5">
              <Label for="ai-style">Poster Style</Label>
              <Input id="ai-style" v-model="aiForm.stylingDesc" placeholder="e.g. standard, green background, minimal white theme" />
              <p class="text-xs text-muted-foreground">Leave as 'standard' for the default luxury navy & gold style. Or describe changes: "silver text", "no gold borders", etc.</p>
            </div>

            <Button class="w-full" :disabled="isGeneratingAi" @click="generateAiPoster">
              <Sparkles class="size-4 mr-2" :class="{ 'animate-spin': isGeneratingAi }" />
              {{ isGeneratingAi ? "Researching & generating... (1-3 min)" : "✨ Generate AI Smart Poster" }}
            </Button>

            <div v-if="isGeneratingAi" class="rounded-lg bg-primary/5 border border-primary/20 p-4 text-sm text-muted-foreground space-y-1">
              <p>⏳ <strong>Step 1:</strong> Researching property via Perplexity AI...</p>
              <p>📸 <strong>Step 2:</strong> Fetching real property photos from Google Places...</p>
              <p>🎨 <strong>Step 3:</strong> Generating luxury poster with Gemini AI...</p>
              <p class="text-xs mt-2">This takes 1–3 minutes. Please wait.</p>
            </div>
          </CardContent>
        </Card>

        <!-- Result -->
        <div class="flex flex-col">
          <div v-if="isGeneratingAi" class="rounded-2xl border border-border bg-card flex items-center justify-center min-h-64">
            <div class="text-center">
              <Sparkles class="mx-auto size-8 text-primary animate-pulse mb-3" />
              <p class="text-sm text-muted-foreground">AI is designing your premium poster...</p>
              <p class="text-xs text-muted-foreground mt-1">Perplexity → Google Places → Gemini</p>
            </div>
          </div>

          <div v-else-if="aiResult" class="space-y-3">
            <img
              :src="aiResult.url"
              alt="AI Generated property poster"
              class="w-full rounded-2xl border border-border shadow-md"
            />
            <div class="flex gap-3">
              <Button class="flex-1" @click="downloadImage(aiResult.url, aiForm.propertyName || 'ai-poster')">
                <Download class="size-4 mr-2" /> Download Poster
              </Button>
              <Button variant="outline" class="flex-1" @click="() => { window.open(aiResult!.url, '_blank') }">
                Open Full Size
              </Button>
            </div>
            <p class="text-xs text-muted-foreground text-center">Hosted on imgbb · <a :href="aiResult.url" target="_blank" class="underline">Direct link</a></p>
          </div>

          <div v-else class="rounded-2xl border border-dashed border-border bg-card flex items-center justify-center min-h-64">
            <div class="text-center px-6">
              <Sparkles class="mx-auto mb-3 size-10 text-muted-foreground opacity-30" />
              <p class="text-sm text-muted-foreground">Your AI-generated poster will appear here</p>
              <p class="text-xs text-muted-foreground mt-1">Full pipeline: research → photo → 9:16 poster</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Property Poster Tab -->
    <template v-else-if="activeTab === 'poster'">
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Form -->
        <Card class="border-border/70 shadow-sm bg-[#111113]">
          <CardHeader>
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-red-500/10 p-2"><Building2 class="h-5 w-5 text-red-500" /></div>
              <div>
                <CardTitle class="text-white font-semibold">Property Poster</CardTitle>
                <CardDescription class="text-zinc-400">Gemini Imagen pulls every detail from your project record and stamps your contact card on the poster.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-1.5">
              <Label for="pname" class="text-zinc-300 font-semibold">Project <span class="text-red-500">*</span></Label>
              <select id="pname" v-model="posterForm.propertyName" class="h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-white">
                <option value="">— Select a project —</option>
                <option value="Tulsi Residency">Tulsi Residency</option>
                <option value="Raipur Investment Alpha">Raipur Investment Alpha</option>
              </select>
              <p class="text-xs text-orange-500 mt-1">No projects found — add a project before generating a poster.</p>
            </div>

            <div class="space-y-1.5">
              <Label class="text-zinc-300 font-semibold">Poster Style</Label>
              <select v-model="posterForm.style" class="h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-white">
                <option value="luxury">Luxury — gold & navy</option>
                <option value="premium">Premium — clean modern</option>
                <option value="affordable">Affordable — bright & welcoming</option>
                <option value="commercial">Commercial — corporate blue</option>
              </select>
            </div>
            
            <div class="space-y-1.5">
              <Label for="cnotes" class="text-zinc-300 font-semibold">Extra creative notes (optional)</Label>
              <Textarea id="cnotes" v-model="posterForm.amenities" placeholder="e.g. Lean into the riverside view, festive Diwali edge" class="min-h-20 border-zinc-800 bg-zinc-950 text-white" />
            </div>

            <div class="grid grid-cols-2 gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-950/50 mt-4">
              <div>
                <p class="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Channel Partner</p>
                <p class="text-sm text-white font-medium">(loading from profile...)</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Contact Number</p>
                <p class="text-sm text-white font-medium">(loading from profile...)</p>
              </div>
              <div class="col-span-2">
                <p class="text-xs text-zinc-500">Auto-filled from your profile and printed on the poster's contact strip.</p>
              </div>
            </div>

            <Button class="w-full bg-red-900/40 text-red-300 hover:bg-red-900/60 border border-red-900/50 mt-4 h-12" :disabled="isGeneratingPoster" @click="generatePoster">
              <Image class="size-4 mr-2" :class="{ 'animate-pulse': isGeneratingPoster }" />
              {{ isGeneratingPoster ? "Generating poster..." : "Generate Property Poster" }}
            </Button>
          </CardContent>
        </Card>

        <!-- Result -->
        <div class="flex flex-col">
          <div v-if="isGeneratingPoster" class="rounded-2xl border border-border bg-card flex items-center justify-center min-h-[400px]">
            <div class="text-center">
              <Wand2 class="mx-auto size-8 text-primary animate-pulse mb-3" />
              <p class="text-sm text-muted-foreground">Gemini is designing your poster...</p>
            </div>
          </div>

          <div v-else-if="posterResult" class="space-y-3">
            <img
              :src="posterResult.contentUrl"
              alt="Generated property poster"
              class="w-full rounded-2xl border border-border shadow-md"
            />
            <Button class="w-full" @click="downloadImage(posterResult.contentUrl, posterForm.propertyName || 'property-poster')">
              <Download class="size-4 mr-2" /> Download Poster
            </Button>
          </div>

          <div v-else class="rounded-2xl border border-dashed border-zinc-800 bg-[#111113] flex items-center justify-center min-h-[400px]">
            <div class="text-center px-6">
              <Image class="mx-auto mb-3 size-10 text-zinc-600 opacity-50" />
              <p class="text-sm text-zinc-500">Your generated poster will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </template>
    
    <!-- My Images Tab -->
    <template v-else-if="activeTab === 'list'">
      <div class="mb-4 flex items-center justify-between mt-2">
        <h2 class="text-lg font-semibold text-foreground">My Images</h2>
        <Button variant="outline" size="sm" @click="fetchMyImages">
          <RefreshCw class="size-3.5 mr-2" :class="{ 'animate-spin': isLoadingHistory }" /> Refresh
        </Button>
      </div>

      <div v-if="myImages.length === 0" class="rounded-2xl border border-dashed border-zinc-800 bg-[#111113] p-16 flex items-center justify-center">
        <div class="text-center">
          <Image class="mx-auto mb-4 size-12 text-zinc-600 opacity-50" />
          <p class="text-sm text-zinc-500">No generated images yet. Create your first one from the Generate tab.</p>
        </div>
      </div>
      
      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card v-for="img in myImages" :key="img._id" class="border-border/70 shadow-sm overflow-hidden flex flex-col">
          <div class="aspect-square bg-zinc-900 relative">
            <img :src="img.contentUrl" class="w-full h-full object-cover" />
          </div>
          <CardContent class="p-4 flex flex-col gap-2 flex-1">
            <div class="flex-1">
              <p class="text-sm font-medium text-foreground line-clamp-1">{{ img.projectName || img.title || "Property Poster" }}</p>
              <p class="text-xs text-muted-foreground mt-1">{{ img.createdAt ? new Date(img.createdAt).toLocaleDateString() : '' }}</p>
            </div>
            <div class="flex gap-2 mt-2">
              <Button size="sm" variant="outline" class="flex-1" @click="() => { window.open(img.contentUrl, '_blank') }">
                View
              </Button>
              <Button size="sm" variant="outline" class="flex-1" @click="downloadImage(img.contentUrl, img.projectName || 'poster')">
                <Download class="size-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </template>

    <!-- Custom Image Tab -->
    <template v-else>
      <div class="grid gap-6 lg:grid-cols-2">
        <Card class="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Custom Image</CardTitle>
            <CardDescription>Describe any image. Use Gemini to enhance your prompt first.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-1.5">
              <Label for="cprompt">Image Description</Label>
              <Textarea id="cprompt" v-model="customForm.prompt" placeholder="e.g. Luxury 3BHK living room with floor-to-ceiling windows, modern furniture, golden hour lighting..." class="min-h-28" />
            </div>
            <div class="flex flex-wrap gap-3">
              <Button variant="outline" :disabled="isEnhancing || !customForm.prompt.trim()" @click="enhanceCustomPrompt">
                <Wand2 class="size-4 mr-2" :class="{ 'animate-pulse': isEnhancing }" />
                {{ isEnhancing ? "Enhancing..." : "✨ Enhance with Gemini" }}
              </Button>
              <Button :disabled="isGeneratingCustom || !customForm.prompt.trim()" @click="generateCustomImage">
                <Image class="size-4 mr-2" />
                {{ isGeneratingCustom ? "Generating..." : "Generate Image" }}
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- Result -->
        <div>
          <div v-if="isGeneratingCustom" class="rounded-2xl border border-border bg-card flex items-center justify-center min-h-64">
            <div class="text-center">
              <Wand2 class="mx-auto size-8 text-primary animate-pulse mb-3" />
              <p class="text-sm text-muted-foreground">Generating image with Gemini...</p>
            </div>
          </div>
          <div v-else-if="customResult" class="space-y-3">
            <img :src="customResult.contentUrl" alt="Generated image" class="w-full rounded-2xl border border-border shadow-md" />
            <Button class="w-full" @click="downloadImage(customResult.contentUrl, 'custom-image')">
              <Download class="size-4 mr-2" /> Download Image
            </Button>
          </div>
          <div v-else class="rounded-2xl border border-dashed border-border bg-card flex items-center justify-center min-h-64">
            <div class="text-center px-6">
              <Image class="mx-auto mb-3 size-10 text-muted-foreground opacity-30" />
              <p class="text-sm text-muted-foreground">Your generated image will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
