<script setup lang="ts">
import { computed, onUnmounted, ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useProjectStore } from "@/store/ProjectStore";
import { useProfileStore } from "@/store/ProfileStore";
import { useAuthStore } from "@/store/AuthStore";
import endpoints from "@/request/endpoints";
import { makeRequest } from "@/request/request";
import type { SiteVisit } from "@/types/sitevisit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, ChevronRight, ExternalLink } from "lucide-vue-next";
import MicrositeShareCard from "@/sections/ProjectSections/MicrositeShareCard.vue";

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const { currentProject, isLoading } = storeToRefs(projectStore);
const authStore = useAuthStore();
const brokerId = computed(() => authStore.userId || localStorage.getItem("userId") || "");

interface ProjectOffer {
  _id: string;
  title?: string;
  description?: string;
  offerTypes?: string[];
  validityDays?: number;
  status?: string;
  startDate?: string;
  imageUrls?: string;
  createdAt?: string;
}

const projectOffers = ref<ProjectOffer[]>([]);
const isOffersLoading = ref(false);
const offersError = ref("");

onMounted(async() => {
  await profileStore.getProfileData()
})

const profileStore = useProfileStore()
const {profileData} = storeToRefs(profileStore)

type ProjectSiteVisit = Omit<SiteVisit, "projectId"> & {
  projectId?:
    | string
    | {
        _id?: string;
        id?: string;
        name?: string;
        projectName?: string;
      };
};

const projectSiteVisits = ref<ProjectSiteVisit[]>([]);
const isSiteVisitsLoading = ref(false);
const siteVisitsError = ref("");

const projectId = computed(() => String(route.params.id || ""));

const normalizeOffers = (payload: any): ProjectOffer[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.offers)) return payload.data.offers;
  if (Array.isArray(payload?.offers)) return payload.offers;
  return [];
};

const normalizeOfferStatus = (status?: string) =>
  String(status || "").trim().toLowerCase();

const normalizeSiteVisitStatus = (status?: string) => {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "cancelled") return "incomplete";
  if (normalized === "complete" || normalized === "incomplete") return normalized;
  return "pending";
};

const siteVisitStatusClass = (status?: string) => {
  const normalized = normalizeSiteVisitStatus(status);
  if (normalized === "complete") return "bg-green-500";
  if (normalized === "incomplete") return "bg-orange-500";
  return "bg-amber-500";
};

const normalizeSiteVisits = (payload: any): ProjectSiteVisit[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.siteVisits)) return payload.data.siteVisits;
  if (Array.isArray(payload?.siteVisits)) return payload.siteVisits;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const getSiteVisitProjectId = (visit: ProjectSiteVisit) => {
  const projectRef = visit?.projectId;
  if (!projectRef) return "";
  if (typeof projectRef === "string") return projectRef;
  return String(projectRef._id || projectRef.id || "");
};

const formatVisitDate = (value?: string) => {
  if (!value) return "-";
  const text = String(value).trim();
  if (!text) return "-";

  const dateOnly = text.includes("T") ? text.split("T")[0] : text.slice(0, 10);
  const parsedDateOnly = new Date(`${dateOnly}T00:00:00`);
  if (!Number.isNaN(parsedDateOnly.getTime())) {
    return parsedDateOnly.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatVisitTime = (value?: string) => {
  const input = String(value || "").trim();
  if (!input) return "-";

  const [hourText = "", minuteText = ""] = input.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return input;

  const timeDate = new Date();
  timeDate.setHours(hour, minute, 0, 0);
  return timeDate.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatVisitPurpose = (purpose?: string) => {
  const text = String(purpose || "").trim();
  if (!text) return "-";

  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatClientPhone = (value?: string | number) => {
  const phone = String(value ?? "").trim();
  return phone || "Phone not available";
};

const getVisitTimestamp = (visit: ProjectSiteVisit) => {
  const dateValue = String(visit.visitDate || "").trim();
  const dateOnly = dateValue.includes("T") ? dateValue.split("T")[0] : dateValue;
  const timeOnly = String(visit.visitTime || "00:00").trim() || "00:00";
  return new Date(`${dateOnly}T${timeOnly}`).getTime();
};

const loadProjectOffers = async () => {
  if (!projectId.value) {
    projectOffers.value = [];
    return;
  }

  try {
    isOffersLoading.value = true;
    offersError.value = "";

    const response = await makeRequest(
      endpoints.projectOffers,
      "GET",
      {},
      {},
      {},
      0,
      projectId.value,
    );

    projectOffers.value = normalizeOffers(response).filter(
      (offer) => normalizeOfferStatus(offer.status) === "active",
    );
  } catch (error) {
    console.error("Error loading project offers", error);
    offersError.value = "Unable to load offers for this project.";
    projectOffers.value = [];
  } finally {
    isOffersLoading.value = false;
  }
};

const loadProjectSiteVisits = async () => {
  if (!projectId.value) {
    projectSiteVisits.value = [];
    return;
  }

  try {
    isSiteVisitsLoading.value = true;
    siteVisitsError.value = "";

    const response = await makeRequest(endpoints.siteVisitsMe, "GET", {}, {}, {}, 0);

    const visits = normalizeSiteVisits(response)
      .filter((visit) => getSiteVisitProjectId(visit) === projectId.value)
      .sort((left, right) => {
        const leftCreatedAt = new Date(String(left.createdAt || "")).getTime();
        const rightCreatedAt = new Date(String(right.createdAt || "")).getTime();

        const hasLeftCreatedAt = Number.isFinite(leftCreatedAt) && leftCreatedAt > 0;
        const hasRightCreatedAt = Number.isFinite(rightCreatedAt) && rightCreatedAt > 0;

        if (hasLeftCreatedAt || hasRightCreatedAt) {
          return (hasRightCreatedAt ? rightCreatedAt : 0) - (hasLeftCreatedAt ? leftCreatedAt : 0);
        }

        const leftVisitAt = getVisitTimestamp(left);
        const rightVisitAt = getVisitTimestamp(right);
        return rightVisitAt - leftVisitAt;
      });

    projectSiteVisits.value = visits;
  } catch (error) {
    console.error("Error loading project site visits", error);
    siteVisitsError.value = "Unable to load booked site visits for this project.";
    projectSiteVisits.value = [];
  } finally {
    isSiteVisitsLoading.value = false;
  }
};

const loadProject = async () => {
  if (!projectId.value) return;
  await Promise.all([
    projectStore.fetchProject(projectId.value),
    loadProjectOffers(),
    loadProjectSiteVisits(),
  ]);
};

watch(projectId, loadProject, { immediate: true });

onUnmounted(() => {
  projectStore.currentProject = null;
  projectOffers.value = [];
  offersError.value = "";
  projectSiteVisits.value = [];
  siteVisitsError.value = "";
});

const project = computed(() => currentProject.value);

const formatINR = (value?: number) => {
  if (!value) return "-";
  return Number(value).toLocaleString("en-IN");
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const offerStatusClass = (status?: string) => {
  const normalized = normalizeOfferStatus(status);
  if (normalized === "active") return "bg-green-500";
  if (normalized === "expired") return "bg-orange-500";
  if (normalized === "inactive") return "bg-gray-500";
  return "bg-slate-500";
};

const parseOfferImageUrls = (imageUrls?: string) => {
  if (!imageUrls) return [];
  return imageUrls
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
};

const getAssetPath = (url: string) => {
  const raw = String(url || "");
  const noQuery = raw.split("?")[0] ?? raw;
  const noHash = noQuery.split("#")[0] ?? noQuery;
  return noHash.toLowerCase();
};

const isImageAsset = (url: string) =>
  /\.(png|jpe?g|gif|webp|bmp|svg|avif)$/.test(getAssetPath(url));

const isVideoAsset = (url: string) =>
  /\.(mp4|webm|mov|m4v|ogg)$/.test(getAssetPath(url));

const isPdfAsset = (url: string) => /\.pdf$/.test(getAssetPath(url));

const locationText = computed(() => {
  if (!project.value) return "-";
  return (
    [project.value.address, project.value.city, project.value.region]
      .filter(Boolean)
      .join(", ") ||
    project.value.glocation ||
    project.value.venue ||
    "-"
  );
});

const projectConfigs = computed(() =>
  Array.isArray(project.value?.PropertyConfig)
    ? project.value?.PropertyConfig.filter(Boolean)
    : [],
);

const amenities = computed(() =>
  Array.isArray(project.value?.amenities)
    ? project.value?.amenities.filter(Boolean)
    : [],
);

const whyBuyPoints = computed(() =>
  Array.isArray(project.value?.whyConsiderBuying)
    ? project.value?.whyConsiderBuying.filter(Boolean)
    : [],
);

const brochureLinks = computed(() =>
  Array.isArray(project.value?.brochure)
    ? project.value?.brochure.filter(Boolean)
    : [],
);

const floorPlanLinks = computed(() =>
  Array.isArray(project.value?.floorPlan)
    ? project.value?.floorPlan.filter(Boolean)
    : [],
);

const propertyPictures = computed(() =>
  Array.isArray(project.value?.propertyPictures)
    ? project.value?.propertyPictures.filter(Boolean)
    : [],
);

const marketingCollateralLinks = computed(() =>
  Array.isArray(project.value?.marketingCollaterals)
    ? project.value?.marketingCollaterals
        .map((item) => item?.link)
        .filter((link): link is string => Boolean(link))
    : [],
);

const marketingVideoLinks = computed(() =>
  Array.isArray(project.value?.marketingCollateralsVideo)
    ? project.value?.marketingCollateralsVideo
        .map((item) => item?.link)
        .filter((link): link is string => Boolean(link))
    : [],
);

const commissionLinks = computed(() =>
  Array.isArray(project.value?.commissionPlan)
    ? project.value?.commissionPlan
        .map((item) => item?.link)
        .filter((link): link is string => Boolean(link))
    : [],
);

const aerialTourLinks = computed(() => {
  const links = [
    ...(marketingVideoLinks.value || []),
    project.value?.videoLink || "",
  ].filter(Boolean);
  return [...new Set(links)];
});

const personalisedVideoLinks = computed(() => {
  const links = [
    ...(marketingVideoLinks.value || []),
    project.value?.videoLink || "",
    project.value?.tourLink || "",
  ].filter(Boolean);
  return [...new Set(links)];
});

const totalVideoAssets = computed(() =>
  Math.max(aerialTourLinks.value.length, personalisedVideoLinks.value.length),
);

const statusClass = computed(() => {
  const status = String(project.value?.projectStatus || "").toLowerCase();
  if (status.includes("pre")) return "bg-blue-500";
  if (status.includes("ongoing") || status.includes("active")) return "bg-green-500";
  if (status.includes("complete") || status.includes("ready")) return "bg-orange-500";
  return "bg-gray-500";
});

const whatsappMessagePreview = computed(() => {
  if (!project.value) return "";

  const rera = project.value.projectReraNumber || project.value.reraNo || "";
  const priceRange =
    project.value.minPrice || project.value.maxPrice
      ? `Rs ${formatINR(project.value.minPrice)} - Rs ${formatINR(project.value.maxPrice)}`
      : "On request";

  return [
    `*${project.value.projectName || "Project"}*`,
    `Location: ${locationText.value}`,
    projectConfigs.value.length
      ? `Configurations: ${projectConfigs.value.join(" | ")}`
      : "Configurations: On request",
    `Price: ${priceRange}`,
    project.value.projectStatus ? `Status: ${project.value.projectStatus}` : "",
    project.value.readyToPossessDate
      ? `Possession: ${project.value.readyToPossessDate}`
      : "",
    amenities.value.length ? `Amenities: ${amenities.value.slice(0, 6).join(" | ")}` : "",
    rera ? `RERA: ${rera}` : "",
    "Interested? Reply for brochure, floor plans and site visit.",
  ]
    .filter(Boolean)
    .join("\n");
});

const smsTemplates = computed(() => {
  if (!project.value) return [];

  const name = project.value.projectName || "Project";
  const location = locationText.value;
  const priceRange =
    project.value.minPrice || project.value.maxPrice
      ? `Rs ${formatINR(project.value.minPrice)} - Rs ${formatINR(project.value.maxPrice)}`
      : "best price";

  return [
    `${name} at ${location}. ${priceRange}. Reply for brochure and site visit.`,
    `Hot offer in ${name}. ${project.value.projectStatus || "Limited inventory"}. Connect now.`,
    `Book your visit for ${name} today. ${projectConfigs.value.join(", ") || "Multiple options"}.`,
  ];
});

interface FeatureCard {
  id: string;
  title: string;
  summary: string;
  response: string;
  links?: string[];
}

const isFeatureDialogOpen = ref(false);
const selectedFeature = ref<FeatureCard | null>(null);

const startingPriceText = computed(() => {
  if (project.value?.minPrice) return `Rs ${formatINR(project.value.minPrice)}`;
  if (project.value?.maxPrice) return `Rs ${formatINR(project.value.maxPrice)}`;
  return "best available price";
});

const allVideoLinks = computed(() =>
  [...new Set([...aerialTourLinks.value, ...personalisedVideoLinks.value])].filter(Boolean),
);

const featureCards = computed<FeatureCard[]>(() => {
  const projectName = project.value?.projectName || "this project";
  const configs = projectConfigs.value.length
    ? projectConfigs.value.join(" | ")
    : "Configurations on request";
  const rera = project.value?.projectReraNumber || project.value?.reraNo || "Not available";
  const possession = project.value?.readyToPossessDate || "To be shared";

  return [
    {
      id: "project-brochure",
      title: "Project Brochure",
      summary: brochureLinks.value.length
        ? `${brochureLinks.value.length} brochure file(s)`
        : "Not configured",
      response: brochureLinks.value.length
        ? `I can share the brochure for ${projectName}. It includes project overview, configuration and pricing highlights.`
        : `Brochure is not configured for ${projectName} yet.`,
      links: brochureLinks.value,
    },
    {
      id: "whatsapp-creatives",
      title: "WhatsApp Creatives",
      summary: propertyPictures.value.length
        ? `${propertyPictures.value.length} project image(s)`
        : "No project photos",
      response: propertyPictures.value.length
        ? `I can share ready project creatives for ${projectName} to start customer conversations quickly.`
        : `No creatives are configured for ${projectName} right now.`,
      links: propertyPictures.value,
    },
    {
      id: "marketing-collateral",
      title: "Marketing Collateral",
      summary: marketingCollateralLinks.value.length
        ? `${marketingCollateralLinks.value.length} collateral asset(s)`
        : "No collateral assets",
      response: marketingCollateralLinks.value.length
        ? `Marketing collateral for ${projectName} is available and can be sent to prospects.`
        : `Marketing collateral is not uploaded for ${projectName}.`,
      links: marketingCollateralLinks.value,
    },
    {
      id: "microsite",
      title: "Personalised Microsite",
      summary: brokerId.value
        ? "Microsite — personalised for you"
        : "Project microsite",
      response: brokerId.value
        ? `Your personalised microsite is live at: http://localhost:3000/${project.value?._id || "<projectId>"}/${brokerId.value} — share this link with prospects so your name and phone appear on the contact section.`
        : `Microsite is available for ${projectName}. Log in to get your personalised link.`,
      links: brokerId.value && project.value?._id
        ? [`http://localhost:3000/${project.value._id}/${brokerId.value}`]
        : [],
    },
    {
      id: "floor-plans",
      title: "Floor Plans",
      summary: floorPlanLinks.value.length
        ? `${floorPlanLinks.value.length} floor plan file(s)`
        : "Not configured",
      response: floorPlanLinks.value.length
        ? `I can share floor plans for ${projectName} based on customer unit preference.`
        : `Floor plans are not configured for ${projectName}.`,
      links: floorPlanLinks.value,
    },
    {
      id: "video-support",
      title: "Aerial / Personalised Video",
      summary: totalVideoAssets.value
        ? `${totalVideoAssets.value} video asset(s)`
        : "Not configured",
      response: allVideoLinks.value.length
        ? `I can share aerial or personalised video assets for ${projectName} to improve lead engagement.`
        : `Video assets are not configured for ${projectName}.`,
      links: allVideoLinks.value,
    },
    {
      id: "tele-calling",
      title: "Tele Calling Support",
      summary: "Uses project pitch, status and pricing in calling scripts.",
      response: `Suggested call opener: ${projectName} in ${locationText.value} is currently ${project.value?.projectStatus || "active"}. Pricing starts from ${startingPriceText.value}. Would you like brochure and site visit options?`,
    },
    {
      id: "best-sales-pitch",
      title: "Best Sales Pitch",
      summary: "Uses config, amenities, possession and value proposition.",
      response: `${projectName} offers ${configs} in ${locationText.value}. Key amenities and the possession timeline (${possession}) make it a strong option for buyers seeking value and location advantage.`,
    },
    {
      id: "commission-details",
      title: "Brokerage / Commission Details",
      summary: commissionLinks.value.length
        ? `${commissionLinks.value.length} commission file(s)`
        : "Not configured",
      response: commissionLinks.value.length
        ? `Commission plan documents are available for ${projectName}.`
        : `Commission plan is not configured for ${projectName}.`,
      links: commissionLinks.value,
    },
    {
      id: "payment-plans",
      title: "Payment Plans",
      summary: "Derived from pricing and project configuration on bot side.",
      response: `Payment plan guidance for ${projectName} is generated using current pricing (${startingPriceText.value}) and selected configuration.`,
    },
    {
      id: "news-events",
      title: "News / Events",
      summary: "Uses status, landmark progress, possession and RERA details.",
      response: `Current project update: ${projectName} is ${project.value?.projectStatus || "in progress"}. Possession: ${possession}. RERA: ${rera}.`,
    },
    {
      id: "project-faqs",
      title: "Project FAQs",
      summary: "FAQ responses are served in bot for this project.",
      response: `FAQ Snapshot\nLocation: ${locationText.value}\nConfigurations: ${configs}\nPrice: ${startingPriceText.value}\nRERA: ${rera}\nPossession: ${possession}`,
    },
  ];
});

const openFeatureResponse = (feature: FeatureCard) => {
  selectedFeature.value = feature;
  isFeatureDialogOpen.value = true;
};
</script>

<template>
  <section class="px-6 pb-8">
    <div class="mb-4 flex items-center justify-between">
      <Button variant="outline" @click="router.push('/projects')">
        <ArrowLeft class="mr-2 h-4 w-4" />
        Back To Projects
      </Button>
      <Button variant="outline" @click="loadProject">Refresh</Button>
    </div>

    <div v-if="isLoading" class="rounded-lg border p-10 text-center text-muted-foreground">
      Loading project details...
    </div>

    <div
      v-else-if="!project"
      class="rounded-lg border p-10 text-center text-muted-foreground"
    >
      Project not found.
    </div>

    <div v-else class="space-y-6">
      <div class="rounded-xl border bg-card p-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 class="text-3xl font-bold">{{ project.projectName }}</h1>
            <p class="mt-1 text-sm text-muted-foreground">{{ locationText }}</p>
          </div>
          <Badge :class="statusClass" class="text-white border-0">
            {{ project.projectStatus || "Unknown" }}
          </Badge>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
          <div class="rounded-md border p-3">
            <p class="text-muted-foreground">Min Price</p>
            <p class="font-semibold">Rs {{ formatINR(project.minPrice) }}</p>
          </div>
          <div class="rounded-md border p-3">
            <p class="text-muted-foreground">Max Price</p>
            <p class="font-semibold">Rs {{ formatINR(project.maxPrice) }}</p>
          </div>
          <div class="rounded-md border p-3">
            <p class="text-muted-foreground">Avg Price</p>
            <p class="font-semibold">Rs {{ formatINR(project.avgPrice) }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div class="space-y-6">
          <div class="rounded-xl border bg-card p-5">
            <h2 class="text-lg font-semibold">Project Information</h2>
            <div class="mt-3 space-y-2 text-sm">
              <p><span class="font-semibold">Builder:</span> {{ project.builderName || "-" }}</p>
              <p><span class="font-semibold">Venue:</span> {{ project.venue || "-" }}</p>
              <p><span class="font-semibold">Address:</span> {{ project.address || "-" }}</p>
              <p><span class="font-semibold">City:</span> {{ project.city || "-" }}</p>
              <p><span class="font-semibold">Region:</span> {{ project.region || "-" }}</p>
              <p>
                <span class="font-semibold">RERA:</span>
                {{ project.projectReraNumber || project.reraNo || "-" }}
              </p>
              <p>
                <span class="font-semibold">Ready To Possess:</span>
                {{ project.readyToPossessDate || "-" }}
              </p>
              <p><span class="font-semibold">Landmark:</span> {{ project.landmark || "-" }}</p>
              <p>
                <span class="font-semibold">Carpet Area:</span>
                {{ project.minCarpetArea || "-" }} - {{ project.maxCarpetArea || "-" }}
              </p>
            </div>

            <div class="mt-4">
              <h3 class="font-semibold">Description</h3>
              <p class="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                {{ project.description || "No description available." }}
              </p>
            </div>
          </div>

          <div class="rounded-xl border bg-card p-5">
            <div class="flex items-center justify-between gap-2">
              <h2 class="text-lg font-semibold">Booked Site Visits</h2>
              <Badge variant="secondary">{{ projectSiteVisits.length }}</Badge>
            </div>
            <p class="mt-1 text-sm text-muted-foreground">
              Broker-booked site visits for this project.
            </p>

            <div
              v-if="isSiteVisitsLoading"
              class="mt-4 rounded-md border p-4 text-sm text-muted-foreground"
            >
              Loading booked site visits...
            </div>

            <div
              v-else-if="siteVisitsError"
              class="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
            >
              {{ siteVisitsError }}
            </div>

            <div
              v-else-if="!projectSiteVisits.length"
              class="mt-4 rounded-md border p-4 text-sm text-muted-foreground"
            >
              No booked site visits for this project yet.
            </div>

            <div v-else class="mt-4 space-y-3">
              <div
                v-for="visit in projectSiteVisits.slice(0, 8)"
                :key="visit._id"
                class="rounded-md border p-3"
              >
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <p class="text-sm font-semibold">{{ visit.clientName || "Unnamed Client" }}</p>
                    <p class="text-xs text-muted-foreground">
                      {{ formatClientPhone(visit.clientPhoneNumber) }}
                    </p>
                  </div>
                  <Badge
                    :class="siteVisitStatusClass(visit.status)"
                    class="border-0 text-white"
                  >
                    {{ normalizeSiteVisitStatus(visit.status) }}
                  </Badge>
                </div>

                <div class="mt-3 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                  <p>
                    <span class="font-semibold text-foreground">Visit Date:</span>
                    {{ formatVisitDate(visit.visitDate) }}
                  </p>
                  <p>
                    <span class="font-semibold text-foreground">Visit Time:</span>
                    {{ formatVisitTime(visit.visitTime) }}
                  </p>
                  <p>
                    <span class="font-semibold text-foreground">Purpose:</span>
                    {{ formatVisitPurpose(visit.purposeOfVisit) }}
                  </p>
                </div>
              </div>

              <Button variant="outline" class="w-full" @click="router.push('/site-visits')">
                View All Site Visits
              </Button>
            </div>
          </div>
        </div>

        <div class="rounded-xl border bg-card p-5">
          <h2 class="text-lg font-semibold">Configurations And Amenities</h2>
          <div class="mt-3 space-y-3">
            <div>
              <h3 class="text-sm font-semibold">Property Configurations</h3>
              <div class="mt-2 flex flex-wrap gap-2">
                <Badge
                  v-for="config in projectConfigs"
                  :key="config"
                  variant="secondary"
                >
                  {{ config }}
                </Badge>
                <p v-if="!projectConfigs.length" class="text-sm text-muted-foreground">
                  Not configured.
                </p>
              </div>
            </div>

            <div>
              <h3 class="text-sm font-semibold">Amenities</h3>
              <div class="mt-2 flex flex-wrap gap-2">
                <Badge v-for="amenity in amenities" :key="amenity" variant="outline">
                  {{ amenity }}
                </Badge>
                <p v-if="!amenities.length" class="text-sm text-muted-foreground">
                  Not configured.
                </p>
              </div>
            </div>

            <div>
              <h3 class="text-sm font-semibold">Why Consider Buying</h3>
              <ul
                v-if="whyBuyPoints.length"
                class="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground"
              >
                <li v-for="point in whyBuyPoints" :key="point">{{ point }}</li>
              </ul>
              <p v-else class="mt-2 text-sm text-muted-foreground">No key points configured.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-xl border bg-card p-5">
        <h2 class="text-lg font-semibold">Media And Documents</h2>
        <div class="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 class="text-sm font-semibold">Project Brochures</h3>
            <div class="mt-2 space-y-2 text-sm">
              <a
                v-for="(link, index) in brochureLinks"
                :key="`brochure-${index}`"
                :href="link"
                target="_blank"
                class="flex items-center gap-1 text-blue-600 underline"
              >
                Brochure {{ index + 1 }} <ExternalLink class="h-3.5 w-3.5" />
              </a>
              <p v-if="!brochureLinks.length" class="text-muted-foreground">No brochure uploaded.</p>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold">Floor Plans</h3>
            <div class="mt-2 space-y-2 text-sm">
              <a
                v-for="(link, index) in floorPlanLinks"
                :key="`floor-${index}`"
                :href="link"
                target="_blank"
                class="flex items-center gap-1 text-blue-600 underline"
              >
                Floor Plan {{ index + 1 }} <ExternalLink class="h-3.5 w-3.5" />
              </a>
              <p v-if="!floorPlanLinks.length" class="text-muted-foreground">No floor plan uploaded.</p>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold">Personalised Microsite</h3>
            <a
              v-if="project._id && brokerId"
              :href="`http://localhost:3000/${project._id}/${brokerId}`"
              target="_blank"
              class="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 underline"
            >
              Open My Personalised Microsite <ExternalLink class="h-3.5 w-3.5" />
            </a>
            <p v-else class="mt-2 text-sm text-muted-foreground">Microsite link unavailable.</p>
          </div>

          <div>
            <h3 class="text-sm font-semibold">Virtual Tour / Video</h3>
            <div class="mt-2 space-y-2 text-sm">
              <a
                v-if="project.tourLink"
                :href="project.tourLink"
                target="_blank"
                class="inline-flex items-center gap-1 text-blue-600 underline"
              >
                Open Tour Link <ExternalLink class="h-3.5 w-3.5" />
              </a>
              <a
                v-if="project.videoLink"
                :href="project.videoLink"
                target="_blank"
                class="inline-flex items-center gap-1 text-blue-600 underline"
              >
                Open Video Link <ExternalLink class="h-3.5 w-3.5" />
              </a>
              <p v-if="!project.tourLink && !project.videoLink" class="text-muted-foreground">
                No virtual tour/video configured.
              </p>
            </div>
          </div>
        </div>

        <div v-if="propertyPictures.length" class="mt-4">
          <h3 class="mb-2 text-sm font-semibold">Property Pictures</h3>
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            <img
              v-for="(img, idx) in propertyPictures.slice(0, 10)"
              :key="`img-${idx}`"
              :src="img"
              :alt="`Project image ${idx + 1}`"
              class="h-28 w-full rounded-md object-cover"
            />
          </div>
        </div>
      </div>

      <!-- ── Personalised Microsite Share Card ────────────────────────── -->
      <MicrositeShareCard
        v-if="project._id && brokerId"
        :project-id="project._id"
        :user-id="brokerId"
        :project-name="project.projectName"
      />

      <div class="rounded-xl border bg-card p-5">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-lg font-semibold">Associated Active Offers</h2>
          <Badge variant="secondary">{{ projectOffers.length }} Active Offer(s)</Badge>
        </div>

        <div
          v-if="isOffersLoading"
          class="mt-4 rounded-md border p-6 text-center text-sm text-muted-foreground"
        >
          Loading associated offers...
        </div>

        <div
          v-else-if="offersError"
          class="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {{ offersError }}
        </div>

        <div
          v-else-if="!projectOffers.length"
          class="mt-4 rounded-md border p-6 text-center text-sm text-muted-foreground"
        >
          No active offers are associated with this project yet.
        </div>

        <div v-else class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div
            v-for="offer in projectOffers"
            :key="offer._id"
            class="rounded-md border p-4"
          >
            <div class="flex items-start justify-between gap-2">
              <h3 class="text-base font-semibold">
                {{ offer.title || "Untitled Offer" }}
              </h3>
              <Badge :class="offerStatusClass(offer.status)" class="border-0 text-white">
                {{ offer.status || "Unknown" }}
              </Badge>
            </div>

            <p class="mt-2 text-sm text-muted-foreground">
              {{ offer.description || "No description provided." }}
            </p>

            <div class="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <p>
                <span class="font-semibold text-foreground">Start:</span>
                {{ formatDate(offer.startDate) }}
              </p>
              <p>
                <span class="font-semibold text-foreground">Validity:</span>
                {{ offer.validityDays ? `${offer.validityDays} day(s)` : "-" }}
              </p>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
              <Badge
                v-for="type in offer.offerTypes || []"
                :key="`${offer._id}-${type}`"
                variant="outline"
              >
                {{ type }}
              </Badge>
            </div>

            <div v-if="parseOfferImageUrls(offer.imageUrls).length" class="mt-3">
              <p class="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Offer Assets</p>
              <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div
                  v-for="(asset, index) in parseOfferImageUrls(offer.imageUrls)"
                  :key="`${offer._id}-asset-${index}`"
                  class="overflow-hidden rounded-md border"
                >
                  <img
                    v-if="isImageAsset(asset)"
                    :src="asset"
                    :alt="`Offer asset ${index + 1}`"
                    class="h-36 w-full object-cover"
                  />
                  <video
                    v-else-if="isVideoAsset(asset)"
                    :src="asset"
                    controls
                    class="h-36 w-full bg-black object-contain"
                  />
                  <iframe
                    v-else-if="isPdfAsset(asset)"
                    :src="asset"
                    :title="`Offer PDF ${index + 1}`"
                    class="h-52 w-full"
                  />
                  <div v-else class="p-3">
                    <p class="text-xs text-muted-foreground">Preview not supported for this file type.</p>
                    <p class="mt-1 break-all text-[11px] text-muted-foreground">{{ asset }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-xl border bg-card p-5">
        <h2 class="text-lg font-semibold">WhatsApp Bot Feature Coverage</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          This section mirrors the project-specific tools available in the WhatsApp bot.
        </p>

        <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <button
            v-for="feature in featureCards"
            :key="feature.id"
            type="button"
            class="rounded-md border p-3 text-left transition-colors hover:border-primary/50 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            @click="openFeatureResponse(feature)"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="font-semibold">{{ feature.title }}</p>
                <p class="text-sm text-muted-foreground">{{ feature.summary }}</p>
              </div>
              <ChevronRight class="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          </button>
        </div>

        <Dialog v-model:open="isFeatureDialogOpen">
          <DialogContent class="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{{ selectedFeature?.title || "Feature Response" }}</DialogTitle>
              <DialogDescription>
                Project-specific response used in WhatsApp bot flows.
              </DialogDescription>
            </DialogHeader>

            <div v-if="selectedFeature" class="space-y-3">
              <div class="rounded-md border p-3">
                <p class="text-xs uppercase tracking-wide text-muted-foreground">Current Status</p>
                <p class="mt-1 text-sm">{{ selectedFeature.summary }}</p>
              </div>

              <div class="rounded-md border p-3">
                <p class="text-xs uppercase tracking-wide text-muted-foreground">Response</p>
                <p class="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                  {{ selectedFeature.response }}
                </p>
              </div>

              <div v-if="selectedFeature.links?.length" class="rounded-md border p-3">
                <p class="text-xs uppercase tracking-wide text-muted-foreground">Mapped Assets</p>
                <div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div
                    v-for="(link, index) in selectedFeature.links"
                    :key="`${selectedFeature.id}-${index}`"
                    class="overflow-hidden rounded-md border"
                  >
                    <img
                      v-if="isImageAsset(link)"
                      :src="link"
                      :alt="`Mapped asset ${index + 1}`"
                      class="h-32 w-full object-cover"
                    />
                    <video
                      v-else-if="isVideoAsset(link)"
                      :src="link"
                      controls
                      class="h-32 w-full bg-black object-contain"
                    />
                    <iframe
                      v-else-if="isPdfAsset(link)"
                      :src="link"
                      :title="`Mapped PDF ${index + 1}`"
                      class="h-48 w-full"
                    />
                    <div v-else class="p-3">
                      <p class="text-xs text-muted-foreground">Preview not supported for this file type.</p>
                      <p class="mt-1 break-all text-[11px] text-muted-foreground">{{ link }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div class="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div class="rounded-md border p-3">
            <h3 class="font-semibold">WhatsApp Message Preview</h3>
            <pre class="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{{ whatsappMessagePreview }}</pre>
          </div>

          <div class="rounded-md border p-3">
            <h3 class="font-semibold">SMS Message Templates</h3>
            <div class="mt-2 space-y-2 text-sm text-muted-foreground">
              <p v-for="(msg, idx) in smsTemplates" :key="`sms-${idx}`">
                <span class="font-semibold text-foreground">SMS {{ idx + 1 }}:</span>
                {{ msg }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
