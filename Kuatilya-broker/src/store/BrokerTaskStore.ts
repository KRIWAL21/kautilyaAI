import { defineStore } from "pinia";
import { ref } from "vue";
import { makeRequest } from "@/request/request";
import endpoints from "@/request/endpoints";
import type {
  BrokerTask,
  CreateBrokerTaskPayload,
  UpdateBrokerTaskPayload,
} from "@/types/brokertask";

export const useBrokerTaskStore = defineStore("broker-task", () => {
  const tasks = ref<BrokerTask[]>([]);
  const meta = ref({
    total: 0,
    page: 1,
    lastPage: 1,
  });
  const loading = ref(false);
  const saving = ref(false);
  const error = ref<string | null>(null);

  const fetchTasks = async (params: { page?: number; limit?: number; search?: string; status?: string; priority?: string; teamMemberId?: string } = {}) => {
    try {
      loading.value = true;
      error.value = null;

      const response: any = await makeRequest(
        endpoints.brokerTasks,
        "GET",
        {},
        {},
        params,
      );

      const payload = response?.data || response;

      if (payload?.items) {
        tasks.value = payload.items;
        meta.value = payload.meta || { total: 0, page: 1, lastPage: 1 };
      } else if (Array.isArray(payload?.data)) {
        tasks.value = payload.data;
        meta.value = {
          total: Number(payload?.total || 0),
          page: Number(payload?.page || 1),
          lastPage: Number(payload?.totalPages || 1),
        };
      } else {
        tasks.value = [];
        meta.value = { total: 0, page: 1, lastPage: 1 };
      }
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      tasks.value = [];
      error.value = err?.response?.data?.message ?? err?.message ?? "Failed to load tasks";
    } finally {
      loading.value = false;
    }
  };

  const createTask = async (payload: CreateBrokerTaskPayload) => {
    try {
      saving.value = true;
      error.value = null;

      const normalizedPayload: CreateBrokerTaskPayload = {
        ...payload,
        status: payload.status === "In Progress" ? "InProgress" : payload.status,
      };

      if (!normalizedPayload.dueDate) {
        delete normalizedPayload.dueDate;
      }

      const response = await makeRequest(
        endpoints.brokerTasks,
        "POST",
        normalizedPayload,
      );

      await fetchTasks();
      return response;
    } catch (err: any) {
      error.value = err?.response?.data?.message ?? err?.message ?? "Failed to create task";
      throw err;
    } finally {
      saving.value = false;
    }
  };

  const updateTask = async (id: string, payload: UpdateBrokerTaskPayload) => {
    try {
      saving.value = true;
      error.value = null;

      const normalizedPayload: UpdateBrokerTaskPayload = {
        ...payload,
        status: payload.status === "In Progress" ? "InProgress" : payload.status,
      };

      if (!normalizedPayload.dueDate) {
        delete normalizedPayload.dueDate;
      }

      const response = await makeRequest(
        endpoints.brokerTasks,
        "PATCH",
        normalizedPayload,
        {},
        {},
        0,
        id,
      );

      await fetchTasks({ page: meta.value.page });
      return response;
    } catch (err: any) {
      error.value = err?.response?.data?.message ?? err?.message ?? "Failed to update task";
      throw err;
    } finally {
      saving.value = false;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      saving.value = true;
      error.value = null;

      const response = await makeRequest(
        endpoints.brokerTasks,
        "DELETE",
        {},
        {},
        {},
        0,
        id,
      );

      await fetchTasks({ page: meta.value.page });
      return response;
    } catch (err: any) {
      error.value = err?.response?.data?.message ?? err?.message ?? "Failed to delete task";
      throw err;
    } finally {
      saving.value = false;
    }
  };

  return {
    tasks,
    meta,
    loading,
    saving,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
});
