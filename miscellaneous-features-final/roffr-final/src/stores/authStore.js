import { defineStore } from "pinia";
import { ref } from "vue";
import { makeRequest } from "@/request/request";
import endpoints from "@/request/endpoints";

const STORAGE_KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  customerId: "customerId",
  phoneNumber: "phoneNumber",
  user: "user",
};

const safeParse = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const useAuthStore = defineStore("auth", () => {
  const user = ref(safeParse(localStorage.getItem(STORAGE_KEYS.user)));
  const token = ref(localStorage.getItem(STORAGE_KEYS.accessToken) || null);
  const isAuthenticated = ref(!!token.value);
  const otpData = ref(null);
  const currentUserData = ref(user.value || {});

  // Single source of truth for "user is signed in".
  // Writes localStorage AND store state in one place so every caller stays consistent.
  const setSession = ({ customer, accessToken, refreshToken } = {}) => {
    if (!customer || !accessToken) {
      throw new Error("setSession requires customer + accessToken");
    }

    user.value = customer;
    token.value = accessToken;
    isAuthenticated.value = true;
    currentUserData.value = customer;

    localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
    }
    if (customer._id) {
      localStorage.setItem(STORAGE_KEYS.customerId, customer._id);
    }
    if (customer.phoneNumber) {
      localStorage.setItem(STORAGE_KEYS.phoneNumber, customer.phoneNumber);
    }
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(customer));
  };

  const login = async (mobile) => {
    const response = await makeRequest(
      endpoints.getCustomers,
      "POST",
      { phoneNumber: mobile },
      {},
      {},
      0,
    );

    if (response?.data?.requestId) {
      otpData.value = response.data.requestId;
    }

    return response;
  };

  const verifyOtp = async (mobile, otp) => {
    const response = await makeRequest(
      endpoints.verifyOtp,
      "POST",
      {
        phoneNumber: mobile,
        requestId: otpData.value,
        otp,
      },
      {},
      {},
      0,
    );

    // Backend wraps payload as { statusCode, message, data: { customer, accessToken, refreshToken } }
    const payload = response?.data;
    if (payload?.customer && payload?.accessToken) {
      setSession(payload);
    }

    return response;
  };

  const getCurrentUserData = async (id) => {
    if (!id) return;
    try {
      const response = await makeRequest(
        endpoints.getCustomerProfile,
        "GET",
        {},
        {},
        {},
        0,
        id,
      );
      const profile = response?.data;
      if (profile) {
        currentUserData.value = profile;
        // Refresh user mirror so Navbar and other UI stay in sync.
        user.value = { ...(user.value || {}), ...profile };
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user.value));
      }
    } catch (error) {
      console.error("Error in fetching current user data", error);
      // Do NOT clear isAuthenticated here — a profile fetch failure does not
      // mean the user's token is invalid. Real auth errors are handled by the
      // axios interceptor (when wired) or by an explicit logout().
    }
  };

  const updateProfile = async (id, data) => {
    const response = await makeRequest(
      endpoints.updateCustomer,
      "PATCH",
      data,
      {},
      {},
      0,
      id,
    );
    const updated = response?.data;
    if (updated) {
      currentUserData.value = { ...currentUserData.value, ...updated };
      user.value = { ...(user.value || {}), ...updated };
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user.value));
    }
    return response;
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    isAuthenticated.value = false;
    currentUserData.value = {};
    otpData.value = null;
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem("newUser");
    localStorage.removeItem("userRequirements");
  };

  return {
    user,
    token,
    isAuthenticated,
    otpData,
    currentUserData,
    login,
    verifyOtp,
    setSession,
    getCurrentUserData,
    updateProfile,
    logout,
    updateUserImage: (imageUrl) => {
      if (user.value) {
        user.value.userImage = imageUrl;
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user.value));
      }
    },
  };
});
