<script setup lang="ts">
import { ref, onMounted } from "vue"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Image as ImageIcon, Download, Sparkles, ExternalLink, RefreshCw } from "lucide-vue-next"
import { useMarketingStore } from "@/store/MarketingStore"
import { useProfileStore } from "@/store/ProfileStore"
import { toast } from "vue-sonner"

const marketingStore = useMarketingStore()
const profileStore = useProfileStore()

const open = ref(false)
const isGenerating = ref(false)
const generatedResult = ref<{ url: string; thumb: string } | null>(null)

const form = ref({
  propertyName: "",
  brokerName: "",
  brokerNumber: "",
  stylingDesc: "standard",
})

// ── localStorage cache key per broker ──────────────────────────────────────
const CACHE_KEY = "kautilya_generated_images"

function getCachedImages(): Record<string, { url: string; thumb: string; generatedAt: string }> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}")
  } catch {
    return {}
  }
}

function cacheImage(propertyName: string, brokerName: string, result: { url: string; thumb: string }) {
  const cache = getCachedImages()
  const key = `${propertyName.trim().toLowerCase()}__${brokerName.trim().toLowerCase()}`
  cache[key] = { ...result, generatedAt: new Date().toISOString() }
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
}

function getFromCache(propertyName: string, brokerName: string) {
  const cache = getCachedImages()
  const key = `${propertyName.trim().toLowerCase()}__${brokerName.trim().toLowerCase()}`
  return cache[key] || null
}

// ── Auto-fill broker info from profile ─────────────────────────────────────
onMounted(async () => {
  if (!profileStore.profileData) {
    await profileStore.getProfileData()
  }
  const profile = profileStore.profileData
  if (profile) {
    form.value.brokerName = (profile as any).name || (profile as any).fullName || ""
    form.value.brokerNumber = (profile as any).phoneNumber || (profile as any).phone || ""
  }
})

// ── Dialog open: check cache immediately ───────────────────────────────────
const openDialog = () => {
  generatedResult.value = null
  open.value = true
}

// ── Submit ──────────────────────────────────────────────────────────────────
const submit = async () => {
  if (!form.value.propertyName.trim()) {
    toast.warning("Property name is required")
    return
  }
  if (!form.value.brokerName.trim() || !form.value.brokerNumber.trim()) {
    toast.warning("Broker name and number are required for the poster CTA")
    return
  }

  // Check cache first — don't waste tokens
  const cached = getFromCache(form.value.propertyName, form.value.brokerName)
  if (cached) {
    generatedResult.value = cached
    toast.info("Loaded from your saved images 📁 (no tokens used)")
    return
  }

  isGenerating.value = true
  generatedResult.value = null
  try {
    const result = await marketingStore.generateAiImage({
      propertyName: form.value.propertyName,
      brokerName: form.value.brokerName,
      brokerNumber: form.value.brokerNumber,
      stylingDesc: form.value.stylingDesc || "standard",
    })

    // astra-service returns { url, thumb } directly
    const poster = result?.url ? result : result?.data
    if (!poster?.url) throw new Error("No image URL returned")

    generatedResult.value = poster
    cacheImage(form.value.propertyName, form.value.brokerName, poster)
    toast.success("Poster generated & saved! 🎨")
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || "Generation failed. Try again.")
    console.error("[GenerateImages] error:", error)
  } finally {
    isGenerating.value = false
  }
}

// ── Regenerate — bypass cache ───────────────────────────────────────────────
const regenerate = async () => {
  const cache = getCachedImages()
  const key = `${form.value.propertyName.trim().toLowerCase()}__${form.value.brokerName.trim().toLowerCase()}`
  delete cache[key]
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  generatedResult.value = null
  await submit()
}

// ── Download ────────────────────────────────────────────────────────────────
const downloadPoster = async () => {
  if (!generatedResult.value?.url) return
  try {
    const res = await fetch(generatedResult.value.url)
    const blob = await res.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = blobUrl
    link.download = `${form.value.propertyName || "kautilya-poster"}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
    toast.success("Poster downloaded!")
  } catch {
    toast.error("Download failed — try opening the direct link instead")
  }
}
</script>

<template>
  <!-- ── CARD ─────────────────────────────────────────────────────────────── -->
  <div
    class="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-primary/50 transition-all duration-300 group shadow-lg"
  >
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="p-3 rounded-lg bg-primary/10">
          <ImageIcon class="w-6 h-6 text-primary" />
        </div>
        <span class="text-[10px] font-bold tracking-widest text-muted-foreground bg-muted px-2.5 py-1 rounded">
          GEMINI AI
        </span>
      </div>
      <div class="space-y-2">
        <h3 class="text-xl font-semibold text-foreground">AI Marketing Poster</h3>
        <p class="text-muted-foreground text-sm leading-relaxed">
          Enter a property name — our AI researches it, fetches real photos, and generates a premium branded poster with your contact details.
        </p>
      </div>
    </div>

    <Button class="flex items-center gap-2" @click="openDialog">
      Create Now
      <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
    </Button>
  </div>

  <!-- ── DIALOG ─────────────────────────────────────────────────────────────── -->
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Sparkles class="w-5 h-5 text-primary" />
          AI Marketing Poster
        </DialogTitle>
        <DialogDescription>
          Researches your property via AI, fetches real photos, and generates a luxury 9:16 branded poster — takes 1–3 minutes.
        </DialogDescription>
      </DialogHeader>

      <!-- Form (hidden once result is shown) -->
      <div v-if="!generatedResult" class="space-y-4 py-2">
        <div class="space-y-1.5">
          <Label>Property Name <span class="text-red-500">*</span></Label>
          <Input v-model="form.propertyName" placeholder="e.g. Lodha Bellissimo, Prestige Lakeside" :disabled="isGenerating" />
          <p class="text-xs text-muted-foreground">AI will research this property automatically.</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <Label>Your Name <span class="text-xs text-muted-foreground">(for poster CTA)</span></Label>
            <Input v-model="form.brokerName" placeholder="John Doe" :disabled="isGenerating" />
          </div>
          <div class="space-y-1.5">
            <Label>Your Number <span class="text-xs text-muted-foreground">(for poster CTA)</span></Label>
            <Input v-model="form.brokerNumber" placeholder="9876543210" :disabled="isGenerating" />
          </div>
        </div>

        <div class="space-y-1.5">
          <Label>Style <span class="text-xs text-muted-foreground">(optional)</span></Label>
          <Input v-model="form.stylingDesc" placeholder="standard / green background / minimal white theme" :disabled="isGenerating" />
          <p class="text-xs text-muted-foreground">Leave as 'standard' for luxury navy & gold. Or describe changes.</p>
        </div>

        <!-- Generating progress -->
        <div v-if="isGenerating" class="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-2 text-sm text-muted-foreground">
          <div class="flex items-center gap-2"><Sparkles class="w-4 h-4 text-primary animate-spin" /><span class="font-medium text-foreground">Generating your poster...</span></div>
          <p>⏳ <strong>Step 1:</strong> Researching property via AI...</p>
          <p>📸 <strong>Step 2:</strong> Fetching real photos from Google Places...</p>
          <p>🎨 <strong>Step 3:</strong> Generating luxury poster with Gemini...</p>
          <p class="text-xs mt-1">This takes 1–3 minutes. Please keep this open.</p>
        </div>
      </div>

      <!-- Generated Result -->
      <div v-if="generatedResult" class="py-2 space-y-4">
        <div class="rounded-xl overflow-hidden border border-border shadow-lg">
          <img
            :src="generatedResult.url"
            alt="Generated property poster"
            class="w-full object-contain max-h-[60vh]"
          />
        </div>
        <div class="flex gap-3">
          <Button class="flex-1" @click="downloadPoster">
            <Download class="w-4 h-4 mr-2" /> Download Poster
          </Button>
          <Button variant="outline" @click="() => window.open(generatedResult!.url, '_blank')">
            <ExternalLink class="w-4 h-4 mr-2" /> Full Size
          </Button>
          <Button variant="ghost" size="icon" @click="regenerate" title="Regenerate (uses tokens)">
            <RefreshCw class="w-4 h-4" />
          </Button>
        </div>
        <p class="text-xs text-center text-muted-foreground">
          ✅ Saved to My Images · <button class="underline hover:text-foreground" @click="generatedResult = null">Generate another</button>
        </p>
      </div>

      <DialogFooter v-if="!generatedResult">
        <Button variant="outline" @click="open = false" :disabled="isGenerating">Cancel</Button>
        <Button @click="submit" :disabled="isGenerating || !form.propertyName.trim()">
          <Sparkles class="w-4 h-4 mr-2" :class="{ 'animate-spin': isGenerating }" />
          {{ isGenerating ? "Generating..." : "Generate Poster" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
