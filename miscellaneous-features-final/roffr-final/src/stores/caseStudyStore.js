// src/stores/caseStudyStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { caseStudies as caseStudiesData } from "@/dummyData/case-study";

export const useCaseStudyStore = defineStore("caseStudy", () => {
  const caseStudies = ref(caseStudiesData); // static import
  const specificCaseStudy = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const getCaseStudies = () => {
    // for dummy data this is trivial, but keep API same
    loading.value = false;
    error.value = null;
    caseStudies.value = caseStudiesData;
  };

  const getCaseStudyById = (id) => {
    if (!id) return;
    loading.value = false;
    error.value = null;

    const found =
      caseStudies.value.find((c) => c._id === id || c.slug === id) || null;
    specificCaseStudy.value = found;
  };

  return {
    caseStudies,
    specificCaseStudy,
    loading,
    error,
    getCaseStudies,
    getCaseStudyById,
  };
});
