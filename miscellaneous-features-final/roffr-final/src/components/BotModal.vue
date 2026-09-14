<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useBotStore } from '@/stores/botStore';
import { storeToRefs } from 'pinia';

const botStore = useBotStore();
const { isModalOpen, botData } = storeToRefs(botStore);

const input = ref('');

// Adapt this to your actual response shape
const messages = computed(() => botData.value?.messages || botData.value || []);

const closeModal = () => {
  isModalOpen.value = false;
};

const handleSend = async () => {
  const text = input.value.trim();
  if (!text) return;
  await botStore.sendMessage(text);
  input.value = '';
};

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};

// Auto-scroll logic
const messagesContainer = ref(null);

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

watch(messages, scrollToBottom, { deep: true });

onMounted(() => {
  if (isModalOpen.value) {
    scrollToBottom();
  }
});

watch(isModalOpen, (val) => {
  if (val) {
    scrollToBottom();
  }
});
</script>

<template>
  <Transition
    name="fade"
    enter-active-class="fade-enter-active"
    leave-active-class="fade-leave-active"
    enter-from-class="fade-enter-from"
    leave-to-class="fade-leave-to"
  >
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-end bg-black/60"
    >
      <!-- backdrop -->
      <div class="absolute inset-0" @click="closeModal" />

      <!-- Phone mockup -->
      <div
        class="relative w-[360px] h-[550px] rounded-[32px] bg-[#f5f5f7] shadow-2xl overflow-hidden flex flex-col xl:mr-20 xl:mb-20"
        @click.stop
      >
        <!-- Header -->
        <header
          class="px-4 pt-4 pb-3 bg-gradient-to-r from-[#ff5b37] to-[#f4b318] text-white"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div
                class="h-9 w-9 flex items-center justify-center"
              >
                <span class="text-lg font-semibold">
                  <img src="/svg/Global/bot-logo2.svg" alt="">
                </span>
              </div>
              <div class="leading-tight">
                <p class="font-semibold">Roffr Bot</p>
                <p class="text-xs text-white/80 flex items-center gap-1">
                  <span class="h-2 w-2 rounded-full bg-green-400"></span>
                  Online
                </p>
              </div>
            </div>

            <button
              class="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              @click="closeModal"
            >
              <i class="pi pi-times text-sm"></i>
            </button>
          </div>
        </header>

        <!-- Messages area -->
        <main 
          ref="messagesContainer"
          class="flex-1 overflow-y-auto px-3 py-4 space-y-3"
        >
          <template v-for="(m, idx) in messages" :key="idx">
            <!-- bot message (default) -->
            <div
              v-if="m.from === 'bot' || !m.from"
              class="flex items-start gap-2"
            >
              <div
                class="h-7 w-7 rounded-full bg-[#ff5b37] flex items-center justify-center text-xs text-white"
              >
                🤖
              </div>
              <div>
                <div
                  class="inline-block max-w-[260px] rounded-2xl bg-white text-gray-800 px-3 py-2 shadow-sm"
                >
                  <p class="text-sm whitespace-pre-line">
                    {{ m.text || m.message || m }}
                  </p>
                </div>
                <p class="mt-1 text-[10px] text-gray-400">
                  {{ m.time || '' }}
                </p>
              </div>
            </div>

            <!-- user message -->
            <div v-else class="flex justify-end">
              <div class="flex flex-col items-end gap-1">
                <div
                  class="relative inline-block max-w-[260px] rounded-3xl bg-gradient-to-br from-[#ff5b37] to-[#f4b318] px-4 py-3 text-white shadow-md"
                >
                  <p class="text-sm leading-snug whitespace-pre-line">
                    {{ m.text || m.message }}
                  </p>
                </div>
                <p class="text-[10px] text-gray-400">
                  {{ m.time || '' }}
                </p>
              </div>
            </div>
          </template>
        </main>

        <!-- Bottom bar -->
        <footer class="border-t border-gray-200 bg-white px-3 pt-2 pb-3">
          <div
            class="flex items-center gap-2 rounded-full border border-gray-300 bg-[#f9f9fb] px-3 py-2"
          >
            <input
              v-model="input"
              type="text"
              placeholder="Type your message here..."
              class="flex-1 bg-transparent text-sm outline-none"
              @keydown="handleKeydown"
            />
            <button
              class="h-8 w-8 rounded-full bg-[#ff5b37] flex items-center justify-center text-white disabled:opacity-50"
              :disabled="!input.trim()"
              @click="handleSend"
            >
              <i class="pi pi-send text-sm"></i>
            </button>
          </div>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
