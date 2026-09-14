<script setup>
import { onMounted } from "vue";
import { useCaseStudyStore } from "@/stores/caseStudyStore";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";

const caseStudyStore = useCaseStudyStore();

const route = useRoute();
const caseStudyId = route.params.id;

const { specificCaseStudy } = storeToRefs(caseStudyStore);

onMounted(async () => {
  console.log(caseStudyId)
  await caseStudyStore.getCaseStudyById(caseStudyId);
});
</script>

<template>
  <main class="max-w-5xl mx-auto px-4 xl:px-0 py-20" v-if="specificCaseStudy">
    <!-- Title + meta -->
    <header class="space-y-4">
      <h1 class="title-text text-center">
        {{ specificCaseStudy.title }}
      </h1>

      <div
        class="flex flex-wrap items-center justify-center gap-4 text-xs md:text-sm text-gray-600"
      >
        <p v-if="specificCaseStudy.subtitle" class="font-outfit">
          {{ specificCaseStudy.subtitle }}
        </p>
        <p v-if="specificCaseStudy.createdAt" class="font-outfit">
          {{ new Date(specificCaseStudy.createdAt).toLocaleDateString("en-IN") }}
        </p>
      </div>
    </header>

    <!-- Cover image -->
    <div class="mt-6">
      <img
        :src="specificCaseStudy.coverImage"
        :alt="specificCaseStudy.title"
        class="w-full rounded-xl object-cover max-h-[420px]"
      />
    </div>

    <!-- Optional stats row -->
    <div
      v-if="specificCaseStudy.meta"
      class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm font-outfit"
    >
      <div v-if="specificCaseStudy.meta.familiesHelped">
        <p class="text-xs text-gray-500 uppercase tracking-wide">
          Families helped
        </p>
        <p class="text-lg font-semibold">
          {{ specificCaseStudy.meta.familiesHelped }}+
        </p>
      </div>
      <div v-if="specificCaseStudy.meta.totalSavings">
        <p class="text-xs text-gray-500 uppercase tracking-wide">
          Total savings
        </p>
        <p class="text-lg font-semibold">
          ₹ {{ Number(specificCaseStudy.meta.totalSavings).toLocaleString("en-IN") }}
        </p>
      </div>
      <div v-if="specificCaseStudy.meta.maxSavingPerBuyer">
        <p class="text-xs text-gray-500 uppercase tracking-wide">
          Max saving / buyer
        </p>
        <p class="text-lg font-semibold">
          ₹ {{ Number(specificCaseStudy.meta.maxSavingPerBuyer).toLocaleString("en-IN") }}
        </p>
      </div>
    </div>

    <!-- Rich HTML body -->
    <section
      class="mt-8 prose prose-sm md:prose-base max-w-none font-outfit text-gray-800"
      v-html="specificCaseStudy.htmlContent"
    ></section>
  </main>
</template>
