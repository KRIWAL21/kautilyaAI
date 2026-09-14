<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { usePropertyStore } from "@/stores/propertyStore";
import { useAuthStore } from "@/stores/authStore";
import { useMyDashboardStore } from "@/stores/myDashboardStore";

const route = useRoute();
const router = useRouter();

const propertyStore = usePropertyStore();
const { specificPropertyDetails } = storeToRefs(propertyStore);

const authStore = useAuthStore();
const dashboardStore = useMyDashboardStore();

// ---------- Loaders ----------
const loading = ref(false);
const loadProperty = async (id) => {
  if (!id) return;
  loading.value = true;
  try {
    await propertyStore.getPropertyById(id);
  } finally {
    loading.value = false;
  }
};

onMounted(() => loadProperty(route.params.id));
watch(
  () => route.params.id,
  (id) => loadProperty(id),
);

// ---------- Derived data ----------
const property = computed(() => specificPropertyDetails.value || {});

const heroImages = computed(() => {
  const list = property.value?.media?.images;
  return Array.isArray(list) ? list.filter(Boolean) : [];
});
const heroVideos = computed(() => {
  const list = property.value?.media?.videos;
  return Array.isArray(list) ? list.filter(Boolean) : [];
});
const brochureUrl = computed(() => property.value?.media?.brochure_url || "");
const highlights = computed(() => {
  const list = property.value?.highlights;
  return Array.isArray(list) ? list.filter(Boolean) : [];
});
const views = computed(() => {
  const list = property.value?.property_details?.view;
  return Array.isArray(list) ? list.filter(Boolean) : [];
});

// Tabs/actions config — falls back to true when the field is missing.
const truthy = (v) => v !== false;
const tabs = computed(() => property.value?.tabs || {});
const actions = computed(() => property.value?.actions || {});

const TAB_DEFS = [
  { key: "photos", label: "Photos", icon: "pi-images" },
  { key: "videos", label: "Videos", icon: "pi-video" },
  { key: "amenities", label: "Amenities", icon: "pi-star" },
  { key: "plans", label: "Plans", icon: "pi-th-large" },
  { key: "views", label: "Views", icon: "pi-eye" },
  { key: "property_details", label: "Property Details", icon: "pi-list" },
  { key: "project", label: "Project", icon: "pi-building" },
  { key: "locality", label: "Locality", icon: "pi-map-marker" },
];

const visibleTabs = computed(() =>
  TAB_DEFS.filter((t) => truthy(tabs.value[t.key])),
);

const activeTab = ref("");
watch(
  visibleTabs,
  (next) => {
    if (next.length && !next.find((t) => t.key === activeTab.value)) {
      activeTab.value = next[0].key;
    }
  },
  { immediate: true },
);

// ---------- Helpers ----------
const locationLabel = computed(() => {
  const l = property.value?.location || {};
  return (
    l.address ||
    [l.locality, l.city, l.state].filter(Boolean).join(", ") ||
    "Location not specified"
  );
});

const mapEmbedSrc = computed(() => {
  const l = property.value?.location || {};
  const q = encodeURIComponent(
    l.address ||
      [l.locality, l.city, l.state].filter(Boolean).join(", ") ||
      property.value?.title ||
      "",
  );
  if (!q) return "";
  return `https://www.google.com/maps?q=${q}&hl=en&z=15&output=embed`;
});

const carpetAreaLabel = computed(() => {
  const a = property.value?.property_details?.area?.usable_area || {};
  if (!a.value && !a.unit) return "—";
  return `${a.value ?? "—"} ${a.unit ?? "sqft"}`;
});

// ---------- Hero gallery ----------
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

// ---------- Modal: site visit / make offer / contact agent ----------
const modalKind = ref(""); // 'visit' | 'offer' | 'contact'
const submitting = ref(false);
const modalMsg = ref("");
const visitForm = ref({
  scheduledDate: "",
  customerName: "",
  phoneNumber: "",
});
const offerForm = ref({ amount: "", note: "" });
const contactForm = ref({ name: "", phone: "", message: "" });

const openModal = (kind) => {
  modalKind.value = kind;
  modalMsg.value = "";
  if (kind === "visit") {
    visitForm.value = {
      scheduledDate: "",
      customerName:
        authStore.currentUserData?.name || authStore.user?.name || "",
      phoneNumber:
        authStore.currentUserData?.phoneNumber ||
        authStore.user?.phoneNumber ||
        "",
    };
  } else if (kind === "offer") {
    offerForm.value = { amount: "", note: "" };
  } else {
    contactForm.value = {
      name: authStore.currentUserData?.name || authStore.user?.name || "",
      phone:
        authStore.currentUserData?.phoneNumber ||
        authStore.user?.phoneNumber ||
        "",
      message: "",
    };
  }
};

const closeModal = () => {
  modalKind.value = "";
  modalMsg.value = "";
};

const submitVisit = async () => {
  if (!authStore.isAuthenticated) {
    modalMsg.value = "Please log in to book a site visit.";
    return;
  }
  if (!visitForm.value.scheduledDate) {
    modalMsg.value = "Please pick a date and time.";
    return;
  }
  submitting.value = true;
  try {
    const customerId =
      authStore.user?._id || localStorage.getItem("customerId");
    await dashboardStore.bookSiteVisit(customerId, {
      propertyId: property.value?._id,
      scheduledDate: visitForm.value.scheduledDate,
      customerName: visitForm.value.customerName,
      phoneNumber: visitForm.value.phoneNumber,
    });
    modalMsg.value = "Booked! Check your dashboard.";
    setTimeout(closeModal, 1000);
  } catch (err) {
    modalMsg.value =
      err?.response?.data?.message || "Failed to book site visit.";
  } finally {
    submitting.value = false;
  }
};

const submitOffer = () => {
  // No backend endpoint yet — surface a UI confirmation only.
  if (!offerForm.value.amount) {
    modalMsg.value = "Please enter an offer amount.";
    return;
  }
  modalMsg.value = "Offer submitted. The owner will reach out.";
  setTimeout(closeModal, 1000);
};

const submitContact = () => {
  if (!contactForm.value.phone) {
    modalMsg.value = "Phone is required.";
    return;
  }
  modalMsg.value = "Thanks — we'll connect you with the agent shortly.";
  setTimeout(closeModal, 1000);
};

// ---------- Action button handlers ----------
const handleShare = async () => {
  const url = window.location.href;
  const title = property.value?.title || "Property";
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      // Track engagement (best effort).
      if (property.value?._id) {
        await fetch(`/properties/${property.value._id}/analytics/share`, {
          method: "POST",
        }).catch(() => {});
      }
      return;
    } catch {
      /* fall back */
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    modalMsg.value = "Link copied.";
  } catch {
    /* ignore */
  }
};

const handleShortlist = async () => {
  const customerId = authStore.user?._id || localStorage.getItem("customerId");
  if (!customerId) {
    router.push("/login");
    return;
  }
  // Without a backend "property wishlist" endpoint we just acknowledge UI-side.
  modalMsg.value = "Added to favourites.";
};

const handleCompare = () => {
  // Stub — your compare basket can plug in here.
  modalMsg.value = "Added to compare list.";
};
</script>

<template>
  <main class="bg-gray-50 min-h-screen pb-12">
    <div v-if="loading" class="max-w-7xl mx-auto px-4 py-24 text-center text-gray-500">
      <i class="pi pi-spin pi-spinner text-3xl"></i>
      <p class="mt-2 text-sm">Loading property…</p>
    </div>

    <template v-else-if="property?._id">
      <!-- ========== HERO ========== -->
      <section class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 2xl:px-0 pt-24 pb-8">
          <button
            @click="router.back()"
            class="text-sm text-gray-500 hover:text-gray-900 mb-3 inline-flex items-center gap-1"
          >
            <i class="pi pi-arrow-left text-xs"></i> Back
          </button>

          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span
                v-if="property?.visit_details?.showing_status"
                class="inline-block text-[11px] uppercase tracking-wider font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700 mb-2"
              >
                {{ property.visit_details.showing_status }}
              </span>
              <h1 class="text-3xl md:text-4xl font-marcellus text-gray-900">
                {{ property.title || "Property" }}
              </h1>
              <p class="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                <i class="pi pi-map-marker text-xs"></i>
                {{ locationLabel }}
              </p>
            </div>

            <!-- Action flags — only render if enabled in property.actions -->
            <div class="flex flex-wrap gap-2 text-sm">
              <button
                v-if="truthy(actions.share_enabled)"
                @click="handleShare"
                class="px-3 py-1.5 rounded-full border border-gray-300 hover:border-gray-900 flex items-center gap-1.5"
              >
                <i class="pi pi-share-alt text-xs"></i> Share
              </button>
              <!-- <button
                v-if="truthy(actions.compare_enabled)"
                @click="handleCompare"
                class="px-3 py-1.5 rounded-full border border-gray-300 hover:border-gray-900 flex items-center gap-1.5"
              >
                <i class="pi pi-sliders-h text-xs"></i> Compare
              </button> -->
              <!-- <button
                v-if="truthy(actions.shortlist_enabled)"
                @click="handleShortlist"
                class="px-3 py-1.5 rounded-full border border-gray-300 hover:border-orange-400 hover:text-orange-600 flex items-center gap-1.5"
              >
                <i class="pi pi-heart text-xs"></i> Shortlist
              </button> -->
              <!-- <button
                v-if="truthy(actions.make_offer_enabled)"
                @click="openModal('offer')"
                class="px-3 py-1.5 rounded-full border border-gray-300 hover:border-gray-900 flex items-center gap-1.5"
              >
                <i class="pi pi-tag text-xs"></i> Make Offer
              </button> -->
              <button
                v-if="truthy(actions.request_visit_enabled)"
                @click="openModal('visit')"
                class="px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium shadow flex items-center gap-1.5"
              >
                <i class="pi pi-calendar text-xs"></i> Request Visit
              </button>
              <!-- <button
                v-if="truthy(actions.contact_agent_enabled)"
                @click="openModal('contact')"
                class="px-3 py-1.5 rounded-full border border-gray-300 hover:border-gray-900 flex items-center gap-1.5"
              >
                <i class="pi pi-phone text-xs"></i> Contact Agent
              </button> -->
            </div>
          </div>

          <!-- Gallery + summary -->
          <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
            <div class="xl:col-span-2">
              <div
                class="rounded-2xl overflow-hidden bg-gray-100 h-[260px] sm:h-[400px] xl:h-[500px]"
              >
                <img
                  :src="activeImage"
                  :alt="property.title"
                  class="w-full h-full object-cover"
                />
              </div>
              <div
                v-if="heroImages.length > 1"
                class="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2"
              >
                <button
                  v-for="(img, idx) in heroImages.slice(0, 12)"
                  :key="idx"
                  @click="activeImageIdx = idx"
                  class="rounded-lg overflow-hidden h-16 border-2 transition"
                  :class="
                    activeImageIdx === idx
                      ? 'border-orange-500'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  "
                >
                  <img :src="img" class="w-full h-full object-cover" />
                </button>
              </div>
            </div>

            <aside class="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
              <div>
                <p class="text-xs uppercase tracking-wider text-gray-500">Configuration</p>
                <p class="text-2xl font-semibold text-gray-900">
                  {{ property?.property_details?.bhk || "—" }}
                  <span
                    v-if="property?.property_details?.unit_type"
                    class="text-sm text-gray-500 font-normal"
                  >
                    · {{ property.property_details.unit_type }}
                  </span>
                </p>
              </div>

              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="text-[11px] uppercase tracking-wider text-gray-500">Carpet area</p>
                  <p class="font-medium text-gray-800">{{ carpetAreaLabel }}</p>
                </div>
                <div>
                  <p class="text-[11px] uppercase tracking-wider text-gray-500">Project type</p>
                  <p class="font-medium text-gray-800">
                    {{ property?.property_details?.project_type || "—" }}
                  </p>
                </div>
                <div>
                  <p class="text-[11px] uppercase tracking-wider text-gray-500">Available from</p>
                  <p class="font-medium text-gray-800">
                    {{ property?.visit_details?.available_from || "—" }}
                  </p>
                </div>
                <div>
                  <p class="text-[11px] uppercase tracking-wider text-gray-500">Listed on</p>
                  <p class="font-medium text-gray-800">
                    {{ property?.listing_details?.listing_date || "—" }}
                  </p>
                </div>
              </div>

              <a
                v-if="brochureUrl"
                :href="brochureUrl"
                target="_blank"
                rel="noopener"
                class="border border-gray-300 rounded-lg w-full py-2 text-center text-sm font-medium text-gray-700 hover:border-gray-900"
              >
                <i class="pi pi-download text-xs mr-1"></i>
                Download brochure
              </a>

              <button
                v-if="truthy(actions.request_visit_enabled)"
                @click="openModal('visit')"
                class="bg-black text-white rounded-lg w-full py-2.5 text-sm font-medium hover:bg-gray-800"
              >
                Schedule a visit
              </button>
            </aside>
          </div>
        </div>
      </section>

      <!-- ========== TABS ========== -->
      <section
        v-if="visibleTabs.length"
        class="bg-white border-b border-gray-200 sticky top-[72px] z-10"
      >
        <div class="max-w-7xl mx-auto px-4 2xl:px-0">
          <div class="flex gap-1 overflow-x-auto whitespace-nowrap py-3">
            <button
              v-for="tab in visibleTabs"
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
        <!-- PHOTOS -->
        <div v-if="activeTab === 'photos'">
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

        <!-- VIDEOS -->
        <div v-else-if="activeTab === 'videos'">
          <div v-if="!heroVideos.length" class="text-center py-16 text-gray-500">
            <i class="pi pi-video text-5xl text-gray-300 mb-3 block"></i>
            <p>No videos available.</p>
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <video
              v-for="(src, idx) in heroVideos"
              :key="idx"
              :src="src"
              class="w-full rounded-2xl border bg-black"
              controls
            ></video>
          </div>
        </div>

        <!-- AMENITIES -->
        <div v-else-if="activeTab === 'amenities'">
          <div v-if="!highlights.length" class="text-center py-16 text-gray-500">
            <i class="pi pi-star text-5xl text-gray-300 mb-3 block"></i>
            <p>Amenities not listed yet.</p>
          </div>
          <div
            v-else
            class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
          >
            <div
              v-for="amenity in highlights"
              :key="amenity"
              class="bg-white border rounded-xl px-4 py-3 text-center text-sm font-medium text-gray-800 shadow-sm flex items-center justify-center gap-2"
            >
              <i class="pi pi-check text-orange-500 text-xs"></i>
              {{ amenity }}
            </div>
          </div>
        </div>

        <!-- PLANS -->
        <div v-else-if="activeTab === 'plans'">
          <div class="text-center py-16 text-gray-500">
            <i class="pi pi-th-large text-5xl text-gray-300 mb-3 block"></i>
            <p>Floor plans not uploaded for this listing yet.</p>
          </div>
        </div>

        <!-- VIEWS -->
        <div v-else-if="activeTab === 'views'">
          <div v-if="!views.length" class="text-center py-16 text-gray-500">
            <i class="pi pi-eye text-5xl text-gray-300 mb-3 block"></i>
            <p>Views not specified.</p>
          </div>
          <div v-else class="flex flex-wrap gap-2">
            <span
              v-for="v in views"
              :key="v"
              class="px-4 py-2 rounded-full bg-white border text-sm text-gray-700"
            >
              {{ v }}
            </span>
          </div>
        </div>

        <!-- PROPERTY DETAILS -->
        <div v-else-if="activeTab === 'property_details'">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="bg-white rounded-2xl border p-6">
              <h3 class="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                Basics
              </h3>
              <dl class="space-y-3 text-sm">
                <div class="flex justify-between gap-3">
                  <dt class="text-gray-500">Project type</dt>
                  <dd class="text-gray-900 font-medium">
                    {{ property?.property_details?.project_type || "—" }}
                  </dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-gray-500">Unit type</dt>
                  <dd class="text-gray-900 font-medium">
                    {{ property?.property_details?.unit_type || "—" }}
                  </dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-gray-500">BHK</dt>
                  <dd class="text-gray-900 font-medium">
                    {{ property?.property_details?.bhk || "—" }}
                  </dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-gray-500">Flooring</dt>
                  <dd class="text-gray-900 font-medium">
                    {{ property?.property_details?.flooring || "—" }}
                  </dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-gray-500">Area</dt>
                  <dd class="text-gray-900 font-medium">{{ carpetAreaLabel }}</dd>
                </div>
              </dl>
            </div>

            <div class="bg-white rounded-2xl border p-6">
              <h3 class="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                Structure
              </h3>
              <dl class="space-y-3 text-sm">
                <div class="flex justify-between gap-3">
                  <dt class="text-gray-500">Balconies</dt>
                  <dd class="text-gray-900 font-medium">
                    {{ property?.property_details?.structure?.balconies ?? "—" }}
                  </dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-gray-500">Bathrooms</dt>
                  <dd class="text-gray-900 font-medium">
                    {{ property?.property_details?.structure?.bathrooms ?? "—" }}
                  </dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-gray-500">Parkings</dt>
                  <dd class="text-gray-900 font-medium">
                    {{ property?.property_details?.structure?.parkings ?? "—" }}
                  </dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-gray-500">Lifts</dt>
                  <dd class="text-gray-900 font-medium">
                    {{ property?.property_details?.structure?.lifts ?? "—" }}
                  </dd>
                </div>
              </dl>
            </div>

            <div class="bg-white rounded-2xl border p-6">
              <h3 class="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                Vastu
              </h3>
              <dl class="space-y-3 text-sm">
                <div class="flex justify-between gap-3">
                  <dt class="text-gray-500">Entry</dt>
                  <dd class="text-gray-900 font-medium">
                    {{ property?.property_details?.vastu?.entry || "—" }}
                  </dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-gray-500">Exit</dt>
                  <dd class="text-gray-900 font-medium">
                    {{ property?.property_details?.vastu?.exit || "—" }}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <!-- PROJECT (linked) -->
        <div v-else-if="activeTab === 'project'">
          <div class="bg-white rounded-2xl border p-6 text-sm text-gray-600">
            <p v-if="!property?.projectId">
              This listing isn't tied to a specific project.
            </p>
            <div v-else>
              Linked project:
              <button
                class="text-orange-600 underline"
                @click="
                  router.push(
                    `/project-details/${typeof property.projectId === 'string' ? property.projectId : property.projectId?._id}`,
                  )
                "
              >
                Open project page →
              </button>
            </div>
          </div>
        </div>

        <!-- LOCALITY -->
        <div v-else-if="activeTab === 'locality'">
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
                <p class="text-gray-900">{{ property?.location?.address || "—" }}</p>
              </div>
              <div>
                <p class="text-[11px] uppercase tracking-wider text-gray-500">Locality</p>
                <p class="text-gray-900">{{ property?.location?.locality || "—" }}</p>
              </div>
              <div>
                <p class="text-[11px] uppercase tracking-wider text-gray-500">City</p>
                <p class="text-gray-900">{{ property?.location?.city || "—" }}</p>
              </div>
              <div>
                <p class="text-[11px] uppercase tracking-wider text-gray-500">State</p>
                <p class="text-gray-900">{{ property?.location?.state || "—" }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <p
        v-if="modalMsg && !modalKind"
        class="max-w-7xl mx-auto px-4 text-sm text-emerald-600"
      >
        {{ modalMsg }}
      </p>
    </template>

    <div
      v-else
      class="max-w-7xl mx-auto px-4 py-24 text-center text-gray-500"
    >
      <i class="pi pi-exclamation-circle text-5xl text-gray-300 mb-3 block"></i>
      <p>Property not found.</p>
      <button
        @click="router.push('/properties')"
        class="mt-4 px-4 py-2 rounded-full bg-orange-500 text-white text-sm"
      >
        Browse properties
      </button>
    </div>

    <!-- ========== MODAL ========== -->
    <div
      v-if="modalKind"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-900">
            {{
              modalKind === "visit"
                ? "Book a site visit"
                : modalKind === "offer"
                  ? "Make an offer"
                  : "Contact agent"
            }}
          </h3>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <p class="text-sm text-gray-600 mb-4">
          For <span class="font-medium">{{ property?.title }}</span>
        </p>

        <!-- Visit -->
        <div v-if="modalKind === 'visit'" class="space-y-3">
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
              class="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm"
              placeholder="Full name"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">Phone</label>
            <input
              v-model="visitForm.phoneNumber"
              type="tel"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm"
              placeholder="10-digit mobile"
            />
          </div>

          <p
            v-if="modalMsg"
            class="text-sm"
            :class="modalMsg.startsWith('Booked') ? 'text-green-600' : 'text-red-500'"
          >
            {{ modalMsg }}
          </p>

          <button
            @click="submitVisit"
            :disabled="submitting"
            class="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-2.5 rounded-lg hover:opacity-95 disabled:opacity-60"
          >
            {{ submitting ? "Booking…" : "Confirm booking" }}
          </button>
        </div>

        <!-- Offer -->
        <div v-else-if="modalKind === 'offer'" class="space-y-3">
          <div>
            <label class="text-xs text-gray-500">Your offer (₹)</label>
            <input
              v-model="offerForm.amount"
              type="number"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm"
              placeholder="e.g. 12500000"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">Message (optional)</label>
            <textarea
              v-model="offerForm.note"
              rows="3"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm"
              placeholder="Anything you want the seller to know?"
            ></textarea>
          </div>

          <p
            v-if="modalMsg"
            class="text-sm"
            :class="modalMsg.startsWith('Offer') ? 'text-green-600' : 'text-red-500'"
          >
            {{ modalMsg }}
          </p>

          <button
            @click="submitOffer"
            class="w-full bg-black text-white font-bold py-2.5 rounded-lg hover:bg-gray-800"
          >
            Submit offer
          </button>
        </div>

        <!-- Contact -->
        <div v-else class="space-y-3">
          <div>
            <label class="text-xs text-gray-500">Your name</label>
            <input
              v-model="contactForm.name"
              type="text"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">Phone</label>
            <input
              v-model="contactForm.phone"
              type="tel"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm"
              placeholder="10-digit mobile"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">Message</label>
            <textarea
              v-model="contactForm.message"
              rows="3"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm"
              placeholder="What would you like to ask?"
            ></textarea>
          </div>

          <p
            v-if="modalMsg"
            class="text-sm"
            :class="modalMsg.startsWith('Thanks') ? 'text-green-600' : 'text-red-500'"
          >
            {{ modalMsg }}
          </p>

          <button
            @click="submitContact"
            class="w-full bg-black text-white font-bold py-2.5 rounded-lg hover:bg-gray-800"
          >
            Send message
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
