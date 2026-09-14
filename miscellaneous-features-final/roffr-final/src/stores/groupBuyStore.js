import { defineStore } from "pinia";
import { ref } from "vue";
import { makeRequest } from "@/request/request";
import endpoints from "@/request/endpoints";

export const useGroupBuyStore = defineStore("groupBuy", () => {
  const activeCampaigns = ref([]);
  const myRequests = ref([]);
  const loading = ref(false);
  // True once fetchActiveCampaigns has completed at least once.
  // ProjectCard uses this to skip individual by-project calls when the global
  // list is already loaded and the project isn't in it.
  const campaignsFetched = ref(false);

  const fetchActiveCampaigns = async () => {
    loading.value = true;
    try {
      const res = await makeRequest(endpoints.groupBuyActive, "GET");
      activeCampaigns.value = res?.data || [];
      campaignsFetched.value = true;
    } catch (e) {
      console.error("fetchActiveCampaigns failed", e);
      activeCampaigns.value = [];
    } finally {
      loading.value = false;
    }
  };

  const fetchCampaignForProject = async (projectId) => {
    try {
      const res = await makeRequest(
        endpoints.groupBuyByProject,
        "GET",
        {},
        {},
        {},
        0,
        projectId
      );
      return res?.data || null;
    } catch (e) {
      console.error("fetchCampaignForProject failed", e);
      return null;
    }
  };

  /**
   * Create a join request for a campaign. No requirements collected — the
   * customer's snapshot (name, phone, email) is taken from the Customer doc
   * server-side and the token amount is computed from project min/max price.
   * `associatedBrokerPhone` is optional — if set, backend tries to link the
   * matching agent so the broker gets credit for the referral.
   */
  const createRequest = async ({
    campaignId,
    customerId,
    associatedBrokerPhone,
  }) => {
    const res = await makeRequest(endpoints.groupBuyRequests, "POST", {
      campaignId,
      customerId,
      associatedBrokerPhone: associatedBrokerPhone || undefined,
    });
    return res?.data || null;
  };

  /** Customer marks the offline refund as received. */
  const confirmRefund = async (requestId, customerId, note) => {
    const res = await makeRequest(
      endpoints.groupBuyRequests,
      "PATCH",
      { customerId, note },
      {},
      {},
      0,
      `${requestId}/confirm-refund`,
    );
    return res?.data || null;
  };

  const fetchMyRequests = async (customerId) => {
    loading.value = true;
    try {
      const res = await makeRequest(
        endpoints.groupBuyCustomerList,
        "GET",
        {},
        {},
        {},
        0,
        customerId
      );
      myRequests.value = res?.data || [];
    } catch (e) {
      console.error("fetchMyRequests failed", e);
      myRequests.value = [];
    } finally {
      loading.value = false;
    }
  };

  return {
    activeCampaigns,
    myRequests,
    loading,
    campaignsFetched,
    fetchActiveCampaigns,
    fetchCampaignForProject,
    createRequest,
    confirmRefund,
    fetchMyRequests,
  };
});
