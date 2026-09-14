import { defineStore } from "pinia";
import { ref } from "vue";
import { makeRequest } from "@/request/request";
import endpoints from "@/request/endpoints";
import type {
  TeamMember,
  CreateTeamMemberPayload,
  UpdateTeamMemberPayload,
  TeamMemberResponse,
} from "@/types/teammember";

export const useTeamMemberStore = defineStore("team-member", () => {
  const teamMembers = ref<TeamMember[]>([]);
  const meta = ref({
    total: 0,
    page: 1,
    lastPage: 1,
  });
  const loading = ref(false);
  const saving = ref(false);
  const error = ref<string | null>(null);

  const fetchTeamMembers = async (params: { page?: number; limit?: number; search?: string; status?: string; role?: string } = {}) => {
    try {
      loading.value = true;
      error.value = null;

      // GET /team-members will automatically use the logged-in broker's ID on the backend
      const response: any = await makeRequest(
        endpoints.teamMembers,
        "GET",
        {},
        {},
        params,
      );

      // The backend returns { items: [...], meta: {...} } based on the subagent output.
      if (response && response.data && response.data.items) {
        teamMembers.value = response.data.items;
        meta.value = response.data.meta || { total: 0, page: 1, lastPage: 1 };
      } else if (response && response.items) {
        teamMembers.value = response.items;
        meta.value = response.meta || { total: 0, page: 1, lastPage: 1 };
      }
    } catch (err: any) {
      console.error("Error fetching team members:", err);
      teamMembers.value = [];
      error.value =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to load team members";
    } finally {
      loading.value = false;
    }
  };

  const createTeamMember = async (payload: CreateTeamMemberPayload) => {
    try {
      saving.value = true;
      error.value = null;

      const response = await makeRequest(
        endpoints.teamMembers,
        "POST",
        payload,
      );

      // Refresh list after creation
      await fetchTeamMembers();
      return response;
    } catch (err: any) {
      error.value =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to create team member";
      throw err;
    } finally {
      saving.value = false;
    }
  };

  const updateTeamMember = async (id: string, payload: UpdateTeamMemberPayload) => {
    try {
      saving.value = true;
      error.value = null;

      const response = await makeRequest(
        endpoints.teamMembers,
        "PATCH",
        payload,
        {},
        {},
        0,
        id,
      );

      // Refresh list after update
      await fetchTeamMembers({ page: meta.value.page });
      return response;
    } catch (err: any) {
      error.value =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to update team member";
      throw err;
    } finally {
      saving.value = false;
    }
  };

  const deleteTeamMember = async (id: string) => {
    try {
      saving.value = true;
      error.value = null;

      const response = await makeRequest(
        endpoints.teamMembers,
        "DELETE",
        {},
        {},
        {},
        0,
        id,
      );

      // Refresh list after deletion
      await fetchTeamMembers({ page: meta.value.page });
      return response;
    } catch (err: any) {
      error.value =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to delete team member";
      throw err;
    } finally {
      saving.value = false;
    }
  };

  return {
    teamMembers,
    meta,
    loading,
    saving,
    error,
    fetchTeamMembers,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
  };
});
