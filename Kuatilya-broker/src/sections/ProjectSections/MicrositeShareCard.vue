<script setup lang="ts">
import { ref, computed } from "vue";
import { ExternalLink, Copy, Check, Globe, MessageCircle } from "lucide-vue-next";

interface Props {
  projectId: string;
  userId: string;
  projectName?: string;
  /** Base URL of the microsite. Defaults to the live Vida Realty site. */
  micrositeBaseUrl?: string;
}

const props = withDefaults(defineProps<Props>(), {
  projectName: "this project",
  micrositeBaseUrl: "http://localhost:3000",
});

// ── Computed URLs ────────────────────────────────────────────────
const effectiveUserId = computed(
  () => props.userId || localStorage.getItem("userId") || "dummy"
);

const personalUrl = computed(
  () => `${props.micrositeBaseUrl}/${props.projectId}/${effectiveUserId.value}`
);

const previewUrl = computed(
  () => `${props.micrositeBaseUrl}/${props.projectId}/dummy`
);

const whatsappShareUrl = computed(() => {
  const message = encodeURIComponent(
    `🏡 Check out ${props.projectName} — here's your personalised microsite link:\n\n${personalUrl.value}`
  );
  return `https://wa.me/?text=${message}`;
});

// ── Copy logic ───────────────────────────────────────────────────
const copied = ref(false);

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(personalUrl.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    // Fallback for browsers without clipboard API
    const el = document.createElement("textarea");
    el.value = personalUrl.value;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
}
</script>

<template>
  <!-- Outer card matching the existing project detail card style -->
  <div class="rounded-2xl border border-muted/60 bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">

    <!-- Header gradient strip -->
    <div class="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-5">
      <!-- Decorative circles -->
      <div class="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
      <div class="pointer-events-none absolute -bottom-4 right-12 h-20 w-20 rounded-full bg-white/5" />

      <div class="relative flex items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <Globe class="h-5 w-5 text-white/80" />
            <span class="text-xs font-semibold uppercase tracking-widest text-white/70">
              My Personalised Microsite
            </span>
          </div>
          <h2 class="mt-1 text-xl font-bold text-white">
            Vida Realty — {{ projectName }}
          </h2>
          <p class="mt-1 text-sm text-white/70">
            Share this link with prospects — it shows your name, phone &amp; WhatsApp on the contact section and attributes all leads to you.
          </p>
        </div>
        <!-- Live badge -->
        <span class="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/30">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
          Live
        </span>
      </div>
    </div>

    <!-- URL display + actions -->
    <div class="p-6 space-y-5">

      <!-- URL chip -->
      <div>
        <p class="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Your personalised link</p>
        <div class="flex items-center gap-2 rounded-lg border bg-muted/40 px-4 py-3">
          <Globe class="h-4 w-4 shrink-0 text-emerald-500" />
          <span class="flex-1 truncate font-mono text-sm text-foreground">
            {{ personalUrl }}
          </span>
          <!-- Copy button -->
          <button
            type="button"
            @click="copyUrl"
            class="shrink-0 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
            :class="copied
              ? 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/30'
              : 'bg-primary/10 text-primary hover:bg-primary/20 ring-1 ring-primary/20'"
          >
            <Check v-if="copied" class="h-3.5 w-3.5" />
            <Copy v-else class="h-3.5 w-3.5" />
            {{ copied ? "Copied!" : "Copy" }}
          </button>
        </div>
      </div>

      <!-- Action buttons row -->
      <div class="flex flex-wrap gap-3">

        <!-- Open personalised link -->
        <a
          :href="personalUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 active:scale-95"
        >
          <ExternalLink class="h-4 w-4" />
          Open My Microsite
        </a>

        <!-- Share on WhatsApp -->
        <a
          :href="whatsappShareUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1ebe5d] active:scale-95"
        >
          <MessageCircle class="h-4 w-4" />
          Share on WhatsApp
        </a>

        <!-- Preview as visitor (dummy) -->
        <a
          :href="previewUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/40 bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/50 hover:text-foreground active:scale-95"
        >
          <Globe class="h-4 w-4" />
          Preview as visitor
        </a>

      </div>

      <!-- Info chips -->
      <div class="flex flex-wrap gap-2 pt-1 border-t">
        <span class="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Your name &amp; phone shown to prospects
        </span>
        <span class="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          <span class="h-1.5 w-1.5 rounded-full bg-blue-400" />
          All leads attributed to you
        </span>
        <span class="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          <span class="h-1.5 w-1.5 rounded-full bg-amber-400" />
          Works at any screen size
        </span>
      </div>

    </div>
  </div>
</template>
