<script setup lang="ts">
import { ref, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { BASE_URL } from "@/request/request";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

import { Check, ChevronsUpDown, ChevronDown } from "lucide-vue-next";
import { VueTelInput } from "vue-tel-input";
import "vue-tel-input/vue-tel-input.css";

const router = useRouter();

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// State
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const loading = ref(false);
const error = ref("");
const regionSearch = ref("");
const agreedToDeclaration = ref(false);
const isNetworkDetailsOpen = ref(false);

const form = ref({
  firstName: "",
  lastName: "",
  mobile: "+91",
  email: "",
  brokerType: "",
  businessTypes: [] as string[],
  regions: [] as string[],
  gstin: "",
  reraNumber: "",
  agencyTeamSize: "",
  instagram: "",
  facebook: "",
  language: "English",
  networkCode: "",
});

// Options
const businessTypeOptions = ["Resale", "Rental"];
const brokerTypes = ["Individual", "Agency"];
const languages = ["English", "Hindi", "Marathi", "Gujarati", "Tamil", "Telugu", "Kannada", "Malayalam", "Bengali", "Punjabi"];

// Top Indian Cities
const indianCities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", 
  "Pune", "Ahmedabad", "Jaipur", "Raipur", "Bilaspur", "Surat", 
  "Lucknow", "Indore", "Nagpur", "Chandigarh", "Bhopal",
];

const filteredCities = computed(() =>
  indianCities.filter((city) =>
    city.toLowerCase().includes(regionSearch.value.toLowerCase()),
  ),
);

const toggleRegion = (city: string) => {
  if (form.value.regions.includes(city)) {
    form.value.regions = form.value.regions.filter((r) => r !== city);
  } else {
    form.value.regions.push(city);
  }
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Submit
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const register = async () => {
  error.value = "";

  if (!form.value.firstName || !form.value.mobile || form.value.mobile.replace(/\D/g, "").length < 10 || !form.value.email) {
    error.value = "Please fill all required account fields";
    return;
  }

  if (!agreedToDeclaration.value) {
    error.value = "You must agree to the declaration to proceed";
    return;
  }

  try {
    loading.value = true;
    const cleanMobile = form.value.mobile.replace(/\D/g, "").slice(-10);

    const name = [form.value.firstName, form.value.lastName].filter(Boolean).join(" ") || "Broker";
    const phoneNumber = form.value.mobile.startsWith("+") ? form.value.mobile : `+91${cleanMobile}`;
    
    const response = await axios.post(`${BASE_URL}/users/register`, {
      name,
      phoneNumber: phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`,
      email: form.value.email || undefined,
    });

    if (response.status === 201 || response.data?.data) {
      toast.success(response.data?.message ?? "Registered successfully. Contact admin to complete setup, then login.");
      router.push("/auth/login");
    }
  } catch (err: any) {
    toast.error("There was an error while registering, please try again later");
    error.value = err?.response?.data?.message || "Registration failed";
  } finally {
    loading.value = false;
  }
};

const currentSlide = ref(0);

const slides = [
  {
    title: "Manage your sourcing operations from a single dashboard.",
    desc: "Track agents, leads, projects, and site visits in one place.",
  },
  {
    title: "Grow your broker network effortlessly.",
    desc: "Connect with top agents and expand your reach faster.",
  },
  {
    title: "Make smarter real estate decisions.",
    desc: "Get insights and track performance in real time.",
  },
];

// Auto slide
setInterval(() => {
  currentSlide.value = (currentSlide.value + 1) % slides.length;
}, 3000);
</script>

<template>
  <main class="min-h-screen bg-black flex items-center justify-center p-4">
    <!-- Main Container matches screenshot aspect ratio -->
    <div class="w-full max-w-[1200px] h-[85vh] min-h-[600px] max-h-[800px] flex gap-4">
      
      <!-- Left Panel (Carousel) -->
      <div class="hidden md:flex flex-1 flex-col justify-between bg-zinc-950/80 rounded-2xl border border-white/5 relative overflow-hidden">
        <!-- Optional subtle glow effect -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent opacity-50 blur-3xl pointer-events-none"></div>

        <div class="flex-1 flex flex-col items-center justify-center text-center px-10 relative z-10">
          <!-- Logo -->
          <div class="mb-12 flex items-center gap-2">
            <!-- R CIRCLE logo removed -->
          </div>

          <h2 class="text-[32px] leading-[1.2] font-semibold text-white mb-4 max-w-[400px]">
            {{ slides[currentSlide].title }}
          </h2>
          <p class="text-zinc-400 text-[15px] max-w-[350px]">
            {{ slides[currentSlide].desc }}
          </p>
        </div>

        <!-- Dots -->
        <div class="flex justify-center gap-2 pb-10 relative z-10">
          <span
            v-for="(s, i) in slides"
            :key="i"
            class="h-1.5 rounded-full transition-all duration-300"
            :class="i === currentSlide ? 'bg-white w-6' : 'bg-zinc-600 w-1.5'"
          />
        </div>
      </div>

      <!-- Right Panel (Form) -->
      <div class="flex-1 flex flex-col bg-zinc-950/80 rounded-2xl border border-white/5 relative overflow-hidden">
        
        <!-- Form Header (Fixed) -->
        <div class="pt-10 px-10 pb-6 shrink-0">
          <div class="text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase mb-4">
            Broker Onboarding
          </div>
          <h1 class="text-[28px] font-semibold text-white mb-3">Create account</h1>
          <p class="text-[15px] text-zinc-400 leading-relaxed max-w-md">
            Register to start managing your real estate business â€” one dashboard for leads, projects, and site visits.
          </p>
        </div>

        <!-- Scrollable Form Area -->
        <div class="flex-1 overflow-y-auto px-10 pb-8 custom-scrollbar">
          
          <!-- ACCOUNT SECTION -->
          <div class="text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase mt-2 mb-6">
            Account
          </div>
          
          <div class="grid grid-cols-2 gap-x-4 gap-y-5">
            <div class="space-y-2">
              <label class="text-[13px] font-medium text-zinc-200">First name <span class="text-red-500">*</span></label>
              <Input v-model="form.firstName" class="bg-zinc-950/50 border-zinc-800 focus:bg-white focus:text-black transition-colors" />
            </div>
            <div class="space-y-2">
              <label class="text-[13px] font-medium text-zinc-200">Last name</label>
              <Input v-model="form.lastName" placeholder="Last name" class="bg-zinc-950/50 border-zinc-800 placeholder:text-zinc-600" />
            </div>

            <div class="col-span-2 space-y-2">
              <label class="text-[13px] font-medium text-zinc-200">Phone number</label>
              <!-- VueTelInput styling override in css -->
              <VueTelInput
                v-model="form.mobile"
                mode="international"
                :default-country="'IN'"
                :enabled-country-code="true"
                class="bg-zinc-950/50 border-zinc-800 rounded-md"
              />
            </div>

            <div class="col-span-2 space-y-2">
              <label class="text-[13px] font-medium text-zinc-200">Email <span class="text-red-500">*</span></label>
              <Input v-model="form.email" type="email" placeholder="email@gmail.com" class="bg-zinc-950/50 border-zinc-800 placeholder:text-zinc-600" />
            </div>
          </div>

          <!-- BROKER PROFILE SECTION -->
          <div class="text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase mt-10 mb-6">
            Broker Profile
          </div>

          <div class="grid grid-cols-2 gap-x-4 gap-y-5">
            <Select v-model="form.brokerType">
              <SelectTrigger class="bg-zinc-950/50 border-zinc-800">
                <SelectValue placeholder="Select broker type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="type in brokerTypes" :key="type" :value="type">
                  {{ type }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="form.language">
              <SelectTrigger class="bg-zinc-950/50 border-zinc-800">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="lang in languages" :key="lang" :value="lang">
                  {{ lang }}
                </SelectItem>
              </SelectContent>
            </Select>

            <!-- Agency Team Size -->
            <div v-if="form.brokerType === 'Agency'" class="col-span-2 space-y-2">
              <label class="text-[13px] font-medium text-zinc-200">Agency Team Size</label>
              <Input v-model="form.agencyTeamSize" placeholder="e.g. 10-50" class="bg-zinc-950/50 border-zinc-800" />
            </div>

            <!-- Business Types -->
            <div class="col-span-2 space-y-3">
              <p class="text-[13px] font-medium text-zinc-200">Business types</p>
              <div class="flex gap-6">
                <label v-for="type in businessTypeOptions" :key="type" class="flex items-center gap-2.5 text-[13px] text-zinc-300 cursor-pointer">
                  <div class="relative flex items-center justify-center">
                    <Checkbox
                      :checked="form.businessTypes.includes(type)"
                      @update:checked="
                        $event
                          ? form.businessTypes.push(type)
                          : form.businessTypes.splice(form.businessTypes.indexOf(type), 1)
                      "
                      class="border-zinc-700 data-[state=checked]:bg-zinc-800 data-[state=checked]:text-white w-4 h-4 rounded-sm"
                    />
                  </div>
                  {{ type }}
                </label>
              </div>
            </div>

            <!-- Regions Multi Select -->
            <div class="col-span-2 space-y-2 mt-2">
              <p class="text-[13px] font-medium text-zinc-200">Select regions</p>
              <Popover>
                <PopoverTrigger as-child>
                  <Button variant="outline" role="combobox" class="w-full justify-between bg-zinc-950/50 border-zinc-800 font-normal text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300">
                    <span v-if="form.regions.length === 0">Select regions</span>
                    <span v-else class="text-white">{{ form.regions.join(", ") }}</span>
                    <ChevronsUpDown class="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-full p-0 border-zinc-800 bg-zinc-950">
                  <Command class="bg-transparent">
                    <CommandInput placeholder="Search city..." v-model="regionSearch" class="border-none focus:ring-0" />
                    <CommandEmpty>No city found.</CommandEmpty>
                    <CommandGroup class="max-h-[200px] overflow-y-auto">
                      <CommandItem v-for="city in filteredCities" :key="city" @select="toggleRegion(city)" class="cursor-pointer hover:bg-zinc-900 data-[selected]:bg-zinc-900">
                        <Check class="mr-2 h-4 w-4" :class="form.regions.includes(city) ? 'opacity-100 text-white' : 'opacity-0'" />
                        {{ city }}
                      </CommandItem>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div class="space-y-2">
              <label class="text-[13px] font-medium text-zinc-200">GSTIN <span class="text-zinc-500 font-normal">(optional)</span></label>
              <Input v-model="form.gstin" placeholder="GSTIN" class="bg-zinc-950/50 border-zinc-800 placeholder:text-zinc-600 uppercase" />
            </div>
            <div class="space-y-2">
              <label class="text-[13px] font-medium text-zinc-200">RERA number <span class="text-zinc-500 font-normal">(optional)</span></label>
              <Input v-model="form.reraNumber" placeholder="RERA agent no." class="bg-zinc-950/50 border-zinc-800 placeholder:text-zinc-600 uppercase" />
            </div>

            <!-- Network registration details (Accordion) -->
            <div class="col-span-2 mt-4">
              <div 
                class="border border-zinc-800 bg-zinc-950/30 rounded-lg p-4 cursor-pointer hover:bg-zinc-900/50 transition-colors select-none"
                @click="isNetworkDetailsOpen = !isNetworkDetailsOpen"
              >
                <div class="flex justify-between items-center">
                  <div>
                    <div class="text-[13px] font-semibold text-white mb-1">Network registration details</div>
                    <div class="text-[12px] text-zinc-500">CN-001 â€” optional but recommended for faster onboarding</div>
                  </div>
                  <ChevronDown class="w-4 h-4 text-zinc-500 transition-transform duration-200" :class="{ 'rotate-180': isNetworkDetailsOpen }" />
                </div>
                
                <div v-if="isNetworkDetailsOpen" class="mt-4 pt-4 border-t border-zinc-800/50">
                  <div class="space-y-2">
                    <label class="text-[13px] font-medium text-zinc-200">Network Code</label>
                    <Input v-model="form.networkCode" placeholder="Enter network code" class="bg-zinc-900/50 border-zinc-800 placeholder:text-zinc-600 uppercase" />
                  </div>
                </div>
              </div>
            </div>

            <!-- DECLARATION SECTION -->
            <div class="col-span-2 mt-4">
              <div class="text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase mb-4">
                Declaration
              </div>
              <p class="text-[13px] text-zinc-400 leading-relaxed mb-4">
                I declare that the information above is true and complete. I understand that any violation of platform policies may result in suspension or removal.
              </p>
              
              <label class="flex items-start gap-3 cursor-pointer group">
                <div class="relative flex items-center justify-center mt-0.5">
                  <Checkbox
                    :checked="agreedToDeclaration"
                    @update:checked="agreedToDeclaration = $event"
                    class="border-zinc-700 data-[state=checked]:bg-white data-[state=checked]:text-black w-4 h-4 rounded-sm"
                  />
                </div>
                <span class="text-[13px] text-zinc-300 group-hover:text-zinc-100 transition-colors select-none">
                  I agree to the declaration above. <span class="text-red-500">*</span>
                </span>
              </label>
            </div>
            
            <p v-if="error" class="col-span-2 text-[13px] text-red-500 mt-2">
              {{ error }}
            </p>
          </div>
        </div>

        <!-- Form Footer (Fixed) -->
        <div class="px-10 py-6 border-t border-white/5 shrink-0 bg-zinc-950">
          <Button 
            class="w-full bg-white text-black hover:bg-zinc-200 font-semibold h-11 text-[15px] rounded-lg transition-colors"
            :loading="loading" 
            @click="register"
          >
            Create account
          </Button>
          
          <p class="text-center text-[13px] text-zinc-500 mt-5">
            Already have an account?
            <router-link to="/auth/login" class="text-white font-medium hover:underline underline-offset-4 ml-1 transition-all">
              Log in
            </router-link>
          </p>
        </div>

      </div>
    </div>
  </main>
</template>

<style>
/* Custom scrollbar for the right panel */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  margin-block: 8px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3f3f46;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #52525b;
}

/* Fix VueTelInput styling to match dark theme */
.vue-tel-input {
  border: 1px solid #27272a !important;
  box-shadow: none !important;
}
.vue-tel-input:focus-within {
  border-color: #52525b !important;
  box-shadow: 0 0 0 1px #52525b !important;
}
.vti__input {
  background-color: transparent !important;
  color: white !important;
}
.vti__dropdown {
  background-color: transparent !important;
  transition: all 0.2s !important;
}
.vti__dropdown:hover {
  background-color: rgba(255, 255, 255, 0.05) !important;
}
.vti__dropdown-list {
  background-color: #09090b !important;
  border: 1px solid #27272a !important;
  color: white !important;
}
.vti__dropdown-item.highlighted {
  background-color: #27272a !important;
}
</style>
