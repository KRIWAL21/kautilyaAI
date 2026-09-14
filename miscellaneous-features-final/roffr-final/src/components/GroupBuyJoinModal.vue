<script setup>
import { ref, computed, watch } from "vue";
import { useGroupBuyStore } from "@/stores/groupBuyStore";
import { toast } from "vue3-toastify";

const props = defineProps({
  open: { type: Boolean, default: false },
  campaign: { type: Object, required: true },
  customerId: { type: String, default: "" },
  project: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["close", "joined"]);

const groupBuyStore = useGroupBuyStore();

const submitting = ref(false);
const submitted = ref(false); // flip to success state after submit
const brokerPhone = ref(""); // optional broker mobile (10-digit, country code optional)
const brokerPhoneError = ref("");

// Token = average of project's min & max price × tokenPercent (or flat tokenAmount)
const tokenAmount = computed(() => {
  const c = props.campaign || {};
  if (c.tokenAmount) return Math.round(Number(c.tokenAmount));
  const min = Number(props.project?.minPrice) || 0;
  const max = Number(props.project?.maxPrice) || 0;
  let base = 0;
  if (min && max) base = (min + max) / 2;
  else base = min || max || Number(props.project?.avgPrice) || 0;
  const pct = Number(c.tokenPercent ?? 0.01);
  return Math.max(1, Math.round((base * pct) / 100));
});

const discountSummary = computed(() => {
  const tiers = props.campaign?.discountTiers || [];
  if (!tiers.length) return "Tiered discounts unlock as more members join.";
  return tiers
    .map(
      (t) =>
        `${t.minMembers}+ members → ${t.discountPercent}% off${
          t.label ? ` (${t.label})` : ""
        }`,
    )
    .join(" · ");
});

watch(
  () => props.open,
  (v) => {
    if (v) {
      submitted.value = false;
      brokerPhone.value = "";
      brokerPhoneError.value = "";
    }
  },
);

const validateBrokerPhone = () => {
  const raw = (brokerPhone.value || "").trim();
  if (!raw) {
    brokerPhoneError.value = "";
    return true; // optional
  }
  const digits = raw.replace(/\D/g, "");
  // Accept 10-digit, 12-digit (91xxxxxxxxxx)
  if (digits.length === 10 || (digits.length === 12 && digits.startsWith("91"))) {
    brokerPhoneError.value = "";
    return true;
  }
  brokerPhoneError.value =
    "Enter a 10-digit mobile (or include +91/91 prefix).";
  return false;
};

const close = () => {
  if (submitting.value) return;
  emit("close");
};

const submit = async () => {
  if (!props.customerId) {
    toast.error("Please log in to join the group buy.");
    return;
  }
  if (!validateBrokerPhone()) {
    return;
  }
  submitting.value = true;
  try {
    const created = await groupBuyStore.createRequest({
      campaignId: props.campaign._id,
      customerId: props.customerId,
      associatedBrokerPhone: brokerPhone.value?.trim() || undefined,
    });
    if (!created?._id) {
      throw new Error("Could not create group-buy request");
    }
    submitted.value = true;
    emit("joined");
  } catch (e) {
    const msg =
      e?.response?.data?.message ||
      e?.message ||
      "Could not submit group-buy request.";
    toast.error(msg);
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <Transition name="modal-fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col relative overflow-hidden"
      >
        <button
          @click="close"
          class="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <i class="pi pi-times text-gray-600"></i>
        </button>

        <div class="p-6 bg-gradient-to-r from-[#EB3131] to-[#DDA439] text-white">
          <p class="text-xs uppercase tracking-wide opacity-80">Group buy</p>
          <h2 class="text-xl md:text-2xl font-bold mt-1">
            {{ campaign?.title || "Join group buy" }}
          </h2>
          <p class="text-xs md:text-sm mt-1 opacity-90">
            {{ discountSummary }}
          </p>
        </div>

        <!-- BEFORE SUBMIT -->
        <div v-if="!submitted" class="p-6 space-y-5">
          <div class="rounded-2xl border border-gray-200 p-4 text-center">
            <p class="text-xs uppercase tracking-wide text-gray-500">
              Token to pay (offline)
            </p>
            <p class="text-3xl font-bold text-[#EB3131] mt-1">
              ₹ {{ Number(tokenAmount).toLocaleString("en-IN") }}
            </p>
            <p class="text-xs text-gray-500 mt-2 leading-snug">
              Pay this amount directly to the builder or sourcing manager. They
              will confirm receipt and accept your request — you'll see it in
              <strong>My Group Buys</strong>.
            </p>
          </div>

          <div>
            <label class="text-xs text-gray-600">
              Broker mobile number
              <span class="text-gray-400 font-normal">(optional)</span>
            </label>
            <div
              class="flex items-center border rounded-full px-4 py-2.5 mt-1 bg-white"
              :class="brokerPhoneError ? 'border-red-400' : 'border-gray-300'"
            >
              <span class="text-gray-500 text-sm mr-2">+91</span>
              <input
                v-model="brokerPhone"
                @blur="validateBrokerPhone"
                type="tel"
                inputmode="numeric"
                maxlength="13"
                placeholder="Your broker's mobile"
                class="flex-1 outline-none text-gray-700 placeholder-gray-400 text-sm"
              />
            </div>
            <p
              v-if="brokerPhoneError"
              class="text-xs text-red-500 mt-1"
            >
              {{ brokerPhoneError }}
            </p>
            <p v-else class="text-[11px] text-gray-400 mt-1">
              If a broker referred you, share their number so they get credit.
            </p>
          </div>

          <button
            @click="submit"
            :disabled="submitting"
            class="w-full bg-gradient-to-r from-[#EB3131] to-[#DDA439] text-white font-bold py-3 rounded-full hover:opacity-95 disabled:opacity-60"
          >
            {{ submitting ? "Submitting…" : "Submit group-buy request" }}
          </button>
          <p class="text-[11px] text-center text-gray-400">
            No payment is taken online. By submitting you reserve a seat in this
            group buy.
          </p>
        </div>

        <!-- AFTER SUBMIT -->
        <div v-else class="p-6 text-center space-y-4">
          <div
            class="mx-auto h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center"
          >
            <i class="pi pi-check text-emerald-600 text-2xl"></i>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">
              Request submitted!
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              Please pay
              <strong class="text-[#EB3131]"
                >₹ {{ Number(tokenAmount).toLocaleString("en-IN") }}</strong
              >
              to the builder. They will confirm receipt and accept your request.
            </p>
            <p class="text-xs text-gray-500 mt-2">
              Track progress under <strong>My Group Buys</strong>.
            </p>
          </div>
          <button
            @click="close"
            class="w-full bg-gray-900 text-white font-semibold py-3 rounded-full hover:bg-gray-800"
          >
            Done
          </button>
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
