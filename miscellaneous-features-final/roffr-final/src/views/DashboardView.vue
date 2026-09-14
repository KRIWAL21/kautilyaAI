<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useProjectStore } from "@/stores/projectStore";
import { useMyDashboardStore } from "@/stores/myDashboardStore";
import { useGroupBuyStore } from "@/stores/groupBuyStore";
import { storeToRefs } from "pinia";
import Navbar from "@/components/Navbar.vue";

const router = useRouter();
const authStore = useAuthStore();
const { currentUserData, user } = storeToRefs(authStore);

const projectStore = useProjectStore();
const { wishlistData } = storeToRefs(projectStore);

const dashboardStore = useMyDashboardStore();
const {
  myProperties,
  myProjects,
  mySiteVisits,
  loading: dashboardLoading,
  stats: liveStats,
  propertyFieldErrors,
  projectFieldErrors,
} = storeToRefs(dashboardStore);

// Inline-error helpers — return the message for a given dot-path or "".
const projectFieldErr = (key) => projectFieldErrors.value?.[key] || "";
const listingFieldErr = (key) => propertyFieldErrors.value?.[key] || "";

const activeTab = ref("Dashboard");

const menuItems = [
  { name: "Dashboard", icon: "pi pi-th-large" },
  { name: "Profile",   icon: "pi pi-user" },
];

// ──────────────────────────────────────────────────────────
// Group Buy history (token amount, status, assigned SM)
// ──────────────────────────────────────────────────────────
const groupBuyStore = useGroupBuyStore();
const { myRequests: myGroupBuys, loading: groupBuyLoading } =
  storeToRefs(groupBuyStore);

const dashboardCustomerId = computed(
  () =>
    currentUserData.value?._id ||
    user.value?._id ||
    (typeof window !== "undefined"
      ? localStorage.getItem("customerId")
      : "") ||
    "",
);

const fmtINR = (v) =>
  v != null ? `₹ ${Number(v).toLocaleString("en-IN")}` : "—";

const groupBuyStatusClass = (s) => {
  switch (s) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "PAYMENT_DONE":
      return "bg-blue-100 text-blue-700";
    case "ACCEPTED":
    case "FOLLOWUP":
    case "SITE_VISIT_SCHEDULED":
      return "bg-emerald-100 text-emerald-700";
    case "CONVERTED":
      return "bg-green-200 text-green-800";
    case "REJECTED":
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const loadGroupBuys = async () => {
  if (!dashboardCustomerId.value) return;
  await groupBuyStore.fetchMyRequests(dashboardCustomerId.value);
};

// Refund-receipt confirmation state, keyed by request id
const confirmingRefund = ref({});
const confirmGroupBuyRefund = async (requestId) => {
  if (!dashboardCustomerId.value || confirmingRefund.value[requestId]) return;
  confirmingRefund.value[requestId] = true;
  try {
    await groupBuyStore.confirmRefund(requestId, dashboardCustomerId.value);
    await loadGroupBuys();
  } catch (e) {
    // groupBuyStore swallows errors with console.error; surface a soft hint
    console.error("Refund confirmation failed", e);
  } finally {
    confirmingRefund.value[requestId] = false;
  }
};

// Load whenever the tab becomes active OR the customer id resolves later
watch(
  () => activeTab.value,
  (t) => {
    if (t === "My Group Buys") loadGroupBuys();
  },
);
watch(dashboardCustomerId, (id) => {
  if (id && activeTab.value === "My Group Buys") loadGroupBuys();
});

const handleLogout = () => {
  authStore.logout();
  router.push("/");
};

// Real, reactive dashboard stats — derived from store data
const stats = computed(() => ({
  viewedProperties: wishlistData.value?.length ?? 0,
  active: liveStats.value.activeListings,
  siteVisits: liveStats.value.siteVisits,
}));

const fileInput = ref(null);
const profileForm = ref({
  fullName: "",
  email: "",
  mobile: "",
  pincode: "",
  city: "",
  state: "",
});

const showAddPropertyForm = ref(false);
const projectForm = ref({
  projectName: "",
  description: "",
  location: "",
  city: "",
  builderName: "",
  minPrice: "",
  maxPrice: "",
});

const showAddListingForm = ref(false);
const listingForm = ref({
  title: "",
  city: "",
  locality: "",
  state: "",
  bhk: "",
  unitType: "",
  areaValue: "",
  areaUnit: "sqft",
});

const showSiteVisitModal = ref(false);
const visitForm = ref({
  projectId: "",
  scheduledDate: "",
  customerName: "",
  phoneNumber: "",
});

const submitting = ref(false);
const formError = ref("");
const customerId = ref("");

onMounted(async () => {
  customerId.value =
    authStore.user?._id || localStorage.getItem("customerId") || "";

  // Auth gate FIRST so a stale "undefined" customerId doesn't trigger a 404 spiral.
  if (!authStore.isAuthenticated) {
    router.push("/login");
    return;
  }

  if (customerId.value && customerId.value !== "undefined") {
    await Promise.allSettled([
      authStore.getCurrentUserData(customerId.value),
      projectStore.getWishlist(customerId.value),
      dashboardStore.loadAll(customerId.value),
    ]);
  }

  profileForm.value = {
    fullName: currentUserData.value?.name || "",
    email: currentUserData.value?.email || "",
    mobile: currentUserData.value?.phoneNumber || "",
    pincode: currentUserData.value?.pincode || "",
    city: currentUserData.value?.city || "",
    state: currentUserData.value?.state || "",
  };
});

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      authStore.updateUserImage(imageUrl);
    };
    reader.readAsDataURL(file);
  }
};

const savingProfile = ref(false);
const profileSaveMsg = ref(""); // "success" | "error" | ""

const saveProfile = async () => {
  if (!customerId.value) return;
  savingProfile.value = true;
  profileSaveMsg.value = "";
  try {
    await authStore.updateProfile(customerId.value, {
      name:        profileForm.value.fullName,
      email:       profileForm.value.email,
      phoneNumber: profileForm.value.mobile,
      pincode:     profileForm.value.pincode,
      city:        profileForm.value.city,
      state:       profileForm.value.state,
    });
    profileSaveMsg.value = "success";
  } catch {
    profileSaveMsg.value = "error";
  } finally {
    savingProfile.value = false;
  }
};

const addProject = async () => {
  dashboardStore.clearFormErrors();
  formError.value = "";

  if (!customerId.value) {
    formError.value = "Please log in again.";
    return;
  }
  if (!projectForm.value.projectName.trim()) {
    formError.value = "Project name is required.";
    projectFieldErrors.value = { projectName: "Project name is required" };
    return;
  }

  submitting.value = true;
  try {
    await dashboardStore.createMyProject(customerId.value, {
      projectName: projectForm.value.projectName.trim(),
      description: projectForm.value.description,
      builderName: projectForm.value.builderName,
      glocation: projectForm.value.location,
      venue: projectForm.value.city,
      minPrice: Number(projectForm.value.minPrice) || 0,
      maxPrice: Number(projectForm.value.maxPrice) || 0,
    });
    showAddPropertyForm.value = false;
    projectForm.value = {
      projectName: "",
      description: "",
      location: "",
      city: "",
      builderName: "",
      minPrice: "",
      maxPrice: "",
    };
    alert("Project listed successfully");
  } catch (err) {
    const raw = err?.response?.data?.message;
    formError.value = Array.isArray(raw)
      ? `${raw.length} field${raw.length === 1 ? "" : "s"} need attention`
      : raw || "Failed to list project.";
  } finally {
    submitting.value = false;
  }
};

const addListing = async () => {
  dashboardStore.clearFormErrors();
  formError.value = "";

  if (!customerId.value) {
    formError.value = "Please log in again.";
    return;
  }
  if (!listingForm.value.title.trim()) {
    formError.value = "Title is required.";
    propertyFieldErrors.value = { title: "Title is required" };
    return;
  }

  submitting.value = true;
  try {
    await dashboardStore.createMyProperty(customerId.value, {
      title: listingForm.value.title.trim(),
      location: {
        city: listingForm.value.city,
        locality: listingForm.value.locality,
        state: listingForm.value.state,
      },
      property_details: {
        unit_type: listingForm.value.unitType,
        bhk: listingForm.value.bhk,
        area: {
          usable_area: {
            value: Number(listingForm.value.areaValue) || undefined,
            unit: listingForm.value.areaUnit,
          },
        },
      },
    });
    showAddListingForm.value = false;
    listingForm.value = {
      title: "",
      city: "",
      locality: "",
      state: "",
      bhk: "",
      unitType: "",
      areaValue: "",
      areaUnit: "sqft",
    };
    alert("Property listed successfully");
  } catch (err) {
    const raw = err?.response?.data?.message;
    formError.value = Array.isArray(raw)
      ? `${raw.length} field${raw.length === 1 ? "" : "s"} need attention`
      : raw || "Failed to list property.";
  } finally {
    submitting.value = false;
  }
};

const removeMyProject = async (projectId) => {
  if (!confirm("Remove this project listing?")) return;
  await dashboardStore.deleteMyProject(customerId.value, projectId);
};

const removeMyProperty = async (propertyId) => {
  if (!confirm("Remove this property listing?")) return;
  await dashboardStore.deleteMyProperty(customerId.value, propertyId);
};

const openBookVisit = (projectId = "") => {
  visitForm.value = {
    projectId,
    scheduledDate: "",
    customerName: currentUserData.value?.name || "",
    phoneNumber: currentUserData.value?.phoneNumber || "",
  };
  formError.value = "";
  showSiteVisitModal.value = true;
};

const submitSiteVisit = async () => {
  if (!visitForm.value.projectId) {
    formError.value = "Please choose a project.";
    return;
  }
  if (!visitForm.value.scheduledDate) {
    formError.value = "Please pick a date.";
    return;
  }

  submitting.value = true;
  formError.value = "";
  try {
    await dashboardStore.bookSiteVisit(customerId.value, {
      projectId: visitForm.value.projectId,
      scheduledDate: visitForm.value.scheduledDate,
      customerName: visitForm.value.customerName,
      phoneNumber: visitForm.value.phoneNumber,
    });
    showSiteVisitModal.value = false;
    alert("Site visit booked.");
  } catch (err) {
    formError.value =
      err?.response?.data?.message || "Failed to book site visit.";
  } finally {
    submitting.value = false;
  }
};

const goToProject = (id) => {
  router.push(`/project-details/${id}`);
};

const handleRemove = async(project, customer) => {
  await projectStore.removeFromWishlist(project, customer)
}

const feedbackTab = ref("Advisor");
const feedbackRating = ref(0);
const feedbackRemark = ref("");

const submitFeedback = () => {
  console.log("Submitting feedback:", {
    type: feedbackTab.value,
    rating: feedbackRating.value,
    remark: feedbackRemark.value,
  });
  alert("Thank you for your feedback!");
  // Reset form
  feedbackRating.value = 0;
  feedbackRemark.value = "";
};
</script>

<template>
  <div class="min-h-screen relative bg-[#1a1a1a] font-outfit">
    <Navbar />
    <!-- Background Image Overlay -->
    <div class="absolute inset-0 z-0 opacity-40">
      <img
        src="/images/heroSection/hero-bg.webp"
        alt="Background"
        class="w-full h-full object-cover"
      />
    </div>

    <div
      class="relative z-10 pt-32 pb-12 px-4 sm:px-6 lg:px-8 flex justify-center"
    >
      <!-- Main Card Container with Mask for Cutout -->
      <div class="w-full max-w-6xl relative mt-20">
        <!-- Profile Picture (Positioned in the cutout) -->
        <div
          class="absolute -top-20 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center"
        >
          <div class="relative">
            <div
              class="w-40 h-40 rounded-full bg-gray-500 border-[6px] border-white shadow-xl overflow-hidden relative z-20 cursor-pointer group"
              @click="triggerFileInput"
            >
              <img
                v-if="user?.userImage"
                :src="user.userImage"
                alt="Profile"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center bg-gray-400 text-white text-5xl font-bold transition-colors duration-300 group-hover:bg-gray-500"
              >
                {{ currentUserData?.name?.charAt(0).toUpperCase() || "U" }}
              </div>

              <!-- Hover Overlay -->
              <div
                class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center"
              >
                <i
                  class="pi pi-camera text-white opacity-0 group-hover:opacity-100 text-3xl transition-opacity duration-300"
                ></i>
              </div>
            </div>
            <!-- Edit Icon -->
            <button
              @click="triggerFileInput"
              class="absolute bottom-2 right-0 bg-[#FFF3E0] p-2.5 rounded-full border-4 border-white shadow-md text-[#FF5722] hover:text-[#F4511E] transition-colors z-30 cursor-pointer"
            >
              <i class="pi pi-pencil text-lg"></i>
            </button>

            <!-- Hidden File Input -->
            <input
              type="file"
              ref="fileInput"
              class="hidden"
              accept="image/*"
              @change="handleFileUpload"
            />
          </div>

          <div class="text-center mt-4">
            <h2 class="text-3xl font-marcellus font-bold text-gray-900">
              {{ currentUserData?.name || user?.name || "Welcome" }}
            </h2>
          </div>
        </div>

        <!-- White Card with Cutout Mask -->
        <div
          class="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] card-mask"
        >
          <!-- Sidebar / Nav -->
          <div class="w-full md:w-72 md:p-8 md:border-r border-gray-200 relative z-10">

            <!-- Mobile: horizontal pill tabs -->
            <div class="flex md:hidden overflow-x-auto gap-2 px-4 pt-32 pb-3 border-b border-gray-100 scrollbar-hide mt-10 justify-center">
              <button
                v-for="item in menuItems"
                :key="item.name"
                @click="activeTab = item.name; showAddPropertyForm = false;"
                class="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0 border"
                :class="activeTab === item.name
                  ? 'bg-[#FF5722] text-white border-[#FF5722]'
                  : 'text-gray-500 border-gray-200 hover:border-gray-400'"
              >
                <i :class="[item.icon, 'text-sm']"></i>
                {{ item.name }}
              </button>
              <button
                @click="handleLogout"
                class="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap shrink-0 border border-gray-200 text-gray-500"
              >
                <i class="pi pi-sign-out text-sm"></i>
                Logout
              </button>
            </div>

            <!-- Desktop: vertical sidebar -->
            <div class="hidden md:block space-y-2 mt-12">
              <button
                v-for="item in menuItems"
                :key="item.name"
                @click="activeTab = item.name; showAddPropertyForm = false;"
                class="w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200"
                :class="activeTab === item.name ? 'text-[#FF5722]' : 'text-gray-500 hover:bg-gray-50'"
              >
                <i :class="[item.icon, 'text-xl']"></i>
                <span class="font-medium text-lg">{{ item.name }}</span>
              </button>
              <button
                @click="handleLogout"
                class="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-gray-500 hover:bg-gray-50 transition-all duration-200 mt-8"
              >
                <i class="pi pi-sign-out text-xl"></i>
                <span class="font-medium text-lg">Logout</span>
              </button>
            </div>
          </div>

          <!-- Main Content -->
          <div class="flex-1 p-8 md:p-12 relative">
            <!-- Dashboard Content -->
            <div v-if="activeTab === 'Dashboard'" class="mt-6 md:mt-24">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <!-- Left Column: ID Card & Download -->
                <div
                  class="flex flex-col gap-3 mt-6 lg:border-r lg:border-orange-200 lg:pr-12"
                >
                  <div class="text-left">
                    <p class="text-gray-900 text-lg font-outfit">
                      Your virtual ID card for platform identification.
                    </p>
                  </div>

                  <!-- ID Card -->
                  <div
                    class="bg-gradient-to-br from-[#FF9800] to-[#F4511E] rounded-2xl py-6 px-8 text-white shadow-lg relative overflow-hidden flex flex-col justify-between transition-all hover:scale-105 duration-300"
                  >
                    <div
                      class="flex justify-between items-center relative z-10"
                    >
                      <div>
                        <h3 class="text-3xl font-bold tracking-tight">
                          Roffr
                        </h3>
                        <p class="text-[10px] opacity-90 tracking-[0.2em] mt-1">
                          PLATINUM
                        </p>
                      </div>
                      <p class="text-[10px] opacity-90 tracking-wider">
                        MEMBER BENEFIT
                      </p>
                    </div>

                    <div class="flex items-center gap-4 relative z-10 my-4">
                      <div
                        class="bg-[#FFC107] text-black font-bold px-3 py-1 rounded text-lg shadow-sm"
                      >
                        8
                      </div>
                      <p
                        class="font-mono text-xl tracking-widest text-shadow-sm"
                      >
                        {{ currentUserData?.phoneNumber || user?.phoneNumber || "—" }}
                      </p>
                    </div>

                    <div class="flex justify-between items-end relative z-10">
                      <div>
                        <p class="text-[10px] opacity-80 mb-1 tracking-wider">
                          CARD HOLDER
                        </p>
                        <p
                          class="font-bold tracking-wide uppercase text-lg text-shadow-sm"
                        >
                          {{ (currentUserData?.name || user?.name || "—").toUpperCase() }}
                        </p>
                      </div>
                      <p class="font-bold italic opacity-90">Roffr SMART</p>
                    </div>
                  </div>

                  <!-- Download Button -->
                  <!-- <div class="mt-6">
                    <button
                      class="bg-[#FF5722] text-white font-outfit font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-[#F4511E] transition-all w-full transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <i class="pi pi-download"></i>
                      Download ID Card
                    </button>
                  </div> -->
                </div>

                <!-- Right Column: Stats -->
                <div>
                  <h3 class="text-xl font-medium text-gray-900 mb-6 text-right">
                    My Roffr Journey
                  </h3>
                  <div class="grid grid-cols-2 gap-6">
                    <!-- Viewed Properties -->
                    <div
                      class="bg-white border border-orange-200 rounded-2xl p-5 relative shadow-sm hover:shadow-md transition-shadow"
                    >
                      <p class="text-xs font-semibold text-gray-500 mb-3">
                        Viewed Properties
                      </p>
                      <div class="flex justify-between items-end">
                        <span class="text-4xl font-bold text-[#FF5722]">{{
                          stats.viewedProperties
                        }}</span>
                        <i class="pi pi-eye text-[#FF5722] text-2xl"></i>
                      </div>
                    </div>

                    <!-- Active -->
                    <div
                      class="bg-white border border-orange-200 rounded-2xl p-5 relative shadow-sm hover:shadow-md transition-shadow"
                    >
                      <p class="text-xs font-semibold text-gray-500 mb-3">
                        Active
                      </p>
                      <div class="flex justify-between items-end">
                        <span class="text-4xl font-bold text-[#FF5722]">{{
                          stats.active
                        }}</span>
                        <i
                          class="pi pi-check-circle text-[#FF5722] text-2xl"
                        ></i>
                      </div>
                    </div>

                    <!-- Site Visits -->
                    <div
                      class="bg-white border border-orange-200 rounded-2xl p-5 relative col-span-2 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <p class="text-xs font-semibold text-gray-500 mb-3">
                        Site Visits Properties
                      </p>
                      <div class="flex justify-between items-end">
                        <span class="text-4xl font-bold text-[#FF5722]">{{
                          stats.siteVisits
                        }}</span>
                        <i class="pi pi-map-marker text-[#FF5722] text-2xl"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Profile Content -->
            <div v-if="activeTab === 'Profile'" class="mt-6 md:mt-24">
              <div class="max-w-3xl mx-auto">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <!-- Full Name -->
                  <div class="space-y-2">
                    <label class="text-gray-400 text-sm font-medium"
                      >Full Name<span class="text-red-500">*</span></label
                    >
                    <input
                      v-model="profileForm.fullName"
                      type="text"
                      class="w-full bg-transparent border-b border-gray-200 py-2 text-gray-900 focus:outline-none focus:border-[#FF5722] transition-colors"
                      placeholder="Enter full name"
                    />
                  </div>

                  <!-- Email Address -->
                  <div class="space-y-2">
                    <label class="text-gray-400 text-sm font-medium"
                      >Email Address<span class="text-red-500">*</span></label
                    >
                    <input
                      v-model="profileForm.email"
                      type="email"
                      class="w-full bg-transparent border-b border-gray-200 py-2 text-gray-900 focus:outline-none focus:border-[#FF5722] transition-colors"
                      placeholder="Enter email address"
                    />
                  </div>

                  <!-- Mobile Number -->
                  <div class="space-y-2">
                    <label class="text-gray-400 text-sm font-medium"
                      >Mobile Number<span class="text-red-500">*</span></label
                    >
                    <input
                      v-model="profileForm.mobile"
                      type="tel"
                      class="w-full bg-transparent border-b border-gray-200 py-2 text-gray-900 focus:outline-none focus:border-[#FF5722] transition-colors"
                      placeholder="Enter mobile number"
                    />
                  </div>

                  <!-- Pincode -->
                  <div class="space-y-2">
                    <label class="text-gray-400 text-sm font-medium"
                      >Pincode<span class="text-red-500">*</span></label
                    >
                    <input
                      v-model="profileForm.pincode"
                      type="text"
                      class="w-full bg-transparent border-b border-gray-200 py-2 text-gray-900 focus:outline-none focus:border-[#FF5722] transition-colors"
                      placeholder="Enter pincode"
                    />
                  </div>

                  <!-- City -->
                  <div class="space-y-2">
                    <label class="text-gray-400 text-sm font-medium"
                      >City<span class="text-red-500">*</span></label
                    >
                    <input
                      v-model="profileForm.city"
                      type="text"
                      class="w-full bg-transparent border-b border-gray-200 py-2 text-gray-900 focus:outline-none focus:border-[#FF5722] transition-colors"
                      placeholder="Enter city"
                    />
                  </div>

                  <!-- State / Country -->
                  <div class="space-y-2">
                    <label class="text-gray-400 text-sm font-medium"
                      >State / Country<span class="text-red-500">*</span></label
                    >
                    <input
                      v-model="profileForm.state"
                      type="text"
                      class="w-full bg-transparent border-b border-gray-200 py-2 text-gray-900 focus:outline-none focus:border-[#FF5722] transition-colors"
                      placeholder="Enter state / country"
                    />
                  </div>
                </div>

                <div class="mt-12 flex flex-col items-center gap-3">
                  <button
                    @click="saveProfile"
                    :disabled="savingProfile"
                    class="bg-[#FF5722] text-white font-bold py-3 px-12 rounded-lg shadow-lg hover:bg-[#F4511E] transition-all transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <i v-if="savingProfile" class="pi pi-spin pi-spinner text-sm"></i>
                    {{ savingProfile ? "Saving…" : "Save Details" }}
                  </button>
                  <p v-if="profileSaveMsg === 'success'" class="text-sm text-green-600 font-medium flex items-center gap-1">
                    <i class="pi pi-check-circle"></i> Profile updated successfully
                  </p>
                  <p v-if="profileSaveMsg === 'error'" class="text-sm text-red-500 font-medium flex items-center gap-1">
                    <i class="pi pi-times-circle"></i> Failed to update — please try again
                  </p>
                </div>
              </div>
            </div>

            <!-- My Project Content -->
            <div v-if="activeTab === 'My project'" class="relative h-full">
              <!-- Empty State -->
              <div
                v-if="!showAddPropertyForm && myProjects.length === 0"
                class="absolute inset-0 flex flex-col items-center justify-center text-center px-8"
              >
                <div class="mb-6">
                  <img
                    src="/images/dashboard/empty-property.png"
                    alt="No Property"
                    class="w-28 h-28 opacity-90"
                  />
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2 font-outfit">
                  No Projects Yet
                </h3>
                <p class="text-gray-500 mb-8 font-outfit text-base">
                  You do not have any projects posted yet
                </p>

                <button
                  @click="showAddPropertyForm = true"
                  class="bg-[#FF5722] text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-[#F4511E] transition-all transform hover:-translate-y-0.5 font-outfit text-sm tracking-wide"
                >
                  Add your first project
                </button>
              </div>

              <!-- Listed projects -->
              <div
                v-else-if="!showAddPropertyForm"
                class="mt-32 md:mt-24"
              >
                <div class="flex justify-between items-center mb-6">
                  <h3 class="text-2xl font-bold text-gray-900">My Projects</h3>
                  <button
                    @click="showAddPropertyForm = true"
                    class="bg-[#FF5722] text-white font-semibold py-2 px-5 rounded-lg shadow hover:bg-[#F4511E] text-sm"
                  >
                    + Add project
                  </button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    v-for="proj in myProjects"
                    :key="proj._id || proj.id"
                    class="rounded-2xl border bg-white p-4 shadow-sm flex flex-col gap-1"
                  >
                    <h4 class="font-semibold text-gray-900">
                      {{ proj.projectName }}
                    </h4>
                    <p class="text-xs text-gray-500">
                      {{ proj.venue || proj.glocation || "—" }}
                    </p>
                    <p class="text-xs text-gray-600 line-clamp-2">
                      {{ proj.description }}
                    </p>
                    <p class="text-sm font-semibold mt-1">
                      ₹ {{ Number(proj.minPrice || 0).toLocaleString("en-IN") }}
                      <span v-if="proj.maxPrice" class="text-xs text-gray-400 font-normal">
                        – ₹ {{ Number(proj.maxPrice).toLocaleString("en-IN") }}
                      </span>
                    </p>
                    <div class="flex gap-2 mt-2">
                      <button
                        @click="openBookVisit(proj._id || proj.id)"
                        class="text-xs px-3 py-1 rounded-full bg-orange-50 text-[#FF5722] border border-orange-200"
                      >
                        Book site visit
                      </button>
                      <button
                        @click="removeMyProject(proj._id || proj.id)"
                        class="text-xs px-3 py-1 rounded-full bg-red-50 text-red-500 border border-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Add Project Form -->
              <div v-else class="mt-32 md:mt-24">
                <div class="max-w-3xl mx-auto">
                  <div class="flex justify-between items-center mb-8">
                    <h3 class="text-2xl font-bold text-gray-900">
                      Add New Project
                    </h3>
                    <button
                      @click="showAddPropertyForm = false"
                      class="text-gray-500 hover:text-gray-700"
                    >
                      <i class="pi pi-times text-xl"></i>
                    </button>
                  </div>

                  <!-- Validation summary -->
                  <div
                    v-if="formError || Object.keys(projectFieldErrors).length"
                    class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 mb-6 text-sm text-red-700"
                  >
                    <p class="font-semibold mb-1">
                      {{ formError || "Please review the highlighted fields." }}
                    </p>
                    <ul
                      v-if="Object.keys(projectFieldErrors).length"
                      class="list-disc pl-5 space-y-0.5"
                    >
                      <li v-for="(msg, key) in projectFieldErrors" :key="key">{{ msg }}</li>
                    </ul>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="space-y-2">
                      <label class="text-gray-400 text-sm font-medium"
                        >Project Name<span class="text-red-500">*</span></label
                      >
                      <input
                        v-model="projectForm.projectName"
                        type="text"
                        class="w-full bg-transparent border-b py-2 text-gray-900 focus:outline-none transition-colors"
                        :class="
                          projectFieldErr('projectName')
                            ? 'border-red-400 focus:border-red-500'
                            : 'border-gray-200 focus:border-[#FF5722]'
                        "
                        placeholder="Enter project name"
                      />
                      <p v-if="projectFieldErr('projectName')" class="text-xs text-red-500">
                        {{ projectFieldErr('projectName') }}
                      </p>
                    </div>

                    <div class="space-y-2">
                      <label class="text-gray-400 text-sm font-medium"
                        >Builder name</label
                      >
                      <input
                        v-model="projectForm.builderName"
                        type="text"
                        class="w-full bg-transparent border-b border-gray-200 py-2 text-gray-900 focus:outline-none focus:border-[#FF5722] transition-colors"
                        placeholder="Enter builder name"
                      />
                    </div>

                    <div class="space-y-2">
                      <label class="text-gray-400 text-sm font-medium"
                        >Location</label
                      >
                      <input
                        v-model="projectForm.location"
                        type="text"
                        class="w-full bg-transparent border-b border-gray-200 py-2 text-gray-900 focus:outline-none focus:border-[#FF5722] transition-colors"
                        placeholder="Enter address / google location"
                      />
                    </div>

                    <div class="space-y-2">
                      <label class="text-gray-400 text-sm font-medium"
                        >City</label
                      >
                      <input
                        v-model="projectForm.city"
                        type="text"
                        class="w-full bg-transparent border-b border-gray-200 py-2 text-gray-900 focus:outline-none focus:border-[#FF5722] transition-colors"
                        placeholder="Enter city"
                      />
                    </div>

                    <div class="space-y-2">
                      <label class="text-gray-400 text-sm font-medium"
                        >Min price (₹)</label
                      >
                      <input
                        v-model="projectForm.minPrice"
                        type="number"
                        class="w-full bg-transparent border-b border-gray-200 py-2 text-gray-900 focus:outline-none focus:border-[#FF5722] transition-colors"
                        placeholder="0"
                      />
                    </div>

                    <div class="space-y-2">
                      <label class="text-gray-400 text-sm font-medium"
                        >Max price (₹)</label
                      >
                      <input
                        v-model="projectForm.maxPrice"
                        type="number"
                        class="w-full bg-transparent border-b border-gray-200 py-2 text-gray-900 focus:outline-none focus:border-[#FF5722] transition-colors"
                        placeholder="0"
                      />
                    </div>

                    <div class="space-y-2 md:col-span-2">
                      <label class="text-gray-400 text-sm font-medium"
                        >Description</label
                      >
                      <textarea
                        v-model="projectForm.description"
                        rows="3"
                        class="w-full bg-transparent border border-gray-200 rounded-lg py-2 px-3 text-gray-900 focus:outline-none focus:border-[#FF5722] transition-colors"
                        placeholder="What makes this project stand out?"
                      ></textarea>
                    </div>
                  </div>

                  <p v-if="formError" class="text-red-500 text-sm mt-4">
                    {{ formError }}
                  </p>

                  <div class="mt-10 flex justify-center">
                    <button
                      @click="addProject"
                      :disabled="submitting"
                      class="bg-[#FF5722] text-white font-bold py-3 px-12 rounded-lg shadow-lg hover:bg-[#F4511E] transition-all transform hover:-translate-y-0.5 disabled:opacity-60"
                    >
                      {{ submitting ? "Submitting…" : "Submit Project" }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Favorites Content -->
            <div v-if="activeTab === 'Favorites'" class="h-full">
              <div
                v-if="!wishlistData.length"
                class="flex flex-col items-center justify-center text-center px-8 mt-28"
              >
                <div class="mb-6">
                  <img
                    src="/images/dashboard/empty-property.png"
                    alt="No Favorites"
                    class="w-28 h-28 opacity-90"
                  />
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2 font-outfit">
                  No Favorites Yet
                </h3>
                <p class="text-gray-500 mb-8 font-outfit text-base">
                  You have not added any properties to favorites
                </p>

                <button
                  @click="router.push('/project')"
                  class="bg-[#FF5722] text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-[#F4511E] transition-all transform hover:-translate-y-0.5 font-outfit text-sm tracking-wide"
                >
                  Explore Properties
                </button>
              </div>

              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-28">
                <div
                  v-for="item in wishlistData"
                  :key="item._id"
                  class="rounded-2xl border shadow-sm overflow-hidden bg-white flex flex-col"
                >
                  <!-- Image with fixed size -->
                  <div class="w-full h-44 overflow-hidden">
                    <img
                      :src="item.thumbnail"
                      :alt="item.projectName"
                      class="w-full h-full object-cover"
                    />
                  </div>

                  <!-- Content -->
                  <div class="p-3 flex flex-col gap-1 flex-1">
                    <p class="text-xs text-gray-500 uppercase">
                      {{ item.region }}, {{ item.city }}
                    </p>
                    <h3 class="text-sm font-semibold line-clamp-2">
                      {{ item.projectName }}
                    </h3>
                    <p class="text-xs text-gray-500">
                      {{ item.projectStatus }} • Possession
                      {{ item.readyToPossessDate }}
                    </p>
                    <p class="text-sm font-semibold mt-1">
                      ₹ {{ Number(item.priceMin || 0).toLocaleString("en-IN") }}
                      <span class="text-xs text-gray-400 font-normal">
                        – ₹
                        {{ Number(item.priceMax || 0).toLocaleString("en-IN") }}
                      </span>
                    </p>

                    <!-- Button -->
                    <div class="flex items-center gap-2">
                      <button
                        class="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 text-white text-xs px-4 py-2 w-full"
                        @click="goToProject(item._id || item.id)"
                      >
                        View Project
                        <i class="pi pi-arrow-right text-[10px]"></i>
                      </button>

                      <button @click="handleRemove(item._id, customerId)" class="pi pi-trash text-red-500 text-[20px] mt-2"></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- My Visits Content -->
            <div v-if="activeTab === 'My Visits'" class="relative h-full">
              <div v-if="!mySiteVisits.length" class="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                <div class="mb-6">
                  <img
                    src="/images/dashboard/empty-property.png"
                    alt="No Visits"
                    class="w-28 h-28 opacity-90"
                  />
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2 font-outfit">
                  No Site Visits Yet
                </h3>
                <p class="text-gray-500 mb-8 font-outfit text-base">
                  You haven't booked any site visits yet
                </p>

                <div class="flex gap-3">
                  <button
                    @click="openBookVisit('')"
                    class="bg-[#FF5722] text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-[#F4511E] transition-all transform hover:-translate-y-0.5 font-outfit text-sm tracking-wide"
                  >
                    Book a Site Visit
                  </button>
                  <button
                    @click="router.push('/project')"
                    class="border border-[#FF5722] text-[#FF5722] font-bold py-3 px-6 rounded-lg hover:bg-orange-50 transition-all font-outfit text-sm tracking-wide"
                  >
                    Browse Projects
                  </button>
                </div>
              </div>

              <div v-else class="mt-32 md:mt-24">
                <div class="flex justify-between items-center mb-6">
                  <h3 class="text-2xl font-bold text-gray-900">My Site Visits</h3>
                  <button
                    @click="openBookVisit('')"
                    class="bg-[#FF5722] text-white font-semibold py-2 px-5 rounded-lg shadow hover:bg-[#F4511E] text-sm"
                  >
                    + Book another
                  </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    v-for="visit in mySiteVisits"
                    :key="visit._id || visit.id"
                    class="rounded-2xl border bg-white p-4 shadow-sm flex flex-col gap-1"
                  >
                    <p class="text-xs uppercase text-gray-500">
                      {{ visit.status || "Pending" }}
                    </p>
                    <h4 class="font-semibold text-gray-900">
                      {{ visit.projectName || visit.projectId?.projectName || "Project" }}
                    </h4>
                    <p class="text-xs text-gray-500">
                      {{
                        visit.scheduledDate
                          ? new Date(visit.scheduledDate).toLocaleString()
                          : "—"
                      }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ visit.customerName }} · {{ visit.phoneNumber }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- My Group Buys Content -->
            <div v-if="activeTab === 'My Group Buys'" class="relative h-full">
              <div class="mt-32 md:mt-24">
                <div class="flex justify-between items-center mb-6">
                  <div>
                    <h3 class="text-2xl font-bold text-gray-900">
                      My Group Buys
                    </h3>
                    <p class="text-sm text-gray-500 mt-1">
                      Campaigns you've joined and the status of each token
                      payment.
                    </p>
                  </div>
                  <button
                    @click="router.push('/project')"
                    class="bg-[#FF5722] text-white font-semibold py-2 px-5 rounded-lg shadow hover:bg-[#F4511E] text-sm"
                  >
                    Find another group buy
                  </button>
                </div>

                <div
                  v-if="groupBuyLoading"
                  class="text-center text-gray-500 py-10"
                >
                  <i class="pi pi-spin pi-spinner text-2xl"></i>
                  <p class="mt-2 text-sm">Loading…</p>
                </div>

                <div
                  v-else-if="!myGroupBuys.length"
                  class="absolute inset-0 flex flex-col items-center justify-center text-center px-8"
                >
                  <div class="mb-6">
                    <img
                      src="/images/dashboard/empty-property.png"
                      alt="No group buys"
                      class="w-28 h-28 opacity-90"
                    />
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 mb-2 font-outfit">
                    No Group Buys Yet
                  </h3>
                  <p class="text-gray-500 mb-8 font-outfit text-base">
                    Join an active group buy on a project to save with other
                    buyers.
                  </p>
                  <button
                    @click="router.push('/project')"
                    class="bg-[#FF5722] text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-[#F4511E] transition-all font-outfit text-sm tracking-wide"
                  >
                    Browse Projects
                  </button>
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <article
                    v-for="req in myGroupBuys"
                    :key="req._id"
                    class="rounded-2xl border border-gray-200 p-5 bg-white shadow-sm"
                  >
                    <header class="flex items-start justify-between gap-3">
                      <div>
                        <p
                          class="text-xs uppercase tracking-wide text-gray-400"
                        >
                          {{ req.campaignId?.title || "Group buy" }}
                        </p>
                        <h4 class="text-lg font-semibold mt-1 text-gray-900">
                          {{ req.projectId?.projectName || "Project" }}
                        </h4>
                        <p class="text-xs text-gray-500">
                          {{
                            req.projectId?.glocation ||
                            req.projectId?.city ||
                            ""
                          }}
                        </p>
                      </div>
                      <span
                        class="text-[10px] font-semibold px-2 py-1 rounded-full"
                        :class="groupBuyStatusClass(req.status)"
                      >
                        {{ req.status }}
                      </span>
                    </header>

                    <div class="grid grid-cols-2 gap-3 mt-4 text-sm">
                      <div>
                        <p class="text-xs text-gray-400">Token amount</p>
                        <p class="font-medium">{{ fmtINR(req.tokenAmount) }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-400">Payment status</p>
                        <p
                          class="text-xs font-medium"
                          :class="
                            req.tokenPaid
                              ? 'text-emerald-600'
                              : 'text-amber-600'
                          "
                        >
                          {{
                            req.tokenPaid
                              ? "✓ Builder confirmed receipt"
                              : "Pay token to builder"
                          }}
                        </p>
                      </div>
                    </div>

                    <div
                      v-if="req.sourcingManagerId"
                      class="mt-4 rounded-xl bg-gray-50 px-3 py-2 text-xs"
                    >
                      <p class="text-gray-500">Your sourcing manager</p>
                      <p class="font-medium text-gray-800">
                        {{ req.sourcingManagerId.name }} —
                        {{ req.sourcingManagerId.phoneNumber }}
                      </p>
                    </div>

                    <!-- Refund banner for the dashboard tab -->
                    <div
                      v-if="req.refundStatus === 'INITIATED'"
                      class="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs"
                    >
                      <p class="font-semibold text-amber-800">
                        Refund of
                        {{ fmtINR(req.refundAmount || req.tokenAmount) }}
                        is being processed
                      </p>
                      <p class="text-amber-700 mt-0.5 leading-snug">
                        The builder has paused this group-buy and is returning
                        your token. Once you receive it, please confirm below.
                      </p>
                      <button
                        class="mt-2 w-full bg-amber-600 text-white text-xs font-semibold py-2 rounded-full hover:bg-amber-700 disabled:opacity-60"
                        :disabled="!!confirmingRefund[req._id]"
                        @click="confirmGroupBuyRefund(req._id)"
                      >
                        {{
                          confirmingRefund[req._id]
                            ? "Saving…"
                            : "✓ I have received my refund"
                        }}
                      </button>
                    </div>
                    <div
                      v-else-if="req.refundStatus === 'RECEIVED'"
                      class="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs"
                    >
                      <p class="font-semibold text-emerald-800">
                        ✓ Refund confirmed received
                      </p>
                    </div>

                    <div
                      v-if="req.notes && req.notes.length"
                      class="mt-3 text-xs text-gray-500 space-y-1"
                    >
                      <p class="font-semibold text-gray-600">Updates</p>
                      <p
                        v-for="(n, i) in req.notes.slice(-3)"
                        :key="i"
                        class="border-l-2 border-orange-200 pl-2"
                      >
                        <span class="italic">{{ n.byRole }}:</span>
                        {{ n.note }}
                      </p>
                    </div>
                  </article>
                </div>
              </div>
            </div>

            <!-- My Properties Content (P2P listings) -->
            <div v-if="activeTab === 'My Properties'" class="relative h-full">
              <div v-if="!showAddListingForm && myProperties.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                <div class="mb-6">
                  <img
                    src="/images/dashboard/empty-property.png"
                    alt="No Property"
                    class="w-28 h-28 opacity-90"
                  />
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2 font-outfit">
                  No Property Listings Yet
                </h3>
                <p class="text-gray-500 mb-8 font-outfit text-base">
                  List a property and reach buyers on Roffr
                </p>
                <button
                  @click="showAddListingForm = true"
                  class="bg-[#FF5722] text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-[#F4511E] font-outfit text-sm tracking-wide"
                >
                  List your first property
                </button>
              </div>

              <div v-else-if="!showAddListingForm" class="mt-32 md:mt-24">
                <div class="flex justify-between items-center mb-6">
                  <h3 class="text-2xl font-bold text-gray-900">My Properties</h3>
                  <button
                    @click="showAddListingForm = true"
                    class="bg-[#FF5722] text-white font-semibold py-2 px-5 rounded-lg shadow hover:bg-[#F4511E] text-sm"
                  >
                    + Add property
                  </button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    v-for="prop in myProperties"
                    :key="prop._id || prop.id"
                    class="rounded-2xl border bg-white p-4 shadow-sm flex flex-col gap-1"
                  >
                    <h4 class="font-semibold text-gray-900">{{ prop.title }}</h4>
                    <p class="text-xs text-gray-500">
                      {{ [prop.location?.locality, prop.location?.city, prop.location?.state].filter(Boolean).join(", ") || "—" }}
                    </p>
                    <p class="text-xs text-gray-600">
                      {{ prop.property_details?.unit_type }}
                      <span v-if="prop.property_details?.bhk"> · {{ prop.property_details.bhk }}</span>
                      <span v-if="prop.property_details?.area?.usable_area?.value">
                        · {{ prop.property_details.area.usable_area.value }}
                        {{ prop.property_details.area.usable_area.unit }}
                      </span>
                    </p>
                    <button
                      @click="removeMyProperty(prop._id || prop.id)"
                      class="self-start text-xs px-3 py-1 mt-2 rounded-full bg-red-50 text-red-500 border border-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              <!-- Add property form -->
              <div v-else class="mt-32 md:mt-24">
                <div class="max-w-3xl mx-auto">
                  <div class="flex justify-between items-center mb-8">
                    <h3 class="text-2xl font-bold text-gray-900">Add Property</h3>
                    <button @click="showAddListingForm = false" class="text-gray-500 hover:text-gray-700">
                      <i class="pi pi-times text-xl"></i>
                    </button>
                  </div>

                  <!-- Validation summary -->
                  <div
                    v-if="formError || Object.keys(propertyFieldErrors).length"
                    class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 mb-6 text-sm text-red-700"
                  >
                    <p class="font-semibold mb-1">
                      {{ formError || "Please review the highlighted fields." }}
                    </p>
                    <ul
                      v-if="Object.keys(propertyFieldErrors).length"
                      class="list-disc pl-5 space-y-0.5"
                    >
                      <li v-for="(msg, key) in propertyFieldErrors" :key="key">{{ msg }}</li>
                    </ul>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="space-y-2">
                      <label class="text-gray-400 text-sm font-medium">Title<span class="text-red-500">*</span></label>
                      <input
                        v-model="listingForm.title"
                        type="text"
                        class="w-full bg-transparent border-b py-2"
                        :class="
                          listingFieldErr('title')
                            ? 'border-red-400'
                            : 'border-gray-200'
                        "
                        placeholder="e.g. Sky Towers Unit 12B"
                      />
                      <p v-if="listingFieldErr('title')" class="text-xs text-red-500">
                        {{ listingFieldErr('title') }}
                      </p>
                    </div>
                    <div class="space-y-2">
                      <label class="text-gray-400 text-sm font-medium">BHK</label>
                      <input v-model="listingForm.bhk" type="text" class="w-full bg-transparent border-b border-gray-200 py-2" placeholder="e.g. 3BHK" />
                    </div>
                    <div class="space-y-2">
                      <label class="text-gray-400 text-sm font-medium">Unit type</label>
                      <select v-model="listingForm.unitType" class="w-full bg-transparent border-b border-gray-200 py-2">
                        <option value="">Select</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Villa">Villa</option>
                        <option value="Studio">Studio</option>
                        <option value="Plot">Plot</option>
                      </select>
                    </div>
                    <div class="space-y-2">
                      <label class="text-gray-400 text-sm font-medium">City</label>
                      <input v-model="listingForm.city" type="text" class="w-full bg-transparent border-b border-gray-200 py-2" placeholder="City" />
                    </div>
                    <div class="space-y-2">
                      <label class="text-gray-400 text-sm font-medium">Locality</label>
                      <input v-model="listingForm.locality" type="text" class="w-full bg-transparent border-b border-gray-200 py-2" placeholder="Locality" />
                    </div>
                    <div class="space-y-2">
                      <label class="text-gray-400 text-sm font-medium">State</label>
                      <input v-model="listingForm.state" type="text" class="w-full bg-transparent border-b border-gray-200 py-2" placeholder="State" />
                    </div>
                    <div class="space-y-2">
                      <label class="text-gray-400 text-sm font-medium">Area</label>
                      <input v-model="listingForm.areaValue" type="number" class="w-full bg-transparent border-b border-gray-200 py-2" placeholder="0" />
                    </div>
                    <div class="space-y-2">
                      <label class="text-gray-400 text-sm font-medium">Unit</label>
                      <select v-model="listingForm.areaUnit" class="w-full bg-transparent border-b border-gray-200 py-2">
                        <option value="sqft">sqft</option>
                        <option value="sqm">sqm</option>
                        <option value="acre">acre</option>
                      </select>
                    </div>
                  </div>

                  <p v-if="formError" class="text-red-500 text-sm mt-4">{{ formError }}</p>

                  <div class="mt-10 flex justify-center">
                    <button
                      @click="addListing"
                      :disabled="submitting"
                      class="bg-[#FF5722] text-white font-bold py-3 px-12 rounded-lg shadow-lg hover:bg-[#F4511E] disabled:opacity-60"
                    >
                      {{ submitting ? "Submitting…" : "Submit Property" }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Feedback Content -->
            <div
              v-if="activeTab === 'Feedback'"
              class="mt-32 md:mt-24 max-w-2xl mx-auto text-center"
            >
              <!-- Tabs -->
              <div
                class="flex justify-center gap-8 mb-12 border-b border-gray-200"
              >
                <button
                  @click="feedbackTab = 'Advisor'"
                  class="pb-2 text-lg font-medium transition-colors relative"
                  :class="
                    feedbackTab === 'Advisor'
                      ? 'text-[#FF5722]'
                      : 'text-gray-400 hover:text-gray-600'
                  "
                >
                  Roffr Advisor
                  <span
                    v-if="feedbackTab === 'Advisor'"
                    class="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF5722]"
                  ></span>
                </button>
                <button
                  @click="feedbackTab = 'Project'"
                  class="pb-2 text-lg font-medium transition-colors relative"
                  :class="
                    feedbackTab === 'Project'
                      ? 'text-[#FF5722]'
                      : 'text-gray-400 hover:text-gray-600'
                  "
                >
                  Project
                  <span
                    v-if="feedbackTab === 'Project'"
                    class="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF5722]"
                  ></span>
                </button>
              </div>

              <!-- Rate Us -->
              <div class="mb-8">
                <h3 class="text-lg font-bold text-gray-900 mb-4 text-left">
                  Rate Us
                </h3>
                <div class="flex gap-4">
                  <button
                    v-for="star in 5"
                    :key="star"
                    @click="
                      feedbackRating = feedbackRating === star ? star - 1 : star
                    "
                    class="focus:outline-none transition-transform hover:scale-110"
                  >
                    <i
                      class="pi pi-star-fill text-5xl"
                      :class="
                        star <= feedbackRating
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      "
                    ></i>
                  </button>
                </div>
              </div>

              <!-- Remark -->
              <div class="mb-12">
                <textarea
                  v-model="feedbackRemark"
                  placeholder="Remark..."
                  class="w-full bg-gray-5 rounded-xl p-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/20 resize-none h-32 border border-gray-100"
                ></textarea>
              </div>

              <!-- Submit Button -->
              <button
                @click="submitFeedback"
                class="bg-[#FF5722] text-white font-bold py-3.5 px-12 rounded-lg shadow-lg hover:bg-[#F4511E] transition-all transform hover:-translate-y-0.5 font-outfit w-full sm:w-auto"
              >
                Submit My Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Site Visit Booking Modal -->
    <div
      v-if="showSiteVisitModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="showSiteVisitModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-900">Book a site visit</h3>
          <button
            @click="showSiteVisitModal = false"
            class="text-gray-500 hover:text-gray-700"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-gray-500 text-xs font-medium">Project</label>
            <select
              v-model="visitForm.projectId"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-[#FF5722]"
            >
              <option value="">Select a project</option>
              <option
                v-for="proj in myProjects"
                :key="proj._id || proj.id"
                :value="proj._id || proj.id"
              >
                {{ proj.projectName }}
              </option>
            </select>
            <p v-if="!myProjects.length" class="text-xs text-gray-400 mt-1">
              No projects available. Browse projects to find one.
            </p>
          </div>

          <div>
            <label class="text-gray-500 text-xs font-medium">Date & time</label>
            <input
              v-model="visitForm.scheduledDate"
              type="datetime-local"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-[#FF5722]"
            />
          </div>

          <div>
            <label class="text-gray-500 text-xs font-medium">Your name</label>
            <input
              v-model="visitForm.customerName"
              type="text"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-[#FF5722]"
              placeholder="Full name"
            />
          </div>

          <div>
            <label class="text-gray-500 text-xs font-medium">Phone</label>
            <input
              v-model="visitForm.phoneNumber"
              type="tel"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-[#FF5722]"
              placeholder="10-digit mobile"
            />
          </div>

          <p v-if="formError" class="text-red-500 text-sm">{{ formError }}</p>

          <button
            @click="submitSiteVisit"
            :disabled="submitting"
            class="w-full bg-[#FF5722] text-white font-bold py-3 rounded-lg hover:bg-[#F4511E] disabled:opacity-60"
          >
            {{ submitting ? "Booking…" : "Confirm booking" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.text-shadow-sm {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.card-mask {
  /* Create a circular cutout at the top center */
  mask-image: radial-gradient(
    circle at 50% 0,
    transparent 5.5rem,
    black 5.6rem
  );
  -webkit-mask-image: radial-gradient(
    circle at 50% 0,
    transparent 5.5rem,
    black 5.6rem
  );
}
</style>
