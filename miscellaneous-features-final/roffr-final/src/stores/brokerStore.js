import { makeRequest } from "@/request/request";
import { defineStore } from "pinia";
import endpoints from "@/request/endpoints";
import { ref } from "vue";

export const useBrokerStore = defineStore("broker", () => {
  const currentBrokerData = ref({});
  const brokerData = ref({});
  const brokerList = ref([]);
  const brokerListTotal = ref(0);
  const brokerListPage = ref(1);
  const brokerListPageSize = ref(12);

  const getCurrentBrokerData = async (id) => {
    try {
      const response = await makeRequest(
        endpoints.broker,
        "GET",
        {},
        {},
        {},
        0,
        id,
      );

      currentBrokerData.value = response?.data ?? {};
    } catch (error) {
      console.error("Error in fetching current broker data", error);
    }
  };

  const getBrokerData = async (id) => {
    try {
      const response = await makeRequest(
        endpoints.broker,
        "GET",
        {},
        {},
        {},
        0,
        id,
      );

      brokerData.value = response?.data ?? {};
    } catch (error) {
      console.error("Error in fetching broker data", error);
    }
  };

  const getBrokerList = async ({ search = "", sortBy = "createdAt", sortOrder = "desc" } = {}) => {
    try {
      const params = {
        pageNumber: brokerListPage.value,
        pageSize: brokerListPageSize.value,
        sortBy,
        sortOrder,
      };
      if (search) params.searchQuery = search;

      const response = await makeRequest(
        endpoints.broker,
        "GET",
        {},
        {},
        params,
        0,
      );

      const payload = response?.data ?? {};
      brokerList.value = payload?.users ?? payload?.data ?? [];
      brokerListTotal.value =
        payload?.total ?? payload?.totalUsers ?? brokerList.value.length;
    } catch (error) {
      console.error("Error in fetching broker list", error);
      brokerList.value = [];
      brokerListTotal.value = 0;
    }
  };

  const reset = () => {
    brokerData.value = {};
    brokerList.value = [];
    brokerListTotal.value = 0;
  };

  return {
    getBrokerData,
    getCurrentBrokerData,
    getBrokerList,
    currentBrokerData,
    brokerData,
    brokerList,
    brokerListTotal,
    brokerListPage,
    brokerListPageSize,
    reset,
  };
});
