<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { pdfs } from "@/data/pdfs.js";

const router = useRouter();


const selectedPdf = ref(null);
const open = ref(false);

const openPdf = (pdf) => {
  selectedPdf.value = pdf;
  open.value = true;
};

const canPrev = computed(() => pageNumber.value > 1);
const canNext = computed(() => pageNumber.value < totalpages.value);

const prevPage = () => {
  if (canPrev.value) pageNumber.value -= 1;
};

const nextPage = () => {
  if (canNext.value) pageNumber.value += 1;
};
</script>

<template>
  <main class="py-20 max-w-7xl mx-auto px-4 2xl:px-0">
    <div class="text-center mb-10">
      <h1 class="title-text">Case Studies</h1>
      <p class="font-outfit">
        Real-world success stories and transformative projects
      </p>
    </div>

    <div class="">
      <!-- Heading -->
      <div class="px-6 mt-6">
        <!-- Carousel Wrapper -->
        <div class="mt-6 overflow-x-auto scrollbar-hide">
          <div class="flex gap-6 snap-x snap-mandatory scroll-smooth">
            <div
              v-for="pdf in pdfs"
              :key="pdf.id"
              class="min-w-[85%] sm:min-w-[48%] lg:min-w-[32%] snap-start"
            >
              <!-- Card -->
              <div
                class="border rounded-2xl overflow-hidden flex flex-col h-full bg-white"
              >
                <!-- Image -->
                <div class="h-60 w-full">
                  <img
                    :src="pdf.img"
                    alt="Blog Image"
                    class="h-full w-full object-cover"
                  />
                </div>

                <!-- Content -->
                <div class="p-4 flex flex-col flex-1">
                  <h2 class="font-semibold text-lg leading-relaxed">
                    {{ pdf.title }}
                  </h2>

                  <p class="text-sm text-gray-500 mt-2 flex-1">
                    {{
                      pdf.description?.length > 100
                        ? pdf.description.slice(0, 100) + "..."
                        : pdf.description
                    }}
                  </p>

                  <!-- Button -->
                  <button
                    class="mt-4 w-full border rounded-lg py-2 text-sm font-medium hover:bg-gray-100 transition"
                    @click="openPdf(pdf)"
                  >
                    Read More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 🔥 Custom Modal -->
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <!-- Overlay -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="open = false"
        ></div>

        <!-- Modal Content -->
        <div
          class="relative bg-white w-[95%] max-w-6xl rounded-2xl shadow-lg overflow-hidden"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b">
            <h2 class="text-lg font-semibold truncate">
              {{ selectedPdf?.title }}
            </h2>

            <div class="flex items-center gap-2">
              <!-- Download -->
              <a
                :href="selectedPdf?.url"
                target="_blank"
                class="text-sm border px-3 py-1 rounded-md hover:bg-gray-100 transition"
              >
                Download
              </a>

              <!-- Close -->
              <button
                class="text-sm border px-3 py-1 rounded-md hover:bg-gray-100 transition"
                @click="open = false"
              >
                Close
              </button>
            </div>
          </div>

          <!-- PDF Viewer -->
          <div class="p-4">
            <iframe
              v-if="selectedPdf"
              :key="selectedPdf.url"
              :src="selectedPdf.url"
              class="w-full h-[80vh] rounded-lg border"
            ></iframe>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="totalpages > 1"
      class="mt-8 flex items-center justify-center gap-4 text-sm font-outfit"
    >
      <button
        class="px-4 py-1.5 rounded-full border border-gray-300 text-gray-700 disabled:opacity-40 flex items-center gap-1"
        :disabled="!canPrev"
        @click="prevPage"
      >
        <i class="pi pi-angle-left text-xs"></i>
        <span>Previous</span>
      </button>

      <span class="text-gray-700">
        Page
        <span class="font-semibold">{{ pageNumber }}</span>
        of
        <span class="font-semibold">{{ totalpages }}</span>
      </span>

      <button
        class="px-4 py-1.5 rounded-full border border-gray-300 text-gray-700 disabled:opacity-40 flex items-center gap-1"
        :disabled="!canNext"
        @click="nextPage"
      >
        <span>Next</span>
        <i class="pi pi-angle-right text-xs"></i>
      </button>
    </div>
  </main>
</template>
