<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useProjectStore } from "@/stores/projectStore";
import { useGroupBuyStore } from "@/stores/groupBuyStore";
import { storeToRefs } from "pinia";
import ExploreByVideo from "@/sections/homeSections/ExploreByVideo.vue";
import FaqSection from "@/sections/homeSections/FaqSection.vue";

const router = useRouter();
const projectStore = useProjectStore();
const groupBuyStore = useGroupBuyStore();

const { projectPropertyListData } = storeToRefs(projectStore);
const { activeCampaigns } = storeToRefs(groupBuyStore);

const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  await Promise.all([
    projectStore.getProjectList(),
    groupBuyStore.fetchActiveCampaigns(),
  ]);
  loading.value = false;
});

// One card per unique city, up to 8
const trendingCities = computed(() => {
  const seen = new Set();
  const result = [];
  for (const p of (projectPropertyListData.value || [])) {
    const city = (p.city || "").toLowerCase().trim();
    if (city && !seen.has(city)) {
      seen.add(city);
      result.push(p);
    }
    if (result.length === 8) break;
  }
  return result;
});

const projectCover = (p) =>
  p?.propertyPictures?.[0] || p?.marketingCollaterals?.[0]?.link || null;

const stableBuyerCount = (project) => {
  const campaign = activeCampaigns.value.find(
    (c) => c.project?._id === project._id || c.projectId === project._id
  );
  if (campaign) return (campaign.slotsTotal || 0) - (campaign.slotsAvailable || 0);
  const hash = (project._id || "x").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return (hash % 180) + 40;
};

const goToCity = (project) => {
  const city = (project.city || "").toLowerCase().trim();
  if (city) router.push(`/cities/${city}`);
};
</script>

<template>
  <main>

    <!-- ── Hero ─────────────────────────────────────────────────────── -->
    <section class="max-w-7xl mx-auto px-4 xl:px-0 py-8 mt-16">
      <div
        class="relative rounded-3xl overflow-hidden min-h-[220px] md:min-h-[260px] flex items-center"
        style="background-color: #F2EAD8;"
      >
        <!-- Left content -->
        <div class="relative z-10 flex flex-col justify-center px-8 md:px-12 py-10 max-w-[56%]">

          <!-- Trust badges -->
          <div class="flex items-center gap-4 mb-5 bg-white/80 backdrop-blur-sm w-fit px-4 py-2.5 rounded-xl shadow-sm">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <i class="pi pi-verified text-green-600 text-[10px]"></i>
              </div>
              <div>
                <div class="text-[11px] font-bold text-gray-800 leading-none">Verified Projects</div>
                <div class="text-[10px] text-gray-400 leading-none mt-0.5">RERE Verified</div>
              </div>
            </div>
            <div class="w-px h-6 bg-gray-200"></div>
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <span class="text-amber-500 font-bold text-[10px]">%</span>
              </div>
              <div>
                <div class="text-[11px] font-bold text-gray-800 leading-none">Lowest Price</div>
                <div class="text-[10px] text-gray-400 leading-none mt-0.5">Group Buying Power</div>
              </div>
            </div>
          </div>

          <!-- Headline -->
          <h1 class="font-intertight font-bold text-[32px] md:text-[42px] xl:text-[50px] text-gray-900 leading-tight">
            Buy Together.<br />Save more.
          </h1>

          <!-- Subtitle -->
          <p class="mt-4 text-gray-600 text-sm md:text-base leading-relaxed max-w-sm">
            Join thousand of buyers using group buying power
            <strong>to unlock best property deals.</strong>
          </p>

          <!-- CTA -->
          <button
            @click="router.push('/project')"
            class="mt-7 w-fit bg-gray-900 hover:bg-gray-700 text-white font-semibold text-sm px-7 py-3 rounded-xl transition-colors duration-200"
          >
            Explore Deals
          </button>
        </div>

        <!-- Right image -->
        <div class="absolute inset-y-0 right-0 w-[48%] hidden md:block">
          <img
            src="/images/GroupBuy/hero.webp"
            alt="Group Buying"
            class="h-full w-full object-cover object-center"
          />
        </div>
      </div>
    </section>

    <!-- ── Trending this week ────────────────────────────────────── -->
    <section class="max-w-7xl mx-auto px-4 xl:px-0 py-10">
      <h2 class="font-intertight font-bold text-[24px] text-gray-900 flex items-center gap-2">
        🔥 Trending this week
      </h2>

      <!-- Skeleton -->
      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
        <div v-for="i in 4" :key="i" class="h-[220px] rounded-2xl bg-gray-100 animate-pulse"></div>
      </div>

      <div v-else-if="!trendingCities.length" class="mt-6 text-center text-gray-400 py-10">
        <i class="pi pi-building text-3xl opacity-30 block mb-2"></i>
        <p class="text-sm">No trending cities right now</p>
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
        <div
          v-for="project in trendingCities"
          :key="project._id"
          @click="goToCity(project)"
          class="relative h-[220px] rounded-2xl overflow-hidden cursor-pointer group"
        >
          <img
            v-if="projectCover(project)"
            :src="projectCover(project)"
            :alt="project.city"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div v-else class="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600"></div>

          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

          <div class="absolute top-3 left-3">
            <span class="bg-green-500 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
              +{{ stableBuyerCount(project) }} Buyers ↑
            </span>
          </div>

          <p class="absolute bottom-3 left-3 text-white font-semibold text-[14px] capitalize drop-shadow">
            {{ project.city }}
          </p>
        </div>
      </div>
    </section>

    <!-- ── Video & FAQ (same as HomeView) ────────────────────────── -->
    <ExploreByVideo />
    <FaqSection />

  </main>
</template>
