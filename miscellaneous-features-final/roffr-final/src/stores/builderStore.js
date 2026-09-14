import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { makeRequest } from "@/request/request";
import endpoints from "@/request/endpoints";

export const useBuilderStore = defineStore("builder", () => {
  const builderList = ref([]);
  const builderListLoading = ref(false);
  const builderListError = ref(null);

  const currentBuilder = ref({});
  const currentBuilderLoading = ref(false);
  const currentBuilderError = ref(null);

  const builderListTotal = computed(() => builderList.value.length);

  const getBuilderList = async ({ search = "" } = {}) => {
    builderListLoading.value = true;
    builderListError.value = null;
    try {
      const response = await makeRequest(
        endpoints.builder,
        "GET",
        {},
        {},
        {},
        0,
      );

      const list = Array.isArray(response?.data) ? response.data : [];

      builderList.value = search
        ? list.filter((b) =>
            (b?.companyName || "")
              .toLowerCase()
              .includes(search.toLowerCase()),
          )
        : list;
    } catch (error) {
      console.error("Error in fetching builder list", error);
      builderListError.value =
        error?.response?.data?.message ?? "Failed to load builders";
      builderList.value = [];
    } finally {
      builderListLoading.value = false;
    }
  };

  const getBuilderById = async (id) => {
    if (!id) return;
    currentBuilderLoading.value = true;
    currentBuilderError.value = null;
    try {
      const response = await makeRequest(
        endpoints.builderById,
        "GET",
        {},
        {},
        {},
        0,
        id,
      );

      currentBuilder.value = response?.data ?? response ?? {};
    } catch (error) {
      console.error("Error in fetching builder by id", error);
      currentBuilderError.value =
        error?.response?.data?.message ?? "Failed to load builder";
      currentBuilder.value = {};
    } finally {
      currentBuilderLoading.value = false;
    }
  };

  const reset = () => {
    builderList.value = [];
    currentBuilder.value = {};
  };

  return {
    builderList,
    builderListTotal,
    builderListLoading,
    builderListError,
    currentBuilder,
    currentBuilderLoading,
    currentBuilderError,
    getBuilderList,
    getBuilderById,
    reset,
  };
});
