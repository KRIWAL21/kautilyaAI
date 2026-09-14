<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useBrokerStore } from "@/stores/brokerStore";

const route = useRoute();
const router = useRouter();

const brokerStore = useBrokerStore();
const { brokerData } = storeToRefs(brokerStore);

const submitting = ref(false);
const submitMsg = ref("");
const contactForm = ref({
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
});

// brokerData in the store is shaped { user, totalSiteVisits } when fetched by id.
const broker = computed(() => brokerData.value?.user ?? brokerData.value ?? {});
const totalSiteVisits = computed(() => brokerData.value?.totalSiteVisits ?? 0);

const initials = (name) =>
  (name || "?")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const redactName = (name) => {
  if (!name) return "Broker";
  return name
    .split(" ")
    .map((word, i) =>
      i === 0
        ? word.slice(0, 3) + "*".repeat(Math.max(0, word.length - 3))
        : word[0] + "*".repeat(Math.max(0, word.length - 1))
    )
    .join(" ");
};

const loadBroker = async (id) => {
  if (!id) return;
  await brokerStore.getBrokerData(id);
};

onMounted(() => {
  loadBroker(route.params.id);
});

watch(
  () => route.params.id,
  (id) => loadBroker(id),
);

const handleConnect = () => {
  if (!contactForm.value.phone) {
    submitMsg.value = "Phone is required.";
    return;
  }
  submitting.value = true;
  submitMsg.value = "";
  // TODO: wire to a real "request callback" endpoint when one is exposed.
  setTimeout(() => {
    submitting.value = false;
    submitMsg.value = "Thanks — the partner will reach out shortly.";
    contactForm.value = { firstName: "", lastName: "", phone: "", email: "" };
  }, 600);
};
</script>

<template>
  <section class="max-w-7xl mx-auto py-10 px-4 2xl:px-0 mt-10">
    <button
      @click="router.back()"
      class="text-sm text-gray-500 hover:text-gray-900 mb-4 inline-flex items-center gap-1"
    >
      <i class="pi pi-arrow-left text-xs"></i> Back
    </button>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- LEFT (70%) -->
      <div class="w-full lg:w-[70%]">
        <div class="flex items-center gap-4 mb-4">
          <div
            class="h-20 w-20 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-bold border-4 border-white shadow"
          >
            <img
              v-if="broker?.brokerImage"
              :src="broker.brokerImage"
              :alt="broker.name"
              class="h-full w-full rounded-full object-cover"
            />
            <span v-else>{{ initials(broker?.name) }}</span>
          </div>
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">
              {{ redactName(broker?.name) }}
            </h1>
            <p class="text-sm text-gray-500">
              {{ broker?.firmName || "Independent" }}
            </p>
          </div>
        </div>

        <div class="border-b mb-6"></div>

        <h2 class="text-lg font-semibold mb-4">About the firm</h2>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div>
            <p class="text-gray-500 text-xs uppercase tracking-wider">Phone</p>
            <p class="mt-1 text-sm text-gray-800">**********</p>
          </div>
          <div>
            <p class="text-gray-500 text-xs uppercase tracking-wider">Email</p>
            <p class="mt-1 text-sm text-gray-800 truncate">
              {{ broker?.email || "—" }}
            </p>
          </div>
          <div>
            <p class="text-gray-500 text-xs uppercase tracking-wider">RERA ID</p>
            <p class="mt-1 text-sm text-gray-800">
              {{ broker?.reraNumber || "—" }}
            </p>
          </div>
        </div>

        <h2 class="text-lg font-semibold mb-3">Activity</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-orange-50 rounded-xl p-3">
            <p class="text-xs text-orange-700">Site visits</p>
            <p class="text-2xl font-bold text-orange-800 mt-1">
              {{ totalSiteVisits }}
            </p>
          </div>
          <div class="bg-blue-50 rounded-xl p-3">
            <p class="text-xs text-blue-700">Total leads</p>
            <p class="text-2xl font-bold text-blue-800 mt-1">
              {{ broker?.totalLeads ?? 0 }}
            </p>
          </div>
          <div class="bg-green-50 rounded-xl p-3">
            <p class="text-xs text-green-700">Closed deals</p>
            <p class="text-2xl font-bold text-green-800 mt-1">
              {{ broker?.totalClosedDeals ?? 0 }}
            </p>
          </div>
          <div class="bg-purple-50 rounded-xl p-3">
            <p class="text-xs text-purple-700">Chanakya points</p>
            <p class="text-2xl font-bold text-purple-800 mt-1">
              {{ broker?.chanakyaPoints ?? 0 }}
            </p>
          </div>
        </div>
      </div>

      <!-- RIGHT (30%) — Contact form -->
      <div class="w-full lg:w-[30%]">
        <div class="border rounded-xl p-4 flex flex-col gap-3 bg-white">
          <h3 class="font-semibold text-gray-900">Connect with this partner</h3>

          <input
            v-model="contactForm.firstName"
            type="text"
            placeholder="First name"
            class="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
          />
          <input
            v-model="contactForm.lastName"
            type="text"
            placeholder="Last name"
            class="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
          />

          <div class="flex border rounded-md overflow-hidden">
            <div class="flex items-center px-3 border-r gap-2 text-sm bg-gray-50">
              🇮🇳 +91
            </div>
            <input
              v-model="contactForm.phone"
              type="tel"
              placeholder="Phone number"
              class="w-full px-3 py-2 text-sm outline-none"
            />
          </div>

          <input
            v-model="contactForm.email"
            type="email"
            placeholder="Email"
            class="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
          />

          <button
            @click="handleConnect"
            :disabled="submitting"
            class="bg-black text-white py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
          >
            {{ submitting ? "Sending…" : "Request callback" }}
          </button>

          <p
            v-if="submitMsg"
            class="text-xs text-center"
            :class="submitMsg.startsWith('Thanks') ? 'text-green-600' : 'text-red-500'"
          >
            {{ submitMsg }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
