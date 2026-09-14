<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      @click="$emit('close')"
    >
      <div
        class="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
        @click.stop
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-800">Share this property</h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <i class="pi pi-times text-lg"></i>
          </button>
        </div>

        <div class="space-y-3">
          <!-- Copy Link -->
          <button
            @click="copyLink"
            class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <i class="pi pi-link text-gray-600"></i>
            </div>
            <div class="flex-1 text-left">
              <p class="font-medium text-gray-800">Copy Link</p>
              <p class="text-xs text-gray-500">Share via clipboard</p>
            </div>
            <i v-if="copied" class="pi pi-check text-green-500"></i>
          </button>

          <!-- WhatsApp -->
          <button
            @click="shareVia('whatsapp')"
            class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <i class="pi pi-whatsapp text-green-600"></i>
            </div>
            <div class="flex-1 text-left">
              <p class="font-medium text-gray-800">WhatsApp</p>
              <p class="text-xs text-gray-500">Share on WhatsApp</p>
            </div>
          </button>

          <!-- Facebook -->
          <button
            @click="shareVia('facebook')"
            class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <i class="pi pi-facebook text-blue-600"></i>
            </div>
            <div class="flex-1 text-left">
              <p class="font-medium text-gray-800">Facebook</p>
              <p class="text-xs text-gray-500">Share on Facebook</p>
            </div>
          </button>

          <!-- Twitter -->
          <button
            @click="shareVia('twitter')"
            class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <div class="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
              <i class="pi pi-twitter text-sky-600"></i>
            </div>
            <div class="flex-1 text-left">
              <p class="font-medium text-gray-800">Twitter</p>
              <p class="text-xs text-gray-500">Share on Twitter</p>
            </div>
          </button>

          <!-- Email -->
          <button
            @click="shareVia('email')"
            class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <i class="pi pi-envelope text-red-600"></i>
            </div>
            <div class="flex-1 text-left">
              <p class="font-medium text-gray-800">Email</p>
              <p class="text-xs text-gray-500">Share via email</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'Check out this property on Roffr'
  }
});

const emit = defineEmits(['close']);

const copied = ref(false);

const copyLink = () => {
  navigator.clipboard.writeText(props.url).then(() => {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
      emit('close');
    }, 500);
  });
};

const shareVia = (platform) => {
  const encodedUrl = encodeURIComponent(props.url);
  const encodedTitle = encodeURIComponent(props.title);
  
  let shareUrl = '';
  
  switch (platform) {
    case 'whatsapp':
      shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
      break;
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      break;
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
      break;
    case 'email':
      shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
      break;
  }
  
  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=400');
    emit('close');
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
