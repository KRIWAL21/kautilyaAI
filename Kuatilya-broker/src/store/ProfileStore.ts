import { defineStore } from "pinia"
import { ref } from "vue"
import { makeRequest } from "@/request/request"
import endpoints from "@/request/endpoints"
import type {
  AssociationRef,
  BrokerProfile,
  BrokerProfileResponse,
  ProfileStatusData,
  ProfileStatusResponse,
} from "@/types/profile"

const toAssociationRef = (value: unknown): AssociationRef | null => {
  if (!value) return null

  if (typeof value === "string") {
    return { _id: value }
  }

  if (typeof value === "object") {
    const item = value as Record<string, unknown>
    const rawId = item._id
    if (!rawId || typeof rawId !== "string") return null

    return {
      _id: rawId,
      name: typeof item.name === "string" ? item.name : undefined,
      companyName:
        typeof item.companyName === "string" ? item.companyName : undefined,
      email: typeof item.email === "string" ? item.email : undefined,
    }
  }

  return null
}

const toAssociationRefs = (input: unknown): AssociationRef[] => {
  const values = Array.isArray(input) ? input : input ? [input] : []
  return values
    .map((value) => toAssociationRef(value))
    .filter((value): value is AssociationRef => Boolean(value))
}

export const useProfileStore = defineStore("profile", () => {
  const profileData = ref<BrokerProfile | null>(null)
  const profileStatus = ref<ProfileStatusData | null>(null)
  const isLoading = ref(false)

  const getProfileData = async () => {
    try {
      isLoading.value = true

      const response: BrokerProfileResponse = await makeRequest(
        endpoints.brokerProfile,
        "GET",
        {},
        {},
        {},
        0
      )

      const data = response.data
      const builders = toAssociationRefs(
        data.builders ?? data.companyIds ?? data.companyId
      )
      const sourcingManagers = toAssociationRefs(
        data.sourcingManagers ??
          data.sourcingManagerIds ??
          data.sourcingManagerId ??
          (data as Record<string, unknown>).sourcingManager
      )

      profileData.value = {
        ...data,
        builders,
        sourcingManagers,
      }
    } catch (error) {
      console.error("Error fetching profile data", error)
    } finally {
      isLoading.value = false
    }
  }

  const isProfileComplete = async () => {
    try {
      const response: ProfileStatusResponse = await makeRequest(
        endpoints.brokerProfileStatus,
        "GET",
        {},
        {},
        {},
        0
      )

      profileStatus.value = response.data
    } catch (error) {
      console.error("Error fetching profile status", error)
    }
  }

  const updateProfileData = async (payload: any) => {
    try {
      isLoading.value = true
      const response: BrokerProfileResponse = await makeRequest(
        endpoints.brokerProfile,
        "POST",
        payload,
        {},
        {},
        0
      )
      
      if (response.data) {
        profileData.value = { ...profileData.value, ...response.data }
        return true
      }
      return false
    } catch (error) {
      console.error("Error updating profile data", error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    getProfileData,
    updateProfileData,
    isProfileComplete,
    profileData,
    profileStatus,
    isLoading,
  }
})
