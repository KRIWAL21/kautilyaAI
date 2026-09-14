<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useCustomerStore } from "@/stores/customerStore";
import { storeToRefs } from "pinia";

const router = useRouter();
const authStore = useAuthStore();
const customerStore = useCustomerStore();

const { otpData } = storeToRefs(authStore);

const step = ref(1);
const mobileNumber = ref("");
const otpCode = ref("");
const error = ref("");
const loading = ref(false);

// Step 3 State
const selectedBhk = ref("");
const area = ref("");
const price = ref("");
const bhkOptions = ["1 bhk", "2 bhk", "3 bhk", "4 bhk", "5 bhk"];

const handleSignIn = async () => {
  error.value = "";
  if (mobileNumber.value.length !== 10) {
    error.value = "Please enter a valid 10-digit mobile number";
    return;
  }

  loading.value = true;
  try {
    const result = await authStore.login(mobileNumber.value);
    console.log(result);
    if (result) {
      step.value = 2; // Move to OTP step instead of direct redirect
    } else {
      error.value = result.message || "Login failed. Please try again.";
    }
  } catch (err) {
    error.value = "An error occurred. Please try again.";
  } finally {
    loading.value = false;
  }
};

const handleVerify = async () => {
  loading.value = true;
  error.value = "";
  try {
    const result = await authStore.verifyOtp(mobileNumber.value, otpCode.value);
    // authStore.verifyOtp persists session via setSession() on success.
    if (authStore.isAuthenticated) {
      step.value = 3;
    } else {
      error.value = result?.message || "Invalid OTP. Please try again.";
    }
  } catch (err) {
    console.error("OTP verification error:", err);
    error.value =
      err?.response?.data?.message || "Invalid OTP. Please try again.";
  } finally {
    loading.value = false;
  }
};

const handleJoin = async () => {
  if (!selectedBhk.value) {
    error.value = "Please fill all requirements to join.";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const customerId =
      authStore.user?._id || localStorage.getItem("customerId");

    if (customerId) {
      // Refresh profile in the background; don't block navigation if it fails.
      authStore.getCurrentUserData(customerId).catch(() => {});
    }

    localStorage.setItem(
      "userRequirements",
      JSON.stringify({ bhk: selectedBhk.value }),
    );

    router.push("/");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen relative bg-[#1a1a1a] font-outfit flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <!-- Background Image Overlay -->
    <div class="absolute inset-0 z-0 opacity-40">
      <img
        src="/images/heroSection/hero-bg.webp"
        alt="Background"
        class="w-full h-full object-cover"
      />
    </div>

    <!-- Centered Card (height a bit bigger) -->
    <div
      class="w-full max-w-2xl bg-white rounded-3xl shadow-2xl relative z-10 flex flex-col md:flex-row overflow-hidden items-center justify-center min-h-[520px] md:min-h-[560px] max-h-[350px]"
    >
      <!-- Left: Only image -->
      <!-- <div class="hidden md:block md:w-1/2 relative border">
        <img
          src="/images/LoginPage/login-bg.webp"
          alt="Roffr"
          class="w-full h-full object-cover"
        />
      </div> -->

      <!-- Right: Form -->
      <div class="w-full flex flex-col">
        <!-- Back Button -->
        <div class="flex items-center justify-between px-6 pt-4">
          <button
            @click="router.push('/')"
            class="text-sm text-gray-500 hover:underline"
          >
            ← Back
          </button>
        </div>

        <div class="px-6 pb-8 pt-2">
          <!-- Header (unchanged fonts) -->
          <div class="text-left mb-6">
            <h2 class="text-2xl md:text-[40px] leading-relaxed font-marcellus text-gray-900">
              <span v-if="step < 3">
                Login with mobile number to <br/>explore <span class="text-orange-500">ROFFR</span>
              </span>
              <span v-else>Requirements</span>
            </h2>
            <p class="mt-2 text-sm text-gray-600">
              <span v-if="step === 1">Sign in with your mobile number</span>
              <span v-else-if="step === 2">Enter verification code</span>
              <span v-else>Tell us what you are looking for</span>
            </p>
          </div>

          <!-- Step 1 -->
          <div class="space-y-6">
            <div v-if="step === 1">
              <div
                class="flex items-center border border-gray-300 rounded-md px-4 py-3 bg-white hover:border-[#EB3131] transition-colors"
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
                  @keyup.enter="handleSignIn"
                />
              </div>

              <button
                @click="handleSignIn"
                :disabled="loading"
                class="w-full mt-4 base-btn flex justify-center text-white font-outfit font-semibold py-3 rounded-md hover:bg-gray-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {{ loading ? "Signing in..." : "Sign in" }}
              </button>
            </div>

            <!-- Step 2 -->
            <div v-else-if="step === 2">
              <p class="text-xs text-gray-500 mb-2">Otp is: {{ otpData }}</p>
              <div
                class="flex items-center border border-gray-300 rounded-md px-4 py-3 bg-white hover:border-[#EB3131] transition-colors"
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
                :disabled="loading"
                class="w-full mt-4 base-btn flex justify-center text-white font-outfit font-semibold py-3 rounded-md hover:bg-gray-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {{ loading ? "Verifying..." : "Verify OTP" }}
              </button>

              <div class="text-left mt-3">
                <p class="text-xs text-gray-600">
                  Didn't receive the code?
                  <button
                    class="text-[#EB3131] font-semibold hover:underline ml-1"
                  >
                    Resend OTP
                  </button>
                </p>
              </div>
            </div>

            <!-- Step 3 -->
            <div v-else>
              <div class="flex flex-wrap gap-2 mb-4">
                <button
                  v-for="bhk in bhkOptions"
                  :key="bhk"
                  @click="selectedBhk = bhk"
                  class="px-4 py-2 rounded-md border text-xs font-outfit transition-colors"
                  :class="
                    selectedBhk === bhk
                      ? 'bg-[#EB3131] text-white border-[#EB3131]'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-[#EB3131]'
                  "
                >
                  {{ bhk }}
                </button>
              </div>

              <!-- <div
                class="flex items-center border border-gray-300 rounded-md px-4 py-3 bg-white mb-3 hover:border-[#EB3131] transition-colors"
              >
                <input
                  v-model="area"
                  type="text"
                  placeholder="Enter area in sq.ft."
                  class="flex-1 outline-none text-gray-700 placeholder-gray-400 text-sm"
                />
              </div>

              <div
                class="flex items-center border border-gray-300 rounded-md px-4 py-3 bg-white hover:border-[#EB3131] transition-colors"
              >
                <span class="text-gray-500 mr-2 text-sm">₹</span>
                <input
                  v-model="price"
                  type="text"
                  placeholder="Expected price of the project"
                  class="flex-1 outline-none text-gray-700 placeholder-gray-400 text-sm"
                />
              </div> -->

              <button
                @click="handleJoin"
                type="button"
                class="w-full mt-4 base-btn flex justify-center text-white font-outfit font-semibold py-3 rounded-md hover:bg-gray-900 transition-all"
              >
                Register
              </button>
            </div>

            <div
              v-if="error"
              class="text-red-500 text-xs text-left bg-red-50 py-2 px-3 rounded-md"
            >
              {{ error }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


