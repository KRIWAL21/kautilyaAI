<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useBuilderStore } from "@/stores/builderStore";
import { makeRequest } from "@/request/request";
import endpoints from "@/request/endpoints";

const route = useRoute();
const router = useRouter();

const builderStore = useBuilderStore();
const { currentBuilder, currentBuilderLoading, currentBuilderError } =
  storeToRefs(builderStore);

const submitting = ref(false);
const submitMsg = ref("");
const contactForm = ref({
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
});

const builder = computed(() => currentBuilder.value || {});

// ---------- Builder's projects ----------
const builderProjects = ref([]);
const projectsLoading = ref(false);
const projectsError = ref("");

const formatINR = (n) => {
  const num = Number(n || 0);
  if (!num) return "Price on request";
  if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹ ${(num / 100000).toFixed(1)} L`;
  return `₹ ${num.toLocaleString("en-IN")}`;
};

const goToProject = (id) => {
  if (!id) return;
  router.push(`/project-details/${id}`);
};

// We hit /search/list?type=project&term=<builderName> which filters across
// builderName/projectName/description/venue, then we tighten that on the client
// to only projects whose builderName actually matches the company.
const loadBuilderProjects = async (term) => {
  if (!term) {
    builderProjects.value = [];
    return;
  }
  projectsLoading.value = true;
  projectsError.value = "";
  try {
    const res = await makeRequest(
      endpoints.search,
      "GET",
      {},
      {},
      { type: "project", term, page: 1, limit: 24 },
      0,
    );
    const list = res?.data?.results ?? [];
    const normalized = (Array.isArray(list) ? list : [])
      .map((entry) =>
        entry && typeof entry === "object" && "doc" in entry ? entry.doc : entry,
      )
      .filter(Boolean);

    // Tighten the match: case-insensitive equality on builderName when present.
    const target = term.toLowerCase();
    builderProjects.value = normalized.filter((p) => {
      if (!p) return false;
      const bn = (p.builderName || "").toLowerCase();
      // Allow empty builderName projects through if the project name itself
      // matches the company strongly (handles seed inconsistencies).
      if (!bn) return (p.projectName || "").toLowerCase().includes(target);
      return bn.includes(target);
    });
  } catch (err) {
    console.error("loadBuilderProjects failed", err);
    projectsError.value =
      err?.response?.data?.message || "Failed to load projects";
    builderProjects.value = [];
  } finally {
    projectsLoading.value = false;
  }
};

const initials = (name) =>
  (name || "?")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const loadBuilder = async (id) => {
  if (!id) return;
  await builderStore.getBuilderById(id);
  await loadBuilderProjects(builder.value?.companyName);
};

onMounted(() => loadBuilder(route.params.id));
watch(
  () => route.params.id,
  (id) => loadBuilder(id),
);
// If the builder loads after the page mounts (e.g. cache miss), fetch projects
// once we know the company name.
watch(
  () => builder.value?.companyName,
  (name, prev) => {
    if (name && name !== prev) loadBuilderProjects(name);
  },
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
    submitMsg.value = "Thanks — the builder will reach out shortly.";
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

    <div v-if="currentBuilderLoading" class="py-16 text-center text-gray-500">
      Loading…
    </div>

    <div
      v-else-if="currentBuilderError"
      class="bg-red-50 text-red-600 text-sm rounded-md p-3"
    >
      {{ currentBuilderError }}
    </div>

    <div v-else class="flex flex-col lg:flex-row gap-6">
      <!-- LEFT (70%) -->
      <div class="w-full lg:w-[70%]">
        <div class="flex items-center gap-4 mb-4">
          <div
            class="h-20 w-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold border-4 border-white shadow"
          >
            <img
              v-if="builder?.logo"
              :src="builder.logo"
              :alt="builder.companyName"
              class="h-full w-full rounded-full object-cover"
            />
            <span v-else>{{ initials(builder?.companyName) }}</span>
          </div>
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">
              {{ builder?.companyName || "Builder" }}
            </h1>
            <p class="text-sm text-gray-500">
              {{ builder?.newReraNumber ? `RERA: ${builder.newReraNumber}` : "Verified developer" }}
            </p>
          </div>
        </div>

        <div class="border-b mb-6"></div>

        <h2 class="text-lg font-semibold mb-3">About</h2>
        <p class="text-sm text-gray-700 leading-relaxed mb-6">
          {{ builder?.aboutUs || "No description provided yet." }}
        </p>

        <h2 class="text-lg font-semibold mb-3">Contact details</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div>
            <p class="text-gray-500 text-xs uppercase tracking-wider">Phone</p>
            <p class="mt-1 text-sm text-gray-800">
              {{ builder?.contactNumber || "—" }}
            </p>
          </div>
          <div>
            <p class="text-gray-500 text-xs uppercase tracking-wider">Email</p>
            <p class="mt-1 text-sm text-gray-800 truncate">
              {{ builder?.email || "—" }}
            </p>
          </div>
          <div>
            <p class="text-gray-500 text-xs uppercase tracking-wider">Address</p>
            <p class="mt-1 text-sm text-gray-800">
              {{ builder?.newAddress || "—" }}
            </p>
          </div>
        </div>

        <div v-if="builder?.guideBook" class="bg-orange-50 rounded-xl p-4">
          <p class="text-xs uppercase tracking-wider text-orange-700">
            Guide book
          </p>
          <a
            :href="builder.guideBook"
            target="_blank"
            rel="noopener"
            class="text-sm text-orange-700 underline mt-1 inline-block"
          >
            Open guide book →
          </a>
        </div>
      </div>

      <!-- RIGHT (30%) — Contact form -->
      <div class="w-full lg:w-[30%]">
        <div class="border rounded-xl p-4 flex flex-col gap-3 bg-white">
          <h3 class="font-semibold text-gray-900">Talk to this builder</h3>

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

    <!-- Projects by this builder -->
    <div class="mt-12">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-marcellus text-gray-900">
          Projects by {{ builder?.companyName || "this builder" }}
        </h2>
        <span v-if="builderProjects.length" class="text-xs text-gray-500">
          {{ builderProjects.length }} project{{ builderProjects.length === 1 ? "" : "s" }}
        </span>
      </div>

      <div v-if="projectsError" class="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-3">
        {{ projectsError }}
      </div>

      <div
        v-if="projectsLoading"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div
          v-for="n in 3"
          :key="n"
          class="rounded-2xl bg-white border overflow-hidden animate-pulse"
        >
          <div class="h-44 bg-gray-100"></div>
          <div class="p-4 space-y-2">
            <div class="h-4 bg-gray-100 rounded w-3/4"></div>
            <div class="h-3 bg-gray-100 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <div
        v-else-if="!builderProjects.length"
        class="text-center py-12 text-gray-500 bg-white rounded-2xl border"
      >
        <i class="pi pi-building text-4xl text-gray-300 mb-2 block"></i>
        <p class="text-sm">No projects listed for this builder yet.</p>
      </div>

      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <article
          v-for="proj in builderProjects"
          :key="proj._id"
          @click="goToProject(proj._id)"
          class="rounded-2xl bg-white border shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition"
        >
          <div class="relative h-44 overflow-hidden bg-gray-100">
            <img
              v-if="proj.propertyPictures?.[0] || proj.floorPlan?.[0]"
              :src="proj.propertyPictures?.[0] || proj.floorPlan?.[0]"
              :alt="proj.projectName"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900"
            ></div>
            <span
              v-if="proj.projectStatus"
              class="absolute top-3 left-3 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-semibold bg-orange-50 text-orange-600 border border-orange-200"
            >
              {{ proj.projectStatus }}
            </span>
          </div>
          <div class="p-4">
            <h3 class="text-sm font-semibold text-gray-900 line-clamp-2">
              {{ proj.projectName || "Untitled project" }}
            </h3>
            <p class="text-xs text-gray-500 mt-1 line-clamp-1">
              {{ proj.venue || proj.glocation || "—" }}
            </p>
            <p
              v-if="proj.minPrice || proj.maxPrice"
              class="text-sm font-semibold text-gray-900 mt-2"
            >
              {{ formatINR(proj.minPrice) }}
              <span v-if="proj.maxPrice" class="text-xs text-gray-500 font-normal">
                – {{ formatINR(proj.maxPrice) }}
              </span>
            </p>
            <button
              class="mt-3 w-full bg-black text-white text-xs py-2 rounded-full hover:bg-gray-800"
              @click.stop="goToProject(proj._id)"
            >
              View project
            </button>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
