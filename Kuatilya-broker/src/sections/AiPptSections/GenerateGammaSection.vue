<script setup lang="ts">
import { computed, ref } from "vue";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAiContentCreatorStore } from "@/store/AiContentCreatorStore";
import { Sparkles, Wand2 } from "lucide-vue-next";

const aiContentCreatorStore = useAiContentCreatorStore();
const emit = defineEmits<{ (e: 'generated'): void }>();
const isGenerating = ref(false);
const isEnhancing = ref(false);
const lastGenerationId = ref("");

const form = ref({
  prompt: "Make a detailed PPT for Tulsi Realty Bombay. Gather project details from reliable internet sources and create an editable investor-friendly deck.",
  numCards: 12,
  additionalInstructions:
    "Include location overview, project highlights, amenities, floor plan summary, pricing insights, and investment rationale.",
  format: "presentation" as "presentation" | "document" | "webpage" | "social",
  exportAs: "pptx" as "pdf" | "pptx",
});

const canSubmit = computed(() => form.value.prompt.trim().length > 0 && !isGenerating.value);

const enhancePrompt = async () => {
  if (!form.value.prompt.trim()) { toast.warning("Enter a prompt first"); return; }
  isEnhancing.value = true;
  try {
    const res = await aiContentCreatorStore.enhancePrompt(form.value.prompt, "ppt");
    form.value.prompt = res.data.enhancedPrompt;
    toast.success("Prompt enhanced by Gemini AI ✨");
  } catch (e: any) {
    toast.error("Failed to enhance prompt");
  } finally { isEnhancing.value = false; }
};

const openGeneration = () => {
  if (!lastGenerationId.value) return;
};

const submit = async () => {
  if (!canSubmit.value) return;

  isGenerating.value = true;

  try {
    const response = await aiContentCreatorStore.generateGamma({
      prompt: form.value.prompt,
      numCards: Number(form.value.numCards) || undefined,
      additionalInstructions: form.value.additionalInstructions || undefined,
      format: form.value.format,
      exportAs: form.value.exportAs,
    });

    if (response.status >= 200 && response.status < 300) {
      lastGenerationId.value = response.data?.generationId || "";
      toast.success(response.message || "Gamma generation started! Check 'My Presentations' for status.");
      emit('generated');
      return;
    }

    toast.error(response.message || "Unable to start generation.");
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Gamma generation failed.");
  } finally {
    isGenerating.value = false;
  }
};
</script>

<template>
  <section class="">
    <Card class="border-border/70 shadow-sm">
      <CardHeader class="space-y-3">
        <div class="flex items-center gap-3">
          <div class="rounded-lg bg-primary/10 p-2">
            <Sparkles class="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle class="text-2xl">AI PPT Generator</CardTitle>
            <CardDescription>
              Create editable Gamma decks using a single prompt. Example: Make a PPT for Tulsi Realty Bombay.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent class="space-y-6">
        <div class="space-y-2">
          <Label for="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            v-model="form.prompt"
            placeholder="Describe the project and ask for a detailed, editable presentation"
            class="min-h-36"
          />
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <div class="space-y-2">
            <Label for="numCards">Slides</Label>
            <Input id="numCards" v-model.number="form.numCards" type="number" min="1" max="60" />
          </div>

          <div class="space-y-2">
            <Label for="format">Format</Label>
            <select
              id="format"
              v-model="form.format"
              class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="presentation">Presentation</option>
              <option value="document">Document</option>
              <option value="webpage">Webpage</option>
              <option value="social">Social</option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="exportAs">Export</Label>
            <select
              id="exportAs"
              v-model="form.exportAs"
              class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="pptx">PPTX</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="instructions">Additional Instructions</Label>
          <Textarea
            id="instructions"
            v-model="form.additionalInstructions"
            placeholder="Tell Gamma what sections, style, or details you want"
            class="min-h-24"
          />
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <Button variant="outline" :disabled="isEnhancing || !form.prompt.trim()" @click="enhancePrompt">
            <Wand2 class="size-4 mr-2" :class="{ 'animate-pulse': isEnhancing }" />
            {{ isEnhancing ? "Researching with Gemini..." : "✨ Research & Enhance with Gemini" }}
          </Button>

          <Button :disabled="!canSubmit" @click="submit">
            <Sparkles class="size-4 mr-2" />
            {{ isGenerating ? "Generating..." : "Generate with Gamma" }}
          </Button>

          <p v-if="lastGenerationId" class="text-sm text-muted-foreground ml-1">
            ✅ Generation started — check <strong>My Presentations</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  </section>
</template>
