import { defineStore } from "pinia";
import { makeRequest } from "@/request/request";
import endpoints from "@/request/endpoints";
import { ref } from "vue";

// orderStore.ts
export const useOrderStore = defineStore("order", () => {
  const createOrderData = async (userId, planId) => {
    const data = { userId, planId };

    try {
      const response = await makeRequest(
        endpoints.orders,
        "POST",
        data,
        {},
        {},
        0
      );

      // If backend wraps in data: { order: {...} }
      const order = response?.data?.order || response?.data || response;

      // order now has:
      // _id, userId, planId, amount, currency, receipt, orderId, status ...
      return {
        orderDocId: order._id,       // your DB id
        razorpayOrderId: order.orderId,
        amount: order.amount * 100,  // convert 999 to 99900 paise if backend is in rupees
        currency: order.currency || "INR",
        receipt: order.receipt,
      };
    } catch (error) {
      console.log("Error in creating order", error);
      throw error;
    }
  };

  const verifyPayment = async (payload) => {
    // implement when your backend verify API is ready
    const response = await makeRequest(
      endpoints.verifyPayment,
      "POST",
      payload,
      {},
      {},
      0
    );
    return response?.data || response;
  };

  return {
    createOrderData,
    verifyPayment,
  };
});

