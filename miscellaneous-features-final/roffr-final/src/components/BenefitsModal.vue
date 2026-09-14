<script setup>
import { useModalStore } from "@/stores/modalStore";
import { storeToRefs } from "pinia";

const modalStore = useModalStore();
const { isBenefitsModalOpen } = storeToRefs(modalStore);
const { closeBenefitsModal } = modalStore;
</script>

<template>
  <Transition name="modal-fade">
    <div
      v-if="isBenefitsModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="closeBenefitsModal"
    >
      <div
        class="bg-gradient-to-br from-[#EB3131] to-[#DDA439] rounded-3xl overflow-hidden shadow-2xl w-full max-w-2xl p-8 md:p-12 text-white relative"
      >
        <!-- Close Button -->
        <button
          @click="closeBenefitsModal"
          class="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <i class="pi pi-times text-white"></i>
        </button>

        <div class="text-center">
          <h2 class="font-marcellus text-3xl md:text-4xl mb-4">
            Membership <span class="border-2 border-white rounded-[50%] px-2 italic">Benefits</span> You Get with<br />
            Roffr
          </h2>

          <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20 mt-8 relative">
            <div class="absolute -top-3 right-6 bg-white text-[#EB3131] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <i class="pi pi-star-fill text-[10px]"></i> Premium
            </div>

            <ul class="space-y-4 font-outfit text-left">
              <li class="flex items-start gap-3">
                <i class="pi pi-check text-white mt-1 text-lg"></i>
                <span class="text-base">Personal Investment Advisor</span>
              </li>
              <li class="flex items-start gap-3">
                <i class="pi pi-check text-white mt-1 text-lg"></i>
                <span class="text-base">Exclusive Discounts Up to 30%</span>
              </li>
              <li class="flex items-start gap-3">
                <i class="pi pi-check text-white mt-1 text-lg"></i>
                <span class="text-base">Permanent Community Membership</span>
              </li>
              <li class="flex items-start gap-3">
                <i class="pi pi-check text-white mt-1 text-lg"></i>
                <span class="text-base">AI-Powered Investment Insights</span>
              </li>
              <li class="flex items-start gap-3">
                <i class="pi pi-check text-white mt-1 text-lg"></i>
                <span class="text-base">Zero Brokerage Charges</span>
              </li>
              <li class="flex items-start gap-3">
                <i class="pi pi-check text-white mt-1 text-lg"></i>
                <span class="text-base">Loyalty Benefits & Referral Incentives</span>
              </li>
            </ul>

            <button
              @click="closeBenefitsModal"
              class="w-full mt-8 bg-white text-[#EB3131] font-bold py-3 rounded-full hover:bg-gray-50 transition-colors text-base"
            >
              Join Community at ₹999/-
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
