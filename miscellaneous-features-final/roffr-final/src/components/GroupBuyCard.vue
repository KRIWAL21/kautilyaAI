<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useProjectStore } from "@/stores/projectStore";
import { useOrderStore } from "@/stores/orderStore";
import { useGroupBuyStore } from "@/stores/groupBuyStore";
import { storeToRefs } from "pinia";
import GroupBuyJoinModal from "@/components/GroupBuyJoinModal.vue";

const projectStore = useProjectStore();
const { isModalOpen } = storeToRefs(projectStore);

const orderStore = useOrderStore();
const groupBuyStore = useGroupBuyStore();

const props = defineProps({
  peopleJoined: { type: Number, required: true },
  requiredPeople: { type: Number, required: true },
  customerId: { type: String },
  projectId: { type: String },
  planId: { type: String },
  campaign: { type: Object, default: null },
  project: { type: Object, default: () => ({}) },
  members: {
    type: Array,
    default: () => [],
  },
});

// Real campaign tied to the project. If a campaign prop is passed in, use it;
// otherwise try to fetch the active campaign for the project on mount.
const liveCampaign = ref(props.campaign);
const joinModalOpen = ref(false);

const ensureCampaign = async () => {
  if (liveCampaign.value || !props.projectId) return;
  liveCampaign.value = await groupBuyStore.fetchCampaignForProject(props.projectId);
};

onMounted(ensureCampaign);
watch(() => props.projectId, ensureCampaign);

const isJoinable = computed(() => {
  // Campaign must exist AND be ACTIVE (paused campaigns are visible but locked)
  const c = liveCampaign.value;
  if (!c) return false;
  if (c.canJoin === false) return false;
  return (c.status || "ACTIVE") === "ACTIVE";
});

const openJoinModal = async () => {
  await ensureCampaign();
  if (!liveCampaign.value) {
    openModal();
    return;
  }
  if (!isJoinable.value) {
    // Paused / closed — don't open the modal at all
    return;
  }
  joinModalOpen.value = true;
};

const handleJoined = async () => {
  // refresh customer's list if logged in
  if (props.customerId) {
    await groupBuyStore.fetchMyRequests(props.customerId).catch(() => {});
  }
};

// step state for modal: 1 = benefits card, 2 = requirements form + payment
const step = ref(1);

// requirements form state
const selectedBhk = ref("");
const area = ref("");
const price = ref("");
const bhkOptions = ["1 bhk", "2 bhk", "3 bhk", "4 bhk", "5 bhk"];

// simple validation state
const errors = ref({
  bhk: "",
  area: "",
  price: "",
});

// basic validators
const validateForm = () => {
  errors.value.bhk = "";
  errors.value.area = "";
  errors.value.price = "";

  if (!selectedBhk.value) {
    errors.value.bhk = "Please select a configuration.";
  }

  if (!area.value) {
    errors.value.area = "Area is required.";
  } else if (isNaN(Number(area.value)) || Number(area.value) <= 0) {
    errors.value.area = "Enter a valid positive number.";
  }

  if (!price.value) {
    errors.value.price = "Price is required.";
  } else if (isNaN(Number(price.value)) || Number(price.value) <= 0) {
    errors.value.price = "Enter a valid positive number.";
  }
};

const isFormValid = computed(() => {
  // run validation to keep state in sync
  validateForm();
  return !errors.value.bhk && !errors.value.area && !errors.value.price;
});

const percentage = computed(() =>
  Math.min(100, (props.peopleJoined / props.requiredPeople) * 100)
);

const chartOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    sparkline: { enabled: true },
  },
  plotOptions: {
    radialBar: {
      startAngle: -135,
      endAngle: 135,
      hollow: {
        size: "65%",
      },
      track: {
        background: "#E5E5E5",
        strokeWidth: "90%",
      },
      dataLabels: {
        name: { show: false },
        value: {
          fontSize: "30px",
          fontWeight: 600,
          color: "#FF3C00",
          formatter: () => `${props.peopleJoined}/${props.requiredPeople}`,
        },
      },
    },
  },
  colors: ["#FF3C00"],
  stroke: {
    lineCap: "round",
  },
  labels: [""],
}));

const cleanMembers = computed(() =>
  props.members.filter(
    (m) =>
      m && Object.keys(m).length > 0 && (m.name || m.location || m.userImage)
  )
);

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

// open/close modal
const openModal = () => {
  step.value = 1;
  isModalOpen.value = true;
};

const closeModal = () => {
  step.value = 1;
  isModalOpen.value = false;
  resetRequirements();
};

// reset requirements form
const resetRequirements = () => {
  selectedBhk.value = "";
  area.value = "";
  price.value = "";
  errors.value.bhk = "";
  errors.value.area = "";
  errors.value.price = "";
};

const handleJoinGroup = async (projectId, customerId) => {
  try {
    await projectStore.joinProjectGroup(projectId, customerId);
  } catch (e) {
    console.error("Join group failed", e);
  }
};

const handleCreateOrder = async (customerId, planId) => {
  try {
    const { razorpayOrderId, amount, currency, receipt } =
      await orderStore.createOrderData(customerId, planId);

    if (!window.Razorpay) {
      console.error("Razorpay script not loaded");
      return;
    }

    const options = {
      key: RAZORPAY_KEY,
      amount,
      currency,
      name: "Roffr",
      description: "Group Buying Membership",
      order_id: razorpayOrderId,
      notes: {
        customerId,
        planId,
        receipt,
      },
      handler: async (response) => {
        try {
          await orderStore.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          await handleJoinGroup(props.projectId, customerId);

          closeModal();
        } catch (e) {
          console.error("Post-payment actions failed", e);
        }
      },
      theme: {
        color: "#EB3131",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error(err);
  }
};

// step 2: validate, keep requirements pending, then Razorpay
const handleSubmitAndPay = async () => {
  validateForm();

  if (!isFormValid.value) {
    return;
  }

  try {
    if (projectStore.savePendingRequirements) {
      await projectStore.savePendingRequirements({
        projectId: props.projectId,
        customerId: props.customerId,
        bhk: selectedBhk.value,
        area: area.value,
        price: price.value,
      });
    }

    await handleCreateOrder(props.customerId, props.planId);
  } catch (e) {
    console.error("Submit + pay failed", e);
  }
};
</script>

<template>
  <div
    class="w-full rounded-2xl border border-gray-200 bg-white p-4 md:p-5 flex flex-col md:flex-row gap-4"
  >
    <!-- LEFT: gauge -->
    <div
      class="w-full md:w-1/3 flex flex-col items-center justify-between border-r md:pr-4 md:border-r md:border-gray-200"
    >
      <div class="w-32 h-32 flex items-center justify-center">
        <apexchart
          type="radialBar"
          height="200"
          :options="chartOptions"
          :series="[percentage]"
        />
      </div>
      <p class="mt-10 text-center text-sm font-outfit">
        Enjoy the ultimate deal<br />
        after at least
        <strong class="text-[#DDA439]">{{ requiredPeople }}</strong> people
        join!
      </p>

      <button
        class="mt-3 w-full rounded-full text-white text-xs font-semibold py-2 shadow-md transition-opacity"
        :class="
          liveCampaign && !isJoinable
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-[#FF9F43] to-[#FF3C00] hover:opacity-95'
        "
        :disabled="liveCampaign && !isJoinable"
        @click="openJoinModal"
      >
        {{ liveCampaign && !isJoinable ? "Group buy paused" : "Join group buy" }}
      </button>

      <p class="mt-2 text-[10px] text-orange-500">*Every 60 days, Restart.</p>
    </div>

    <!-- RIGHT: people list -->
    <div class="w-full md:w-2/3 flex flex-col gap-3 md:pl-4">
      <p
        v-if="!cleanMembers.length"
        class="font-outfit text-[18px] text-gray-400 italic px-2"
      >
        No customers in group buy yet.
      </p>

      <div
        v-else
        v-for="(member, index) in cleanMembers"
        :key="index"
        class="flex items-center gap-3 rounded-2xl border border-gray-100 px-3 py-2 shadow-sm"
      >
        <div class="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
          <img
            v-if="member.userImage"
            :src="member.userImage"
            alt=""
            class="w-full h-full object-cover"
          />
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-800">
            {{ member.name }}
          </p>
          <p class="text-xs text-[#FF3C00] font-semibold">
            {{ member.config }}
          </p>
        </div>
        <div
          class="w-6 h-6 rounded-full bg-[#FFEAD6] flex items-center justify-center"
        >
          <span class="text-[#FF3C00] text-xs">✔</span>
        </div>
      </div>
    </div>
  </div>

  <Transition name="modal-fade">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      v-if="isModalOpen"
    >
      <div
        class="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-2xl flex flex-col relative"
      >
        <button
          @click="closeModal"
          class="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <i class="pi pi-times text-gray-600"></i>
        </button>

        <div class="bg-white p-6 text-center w-full">
          <h3
            class="font-marcellus text-xl md:text-2xl leading-tight text-gray-900"
          >
            Membership
            <span
              class="border-2 border-[#EB3131] rounded-[50%] px-2 italic text-gray-900"
              >Benefits</span
            >
            You Get with
          </h3>
          <h2
            class="font-marcellus text-3xl md:text-4xl text-[#EB3131] text-center mt-2"
          >
            Roffr
          </h2>
        </div>

        <div
          class="bg-white p-8 md:p-12 flex-1 flex flex-col justify-center"
        >
          <!-- STEP 1: benefits card -->
          <div
            v-if="step === 1"
            class="bg-gradient-to-br from-[#EB3131] to-[#DDA439] rounded-2xl p-6 pt-8 border border-white/20 relative text-white"
          >
            <div
              class="absolute -top-3 right-6 bg-white text-[#EB3131] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm"
            >
              <i class="pi pi-star-fill text-[10px]"></i> Premium
            </div>

            <ul class="space-y-4 font-outfit">
              <li class="flex items-start gap-3">
                <i class="pi pi-check text-white mt-1"></i>
                <span>Personal Investment Advisor</span>
              </li>
              <li class="flex items-start gap-3">
                <i class="pi pi-check text-white mt-1"></i>
                <span>Exclusive Discounts Up To 30%</span>
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

            <button
              @click="step = 2"
              class="w-full mt-6 bg-white text-[#EB3131] font-bold py-3 rounded-full hover:bg-gray-50 transition-colors"
            >
              Join Community at ₹999/-
            </button>
          </div>

          <!-- STEP 2: requirements form + Submit & Join -->
          <div
            v-else
            class="bg-white border border-gray-200 rounded-2xl p-6 space-y-4"
          >
            <!-- BHK Selection -->
            <div class="flex flex-wrap gap-2 mb-1">
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
            <p v-if="errors.bhk" class="text-xs text-red-500">
              {{ errors.bhk }}
            </p>

            <!-- Area Input -->
            <div
              class="flex items-center border border-gray-300 rounded-full px-4 py-3 bg-white mt-2"
              :class="errors.area ? 'border-red-400' : 'border-gray-300'"
            >
              <input
                v-model="area"
                type="text"
                placeholder="Enter area in sq.ft."
                class="flex-1 outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
            <p v-if="errors.area" class="text-xs text-red-500 mt-1">
              {{ errors.area }}
            </p>

            <!-- Price Input -->
            <div
              class="flex items-center border rounded-full px-4 py-3 bg-white mt-2"
              :class="errors.price ? 'border-red-400' : 'border-gray-300'"
            >
              <span class="text-gray-500 mr-2">₹</span>
              <input
                v-model="price"
                type="text"
                placeholder="Expected price of the project"
                class="flex-1 outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
            <p v-if="errors.price" class="text-xs text-red-500 mt-1">
              {{ errors.price }}
            </p>

            <button
              @click="handleSubmitAndPay"
              :disabled="!isFormValid"
              class="w-full mt-4 bg-gradient-to-r from-[#EB3131] to-[#DDA439] text-white font-bold py-3 rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Submit &amp; Join
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <GroupBuyJoinModal
    :open="joinModalOpen"
    :campaign="liveCampaign || {}"
    :customer-id="customerId"
    :project="project"
    @close="joinModalOpen = false"
    @joined="handleJoined"
  />
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
