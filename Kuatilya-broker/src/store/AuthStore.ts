import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { makeRequest } from "@/request/request"
import endpoints from "@/request/endpoints"

export type PortalRole = 'BROKER' | 'BUILDER' | 'CLIENT' | 'broker' | 'agent' | 'agency' | 'owner' | 'buyer' | 'seller'

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem("accessToken"))
  const role = ref<PortalRole | null>(
    (localStorage.getItem("userRole") as PortalRole) ?? null
  )
  const userId = ref<string | null>(localStorage.getItem("userId"))

  // Role getters
  const isBroker = computed(() =>
    role.value === 'BROKER' || ['broker', 'agent', 'agency'].includes(role.value ?? '')
  )
  const isBuilder = computed(() => role.value === 'BUILDER' || role.value === 'owner')
  const isClient = computed(() => role.value === 'CLIENT' || ['buyer', 'seller'].includes(role.value ?? ''))

  /** Called after OTP verify to store the initial token + role */
  function setAuth(accessToken: string, userRole: PortalRole, uid: string) {
    token.value = accessToken
    role.value = userRole
    userId.value = uid
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("userRole", userRole)
    localStorage.setItem("userId", uid)
  }

  /** Called from RoleSelectPage — sets role and gets a fresh token */
  async function selectRole(newRole: PortalRole) {
    const response = await makeRequest(
      endpoints.selectRole,
      "POST",
      { role: newRole },
      {},
      {},
      0
    )
    if (response?.data?.accessToken) {
      const { accessToken, user } = response.data
      token.value = accessToken
      role.value = newRole
      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("userRole", newRole)
      if (user?._id) {
        userId.value = user._id
        localStorage.setItem("userId", user._id)
      }
    }
    return response
  }

  function logout() {
    token.value = null
    role.value = null
    userId.value = null
    localStorage.removeItem("accessToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userId")
  }

  function isAuthenticated() {
    return !!token.value
  }

  function hasRole() {
    return !!role.value
  }

  return {
    token,
    role,
    userId,
    isBroker,
    isBuilder,
    isClient,
    setAuth,
    selectRole,
    logout,
    isAuthenticated,
    hasRole,
  }
})
