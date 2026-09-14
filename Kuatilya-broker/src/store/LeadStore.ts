import { defineStore } from "pinia";
import { ref } from "vue";
import { makeRequest } from "@/request/request.ts";
import endpoints from "@/request/endpoints.ts";
import type {
  Lead,
  LeadAssociationRef,
  LeadResponse,
  LeadStatsData,
  LeadStatsResponse,
  CreateLeadPayload,
  CreateLeadResponse,
} from "@/types/leads";

interface BulkCreateLeadResult {
  successfulRecords: number;
  failedRecords: number;
  errors: Array<{ row: number; message: string }>;
}

export const useLeadStore = defineStore("leads", () => {
  const MONGO_OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

  const leadData = ref<Lead[]>([]);
  const leadStatsData = ref<LeadStatsData>({
    totalLeads: 0,
    hot: 0,
    warm: 0,
    cold: 0,
  });
  const specificLeadData = ref<Lead | null>(null);
  const totalCount = ref(0);
  const totalPages = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const isCreating = ref(false);
  const error = ref<string | null>(null);

  const ALLOWED_SOURCES = new Set([
    "99_acres",
    "broker_reference",
    "client_reference",
    "email_marketing",
    "existing_customer",
    "housing",
    "magic_bricks",
    "my_website",
    "personal_reference",
    "portals_others",
    "rcs_broadcast",
    "rezide",
    "sms_marketing",
    "squareyards",
    "walk_in",
    "whatsapp_broadcast",
    "microsite",
    "meta",
    "crm",
    "realestate_website",
    "broker_dashboard",
    "other",
  ]);

  function normalizeLeadSource(value: any): string {
    const raw = String(value ?? "").trim().toLowerCase();
    if (!raw) return "broker_dashboard";

    const normalized = raw.replace(/\s+/g, "_");
    if (normalized === "broker_dashboard") return "broker_dashboard";
    if (normalized === "realestatewebsite") return "realestate_website";
    if (normalized === "real_estate_website") return "realestate_website";

    return ALLOWED_SOURCES.has(normalized) ? normalized : "other";
  }

  function isMongoObjectId(value: unknown): value is string {
    const normalized = String(value ?? "").trim();
    return MONGO_OBJECT_ID_PATTERN.test(normalized);
  }

  function normalizePhoneDigits(value: unknown): string {
    const digits = String(value ?? "").replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) {
      return digits.slice(2);
    }
    return digits.slice(-10);
  }

  function asArray(value: any): any[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  function toAssociationRefs(value: any): LeadAssociationRef[] {
    return asArray(value)
      .map((item) => {
        if (!item) return null;
        if (typeof item === "string") {
          return { _id: item };
        }

        const id = item._id ?? item.id;
        if (!id) return null;

        return {
          _id: id,
          name: item.name ?? item.projectName ?? item.companyName,
          email: item.email,
          phoneNumber: item.phoneNumber ?? item.contactNumber,
        };
      })
      .filter((item): item is LeadAssociationRef => Boolean(item));
  }

  function mergeAssociationRefs(...sources: any[]): LeadAssociationRef[] {
    const refMap = new Map<string, LeadAssociationRef>();

    sources.forEach((source) => {
      toAssociationRefs(source).forEach((ref) => {
        const id = String(ref._id || "").trim();
        if (!id) return;

        const existing = refMap.get(id);
        if (!existing) {
          refMap.set(id, { ...ref, _id: id });
          return;
        }

        refMap.set(id, {
          _id: id,
          name: existing.name || ref.name,
          email: existing.email || ref.email,
          phoneNumber: existing.phoneNumber || ref.phoneNumber,
        });
      });
    });

    return Array.from(refMap.values());
  }

  function parseBudget(value: any) {
    if (!value || typeof value !== "object") {
      return { min: 0, max: 0 };
    }

    return {
      min: Number(value.min ?? 0),
      max: Number(value.max ?? 0),
    };
  }

/** Map API lead (name, phoneNumber, userId, etc.) to dashboard Lead shape */
function mapApiLeadToLead(apiLead: any): Lead {
  const id = apiLead._id ?? apiLead.id;
  const brokerRefs = mergeAssociationRefs(apiLead.brokers, apiLead.userIds, apiLead.userId);
  const projectRefs = mergeAssociationRefs(apiLead.projectIds, apiLead.projectId, apiLead.projects);
  const builderRefs = mergeAssociationRefs(apiLead.companyIds, apiLead.builderIds, apiLead.builders);
  const brokerIds = brokerRefs.map((item) => item._id);
  const projectIds = projectRefs.map((item) => item._id);
  const builderIds = builderRefs.map((item) => item._id);

  return {
    _id: id,
    brokerId: brokerIds[0] ?? "",
    brokerIds,
    projectIds,
    builderIds,
    brokers: brokerRefs,
    projects: projectRefs,
    builders: builderRefs,
    name: apiLead.name ?? "",
    phone: apiLead.phoneNumber ?? apiLead.phone ?? "",
    email: apiLead.email ?? "",
    source: normalizeLeadSource(apiLead.source ?? "other"),
    sourceDetails: apiLead.sourceDetails ?? "",
    preferredLocation: apiLead.preferredLocation ?? "",
    city: apiLead.city ?? "",
    region: apiLead.region ?? "",
    subRegion: apiLead.subRegion ?? "",
    locality: apiLead.locality ?? "",
    budget: parseBudget(apiLead.budget),
    status: apiLead.status ?? "Warm",
    propertyType: apiLead.propertyType,
    lookingTo: apiLead.lookingTo,
    stage: apiLead.stage,
    notes: apiLead.notes ?? "",
    internalNote: apiLead.internalNote ?? "",
    nextFollowUpAt: apiLead.nextFollowUpAt ?? null,
    isConverted: apiLead.isConverted ?? false,
    convertedAt: apiLead.convertedAt ?? null,
    assignedToUserId:
      typeof apiLead.assignedToUserId === "string"
        ? apiLead.assignedToUserId
        : apiLead.assignedToUserId?._id,
    projectStatusPreferences: Array.isArray(apiLead.projectStatusPreferences)
      ? apiLead.projectStatusPreferences
      : [],
    projectTypePreferences: Array.isArray(apiLead.projectTypePreferences)
      ? apiLead.projectTypePreferences
      : [],
    createdAt: apiLead.createdAt ?? "",
    updatedAt: apiLead.updatedAt ?? "",
  };
}

const getLeadData = async (
  size = 10,
  page = 1,
  filters: {
    search?: string
    status?: string
  } = {}
) => {
  try {
    const params: Record<string, string | number | undefined> = {
      pageSize: size,
      pageNumber: page,
    };
    if (filters.search) params.searchQuery = filters.search;
    if (filters.status) params.status = filters.status;

    const response: LeadResponse = await makeRequest(
      endpoints.leads,
      "GET",
      {},
      {},
      params,
      0
    );

    const rawLeads = response.data?.leads ?? [];
    leadData.value = rawLeads.map(mapApiLeadToLead);
    totalCount.value = response.data?.totalLeads ?? 0;
    totalPages.value = response.data?.totalPages ?? 0;
    currentPage.value = page;
    pageSize.value = size;
  } catch (error) {
    console.error("Error fetching leads", error);
  }
};

const findLeadByPhone = async (phone: string): Promise<Lead | null> => {
  const normalizedPhone = normalizePhoneDigits(phone);
  if (normalizedPhone.length !== 10) {
    return null;
  }

  const localMatch = leadData.value.find(
    (lead) => normalizePhoneDigits(lead.phone) === normalizedPhone,
  );
  if (localMatch) {
    return localMatch;
  }

  try {
    const response: LeadResponse = await makeRequest(
      endpoints.leads,
      "GET",
      {},
      {},
      {
        pageSize: 50,
        pageNumber: 1,
        searchQuery: normalizedPhone,
      },
      0,
    );

    const rawLeads = response.data?.leads ?? [];
    const matched = rawLeads
      .map(mapApiLeadToLead)
      .find((lead) => normalizePhoneDigits(lead.phone) === normalizedPhone);

    return matched ?? null;
  } catch (err) {
    console.error("Error searching lead by phone", err);
    return null;
  }
};


const getLeadStats = async () => {
  try {
    const response: LeadStatsResponse = await makeRequest(
      endpoints.leadStats,
      "GET",
      {},
      {},
      {},
      0
    );

    leadStatsData.value = response.data;
  } catch (error) {
    console.error("Error fetching leads stats", error);
  }
};

function buildCreatePayload(payload: CreateLeadPayload & { projectId?: string }) {
  const projectIds = payload.projectIds?.length
    ? payload.projectIds
    : payload.projectId
      ? [payload.projectId]
      : [];

  const brokerIds = Array.from(
    new Set((payload.brokerIds ?? []).map((id) => String(id ?? "").trim())),
  ).filter((id) => isMongoObjectId(id));
  const builderIds = Array.from(
    new Set((payload.builderIds ?? []).map((id) => String(id ?? "").trim())),
  ).filter((id) => isMongoObjectId(id));

  const name = payload.name?.trim();
  const phoneNumber = payload.phone?.trim();
  const email = payload.email?.trim();
  const sourceDetails = payload.sourceDetails?.trim();
  const preferredLocation = payload.preferredLocation?.trim?.() ?? payload.preferredLocation;
  const city = payload.city?.trim?.() ?? payload.city;
  const region = payload.region?.trim?.() ?? payload.region;
  const subRegion = payload.subRegion?.trim?.() ?? payload.subRegion;
  const locality = payload.locality?.trim?.() ?? payload.locality;
  const notes = payload.notes?.trim?.() ?? payload.notes;
  const internalNote = payload.internalNote?.trim?.() ?? payload.internalNote;

  const requestBody: Record<string, any> = {
    name: name || undefined,
    phoneNumber: phoneNumber || undefined,
    email: email || undefined,
  };

  if (payload.source) {
    requestBody.source = normalizeLeadSource(payload.source);
  }

  if (sourceDetails) {
    requestBody.sourceDetails = sourceDetails;
  }

  if (payload.status) {
    requestBody.status = payload.status;
  }

  if (payload.propertyType) {
    requestBody.propertyType = payload.propertyType;
  }

  if (payload.lookingTo) {
    requestBody.lookingTo = payload.lookingTo;
  }

  if (payload.stage) {
    requestBody.stage = payload.stage;
  }

  if (preferredLocation) {
    requestBody.preferredLocation = preferredLocation;
  }

  if (city) {
    requestBody.city = city;
  }

  if (region) {
    requestBody.region = region;
  }

  if (subRegion) {
    requestBody.subRegion = subRegion;
  }

  if (locality) {
    requestBody.locality = locality;
  }

  if (notes) {
    requestBody.notes = notes;
  }

  if (internalNote) {
    requestBody.internalNote = internalNote;
  }

  if (projectIds[0]) {
    requestBody.projectId = projectIds[0];
  }

  if (projectIds.length > 0) {
    requestBody.projectIds = projectIds;
  }

  if (payload.projectStatusPreferences?.length) {
    requestBody.projectStatusPreferences = payload.projectStatusPreferences;
  }

  if (payload.projectTypePreferences?.length) {
    requestBody.projectTypePreferences = payload.projectTypePreferences;
  }

  if (builderIds.length) {
    requestBody.companyIds = builderIds;
  }

  if (brokerIds[0]) {
    requestBody.userId = brokerIds[0];
    requestBody.userIds = brokerIds;
  }

  if (isMongoObjectId(payload.assignedToUserId)) {
    requestBody.assignedToUserId = payload.assignedToUserId.trim();
  }

  return requestBody;
}

function buildUpdatePayload(payload: Partial<Lead>) {
  const projectIds = payload.projectIds ?? [];
  const brokerIds = payload.brokerIds ?? [];

  return {
    name: payload.name,
    phoneNumber: payload.phone,
    email: payload.email,
    source: normalizeLeadSource(payload.source),
    sourceDetails: payload.sourceDetails,
    status: payload.status,
    propertyType: payload.propertyType,
    lookingTo: payload.lookingTo,
    stage: payload.stage,
    preferredLocation: payload.preferredLocation,
    city: payload.city,
    region: payload.region,
    subRegion: payload.subRegion,
    locality: payload.locality,
    notes: payload.notes,
    internalNote: payload.internalNote,
    projectId: projectIds[0],
    projectIds,
    projectStatusPreferences: payload.projectStatusPreferences,
    projectTypePreferences: payload.projectTypePreferences,
    userId: brokerIds[0],
    userIds: brokerIds,
    assignedToUserId: payload.assignedToUserId,
    companyIds: payload.builderIds ?? [],
  };
}


  const createLeadRequest = async (
    payload: CreateLeadPayload & { projectId?: string },
  ): Promise<CreateLeadResponse> => {
    const body = buildCreatePayload(payload);

    const response: CreateLeadResponse = await makeRequest(
      endpoints.brokerLeadCreate,
      "POST",
      body,
      {},
      {},
      0,
    );

    return response;
  };


  const createLead = async (payload: CreateLeadPayload & { projectId?: string }) => {
    try {
      isCreating.value = true;
      error.value = null;

      const response = await createLeadRequest(payload);

      await getLeadData()
      return response;
    } catch (err) {
      console.error("Error creating lead", err);
      error.value = "Failed to create lead";
      throw err;
    } finally {
      isCreating.value = false;
    }
  };

  const createLeadBulk = async (
    payloads: Array<CreateLeadPayload & { projectId?: string }>,
  ): Promise<BulkCreateLeadResult> => {
    const result: BulkCreateLeadResult = {
      successfulRecords: 0,
      failedRecords: 0,
      errors: [],
    };

    if (!payloads.length) {
      return result;
    }

    try {
      isCreating.value = true;
      error.value = null;

      for (let index = 0; index < payloads.length; index += 1) {
        try {
          const currentPayload = payloads[index];
          if (!currentPayload) {
            continue;
          }

          await createLeadRequest(currentPayload);
          result.successfulRecords += 1;
        } catch (err: any) {
          result.failedRecords += 1;
          result.errors.push({
            row: index,
            message:
              err?.response?.data?.message ||
              err?.message ||
              "Failed to create lead",
          });
        }
      }

      await getLeadData(pageSize.value, currentPage.value);
      return result;
    } catch (err) {
      console.error("Error bulk creating leads", err);
      error.value = "Failed to bulk create leads";
      throw err;
    } finally {
      isCreating.value = false;
    }
  };

  const getLeadById = async (id: string) => {
    try {
      const response = await makeRequest(
        endpoints.leads,
        "GET",
        {},
        {},
        {},
        0,
        id
      );
      specificLeadData.value = mapApiLeadToLead(response.data ?? response);
      return specificLeadData.value;
    } catch (error) {
      console.error("Error getting lead", error);
      throw error;
    }
  };

  const updateLead = async (id: string, payload: Partial<Lead>) => {
    try {
      error.value = null;

      const body = buildUpdatePayload(payload);

      const response = await makeRequest(
        endpoints.leads,
        "PATCH",
        {
          name: body.name,
          phoneNumber: body.phoneNumber,
          email: body.email,
          source: body.source,
          sourceDetails: body.sourceDetails,
          status: body.status,
          propertyType: body.propertyType,
          lookingTo: body.lookingTo,
          stage: body.stage,
          preferredLocation: body.preferredLocation,
          city: body.city,
          region: body.region,
          subRegion: body.subRegion,
          locality: body.locality,
          notes: body.notes,
          internalNote: body.internalNote,
          projectId: body.projectId,
          projectIds: body.projectIds,
          projectStatusPreferences: body.projectStatusPreferences,
          projectTypePreferences: body.projectTypePreferences,
          userId: body.userId,
          userIds: body.userIds,
          assignedToUserId: body.assignedToUserId,
          companyIds: body.companyIds,
        },
        {},
        {},
        0,
        id
      );

      await getLeadData(pageSize.value, currentPage.value);

      return response;
    } catch (err) {
      console.error("Error updating lead", err);
      error.value = "Failed to update lead";
      throw err;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      error.value = null;

      const response = await makeRequest(
        endpoints.leads,
        "DELETE",
        {},
        {},
        {},
        0,
        id
      );

      leadData.value = leadData.value.filter((lead) => lead._id !== id);
      totalCount.value = Math.max(0, totalCount.value - 1);

      return response;
    } catch (err) {
      console.error("Error deleting lead", err);
      error.value = "Failed to delete lead";
      throw err;
    }
  };


  return {
    leadData,
    getLeadData,
    findLeadByPhone,
    getLeadStats,
    leadStatsData,
    createLead,
    createLeadBulk,
    getLeadById,
    specificLeadData,
    updateLead,
    deleteLead,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
  };
});
