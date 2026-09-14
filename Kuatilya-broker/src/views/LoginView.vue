<script setup lang="ts">
import { ref, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { BASE_URL, tokenStorage } from "@/request/request";
import { useAuthStore } from "@/store/AuthStore";
import { UserCheck, MapPin, ChevronRight, Smartphone } from "lucide-vue-next";

import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "vue-input-otp";
import { VueTelInput } from "vue-tel-input";
import "vue-tel-input/vue-tel-input.css";

const router = useRouter();
const authStore = useAuthStore();

// ─────────────────────────────────────────
// Step state: MOBILE → OTP → PROFILE
// ─────────────────────────────────────────
type Step = "MOBILE" | "OTP" | "PROFILE";
const step = ref<Step>("MOBILE");

const loading = ref(false);
const error   = ref("");

// Step 1 & 2 — OTP
const mobile = ref("+91");
const otp    = ref("");

// Step 3 — Profile (after first-time login)
const pendingUserId = ref(""); // filled after OTP verify
const profile = ref({
  name: "",
  city: "",
});

const indianCities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata",
  "Pune", "Ahmedabad", "Jaipur", "Raipur", "Bilaspur", "Surat",
  "Lucknow", "Indore", "Nagpur", "Chandigarh", "Bhopal",
];

const filteredCities = computed(() =>
  profile.value.city.length > 0
    ? indianCities.filter((c) =>
        c.toLowerCase().startsWith(profile.value.city.toLowerCase())
      )
    : indianCities
);

// ─────────────────────────────────────────
// Step 1: Send OTP
// ─────────────────────────────────────────
const sendOtp = async () => {
  error.value = "";
  if (!mobile.value?.trim() || mobile.value.replace(/\D/g, "").length < 10) {
    error.value = "Please enter a valid 10-digit mobile number";
    return;
  }
  try {
    loading.value = true;
    await axios.post(`${BASE_URL}/users/auth/send-otp`, {
      phoneNumber: mobile.value.trim(),
    });
    step.value = "OTP";
    toast.success("OTP sent! Use 123456 for dev");
  } catch (err: any) {
    error.value = err?.response?.data?.message || "Failed to send OTP";
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

// ─────────────────────────────────────────
// Step 2: Verify OTP
// ─────────────────────────────────────────
const verifyOtp = async () => {
  error.value = "";
  if (otp.value.length !== 6) {
    error.value = "Enter a valid 6-digit OTP";
    return;
  }
  try {
    loading.value = true;
    const res = await axios.post(`${BASE_URL}/users/auth/verify-otp`, {
      phoneNumber: mobile.value.trim(),
      otp: otp.value,
    });

    const data = res?.data?.data;
    if (!data?.accessToken) { toast.error("Login failed"); return; }

    // Store tokens + role in AuthStore (and localStorage via the store)
    const userId = data.user?._id ?? data.user?.id ?? "";
    const userRole = data.user?.role ?? 'BROKER';
    tokenStorage.setTokens(data.accessToken, data.refreshToken || "");
    tokenStorage.setUserData(userId);
    authStore.setAuth(data.accessToken, userRole, userId);

    if (data.profileComplete === false) {
      // First-time user — show profile completion step
      pendingUserId.value = userId;
      profile.value.name  = data.user?.name !== "New User" ? data.user?.name ?? "" : "";
      step.value = "PROFILE";
      toast.info("Almost done! Tell us a bit about yourself.");
    } else {
      toast.success("Welcome back!");
      // Route to correct portal based on role
      if (userRole === 'BUILDER') router.push('/builder');
      else if (userRole === 'CLIENT') router.push('/client');
      else router.push('/');
    }
  } catch (err: any) {
    error.value = err?.response?.data?.message || "Invalid OTP";
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

// ─────────────────────────────────────────
// Step 3: Complete Profile
// ─────────────────────────────────────────
const completeProfile = async () => {
  error.value = "";
  if (!profile.value.name.trim()) {
    error.value = "Your name is required"; return;
  }
  if (!profile.value.city.trim()) {
    error.value = "Your city is required"; return;
  }

  try {
    loading.value = true;
    await axios.post(`${BASE_URL}/users/profile/complete`, {
      userId: pendingUserId.value,
      name:   profile.value.name,
      role:   'BROKER', // default role — user picks their portal on /select-role next
      city:   profile.value.city,
    });
    toast.success("Profile saved! Now choose your portal 🎉");
    // Send new users to role selection so they pick BROKER / BUILDER / CLIENT
    router.push("/select-role");
  } catch (err: any) {
    error.value = err?.response?.data?.message || "Failed to save profile";
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

const selectCity = (city: string) => {
  profile.value.city = city;
};
</script>

<template>
  <main class="min-h-screen flex items-center justify-center px-4 bg-background">

    <div class="w-full max-w-md space-y-6">

      <!-- ═══════════════════════════════════
           STEP 1 + 2: Mobile + OTP Card
      ═══════════════════════════════════ -->
      <Card
        v-if="step === 'MOBILE' || step === 'OTP'"
        class="w-full bg-card/80 backdrop-blur border-border rounded-xl"
      >
        <CardHeader>
          <div class="flex items-center gap-3 mb-1">
            <div class="rounded-full bg-primary/10 p-2">
              <Smartphone class="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle class="text-2xl">{{ step === 'MOBILE' ? 'Welcome Back' : 'Verify OTP' }}</CardTitle>
              <CardDescription>
                {{ step === 'MOBILE'
                    ? 'Enter your mobile number to receive a one-time password'
                    : `OTP sent to ${mobile}` }}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent class="space-y-5">
          <!-- Phone input -->
          <div class="space-y-2">
            <label class="text-sm font-medium">Mobile Number</label>
            <VueTelInput
              v-model="mobile"
              mode="international"
              :default-country="'IN'"
              :enabled-country-code="true"
              :disabled="step === 'OTP'"
            />
          </div>

          <!-- OTP input -->
          <div v-if="step === 'OTP'" class="space-y-3">
            <label class="text-sm font-medium">Enter 6-digit OTP</label>
            <p class="text-xs text-muted-foreground">Use <strong>123456</strong> for development</p>
            <InputOTP
              v-model="otp"
              :maxlength="6"
              :pattern="REGEXP_ONLY_DIGITS_AND_CHARS"
            >
              <InputOTPGroup>
                <InputOTPSlot v-for="i in 6" :key="i" :index="i - 1" />
              </InputOTPGroup>
            </InputOTP>
            <button
              type="button"
              class="text-xs text-muted-foreground hover:text-primary transition"
              @click="sendOtp"
            >
              Didn't receive code? <span class="underline font-medium">Resend OTP</span>
            </button>
          </div>

          <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
        </CardContent>

        <CardFooter class="flex flex-col gap-3">
          <Button
            v-if="step === 'MOBILE'"
            class="w-full text-base"
            :disabled="loading"
            @click="sendOtp"
          >
            {{ loading ? 'Sending...' : 'Get OTP' }}
          </Button>
          <Button
            v-else
            class="w-full text-base"
            :disabled="otp.length !== 6 || loading"
            @click="verifyOtp"
          >
            {{ loading ? 'Verifying...' : 'Verify & Login' }}
          </Button>

          <p class="text-center text-sm text-muted-foreground">
            Don't have an account?
            <router-link to="/auth/register" class="text-primary underline underline-offset-2 ml-1">
              Register
            </router-link>
          </p>
        </CardFooter>
      </Card>

      <!-- ═══════════════════════════════════
           STEP 3: Profile Completion
      ═══════════════════════════════════ -->
      <Card
        v-else-if="step === 'PROFILE'"
        class="w-full bg-card/80 backdrop-blur border-border rounded-xl"
      >
        <CardHeader>
          <div class="flex items-center gap-3 mb-1">
            <div class="rounded-full bg-primary/10 p-2">
              <UserCheck class="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle class="text-2xl">Complete Your Profile</CardTitle>
              <CardDescription>Just a few details to get you started</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent class="space-y-5">
          <!-- Name -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Your Full Name *</label>
            <Input
              v-model="profile.name"
              placeholder="e.g. Aayush Agarwal"
              class="text-base"
            />
          </div>

          <!-- Role / Account Type -->
          <div class="space-y-2">
            <label class="text-sm font-medium">Select Account Type *</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="r in roles"
                :key="r.value"
                type="button"
                class="rounded-lg border px-3 py-2 text-sm font-medium transition-all"
                :class="profile.role === r.value
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-background border-border text-muted-foreground hover:border-primary hover:text-foreground'"
                @click="profile.role = r.value as any"
              >
                {{ r.label }}
              </button>
            </div>
          </div>

          <!-- City -->
          <div class="space-y-1.5 relative">
            <label class="text-sm font-medium flex items-center gap-1.5">
              <MapPin class="w-4 h-4 text-primary" /> Your City *
            </label>
            <Input
              v-model="profile.city"
              placeholder="e.g. Raipur"
              autocomplete="off"
            />
            <!-- Autocomplete dropdown -->
            <div
              v-if="profile.city.length > 0 && filteredCities.length > 0 && !indianCities.includes(profile.city)"
              class="absolute z-50 w-full bg-popover border border-border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto"
            >
              <button
                v-for="city in filteredCities.slice(0, 6)"
                :key="city"
                type="button"
                class="w-full text-left px-4 py-2 text-sm hover:bg-accent transition"
                @click="selectCity(city)"
              >
                {{ city }}
              </button>
            </div>
          </div>

          <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
        </CardContent>

        <CardFooter>
          <Button
            class="w-full text-base"
            :disabled="loading"
            @click="completeProfile"
          >
            {{ loading ? 'Saving...' : "Let's Go →" }}
          </Button>
        </CardFooter>
      </Card>
    </div>
  </main>
</template>
