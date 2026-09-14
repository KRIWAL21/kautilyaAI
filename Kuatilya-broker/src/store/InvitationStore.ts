import { defineStore } from "pinia";
import { ref } from "vue";
import { makeRequest } from "@/request/request";
import endpoints from "@/request/endpoints";
import type {
  BuilderSuggestion,
  BuilderSuggestionsResponse,
  BrokerInvitation,
  BrokerInvitationListResponse,
} from "@/types/invitation";

export const useInvitationStore = defineStore("invitations", () => {
  const invitations = ref<BrokerInvitation[]>([]);
  const builderSuggestions = ref<BuilderSuggestion[]>([]);
  const searchingBuilders = ref(false);
  const creatingRequest = ref(false);
  const loading = ref(false);
  const responding = ref(false);

  const getInvitations = async () => {
    try {
      loading.value = true;
      const response: BrokerInvitationListResponse = await makeRequest(
        endpoints.brokerInvitations,
        "GET",
        {},
        {},
        {},
        0,
      );

      invitations.value = response.data ?? [];
    } catch (error) {
      console.error("Error fetching broker invitations", error);
      invitations.value = [];
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const respondToInvitation = async (
    invitationId: string,
    action: "accept" | "reject",
  ) => {
    try {
      responding.value = true;

      const response = await makeRequest(
        `${endpoints.brokerInvitationRespondBase}/${invitationId}/respond`,
        "PATCH",
        { action },
        {},
        {},
        0,
      );

      await getInvitations();
      return response;
    } catch (error) {
      console.error("Error responding to invitation", error);
      throw error;
    } finally {
      responding.value = false;
    }
  };

  const getBuilderSuggestions = async (query: string) => {
    const q = query.trim();
    try {
      searchingBuilders.value = true;
      const response: BuilderSuggestionsResponse = await makeRequest(
        endpoints.brokerBuilderSuggestions,
        "GET",
        {},
        {},
        q ? { q } : {},
        0,
      );
      builderSuggestions.value = response.data ?? [];
    } catch (error) {
      console.error("Error fetching builder suggestions", error);
      builderSuggestions.value = [];
      throw error;
    } finally {
      searchingBuilders.value = false;
    }
  };

  const getAvailableBuilders = async () => {
    try {
      searchingBuilders.value = true;
      const response: any = await makeRequest(
        endpoints.companiesAll,
        "GET",
        {},
        {},
        {},
        0,
      );
      const raw =
        response?.data?.data ??
        response?.data ??
        response;

      const list = Array.isArray(raw) ? raw : [];
      builderSuggestions.value = list.map((company: any) => ({
        _id: company._id,
        companyName: company.companyName,
        contactNumber: company.contactNumber,
        email: company.email,
      }));
    } catch (error) {
      console.error("Error fetching available builders", error);
      builderSuggestions.value = [];
      throw error;
    } finally {
      searchingBuilders.value = false;
    }
  };

  const requestBuilderAssociation = async (payload: {
    companyId: string;
    note?: string;
  }) => {
    try {
      creatingRequest.value = true;
      const response = await makeRequest(
        endpoints.brokerBuilderRequest,
        "POST",
        payload,
        {},
        {},
        0,
      );
      await getInvitations();
      return response;
    } catch (error) {
      console.error("Error requesting builder association", error);
      throw error;
    } finally {
      creatingRequest.value = false;
    }
  };

  return {
    invitations,
    builderSuggestions,
    searchingBuilders,
    creatingRequest,
    loading,
    responding,
    getInvitations,
    respondToInvitation,
    getBuilderSuggestions,
    getAvailableBuilders,
    requestBuilderAssociation,
  };
});
