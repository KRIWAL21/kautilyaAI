<script setup>
import { ref } from "vue";
import { useModalStore } from "@/stores/modalStore";
import { useAuthStore } from "@/stores/authStore";
import { storeToRefs } from "pinia";

const modalStore = useModalStore();
const { isLoginModalOpen } = storeToRefs(modalStore);
const { closeLoginModal, openBenefitsModal } = modalStore;

const authStore = useAuthStore()
const {otpData} = storeToRefs(authStore)

const stepNumber = ref(1);
const mobileNumber = ref("");
const otpCode = ref("");

// Step 3 State
const selectedBhk = ref("");
const area = ref("");
const price = ref("");
const bhkOptions = ["1 bhk", "2 bhk", "3 bhk", "4 bhk", "5 bhk"];

const handleSignIn = async() => {
  // Basic validation
  if (mobileNumber.value.length === 10) {
    stepNumber.value = 2;
    console.log(step.value)
  }

  await authStore.login(mobileNumber.value)
};

const handleVerify = () => {
  console.log("Verifying OTP:", otpCode.value);
  // Simulate verification success
  step.value = 3;
};

const handleJoin = () => {
  console.log("Joining with:", {
    mobile: mobileNumber.value,
    bhk: selectedBhk.value,
    area: area.value,
    price: price.value,
  });
  closeLoginModal();
  // Reset state
  step.value = 1;
  mobileNumber.value = "";
  otpCode.value = "";
  selectedBhk.value = "";
  area.value = "";
  price.value = "";
  // Open benefits modal
  openBenefitsModal();
};

const handleClose = () => {
  step.value = 1;
  mobileNumber.value = "";
  otpCode.value = "";
  selectedBhk.value = "";
  area.value = "";
  price.value = "";
  closeLoginModal();
};
</script>

<template>
  <Transition name="modal-fade">
    <div
      v-if="isLoginModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="handleClose"
    >
      <div
        class="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-5xl flex flex-col md:flex-row relative"
      >
        <!-- Close Button -->
        <button
          @click="isLoginModalOpen = false"
          class="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <i class="pi pi-times text-gray-600"></i>
        </button>

        <!-- Left Side: Login / Requirements -->
        <div class="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h2 class="font-marcellus text-3xl md:text-4xl mb-2">
            <span v-if="step < 3">
              Login with mobile number to explore<br />
              <span class="text-[#EB3131]">Roffr</span>
            </span>
            <span v-else>Requirements</span>
          </h2>

          <div class="mt-8">
            <!-- Step 1: Mobile Number -->
            <!-- <div >
              <div
                class="flex items-center border border-gray-300 rounded-full px-4 py-3 bg-white"
              >
                <img
                  src="https://flagcdn.com/w20/in.png"
                  alt="India"
                  class="w-6 h-4 mr-2"
                />
                <span class="text-gray-500 mr-2">+91</span>
                <input
                  v-model="mobileNumber"
                  type="tel"
                  placeholder="0000000000"
                  class="flex-1 outline-none text-gray-700 placeholder-gray-400"
                  maxlength="10"
                />
              </div>
              <p></p>

              <button
                @click="handleSignIn"
                class="w-full mt-6 bg-gradient-to-r from-[#DDA439] to-[#EB3131] text-white font-outfit font-semibold py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
              >
                Sign in
              </button>
              
            </div> -->

            <!-- Step 2: OTP Verification -->
            <!-- <div >
              <div
                class="flex items-center border border-gray-300 rounded-full px-4 py-3 bg-white"
              >
                <input
                  v-model="otpCode"
                  type="text"
                  placeholder="Enter Verification code"
                  class="flex-1 outline-none text-gray-700 placeholder-gray-400 text-center"
                  maxlength="6"
                  @keyup.enter="handleVerify"
                />
              </div>

              <button
                @click="handleVerify"
                class="w-full mt-6 bg-gradient-to-r from-[#DDA439] to-[#EB3131] text-white font-outfit font-semibold py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
              >
                Verify OTP
              </button>

              <div class="text-center mt-4">
                <p class="text-sm text-gray-600">
                  Didn't receive the code?
                  <button class="text-[#EB3131] font-semibold hover:underline">
                    Resend OTP
                  </button>
                </p>
              </div>
            </div> -->

            <!-- Step 3: Requirements -->
            <div>
              <!-- BHK Selection -->
              <div class="flex flex-wrap gap-2 mb-4">
                <button
                  v-for="bhk in bhkOptions"
                  :key="bhk"
                  @click="selectedBhk = bhk"
                  class="px-4 py-2 rounded-lg border text-sm font-outfit transition-colors"
                  :class="
                    selectedBhk === bhk
                      ? 'bg-[#EB3131] text-white border-[#EB3131]'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-[#EB3131]'
                  "
                >
                  {{ bhk }}
                </button>
              </div>

              <!-- Area Input -->
              <div
                class="flex items-center border border-gray-300 rounded-full px-4 py-3 bg-white mb-4"
              >
                <input
                  v-model="area"
                  type="text"
                  placeholder="Enter area in sq.ft."
                  class="flex-1 outline-none text-gray-700 placeholder-gray-400"
                />
              </div>

              <!-- Price Input -->
              <div
                class="flex items-center border border-gray-300 rounded-full px-4 py-3 bg-white"
              >
                <span class="text-gray-500 mr-2">₹</span>
                <input
                  v-model="price"
                  type="text"
                  placeholder="Execrated price of the project"
                  class="flex-1 outline-none text-gray-700 placeholder-gray-400"
                />
              </div>

              <button
                @click="handleJoin"
                class="w-full mt-6 bg-gradient-to-r from-[#DDA439] to-[#EB3131] text-white font-outfit font-semibold py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
              >
                Join Group Buying
              </button>
            </div>
          </div>

          <p class="text-xs text-gray-400 mt-6 leading-relaxed">
            By joining, you agree to Roffer's Terms and Conditions and consent to
            receive occasional emails from us. Please review our Privacy Policy to
            understand how we handle your personal data.
          </p>
        </div>

        <!-- Right Side: Benefits -->
        <div
          class="w-full md:w-1/2 flex flex-col relative overflow-hidden rounded-tr-3xl"
        >
          <!-- Upper Part: White Background -->
          <div class="bg-white p-6 md:p-8 rounded-tr-3xl">
            <h3 class="font-marcellus text-xl md:text-2xl leading-tight text-gray-900">
              Membership <span class="border-2 border-[#EB3131] rounded-[50%] px-2 italic text-gray-900">Benefits</span> You Get with
            </h3>
            <h2 class="font-marcellus text-3xl md:text-4xl text-[#EB3131] text-center mt-2">
              Roffr
            </h2>
          </div>

          <!-- Lower Part: Solid Background -->
          <div class="bg-white p-8 md:p-12 flex-1 flex flex-col justify-center">
            <div class="bg-gradient-to-br from-[#EB3131] to-[#DDA439] rounded-2xl p-6 pt-8 border border-white/20 relative text-white">
               <div class="absolute -top-3 right-6 bg-white text-[#EB3131] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <i class="pi pi-star-fill text-[10px]"></i> Premium
               </div>

              <ul class="space-y-4 font-outfit">
                <li class="flex items-start gap-3">
                  <i class="pi pi-check text-white mt-1"></i>
                  <span>Personal Investment Advisor</span>
                </li>
                <li class="flex items-start gap-3">
                  <i class="pi pi-check text-white mt-1"></i>
                  <span>Exclusive Discounts Up to 30%</span>
                </li>
                <li class="flex items-start gap-3">
                  <i class="pi pi-check text-white mt-1"></i>
                  <span>Permanent Community Membership</span>
                </li>
                <li class="flex items-start gap-3">
                  <i class="pi pi-check text-white mt-1"></i>
                  <span>AI-Powered Investment Insights</span>
                </li>
                <li class="flex items-start gap-3">
                  <i class="pi pi-check text-white mt-1"></i>
                  <span>Zero Brokerage Charges</span>
                </li>
                 <li class="flex items-start gap-3">
                  <i class="pi pi-check text-white mt-1"></i>
                  <span>Loyalty Benefits & Referral Incentives</span>
                </li>
              </ul>

              <button class="w-full mt-6 bg-white text-[#EB3131] font-bold py-3 rounded-full hover:bg-gray-50 transition-colors">
                  Join Community at ₹999/-
              </button>
            </div>
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
