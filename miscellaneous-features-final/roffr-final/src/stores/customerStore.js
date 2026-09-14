import { makeRequest } from "@/request/request";
import { defineStore } from "pinia";
import endpoints from "@/request/endpoints";
import { ref } from "vue";

export const useCustomerStore = defineStore("customer", () => {
  const currentUserData = ref([])
  const customerData = ref([]);

  const getCurrentUserData = async (id) => {
    try {
      const response = await makeRequest(
        endpoints.customer,
        "GET",
        {},
        {},
        {},
        0,
        id
      );

      currentUserData.value = response?.data;
    } catch (error) {
      console.error("Error in fetching current user data", error);
    }
  };


  const getCustomerData = async (id) => {
    try {
      const response = await makeRequest(
        endpoints.customer,
        "GET",
        {},
        {},
        {},
        0,
        id
      );

      customerData.value = response?.data;
    } catch (error) {
      console.error("Error in fetching customer data", error);
    }
  };

  const reset = () => {
    customerData.value = []
  }

  return {
    getCustomerData,
    currentUserData,
    getCurrentUserData,
    customerData,
    reset
  };
});
