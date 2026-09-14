<script setup>
import { ref, computed, watch } from "vue";
import axios from "axios";
import endpoints from "@/request/endpoints";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  folder: { type: String, default: "social" },
  max: { type: Number, default: 4 },
  // Per-file size cap in MB. Anything bigger is rejected client-side.
  maxSizeMb: { type: Number, default: 8 },
});

const emit = defineEmits(["update:modelValue"]);

const uploading = ref(false);
const errorMsg = ref("");
const fileInput = ref(null);

const urls = computed({
  get: () => props.modelValue || [],
  set: (v) => emit("update:modelValue", v),
});

const remainingSlots = computed(() => Math.max(0, props.max - urls.value.length));

watch(() => props.modelValue, () => {
  // Sync external clears (e.g. after submit)
});

const triggerPicker = () => {
  errorMsg.value = "";
  fileInput.value?.click();
};

const onFilesSelected = async (e) => {
  const target = e.target;
  if (!target?.files?.length) return;

  const picked = Array.from(target.files).slice(0, remainingSlots.value);
  // Reset input so picking the same file again retriggers `change`
  target.value = "";

  // Client-side size guard
  const tooBig = picked.find(
    (f) => f.size > props.maxSizeMb * 1024 * 1024,
  );
  if (tooBig) {
    errorMsg.value = `"${tooBig.name}" is over ${props.maxSizeMb} MB.`;
    return;
  }

  uploading.value = true;
  errorMsg.value = "";

  try {
    if (picked.length === 1) {
      const fd = new FormData();
      fd.append("file", picked[0]);
      fd.append("folder", props.folder);
      const res = await axios.post(endpoints.s3UploadOne, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res?.data?.data?.url || res?.data?.url;
      if (url) urls.value = [...urls.value, url];
    } else {
      const fd = new FormData();
      picked.forEach((f) => fd.append("files", f));
      fd.append("folder", props.folder);
      const res = await axios.post(endpoints.s3UploadMany, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const list = res?.data?.data || res?.data || [];
      const newUrls = (Array.isArray(list) ? list : [])
        .map((it) => it?.url)
        .filter(Boolean);
      urls.value = [...urls.value, ...newUrls];
    }
  } catch (err) {
    console.error("Image upload failed", err);
    errorMsg.value =
      err?.response?.data?.message || "Upload failed. Try a smaller image.";
  } finally {
    uploading.value = false;
  }
};

const removeAt = (idx) => {
  const next = [...urls.value];
  next.splice(idx, 1);
  urls.value = next;
};
</script>

<template>
  <div class="flex flex-col gap-2">
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="onFilesSelected"
    />

    <div class="flex items-start gap-3">
      <button
        type="button"
        @click="triggerPicker"
        :disabled="uploading || remainingSlots === 0"
        class="shrink-0 h-20 w-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-400 flex flex-col items-center justify-center text-gray-400 hover:text-orange-500 disabled:opacity-50"
      >
        <span v-if="uploading" class="text-xs">…</span>
        <template v-else>
          <i class="pi pi-image text-xl"></i>
          <span class="text-[10px] mt-1">Add image</span>
        </template>
      </button>

      <div class="flex flex-wrap gap-2">
        <div
          v-for="(url, i) in urls"
          :key="i"
          class="relative h-20 w-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
        >
          <img :src="url" class="w-full h-full object-cover" alt="" />
          <button
            type="button"
            @click="removeAt(i)"
            class="absolute top-1 right-1 bg-black/60 hover:bg-black text-white rounded-full h-5 w-5 flex items-center justify-center text-[10px]"
            aria-label="Remove image"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <p v-if="errorMsg" class="text-xs text-red-500">{{ errorMsg }}</p>
    <p class="text-[11px] text-gray-400">
      {{ urls.length }}/{{ max }} images · max {{ maxSizeMb }} MB each
    </p>
  </div>
</template>
