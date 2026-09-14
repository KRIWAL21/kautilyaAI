import { defineStore } from "pinia";
import { ref } from "vue";
import { makeRequest } from "@/request/request.ts";
import endpoints from "@/request/endpoints.ts";
import type {
  FollowUpStats,
  FollowUpStatsResponse,
  FollowUpResponse,
  FollowUp,
  FollowUpLeadSummary,
  FollowUpByLeadResponse,
  CreateFollowUpPayload,
  CreateFollowUpResponse,
  FollowUpFilters,
  FollowUpAuditLog,
  FollowUpAuditLogResponse,
  FollowUpAuditLogFilters,
} from "@/types/followup";

export const useFollowUpStore = defineStore("follow", () => {
  const followStatData = ref<FollowUpStats>([]);
  const followUps = ref<FollowUp[]>([]);
  const leadFollowUps = ref<FollowUpLeadSummary[]>([]);
  const totalPages = ref(0);
  const totalFollowUps = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const pageNumber = ref(1);
  const leadPageNumber = ref(1);
  const leadFilters = ref<FollowUpFilters>({});
  const loading = ref(false);
  const leadLoading = ref(false);
  const creating = ref(false);
  const updating = ref(false);
  const auditLogs = ref<FollowUpAuditLog[]>([]);
  const auditTotalPages = ref(0);
  const auditTotalLogs = ref(0);
  const auditCurrentPage = ref(1);
  const auditPageSize = ref(10);
  const auditLoading = ref(false);

  const getFollowStats = async () => {
    try {
      const response: FollowUpStatsResponse = await makeRequest(
        endpoints.followupstats,
        "GET",
        {},
        {},
        {},
        0,
      );

      followStatData.value = response.data;
    } catch (error) {
      console.error("Error fetching leads stats", error);
    }
  };

  const getFollowUps = async (
    size = 10,
    page = 1,
    filters: FollowUpFilters = {},
  ) => {
    try {
      loading.value = true;
      pageSize.value = size
      const params = {
        pageSize: size,
        pageNumber: page,
        search: filters.search || undefined,
        status: filters.status || undefined,
        actionType: filters.actionType || undefined,
        leadId: filters.leadId || undefined,
      }

      const response: FollowUpResponse = await makeRequest(
        endpoints.followup,
        "GET",
        {},
        {},
        params,
        0,
      );

      const payload: any = response?.data || response;
      const listPayload: any = payload?.followUps ? payload : payload?.data || {};

      followUps.value = Array.isArray(listPayload?.followUps)
        ? listPayload.followUps
        : [];
      totalPages.value = Number(listPayload?.totalPages || 0);
      totalFollowUps.value = Number(listPayload?.totalFollowUps || 0);
      pageNumber.value = Number(listPayload?.pageNumber || page);
      currentPage.value = page
    } catch (error) {
      console.error("Error fetching follow-ups", error);
    } finally {
      loading.value = false;
    }
  };

  const getFollowUpsByLead = async (
    size = 10,
    page = 1,
    filters: FollowUpFilters = {},
  ) => {
    try {
      leadLoading.value = true;
      pageSize.value = size;

      const params = {
        pageSize: size,
        pageNumber: page,
        search: filters.search || undefined,
        status: filters.status || undefined,
        leadId: filters.leadId || undefined,
      };

      const response: FollowUpByLeadResponse = await makeRequest(
        endpoints.followupByLead,
        "GET",
        {},
        {},
        params,
        0,
      );

      const payload: any = response?.data || response;
      const listPayload: any = payload?.followUps ? payload : payload?.data || {};

      leadFollowUps.value = Array.isArray(listPayload?.followUps)
        ? listPayload.followUps
        : [];
      totalPages.value = Number(listPayload?.totalPages || 0);
      totalFollowUps.value = Number(listPayload?.totalFollowUps || 0);
      pageNumber.value = Number(listPayload?.pageNumber || page);
      leadPageNumber.value = Number(listPayload?.pageNumber || page);
      leadFilters.value = { ...filters };
      currentPage.value = page;
    } catch (error) {
      console.error("Error fetching lead follow-ups", error);
    } finally {
      leadLoading.value = false;
    }
  };

  const createFollowUp = async (payload: CreateFollowUpPayload) => {
    try {
      creating.value = true;

      const response: CreateFollowUpResponse = await makeRequest(
        endpoints.followup,
        "POST",
        payload,
        {},
        {},
        0,
      );

      // Refresh list after creation
      await getFollowUps(pageNumber.value);
      await getFollowUpsByLead(
        auditPageSize.value,
        leadPageNumber.value,
        leadFilters.value,
      );

      return response;
    } catch (error) {
      console.error("Error creating follow-up", error);
      throw error;
    } finally {
      creating.value = false;
    }
  };

  // ✅ Update Follow-Up
  const updateFollowUp = async (
    id: string,
    payload: Partial<CreateFollowUpPayload>,
  ) => {
    try {
      updating.value = true;

      const response = await makeRequest(
        `${endpoints.followup}/${id}`,
        "PATCH",
        payload,
        {},
        {},
        0,
      );

      // Refresh list after update
      await getFollowUps(pageNumber.value);
      await getFollowUpsByLead(
        auditPageSize.value,
        leadPageNumber.value,
        leadFilters.value,
      );

      return response;
    } catch (error) {
      console.error("Error updating follow-up", error);
      throw error;
    } finally {
      updating.value = false;
    }
  };

  const getFollowUpAuditLogs = async (
    size = 10,
    page = 1,
    filters: FollowUpAuditLogFilters = {},
  ) => {
    try {
      auditLoading.value = true;
      auditPageSize.value = size;

      const params = {
        pageSize: size,
        pageNumber: page,
        leadId: filters.leadId || undefined,
        followUpId: filters.followUpId || undefined,
        action: filters.action || undefined,
      };

      const response: FollowUpAuditLogResponse = await makeRequest(
        endpoints.followupAuditLogs,
        "GET",
        {},
        {},
        params,
        0,
      );

      const payload: any = response?.data || response;
      const listPayload: any = payload?.auditLogs ? payload : payload?.data || {};

      auditLogs.value = Array.isArray(listPayload?.auditLogs)
        ? listPayload.auditLogs
        : [];
      auditTotalPages.value = Number(listPayload?.totalPages || 0);
      auditTotalLogs.value = Number(listPayload?.totalAuditLogs || 0);
      auditCurrentPage.value = Number(listPayload?.pageNumber || page);
    } catch (error) {
      console.error("Error fetching follow-up audit logs", error);
    } finally {
      auditLoading.value = false;
    }
  };

  return {
    followStatData,
    getFollowStats,
    followUps,
    leadFollowUps,
    totalPages,
    totalFollowUps,
    createFollowUp,
    creating,
    currentPage,
    leadPageNumber,
    leadFilters,
    updateFollowUp,
    updating,
    pageSize,
    pageNumber,
    loading,
    leadLoading,
    getFollowUps,
    getFollowUpsByLead,
    auditLogs,
    auditTotalPages,
    auditTotalLogs,
    auditCurrentPage,
    auditPageSize,
    auditLoading,
    getFollowUpAuditLogs,
  };
});