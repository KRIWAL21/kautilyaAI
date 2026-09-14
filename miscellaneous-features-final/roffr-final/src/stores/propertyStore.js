import { makeRequest } from "@/request/request";
import { defineStore } from "pinia";
import endpoints from "@/request/endpoints";
import { ref } from "vue";

export const usePropertyStore = defineStore("property", () => {
  const propertyData = ref([]);
  const specificPropertyDetails = ref([]);
  const propertyListData = ref([]);
  const pageNumber = ref(1);
  const pageSize = ref(10);
  const totalpages = ref(0);

    const getProperty = async () => {
      try {
        const params = {
           pageSize: pageSize.value,
          pageNumber: pageNumber.value,
        };
        const response = await makeRequest(
          endpoints.property,
          "GET",
          {},
          {},
          params,
          0
        );

        propertyData.value = response?.data;
      } catch (error) {
        console.error("Error in fetching specific project data", error);
      }
    };

  const getPropertyById = async (id) => {
    try {
      const response = await makeRequest(
        endpoints.propertyById,
        "GET",
        {},
        {},
        {},
        0,
        id
      );

      specificPropertyDetails.value = response?.data;
    } catch (error) {
      console.error("Error in fetching specific project data", error);
    }
  };

  const getProjectPropertyList = async (
    type = "property",
    search = "",
    city = ""
  ) => {
    try {
      const params = {
        type: type,
        search: search,
        city: city,
        limit: pageSize.value,
        page: pageNumber.value,
      };
      const response = await makeRequest(
        endpoints.getProjectProperty,
        "GET",
        {},
        {},
        params,
        0
      );

      propertyListData.value = response?.data?.results;
      totalpages.value = response?.data?.total;
      pageSize.value = response?.data?.limit;
      pageNumber.value = response?.data?.page;
    } catch (error) {
      console.error("Error in fetching specific project data", error);
    }
  };

  // getProjectPropertyList();

  return {
    propertyData,
    totalpages,
    getPropertyById,
    getProperty,
    specificPropertyDetails,
    propertyListData,
    pageNumber,
    pageSize,
  };
});
