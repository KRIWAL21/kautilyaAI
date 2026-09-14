<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { useMyDashboardStore } from "@/stores/myDashboardStore";
import { useGroupBuyStore } from "@/stores/groupBuyStore";
import GroupBuyCard from "@/components/GroupBuyCard.vue";
import GroupBuyJoinModal from "@/components/GroupBuyJoinModal.vue";

const route = useRoute();
const router = useRouter();

const projectStore = useProjectStore();
const { specificProjectDetails } = storeToRefs(projectStore);

const authStore = useAuthStore();
const dashboardStore = useMyDashboardStore();

// ----- Group Buy -----
const groupBuyStore = useGroupBuyStore();
const liveCampaign = ref(null);

const groupBuyJoinedCount = computed(() =>
  liveCampaign.value
    ? Number(liveCampaign.value.acceptedMembersCount || 0)
    : 0,
);
const groupBuyTargetCount = computed(() =>
  liveCampaign.value ? Number(liveCampaign.value.memberLimit || 5) : 5,
);
const currentCustomerId = computed(
  () =>
    authStore.user?._id ||
    authStore.currentUserData?._id ||
    (typeof window !== "undefined"
      ? localStorage.getItem("customerId")
      : "") ||
    "",
);

const joinModalOpen = ref(false);

const isJoinable = computed(() => {
  const c = liveCampaign.value;
  if (!c) return false;
  if (c.canJoin === false) return false;
  return (c.status || "ACTIVE") === "ACTIVE";
});

const openStickyJoinModal = () => {
  if (!isJoinable.value) return;
  joinModalOpen.value = true;
};

const handleJoined = async () => {
  if (currentCustomerId.value) {
    await groupBuyStore.fetchMyRequests(currentCustomerId.value).catch(() => {});
  }
};

const loadCampaign = async (projectId) => {
  if (!projectId) {
    liveCampaign.value = null;
    return;
  }
  liveCampaign.value = await groupBuyStore.fetchCampaignForProject(projectId);
};

// ----- Loaders -----
const loading = ref(false);
const loadProject = async (id) => {
  if (!id) return;
  loading.value = true;
  try {
    await projectStore.getProjectById(id);
    await loadCampaign(specificProjectDetails.value?._id || id);
  } finally {
    loading.value = false;
  }
};

// ----- Avatar swap animation -----
const step = ref(0);
let swapInterval = null;
const GAP = 34;

const avatarLeft = (idx, total) => ((idx + step.value) % Math.min(total, 3)) * GAP;
const avatarZ    = (idx, total) => { const c = Math.min(total, 3); return c - (idx + step.value) % c; };

onMounted(() => {
  loadProject(route.params.id);
  swapInterval = setInterval(() => { step.value = (step.value + 1) % 3; }, 2000);
});
onBeforeUnmount(() => clearInterval(swapInterval));

watch(
  () => route.params.id,
  (id) => loadProject(id),
);

// ----- Derived data -----
const project = computed(() => specificProjectDetails.value || {});
const heroImages = computed(() => {
  const list = project.value?.propertyPictures;
  return Array.isArray(list) ? list.filter(Boolean) : [];
});
const floorPlans = computed(() => {
  const fp = project.value?.floorPlan;
  if (!fp) return [];
  if (Array.isArray(fp)) return fp.filter(Boolean);
  return [fp].filter(Boolean);
});
const amenities = computed(() => {
  const a = project.value?.amenities;
  return Array.isArray(a) ? a.filter(Boolean) : [];
});
const facilities = computed(() => {
  const f = project.value?.facilities;
  return Array.isArray(f) ? f : [];
});
const whyConsiderBuying = computed(() => {
  const w = project.value?.whyConsiderBuying;
  return Array.isArray(w) ? w.filter(Boolean) : [];
});
const propertyConfigs = computed(() => {
  const c = project.value?.PropertyConfig;
  return Array.isArray(c) ? c.filter(Boolean) : [];
});
const brochureUrl = computed(() => {
  const b = project.value?.brochure;
  if (!b) return "";
  if (Array.isArray(b)) return b[0] || "";
  return b;
});
const videoUrl = computed(() => project.value?.videoLink || project.value?.tourLink || "");

const formatINR = (n) => {
  const num = Number(n || 0);
  if (!num) return "—";
  if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹ ${(num / 100000).toFixed(1)} L`;
  return `₹ ${num.toLocaleString("en-IN")}`;
};

const priceLabel = computed(() => {
  const min = Number(project.value?.minPrice || 0);
  const max = Number(project.value?.maxPrice || 0);
  if (!min && !max) return "Price on request";
  if (min && max && min !== max) return `${formatINR(min)} – ${formatINR(max)}`;
  return formatINR(min || max);
});

const carpetAreaLabel = computed(() => {
  const min = project.value?.minCarpetArea;
  const max = project.value?.maxCarpetArea;
  if (!min && !max) return "—";
  if (min && max && min !== max) return `${min} – ${max} sqft`;
  return `${min || max} sqft`;
});

const locationLabel = computed(() => {
  return (
    project.value?.address ||
    project.value?.venue ||
    project.value?.glocation ||
    [project.value?.region, project.value?.city].filter(Boolean).join(", ") ||
    "Location not specified"
  );
});

// Try to extract a "lat,lng" pair from glocation for the map embed.
const mapEmbedSrc = computed(() => {
  const g = project.value?.glocation || "";
  const coordMatch = String(g).match(
    /(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)/,
  );
  if (coordMatch) {
    return `https://www.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&hl=en&z=15&output=embed`;
  }
  const q = encodeURIComponent(
    project.value?.venue ||
      project.value?.glocation ||
      project.value?.address ||
      project.value?.projectName ||
      "",
  );
  if (!q) return "";
  return `https://www.google.com/maps?q=${q}&hl=en&z=15&output=embed`;
});

// ----- Hero gallery -----
const activeImageIdx = ref(0);
watch(heroImages, () => {
  activeImageIdx.value = 0;
});
const activeImage = computed(
  () =>
    heroImages.value[activeImageIdx.value] ||
    heroImages.value[0] ||
    "/images/heroSection/hero-bg.webp",
);

// ----- Tabs -----
const TABS = [
  { key: "overview", label: "Overview", icon: "pi-info-circle" },
  { key: "photos", label: "Photos", icon: "pi-images" },
  { key: "video", label: "Video", icon: "pi-video" },
  { key: "amenities", label: "Amenities", icon: "pi-star" },
  { key: "plans", label: "Plans", icon: "pi-th-large" },
  { key: "location", label: "Location", icon: "pi-map-marker" },
  { key: "about", label: "About Builder", icon: "pi-building" },
];
const activeTab = ref("overview");

// ----- Site visit booking -----
const showVisitModal = ref(false);
const submittingVisit = ref(false);
const visitMsg = ref("");
const visitForm = ref({
  scheduledDate: "",
  customerName: "",
  phoneNumber: "",
});

const openBookVisit = () => {
  visitForm.value = {
    scheduledDate: "",
    customerName: authStore.currentUserData?.name || authStore.user?.name || "",
    phoneNumber:
      authStore.currentUserData?.phoneNumber ||
      authStore.user?.phoneNumber ||
      "",
  };
  visitMsg.value = "";
  showVisitModal.value = true;
};

const submitVisit = async () => {
  if (!authStore.isAuthenticated) {
    visitMsg.value = "Please log in to book a site visit.";
    return;
  }
  if (!visitForm.value.scheduledDate) {
    visitMsg.value = "Please pick a date and time.";
    return;
  }
  if (!visitForm.value.phoneNumber) {
    visitMsg.value = "Phone number is required.";
    return;
  }

  submittingVisit.value = true;
  visitMsg.value = "";
  try {
    const customerId =
      authStore.user?._id || localStorage.getItem("customerId");
    await dashboardStore.bookSiteVisit(customerId, {
      projectId: project.value?._id,
      scheduledDate: visitForm.value.scheduledDate,
      customerName: visitForm.value.customerName,
      phoneNumber: visitForm.value.phoneNumber,
    });
    visitMsg.value = "Booked! You can manage it from your dashboard.";
    setTimeout(() => (showVisitModal.value = false), 1200);
  } catch (err) {
    visitMsg.value =
      err?.response?.data?.message || "Failed to book site visit.";
  } finally {
    submittingVisit.value = false;
  }
};

// ----- Wishlist (existing endpoint expects login) -----
const togglingWishlist = ref(false);
const handleShortlist = async () => {
  const customerId = authStore.user?._id || localStorage.getItem("customerId");
  if (!customerId) {
    router.push("/login");
    return;
  }
  togglingWishlist.value = true;
  try {
    await projectStore.addToWishlist(project.value?._id, customerId);
    visitMsg.value = "Added to favourites.";
  } finally {
    togglingWishlist.value = false;
  }
};

// ----- Description expand -----
const descExpanded = ref(false);

const savingsAmount = computed(() => {
  if (!liveCampaign.value) return null;
  const price = Number(project.value?.minPrice || 0);
  const pct = Number(liveCampaign.value.currentDiscountPercent || 0);
  if (!price || !pct) return null;
  const saved = (price * pct) / 100;
  if (saved >= 10000000) return `₹ ${(saved / 10000000).toFixed(2)} Cr`;
  if (saved >= 100000) return `₹ ${(saved / 100000).toFixed(1)} L`;
  return `₹ ${saved.toLocaleString("en-IN")}`;
});

const memberOrdinal = computed(() => {
  const n = groupBuyJoinedCount.value + 1;
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
});

// ----- Share dialog -----
const showShareModal = ref(false);
const linkCopied = ref(false);

const openShareModal = () => {
  showShareModal.value = true;
  linkCopied.value = false;
};

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    linkCopied.value = true;
    setTimeout(() => (linkCopied.value = false), 2000);
  } catch { /* ignore */ }
};

const socialLinks = computed(() => {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(project.value?.projectName || "Check out this project on Roffr");
  return {
    whatsapp:  `https://wa.me/?text=${text}%20${url}`,
    facebook:  `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    twitter:   `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    linkedin:  `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    telegram:  `https://t.me/share/url?url=${url}&text=${text}`,
    email:     `mailto:?subject=${text}&body=${url}`,
  };
});

// ----- Image carousel modal -----
const showImageCarousel = ref(false);
const carouselIdx = ref(0);
const swiperInstance = ref(null);
const activeCarouselIdx = ref(0);

const openCarousel = (idx = 0) => {
  carouselIdx.value = idx;
  activeCarouselIdx.value = idx;
  showImageCarousel.value = true;
};

const onCarouselSwiper = (swiper) => { swiperInstance.value = swiper; };
const onCarouselSlideChange = (swiper) => { activeCarouselIdx.value = swiper.realIndex; };
</script>

<template>
  <main class="bg-gray-50 min-h-screen pb-12">
    <!-- Loading -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 py-24 text-center text-gray-500">
      <i class="pi pi-spin pi-spinner text-3xl"></i>
      <p class="mt-2 text-sm">Loading project…</p>
    </div>

    <template v-else-if="project?._id">
      <!-- ========== HERO: two-column layout ========== -->
      <div class="max-w-7xl mx-auto px-4 2xl:px-0 pt-20">
        <div class="flex flex-col lg:flex-row gap-8 items-start">

          <!-- ── LEFT COLUMN ────────────────────────────────────── -->
          <div class="flex-1 min-w-0 pt-4">

            <!-- Breadcrumb -->
            <nav class="text-xs text-gray-400 flex items-center gap-1.5 mb-4 flex-wrap">
              <router-link to="/" class="hover:text-gray-700">Home</router-link>
              <i class="pi pi-angle-right text-[10px]"></i>
              <router-link to="/project" class="hover:text-gray-700">Projects</router-link>
              <template v-if="project.builderName">
                <i class="pi pi-angle-right text-[10px]"></i>
                <span>{{ project.builderName }}</span>
              </template>
              <i class="pi pi-angle-right text-[10px]"></i>
              <span class="text-gray-700 font-medium truncate max-w-[180px]">{{ project.projectName }}</span>
            </nav>

            <!-- RERA + status badges -->
            <div class="flex items-center gap-2 mb-3 flex-wrap">
              <span
                v-if="project.projectReraNumber || project.reraNo"
                class="inline-flex items-center gap-1.5 bg-green-600 text-white text-[11px] font-semibold px-3 py-1 rounded-full"
              >
                <i class="pi pi-verified text-[10px]"></i> RERA Registered
              </span>
              <span
                v-if="project.projectStatus"
                class="inline-block text-[11px] font-semibold px-3 py-1 rounded-full border border-orange-300 bg-orange-50 text-orange-700"
              >
                {{ project.projectStatus }}
              </span>
            </div>

            <!-- Title + action icons -->
            <div class="flex items-start justify-between gap-3 mb-2">
              <h1 class="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                {{ project.projectName || "Project" }}
              </h1>
              <div class="flex items-center gap-2 shrink-0 mt-1">
                <!-- <button
                  @click="handleShortlist"
                  :disabled="togglingWishlist"
                  class="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:border-red-400 hover:text-red-500 transition"
                >
                  <i class="pi pi-heart text-sm"></i>
                </button> -->
                <button
                  @click="openShareModal"
                  class="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-600 transition"
                >
                  <i class="pi pi-share-alt text-sm"></i>
                </button>
              </div>
            </div>

            <!-- Location -->
            <p class="text-sm text-gray-500 flex items-start gap-1.5 mb-5 flex-wrap">
              <i class="pi pi-map-marker text-md mt-1 text-[#EB3131]"></i>
              <span class=" max-w-[400px]">{{ locationLabel }}</span>
            </p>

            <!-- Main hero image -->
            <div
              class="relative rounded-2xl overflow-hidden bg-gray-100 h-[240px] sm:h-[380px] cursor-zoom-in group"
              @click="openCarousel(activeImageIdx)"
            >
              <img
                :src="activeImage"
                :alt="project.projectName"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <i class="pi pi-expand text-[11px]"></i> View all photos
                </span>
              </div>
              <span class="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] text-white/80 bg-black/30 rounded-full px-3 py-1 whitespace-nowrap pointer-events-none">
                Shot on location
              </span>
            </div>

            <!-- Thumbnail strip -->
            <div v-if="heroImages.length > 1" class="mt-2 flex gap-2 overflow-x-auto pb-1">
              <button
                v-for="(img, idx) in heroImages.slice(0, 8)"
                :key="idx"
                @click="activeImageIdx = idx; openCarousel(idx)"
                class="rounded-xl overflow-hidden h-16 w-24 shrink-0 border-2 transition"
                :class="activeImageIdx === idx ? 'border-[#EB3131]' : 'border-transparent opacity-70 hover:opacity-100'"
              >
                <img :src="img" class="w-full h-full object-cover" />
              </button>
            </div>

            <!-- Overview card -->
            <div class="mt-5 bg-white rounded-2xl border border-gray-200 p-5">
              <h2 class="text-base font-bold text-gray-900 mb-2">Overview</h2>
              <p
                class="text-sm text-gray-600 leading-relaxed"
                :class="descExpanded ? '' : 'line-clamp-4'"
              >
                {{ project.description || "No description provided." }}
              </p>
              <button
                v-if="!descExpanded && (project.description || '').length > 200"
                @click="descExpanded = true"
                class="text-sm text-[#EB3131] font-medium mt-1 hover:underline"
              >
                read more
              </button>

              <!-- Stats row -->
              <div class="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p class="text-[11px] text-gray-400 mb-0.5">Configuration</p>
                  <p class="text-sm font-semibold text-gray-800">
                    {{ propertyConfigs.length ? propertyConfigs.join(", ") : "—" }}
                  </p>
                </div>
                <div>
                  <p class="text-[11px] text-gray-400 mb-0.5">{{ project.projectStatus || "Under Construction" }}</p>
                  <p class="text-sm font-semibold text-gray-800">
                    Possession in {{ project.readyToPossessDate || "—" }}
                  </p>
                </div>
                <div>
                  <p class="text-[11px] text-gray-400 mb-0.5">Avg. Price</p>
                  <p class="text-sm font-semibold text-gray-800">
                    {{ project.avgPrice ? formatINR(project.avgPrice) + "/sq.ft" : "—" }}
                  </p>
                </div>
                <div>
                  <p class="text-[11px] text-gray-400 mb-0.5">RERA Carpet Area</p>
                  <p class="text-sm font-semibold text-gray-800">{{ carpetAreaLabel }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- ── RIGHT STICKY PANEL ─────────────────────────────── -->
          <aside class="w-full lg:w-[300px] xl:w-[320px] shrink-0 lg:sticky lg:top-24 pt-4 space-y-4 group-buy-aside">

            <!-- CARD 1+2: Group buy + Price (single combined card) -->
            <div class="rounded-2xl overflow-hidden border shadow-sm" :class="liveCampaign ? 'border-red-200 group-buy-card--live' : 'border-gray-200'">

              <!-- Red section: savings + avatars + join group -->
              <div v-if="liveCampaign" class="bg-[#EB3131] px-5 pt-5 pb-5">
                <p class="text-sm text-white/80 font-medium">You can save upto</p>
                <p class="text-5xl font-extrabold text-white leading-none mt-0.5 savings-pulse">
                  {{ savingsAmount || `${liveCampaign.currentDiscountPercent || 0}%` }}
                </p>
                <p class="text-sm text-white/80 font-medium mt-1">on this property</p>

                <!-- Avatars with swap animation -->
                <div class="flex items-center gap-2.5 mt-4">
                  <div
                    class="relative shrink-0"
                    :style="{ width: `${44 + (Math.min(groupBuyJoinedCount, 3) - 1) * GAP}px`, height: '44px' }"
                  >
                    <div
                      v-for="(_, idx) in Math.min(groupBuyJoinedCount, 3)"
                      :key="idx"
                      class="w-11 h-11 rounded-full border-2 border-white overflow-hidden shadow-md absolute top-0 transition-all duration-[650ms] ease-in-out"
                      :style="{ left: `${avatarLeft(idx, groupBuyJoinedCount)}px`, zIndex: avatarZ(idx, groupBuyJoinedCount) }"
                    >
                      <img
                        :src="`/dummy/dummy-case${(idx % 3) + 1}.webp`"
                        class="w-full h-full object-cover blur-[1.5px]"
                        alt="member"
                      />
                    </div>
                  </div>
                  <span class="text-white/70 font-bold">+</span>
                  <div class="w-10 h-10 rounded-full border-2 border-dashed border-white/50 bg-white/10 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    ?
                  </div>
                </div>

                <!-- Dashed divider -->
                <div class="border-t border-dashed border-white/30 mt-4 mb-3"></div>

                <p class="text-sm text-white mb-3">
                  <span class="font-bold">You?</span> Become {{ memberOrdinal }} member
                </p>
                <div :class="isJoinable ? 'p-[2px] rounded-xl join-btn-border' : ''">
                  <button
                    @click="openStickyJoinModal"
                    :disabled="!isJoinable"
                    class="w-full rounded-[10px] py-3 text-sm font-bold transition"
                    :class="!isJoinable ? 'bg-white/40 text-white/70 cursor-not-allowed' : 'bg-white text-[#EB3131] hover:bg-red-50'"
                  >
                    {{ !isJoinable ? "Group buy paused" : "Join Group" }}
                  </button>
                </div>
              </div>

              <!-- White section: price + green pill + book visit -->
              <div class="bg-white px-5 py-5 space-y-4">
                <div>
                  <p class="text-xs text-gray-400 font-medium mb-1">Price Details</p>
                  <p class="text-2xl font-extrabold text-gray-900 leading-tight">{{ priceLabel }}</p>
                </div>
                <div
                  v-if="liveCampaign"
                  class="bg-green-50 border border-green-100 rounded-xl px-3 py-2.5 text-xs text-green-700 font-medium leading-relaxed"
                >
                  Price may Further reduced as more buyer join the group
                </div>
                <button
                  @click="openBookVisit"
                  class="w-full bg-[#EB3131] hover:bg-[#c72828] text-white rounded-xl py-3 text-sm font-bold transition shadow-sm"
                >
                  Book a Site Visit
                </button>
                <a
                  v-if="brochureUrl"
                  :href="brochureUrl"
                  target="_blank"
                  rel="noopener"
                  class="flex items-center justify-center gap-2 border border-gray-300 rounded-xl w-full py-2.5 text-sm font-medium text-gray-600 hover:border-gray-500 transition"
                >
                  <i class="pi pi-download text-xs"></i>
                  Download brochure
                </a>
              </div>
            </div>

            <!-- CARD 3: About Developer -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h3 class="text-base font-bold text-gray-900">About Developer</h3>

              <!-- Developer identity -->
              <div class="flex items-center gap-3">
                <div class="relative shrink-0">
                  <img
                    v-if="project.builderLogo"
                    :src="project.builderLogo"
                    :alt="project.builderName"
                    class="w-14 h-14 rounded-full object-cover border border-gray-200"
                  />
                  <div
                    v-else
                    class="w-14 h-14 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-2xl font-extrabold text-amber-700 border border-amber-200"
                  >
                    {{ (project.builderName || "B").slice(0, 1).toUpperCase() }}
                  </div>
                  <span class="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <i class="pi pi-check text-white" style="font-size: 9px;"></i>
                  </span>
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-900">{{ project.builderName || "Developer" }}</p>
                  <p class="text-xs text-teal-600 font-semibold mt-0.5">Verified Developer</p>
                </div>
              </div>

              <!-- Estd + city -->
              <p class="text-xs text-gray-500">
                {{ project.region || project.city || "India" }}
              </p>

              <!-- Stats pill -->
              <div class="bg-[#F5EDE0] rounded-xl px-4 py-3">
                <p class="text-sm font-bold text-gray-800">130+ Projects Delivered</p>
                <p class="text-xs text-gray-500 mt-0.5">Trusted by 1300+ Families</p>
              </div>

              <!-- View profile button -->
              <button class="w-full border border-[#EB3131] text-[#EB3131] rounded-xl py-2.5 text-sm font-semibold hover:bg-red-50 transition">
                View Developer Profile
              </button>
            </div>

          </aside>
        </div>
      </div>

      <!-- ========== TABS ========== -->
      <section class="bg-white border-b border-gray-200 sticky top-[72px] z-10 mt-8">
        <div class="max-w-7xl mx-auto px-4 2xl:px-0">
          <div class="flex gap-1 overflow-x-auto whitespace-nowrap py-3">
            <button
              v-for="tab in TABS"
              :key="tab.key"
              @click="activeTab = tab.key"
              class="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition"
              :class="
                activeTab === tab.key
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              "
            >
              <i :class="['pi text-xs', tab.icon]"></i>
              {{ tab.label }}
            </button>
          </div>
        </div>
      </section>

      <!-- ========== TAB BODIES ========== -->
      <section class="max-w-7xl mx-auto px-4 2xl:px-0 py-8">
        <!-- GROUP BUY (shown only when builder has an ACTIVE campaign on this project) -->
        <div v-if="liveCampaign" class="mb-6">
          <div
            class="flex items-center justify-between mb-3 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 px-5 py-3"
          >
            <div>
              <p class="text-xs uppercase tracking-wider text-orange-700 font-semibold">
                Group buy live
              </p>
              <p class="text-base font-semibold text-gray-900">
                {{ liveCampaign.title || "Save more by joining together" }}
              </p>
              <p class="text-xs text-gray-600 mt-0.5">
                Current discount:
                <span class="text-orange-600 font-semibold">
                  {{ liveCampaign.currentDiscountPercent || 0 }}%
                </span>
                · Unlocks more as members join
              </p>
            </div>
          </div>
          <GroupBuyCard
            :people-joined="groupBuyJoinedCount"
            :required-people="groupBuyTargetCount"
            :members="[]"
            :projectId="project?._id"
            :customerId="currentCustomerId"
            :planId="null"
            :campaign="liveCampaign"
            :project="project"
          />
        </div>

        <!-- OVERVIEW -->
        <div v-if="activeTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white rounded-2xl border p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-3">About this project</h2>
            <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {{ project.description || "No description provided." }}
            </p>

            <div v-if="whyConsiderBuying.length" class="mt-6">
              <h3 class="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">
                Why consider buying
              </h3>
              <ul class="space-y-2 text-sm text-gray-700">
                <li v-for="(point, i) in whyConsiderBuying" :key="i" class="flex gap-2">
                  <i class="pi pi-check-circle text-orange-500 mt-1"></i>
                  <span>{{ point }}</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="bg-white rounded-2xl border p-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
              Project facts
            </h3>
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between gap-3">
                <dt class="text-gray-500">Status</dt>
                <dd class="text-gray-900 font-medium">{{ project.projectStatus || "—" }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-gray-500">Builder</dt>
                <dd class="text-gray-900 font-medium truncate">
                  {{ project.builderName || "—" }}
                </dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-gray-500">RERA No.</dt>
                <dd class="text-gray-900 font-medium truncate">
                  {{ project.projectReraNumber || project.reraNo || "—" }}
                </dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-gray-500">Carpet area</dt>
                <dd class="text-gray-900 font-medium">{{ carpetAreaLabel }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-gray-500">Possession</dt>
                <dd class="text-gray-900 font-medium">
                  {{ project.readyToPossessDate || "—" }}
                </dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-gray-500">Region</dt>
                <dd class="text-gray-900 font-medium truncate">
                  {{ project.region || project.city || "—" }}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- PHOTOS -->
        <div v-else-if="activeTab === 'photos'">
          <div v-if="!heroImages.length" class="text-center py-16 text-gray-500">
            <i class="pi pi-images text-5xl text-gray-300 mb-3 block"></i>
            <p>No photos available.</p>
          </div>
          <div v-else>
            <div class="rounded-2xl overflow-hidden">
              <Swiper :space-between="10" :slides-per-view="1">
                <SwiperSlide v-for="(img, idx) in heroImages" :key="idx">
                  <img :src="img" class="w-full h-[300px] sm:h-[500px] object-cover" />
                </SwiperSlide>
              </Swiper>
            </div>
            <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <img
                v-for="(img, idx) in heroImages"
                :key="idx"
                :src="img"
                class="rounded-lg h-28 w-full object-cover border"
              />
            </div>
          </div>
        </div>

        <!-- VIDEO -->
        <div v-else-if="activeTab === 'video'">
          <div v-if="!videoUrl" class="text-center py-16 text-gray-500">
            <i class="pi pi-video text-5xl text-gray-300 mb-3 block"></i>
            <p>No video walkthrough available.</p>
          </div>
          <div v-else class="aspect-video w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border">
            <iframe
              :src="videoUrl"
              class="w-full h-full"
              frameborder="0"
              allow="autoplay; encrypted-media; fullscreen"
              allowfullscreen
            ></iframe>
          </div>
        </div>

        <!-- AMENITIES -->
        <div v-else-if="activeTab === 'amenities'">
          <div v-if="!amenities.length && !facilities.length" class="text-center py-16 text-gray-500">
            <i class="pi pi-star text-5xl text-gray-300 mb-3 block"></i>
            <p>Amenities not listed yet.</p>
          </div>

          <div v-if="amenities.length" class="mb-8">
            <h3 class="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
              Project amenities
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div
                v-for="amenity in amenities"
                :key="amenity"
                class="bg-white border rounded-xl px-4 py-3 text-center text-sm font-medium text-gray-800 shadow-sm flex items-center justify-center gap-2"
              >
                <i class="pi pi-check text-orange-500 text-xs"></i>
                {{ amenity }}
              </div>
            </div>
          </div>

          <div v-if="facilities.length">
            <h3 class="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
              Public facilities nearby
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div
                v-for="(f, i) in facilities"
                :key="i"
                class="bg-white border rounded-xl px-4 py-3 text-center text-sm flex flex-col items-center gap-2"
              >
                <img
                  v-if="f?.iconImage"
                  :src="f.iconImage"
                  :alt="f.name"
                  class="h-8 w-8 object-contain"
                />
                <i v-else class="pi pi-map text-orange-500"></i>
                <span class="text-gray-800 font-medium">{{ f?.name || "—" }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- PLANS -->
        <div v-else-if="activeTab === 'plans'">
          <div v-if="!floorPlans.length && !project.masterPlan" class="text-center py-16 text-gray-500">
            <i class="pi pi-th-large text-5xl text-gray-300 mb-3 block"></i>
            <p>Floor plans not uploaded yet.</p>
          </div>

          <div v-if="project.masterPlan" class="mb-8">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
              Master plan
            </h3>
            <div class="bg-white border rounded-2xl p-4">
              <img
                :src="project.masterPlan"
                alt="Master plan"
                class="w-full max-h-[600px] object-contain"
              />
            </div>
          </div>

          <div v-if="floorPlans.length">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
              Floor plans
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="(fp, i) in floorPlans"
                :key="i"
                class="bg-white border rounded-2xl p-3"
              >
                <img :src="fp" :alt="`Floor plan ${i + 1}`" class="w-full h-72 object-contain" />
              </div>
            </div>
          </div>
        </div>

        <!-- LOCATION -->
        <div v-else-if="activeTab === 'location'">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 bg-white rounded-2xl border overflow-hidden">
              <iframe
                v-if="mapEmbedSrc"
                :src="mapEmbedSrc"
                class="w-full h-[450px]"
                style="border: 0"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              ></iframe>
              <div v-else class="h-[300px] flex items-center justify-center text-gray-400">
                Map not available
              </div>
            </div>
            <div class="bg-white rounded-2xl border p-5 space-y-3 text-sm">
              <div>
                <p class="text-[11px] uppercase tracking-wider text-gray-500">Address</p>
                <p class="text-gray-900">{{ project.address || project.venue || "—" }}</p>
              </div>
              <div>
                <p class="text-[11px] uppercase tracking-wider text-gray-500">Region</p>
                <p class="text-gray-900">{{ project.region || "—" }}</p>
              </div>
              <div>
                <p class="text-[11px] uppercase tracking-wider text-gray-500">City</p>
                <p class="text-gray-900">{{ project.city || project.venue || "—" }}</p>
              </div>
              <div>
                <p class="text-[11px] uppercase tracking-wider text-gray-500">Landmark</p>
                <p class="text-gray-900">{{ project.landmark || "—" }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ABOUT BUILDER -->
        <div v-else-if="activeTab === 'about'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white rounded-2xl border p-6">
            <div class="flex items-center gap-4 mb-4">
              <div
                class="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold"
              >
                {{ (project.builderName || "B").slice(0, 1).toUpperCase() }}
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">
                  {{ project.builderName || "Builder" }}
                </h3>
                <p class="text-sm text-gray-500">
                  {{ project.region || project.city || "—" }}
                </p>
              </div>
            </div>
            <p class="text-sm text-gray-700 leading-relaxed">
              {{ project.description || "No description provided." }}
            </p>
          </div>

          <div class="bg-white rounded-2xl border p-6 text-sm">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
              Reach the builder
            </h3>
            <div class="space-y-3">
              <div>
                <p class="text-[11px] uppercase tracking-wider text-gray-500">Phone</p>
                <p class="text-gray-900">{{ project.builderContact || "—" }}</p>
              </div>
              <div>
                <p class="text-[11px] uppercase tracking-wider text-gray-500">RERA</p>
                <p class="text-gray-900 truncate">
                  {{ project.projectReraNumber || project.reraNo || "—" }}
                </p>
              </div>
              <button
                v-if="project.builderName"
                class="mt-2 w-full bg-black text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800"
                @click="openBookVisit"
              >
                Talk to builder
              </button>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- Not found -->
    <div
      v-else
      class="max-w-7xl mx-auto px-4 py-24 text-center text-gray-500"
    >
      <i class="pi pi-exclamation-circle text-5xl text-gray-300 mb-3 block"></i>
      <p>Project not found.</p>
      <button
        @click="router.push('/project')"
        class="mt-4 px-4 py-2 rounded-full bg-orange-500 text-white text-sm"
      >
        Browse projects
      </button>
    </div>

    <!-- ========== SHARE DIALOG ========== -->
    <Transition name="modal-fade">
      <div
        v-if="showShareModal"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="showShareModal = false"
      >
        <div class="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
            <h3 class="text-base font-bold text-gray-900">Share this project</h3>
            <button @click="showShareModal = false" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
              <i class="pi pi-times text-gray-500 text-xs"></i>
            </button>
          </div>

          <div class="px-5 py-5 space-y-4">
            <!-- Copy link -->
            <div class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
              <i class="pi pi-link text-gray-400 text-sm shrink-0"></i>
              <span class="flex-1 text-xs text-gray-500 truncate">{{ $route.fullPath }}</span>
              <button
                @click="copyLink"
                class="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                :class="linkCopied ? 'bg-green-100 text-green-700' : 'bg-[#EB3131] text-white hover:bg-[#c72828]'"
              >
                {{ linkCopied ? 'Copied!' : 'Copy' }}
              </button>
            </div>

            <!-- Social media grid -->
            <div class="grid grid-cols-3 gap-3">
              <a
                :href="socialLinks.whatsapp" target="_blank" rel="noopener"
                class="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-green-50 hover:bg-green-100 transition"
              >
                <i class="pi pi-whatsapp text-green-600 text-xl"></i>
                <span class="text-[11px] font-medium text-gray-600">WhatsApp</span>
              </a>
              <a
                :href="socialLinks.facebook" target="_blank" rel="noopener"
                class="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 transition"
              >
                <i class="pi pi-facebook text-blue-600 text-xl"></i>
                <span class="text-[11px] font-medium text-gray-600">Facebook</span>
              </a>
              <a
                :href="socialLinks.twitter" target="_blank" rel="noopener"
                class="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 transition"
              >
                <i class="pi pi-twitter text-sky-500 text-xl"></i>
                <span class="text-[11px] font-medium text-gray-600">Twitter / X</span>
              </a>
              <a
                :href="socialLinks.linkedin" target="_blank" rel="noopener"
                class="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 transition"
              >
                <i class="pi pi-linkedin text-blue-700 text-xl"></i>
                <span class="text-[11px] font-medium text-gray-600">LinkedIn</span>
              </a>
              <a
                :href="socialLinks.telegram" target="_blank" rel="noopener"
                class="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 transition"
              >
                <svg class="w-5 h-5 text-sky-500 fill-current" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                <span class="text-[11px] font-medium text-gray-600">Telegram</span>
              </a>
              <a
                :href="socialLinks.email" target="_blank" rel="noopener"
                class="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition"
              >
                <i class="pi pi-envelope text-gray-600 text-xl"></i>
                <span class="text-[11px] font-medium text-gray-600">Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ========== IMAGE CAROUSEL MODAL ========== -->
    <Transition name="modal-fade">
      <div
        v-if="showImageCarousel"
        class="fixed inset-0 z-50 bg-black/95 flex flex-col"
        @keydown.esc="showImageCarousel = false"
      >
        <!-- Toolbar -->
        <div class="flex items-center justify-between px-4 py-3 shrink-0">
          <p class="text-white/70 text-sm font-medium">{{ project.projectName }}</p>
          <button
            @click="showImageCarousel = false"
            class="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <i class="pi pi-times text-white text-sm"></i>
          </button>
        </div>

        <!-- Swiper -->
        <div class="flex-1 min-h-0">
          <Swiper
            :modules="[Navigation, Keyboard]"
            :navigation="true"
            :keyboard="{ enabled: true }"
            :initial-slide="carouselIdx"
            :key="carouselIdx"
            loop
            class="w-full h-full carousel-swiper"
            @swiper="onCarouselSwiper"
            @slideChange="onCarouselSlideChange"
          >
            <SwiperSlide
              v-for="(img, idx) in heroImages"
              :key="idx"
              class="flex items-center justify-center"
            >
              <img
                :src="img"
                :alt="`${project.projectName} – photo ${idx + 1}`"
                class="max-h-full max-w-full object-contain select-none"
              />
            </SwiperSlide>
          </Swiper>
        </div>

        <!-- Thumbnail strip -->
        <div class="shrink-0 flex gap-2 justify-center overflow-x-auto px-4 py-3">
          <button
            v-for="(img, idx) in heroImages"
            :key="idx"
            @click="swiperInstance && swiperInstance.slideToLoop(idx)"
            class="w-14 h-10 rounded-lg overflow-hidden border-2 shrink-0 transition"
            :class="activeCarouselIdx === idx ? 'border-white' : 'border-transparent opacity-50 hover:opacity-80'"
          >
            <img :src="img" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- Group Buy Join Modal (triggered from sticky panel) -->
    <GroupBuyJoinModal
      :open="joinModalOpen"
      :campaign="liveCampaign || {}"
      :customer-id="currentCustomerId"
      :project="project"
      @close="joinModalOpen = false"
      @joined="handleJoined"
    />

    <!-- Site visit modal -->
    <div
      v-if="showVisitModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="showVisitModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-900">Book a site visit</h3>
          <button
            @click="showVisitModal = false"
            class="text-gray-500 hover:text-gray-700"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>

        <p class="text-sm text-gray-600 mb-4">
          For <span class="font-medium">{{ project?.projectName }}</span>
        </p>

        <div class="space-y-3">
          <div>
            <label class="text-xs text-gray-500">Date &amp; time</label>
            <input
              v-model="visitForm.scheduledDate"
              type="datetime-local"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">Your name</label>
            <input
              v-model="visitForm.customerName"
              type="text"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:border-orange-400"
              placeholder="Full name"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">Phone</label>
            <input
              v-model="visitForm.phoneNumber"
              type="tel"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:border-orange-400"
              placeholder="10-digit mobile"
            />
          </div>

          <p
            v-if="visitMsg"
            class="text-sm"
            :class="visitMsg.startsWith('Booked') ? 'text-green-600' : 'text-red-500'"
          >
            {{ visitMsg }}
          </p>

          <button
            @click="submitVisit"
            :disabled="submittingVisit"
            class="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-2.5 rounded-lg hover:opacity-95 disabled:opacity-60"
          >
            {{ submittingVisit ? "Booking…" : "Confirm booking" }}
          </button>

          <p v-if="!authStore.isAuthenticated" class="text-xs text-gray-500 text-center">
            You'll need to <router-link to="/login" class="text-orange-600 underline">log in</router-link> to confirm.
          </p>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* ── Group-buy card animations ─────────────────────────────── */

/* One-time slide-in entrance for the sticky aside */
.group-buy-aside {
  animation: aside-enter 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes aside-enter {
  from { opacity: 0; transform: translateX(32px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* Continuous pulsing glow ring — only when a live campaign exists */
.group-buy-card--live {
  animation: card-glow 2.8s ease-in-out infinite;
}
@keyframes card-glow {
  0%, 100% { box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
  50%       { box-shadow: 0 6px 28px rgba(235,49,49,0.30), 0 0 0 3px rgba(235,49,49,0.12); }
}

/* Savings number — gentle scale pulse */
.savings-pulse {
  display: inline-block;
  animation: savings-pop 2.4s ease-in-out infinite;
  transform-origin: left center;
}
@keyframes savings-pop {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.05); }
}

/* Join button — animated gradient border */
.join-btn-border {
  background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899, #ef4444, #f97316, #a855f7, #6366f1);
  background-size: 300% 300%;
  animation: gradient-shift 4s ease infinite;
}
@keyframes gradient-shift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* ── Modal transitions ──────────────────────────────────────── */
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to    { opacity: 0; }

/* Carousel slide: fill height, center image both axes */
.carousel-swiper :deep(.swiper-wrapper) {
  align-items: center;
}
.carousel-swiper :deep(.swiper-slide) {
  display: flex !important;
  align-items: center;
  justify-content: center;
  height: 100%;
}

/* Swiper nav arrows – white on dark carousel background */
.carousel-swiper :deep(.swiper-button-next),
.carousel-swiper :deep(.swiper-button-prev) {
  color: #fff;
  background: rgba(0,0,0,0.4);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  --swiper-navigation-size: 18px;
}
.carousel-swiper :deep(.swiper-button-next):hover,
.carousel-swiper :deep(.swiper-button-prev):hover {
  background: rgba(0,0,0,0.65);
}
</style>
