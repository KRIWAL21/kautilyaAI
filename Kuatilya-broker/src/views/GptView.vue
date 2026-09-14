<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  useAiContentCreatorStore,
  type PerplexityCreditSummary,
} from "@/store/AiContentCreatorStore";
import { toast } from "vue-sonner";

type AssistantMessageBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
  blocks?: AssistantMessageBlock[];
};

const aiStore = useAiContentCreatorStore();
const defaultAssistantMessage =
  "Hello! I am Chanakya GPT. Ask me anything about properties, prices, locations, and investment options.";

const propertySuggestions = [
  "2 BHK flats in Raipur under 35 lakh with ready-to-move options",
  "Best localities in Raipur for rental yield in 2026",
  "Compare 2 BHK rent in Shankar Nagar vs Mowa",
  "Top gated projects in Raipur with clubhouse and parking",
  "Investment plan for 50 lakh budget in Raipur real estate",
  "New launch projects near schools and hospitals in Raipur",
];

const citationPattern = /\[(?:web|source|ref):\s*\d+\]/gi;

const sanitizeUiMessage = (value: string) =>
  value.replace(/perplexity/gi, "Chanakya GPT");

const normalizeAssistantText = (value: string) =>
  value
    .replace(citationPattern, "")
    .replace(/\r\n/g, "\n")
    .replace(/\s*##\s*/g, "\n\n## ")
    .replace(/\s-\s(?=[A-Za-z])/g, "\n- ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

const toAssistantBlocks = (value: string): AssistantMessageBlock[] => {
  const normalized = normalizeAssistantText(value);
  if (!normalized) {
    return [
      {
        type: "paragraph",
        text: "I could not generate a response right now.",
      },
    ];
  }

  const sections = normalized
    .split(/\n{2,}/)
    .map((section) => section.trim())
    .filter(Boolean);

  const blocks: AssistantMessageBlock[] = [];

  for (const section of sections) {
    if (section.startsWith("## ")) {
      const heading = section.replace(/^##\s+/, "").trim();
      if (heading) {
        blocks.push({ type: "heading", text: heading });
      }
      continue;
    }

    const listParts = section
      .split(/\n-\s+/)
      .map((item, index) =>
        index === 0 ? item.replace(/^[-\s]+/, "") : item,
      )
      .map((item) => item.trim())
      .filter(Boolean);

    if (section.startsWith("- ") && listParts.length > 0) {
      blocks.push({ type: "list", items: listParts });
      continue;
    }

    if (section.includes("\n- ") && listParts.length > 1) {
      const [intro, ...items] = listParts;
      if (intro) {
        blocks.push({ type: "paragraph", text: intro });
      }
      if (items.length) {
        blocks.push({ type: "list", items });
      }
      continue;
    }

    blocks.push({ type: "paragraph", text: section });
  }

  return blocks.length
    ? blocks
    : [
        {
          type: "paragraph",
          text: normalized,
        },
      ];
};

const createAssistantMessage = (content: string): ChatMessage => ({
  role: "assistant",
  content,
  blocks: toAssistantBlocks(content),
});

const messages = ref<ChatMessage[]>([
  createAssistantMessage(defaultAssistantMessage),
]);

const input = ref("");
const chatContainer = ref<HTMLElement | null>(null);
const sending = ref(false);
const preset = ref("pro-search");
const loadingHistory = ref(true);
const credits = ref<PerplexityCreditSummary | null>(null);

const hasRemainingCredit = computed(() => {
  if (!credits.value) return true;
  return credits.value.remaining >= credits.value.costPerMessage;
});

const sendDisabled = computed(
  () =>
    sending.value ||
    loadingHistory.value ||
    !input.value.trim() ||
    !hasRemainingCredit.value,
);

const scrollToBottom = async () => {
  await nextTick();
  chatContainer.value?.scrollTo({
    top: chatContainer.value.scrollHeight,
    behavior: "smooth",
  });
};

const loadChatHistory = async () => {
  loadingHistory.value = true;

  try {
    const response = await aiStore.fetchPerplexityChatHistory(50);
    credits.value = response?.data?.credits ?? null;

    const history = response?.data?.history ?? [];
    if (history.length === 0) {
      messages.value = [createAssistantMessage(defaultAssistantMessage)];
      return;
    }

    const mapped: ChatMessage[] = [];
    for (const item of history) {
      if (item?.userMessage) {
        mapped.push({ role: "user", content: item.userMessage });
      }
      if (item?.assistantMessage) {
        mapped.push(createAssistantMessage(item.assistantMessage));
      }
    }

    messages.value = mapped.length
      ? mapped
      : [createAssistantMessage(defaultAssistantMessage)];
  } catch (error: any) {
    const message =
      error?.response?.data?.message ??
      error?.message ??
      "Failed to load chat history.";
    toast.error(sanitizeUiMessage(message));
  } finally {
    loadingHistory.value = false;
    await scrollToBottom();
  }
};

onMounted(async () => {
  await loadChatHistory();
});

const sendMessage = async () => {
  if (!input.value.trim() || sending.value || loadingHistory.value) return;

  if (!hasRemainingCredit.value) {
    toast.error("Chanakya GPT credit limit reached for your account.");
    return;
  }

  const userText = input.value.trim();
  messages.value.push({ role: "user", content: userText });

  input.value = "";
  sending.value = true;
  await scrollToBottom();

  try {
    const response = await aiStore.perplexityChat({
      input: userText,
      preset: preset.value,
    });

    if (response?.data?.credits) {
      credits.value = response.data.credits;
    }

    const answer =
      response?.data?.outputText?.trim() ||
      "I could not generate a response right now.";

    messages.value.push(createAssistantMessage(answer));
  } catch (error: any) {
    const rawMessage =
      error?.response?.data?.message ??
      error?.message ??
      "Failed to fetch a response from Chanakya GPT.";
    const message = sanitizeUiMessage(rawMessage);

    if (error?.response?.data?.statusCode === 403) {
      const latestCredits = await aiStore
        .fetchPerplexityChatHistory(1)
        .catch(() => null);
      if (latestCredits?.data?.credits) {
        credits.value = latestCredits.data.credits;
      }
    }

    messages.value.push(
      createAssistantMessage(
        "I am unable to fetch a response right now. Please try again.",
      ),
    );
    toast.error(message);
  } finally {
    sending.value = false;
    await scrollToBottom();
  }
};

const applySuggestion = async (suggestion: string) => {
  if (sending.value || loadingHistory.value || !hasRemainingCredit.value) {
    return;
  }

  input.value = suggestion;
  await sendMessage();
};
</script>

<template>
  <section class="flex h-[calc(100vh-80px)] flex-col bg-background">
    <div
      ref="chatContainer"
      class="flex-1 space-y-4 overflow-y-auto px-4 py-4"
    >
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="flex"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <Card
            class="max-w-[78%] p-4 text-sm leading-relaxed"
            :class="
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            "
          >
            <div v-if="msg.role === 'assistant'" class="space-y-3">
              <template
                v-for="(block, blockIndex) in msg.blocks"
                :key="`${index}-${blockIndex}`"
              >
                <h4
                  v-if="block.type === 'heading'"
                  class="text-sm font-semibold text-foreground"
                >
                  {{ block.text }}
                </h4>
                <ul
                  v-else-if="block.type === 'list'"
                  class="list-disc space-y-1 pl-5 text-sm leading-7"
                >
                  <li
                    v-for="(item, itemIndex) in block.items"
                    :key="`${index}-${blockIndex}-${itemIndex}`"
                  >
                    {{ item }}
                  </li>
                </ul>
                <p v-else class="whitespace-pre-line text-sm leading-7">
                  {{ block.text }}
                </p>
              </template>
            </div>
            <p v-else class="whitespace-pre-line text-sm">{{ msg.content }}</p>
          </Card>
        </div>
    </div>

    <div class="border-t border-border bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div class="mx-auto w-full max-w-4xl space-y-3">
        <div class="flex gap-2 overflow-x-auto pb-1">
            <Button
              v-for="suggestion in propertySuggestions"
              :key="suggestion"
              variant="outline"
              size="sm"
              class="h-auto shrink-0 rounded-full px-4 py-2 text-xs"
              :disabled="sending || loadingHistory || !hasRemainingCredit"
              @click="applySuggestion(suggestion)"
            >
              {{ suggestion }}
            </Button>
        </div>

        <div class="rounded-2xl border bg-background p-2 shadow-lg">
          <div
            class="mb-2 flex items-center justify-between px-1 text-xs text-muted-foreground"
          >
            <span v-if="loadingHistory">Loading chat history...</span>
            <span v-else>
              Chanakya GPT Credits: {{ credits?.remaining ?? "-" }} /
              {{ credits?.limit ?? "-" }} (used {{ credits?.used ?? "-" }})
            </span>
          </div>

          <div class="flex flex-col gap-2 sm:flex-row">
            <Input
              v-model="input"
              :disabled="sending || loadingHistory || !hasRemainingCredit"
              @keyup.enter="sendMessage"
              placeholder="Ask Chanakya GPT about property..."
            />
            <Button :disabled="sendDisabled" @click="sendMessage" class="sm:min-w-28">
              {{ sending ? "Sending..." : "Send" }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
