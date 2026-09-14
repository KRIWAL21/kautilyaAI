import { defineStore } from "pinia";
import { ref } from "vue";
import { makeRequest } from "@/request/request";
import endpoints from "@/request/endpoints";
import type {
  SiteVisit,
  SiteVisitByUserResponse,
  CreateSiteVisitPayload,
} from "@/types/sitevisit";

export const useSiteVisitStore = defineStore("site-visit", () => {
  const siteVisits = ref<SiteVisit[]>([]);
  const loading = ref(false);
  const creating = ref(false);
  const updating = ref(false);
  const error = ref<string | null>(null);

  const getSiteVisitsByUserId = async () => {
    try {
      loading.value = true;
      error.value = null;

      const response: SiteVisitByUserResponse = await makeRequest(
        endpoints.siteVisitsMe,
        "GET",
        {},
        {},
        {},
        0,
      );

      const payload: any = response?.data ?? response;

      if (Array.isArray(payload)) {
        siteVisits.value = payload;
      } else if (Array.isArray(payload?.siteVisits)) {
        siteVisits.value = payload.siteVisits;
      } else if (Array.isArray(payload?.items)) {
        siteVisits.value = payload.items;
      } else {
        siteVisits.value = [];
      }
    } catch (err: any) {
      console.error("Error fetching site visits", err);
      siteVisits.value = [];
      error.value =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to load site visits";
    } finally {
      loading.value = false;
    }
  };

  const createSiteVisitForBroker = async (payload: CreateSiteVisitPayload) => {
    try {
      creating.value = true;
      error.value = null;

      const response = await makeRequest(
        endpoints.siteVisits,
        "POST",
        payload,
        {},
        {},
        0,
        null,
        "/agent",
      );

      await getSiteVisitsByUserId();
      return response;
    } catch (err: any) {
      error.value =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to schedule site visit";
      throw err;
    } finally {
      creating.value = false;
    }
  };

  const updateSiteVisitStatusForBroker = async (
    siteVisitId: string,
    status: "pending" | "complete" | "incomplete",
  ) => {
    try {
      updating.value = true;
      error.value = null;

      const response = await makeRequest(
        `${endpoints.siteVisits}/agent/${siteVisitId}/status`,
        "PATCH",
        { status },
      );

      await getSiteVisitsByUserId();
      return response;
    } catch (err: any) {
      error.value =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to update site visit status";
      throw err;
    } finally {
      updating.value = false;
    }
  };

  return {
    siteVisits,
    loading,
    creating,
    updating,
    error,
    getSiteVisitsByUserId,
    createSiteVisitForBroker,
    updateSiteVisitStatusForBroker,
  };
});
