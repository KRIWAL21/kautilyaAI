<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { Sparkles, RefreshCw, Trash2, Plus, Clock, CheckCircle2, Loader2, AlertCircle, Eye, Download } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAiContentCreatorStore, type GammaGeneration } from "@/store/AiContentCreatorStore";

const router = useRouter();
const store = useAiContentCreatorStore();
const pollingIds = ref<Set<string>>(new Set());

const generations = computed(() => store.generations);

const statusColor = (status: GammaGeneration["status"]) => {
  switch (status) {
    case "completed": return "text-green-500";
    case "queued":
    case "pending": return "text-yellow-500";
    case "failed": return "text-red-500";
    default: return "text-muted-foreground";
  }
};

const statusIcon = (status: GammaGeneration["status"]) => {
  switch (status) {
    case "completed": return CheckCircle2;
    case "queued":
    case "pending": return Loader2;
    case "failed": return AlertCircle;
    default: return Clock;
  }
};

const statusLabel = (status: GammaGeneration["status"]) =>
  status === "queued" ? "Queued" : status.charAt(0).toUpperCase() + status.slice(1);

const formatDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

const pollStatus = async (generationId: string) => {
  if (pollingIds.value.has(generationId)) return;
  pollingIds.value.add(generationId);

  try {
    const result = await store.getStatus(generationId);
    if (result.data.status === "completed") {
      toast.success(`Presentation ready! Open it to view & download.`);
    } else {
      toast.info(`Status: ${result.data.status}`);
    }
  } catch (err: any) {
    toast.error(err?.response?.data?.message || "Failed to fetch status");
  } finally {
    pollingIds.value.delete(generationId);
  }
};

const remove = (id: string) => {
  store.removeGeneration(id);
  toast.success("Removed from list");
};

// Auto-poll any queued/pending on mount
onMounted(() => {
  generations.value
    .filter((g) => g.status === "queued" || g.status === "pending")
    .forEach((g) => pollStatus(g.generationId));
});
</script>

<template>
  <div>
    <!-- Header row -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-semibold text-foreground">My Presentations</h2>
        <p class="text-sm text-muted-foreground mt-0.5">All your Gamma AI generated decks</p>
      </div>
      <div class="flex gap-2">
        <Button variant="ghost" size="sm" class="text-zinc-400 hover:text-white" @click="store.generations = []; localStorage.removeItem('gamma_ppt_generations')">
          <Trash2 class="size-3.5 mr-2" /> Cleanup
        </Button>
        <Button variant="outline" size="sm" @click="() => { generations.filter(g => g.status === 'queued' || g.status === 'pending').forEach(g => pollStatus(g.generationId)) }">
          <RefreshCw class="size-3.5 mr-2" /> Refresh
        </Button>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="generations.length === 0"
      class="rounded-2xl border border-dashed border-zinc-800 bg-[#111113] p-16 flex items-center justify-center"
    >
      <div class="text-center">
        <Sparkles class="mx-auto mb-4 size-12 text-zinc-600 opacity-50" />
        <p class="text-sm text-zinc-500">No presentations yet. Generate your first one!</p>
      </div>
    </div>

    <!-- Generations grid -->
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card
        v-for="gen in generations"
        :key="gen.generationId"
        class="border-border/70 shadow-sm hover:shadow-md transition-shadow"
      >
        <CardHeader class="pb-3">
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <CardTitle class="text-sm font-semibold truncate">
                {{ gen.title || "Unnamed Presentation" }}
              </CardTitle>
              <CardDescription class="mt-1 line-clamp-2 text-xs">
                {{ gen.prompt }}
              </CardDescription>
            </div>
            <div :class="['flex items-center gap-1 shrink-0 text-xs font-medium', statusColor(gen.status)]">
              <component
                :is="statusIcon(gen.status)"
                class="size-3.5"
                :class="{ 'animate-spin': gen.status === 'queued' || gen.status === 'pending' }"
              />
              {{ statusLabel(gen.status) }}
            </div>
          </div>
        </CardHeader>

        <CardContent class="pt-0 space-y-3">
          <!-- Meta -->
          <div class="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span v-if="gen.numCards" class="rounded-full bg-muted px-2 py-0.5">{{ gen.numCards }} slides</span>
            <span v-if="gen.format" class="rounded-full bg-muted px-2 py-0.5 capitalize">{{ gen.format }}</span>
            <span v-if="gen.exportAs" class="rounded-full bg-muted px-2 py-0.5 uppercase">{{ gen.exportAs }}</span>
          </div>

          <p class="text-xs text-muted-foreground">{{ formatDate(gen.createdAt) }}</p>

          <!-- Actions -->
          <div class="flex items-center gap-2 pt-1">
            <!-- Always: view details / download page -->
            <Button
              size="sm"
              :variant="gen.status === 'completed' ? 'default' : 'outline'"
              @click="router.push(`/marketing/ppt/${gen.generationId}`)"
            >
              <Eye class="size-3.5 mr-1" />
              {{ gen.status === 'completed' ? 'View & Download' : 'View Details' }}
            </Button>

            <!-- Poll status if not done -->
            <Button
              v-if="gen.status !== 'completed'"
              size="sm"
              variant="outline"
              :disabled="pollingIds.has(gen.generationId)"
              @click="pollStatus(gen.generationId)"
            >
              <RefreshCw
                class="size-3.5 mr-1"
                :class="{ 'animate-spin': pollingIds.has(gen.generationId) }"
              />
              Check Status
            </Button>

            <Button
              size="sm"
              variant="ghost"
              class="ml-auto text-destructive hover:bg-destructive/10"
              @click="remove(gen.generationId)"
            >
              <Trash2 class="size-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
