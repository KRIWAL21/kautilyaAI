import { makeRequest } from "@/request/request";
import { defineStore } from "pinia";
import endpoints from "@/request/endpoints";
import { ref } from "vue";

export const useProjectStore = defineStore("project", () => {
  const projectAffordablityData = ref([]);
  const groupBuyingData = ref([]);
  const specificProjectDetails = ref([]);
  const projectPropertyListData = ref([]);
  const uniqueCitiesData = ref([]);
  const wishlistData = ref([]);
  const isModalOpen = ref(false)
  const pageNumber = ref(1);
  const pageSize = ref(10);
  const totalpages = ref(0);

  const getProjectAffordiablityData = async (
    city = "mumbai",
    affordability = "asc"
  ) => {
    try {
      const params = {
        // searchQuery: city,
        sortOrder: affordability,
        pageSize: pageSize.value,
        pageNumber: pageNumber.value,
      };

      const response = await makeRequest(
        endpoints.getProjectProperty,
        "GET",
        {},
        {},
        params,
        0
      );

      projectAffordablityData.value = response?.data?.projects;
      totalpages.value = response?.data?.totalPages;
      pageSize.value = response?.data?.pageSize;
      pageNumber.value = response?.data?.pageNumber;
    } catch (error) {
      console.error("Error in fetching project affordability data", error);
    }
  };

  const getGroupBuyingData = async () => {
    try {
      const response = await makeRequest(
        endpoints.groupBuying,
        "GET",
        {},
        {},
        {},
        0
      );

      groupBuyingData.value = response?.data;
    } catch (error) {
      console.error("Error in fetching group project data", error);
    }
  };

  const getProjectById = async (id) => {
    try {
      const response = await makeRequest(
        endpoints.getProjectById,
        "GET",
        {},
        {},
        {},
        0,
        id
      );

      specificProjectDetails.value = response?.data;
    } catch (error) {
      console.error("Error in fetching specific project data", error);
    }
  };

  const getProjectList = async (
    type = "project",
    search = "",
    city = ""
  ) => {
    try {
      const params = {
        type: type,
        search: search,
        limit: pageSize.value,
        page: pageNumber.value,
      };

      if (city) {
        params.city = city;
      }
      const response = await makeRequest(
        endpoints.getProjectProperty,
        "GET",
        {},
        {},
        params,
        0
      );

      projectPropertyListData.value = response?.data?.projects;
      totalpages.value = response?.data?.total;
      pageSize.value = response?.data?.limit;
      pageNumber.value = response?.data?.page;
    } catch (error) {
      console.error("Error in fetching specific project data", error);
    }
  };

  const getProjectCities = async () => {
    try {
      const response = await makeRequest(
        endpoints.projectCities,
        "GET",
        {},
        {},
        {},
        0
      );

      uniqueCitiesData.value = response?.data;
    } catch (error) {
      console.error("Error in fetching specific project data", error);
    }
  };


  const joinProjectGroup = async (projectId, customerId) => {
    try {
      const response = await makeRequest(
        `/projects/${projectId}/apply/${customerId}`,
        "POST",
        {},
        {},
        {},
        0
      );

      return response;
    } catch (error) {
      console.error("Error in joining the project group", error);
    }
  };


  const getWishlist = async (customerId) => {
    try {
      const response = await makeRequest(
        `/projects/wishlist/customer/${customerId}`,
        "GET",
        {},
        {},
        {},
        0
      );
      
      wishlistData.value = response?.data?.wishlist
    } catch (error) {
      console.error("Error in joining the project group", error);
    }
  };


  const addToWishlist = async (projectId, customerId) => {
    try {
      const response = await makeRequest(
        `/projects/wishlist/${projectId}/customer/${customerId}`,
        "POST",
        {},
        {},
        {},
        0
      );

      return response;
    } catch (error) {
      console.error("Error in joining the project group", error);
    }
  };


  const removeFromWishlist = async (projectId, customerId) => {
    try {
      const response = await makeRequest(
        `/projects/wishlist/${projectId}/customer/${customerId}`,
        "DELETE",
        {},
        {},
        {},
        0
      );

      return response;
    } catch (error) {
      console.error("Error in joining the project group", error);
    }
  };

  getProjectAffordiablityData();
  getGroupBuyingData();

  // Super-admin curated feeds — populated only when the corresponding
  // section mounts so the home page doesn't fire 3+ extra requests on
  // every load.
  const featuredProjects = ref([]);
  const trendingProjects = ref([]);

  /**
   * Pull projects super-admin marked `isFeaturedOnMarketplace: true`.
   * Returns the list and stashes it on `featuredProjects` so the section
   * can read it reactively.
   */
  const getFeaturedProjects = async (limit = 12) => {
    try {
      const response = await makeRequest(
        "GET",
        endpoints.marketplaceFeatured("projects"),
        { params: { limit } }
      );
      const items = response?.data?.data || response?.data || [];
      featuredProjects.value = Array.isArray(items) ? items : [];
      return featuredProjects.value;
    } catch (error) {
      console.error("Error fetching featured projects", error);
      featuredProjects.value = [];
      return [];
    }
  };

  const getTrendingProjects = async (limit = 12) => {
    try {
      const response = await makeRequest(
        "GET",
        endpoints.marketplaceTrending("projects"),
        { params: { limit } }
      );
      const items = response?.data?.data || response?.data || [];
      trendingProjects.value = Array.isArray(items) ? items : [];
      return trendingProjects.value;
    } catch (error) {
      console.error("Error fetching trending projects", error);
      trendingProjects.value = [];
      return [];
    }
  };

  return {
    projectAffordablityData,
    getProjectAffordiablityData,
    groupBuyingData,
    getProjectById,
    specificProjectDetails,
    getProjectList,
    projectPropertyListData,
    getProjectCities,
    uniqueCitiesData,
    joinProjectGroup,
    wishlistData,
    removeFromWishlist,
    getWishlist,
    addToWishlist,
    isModalOpen,
    featuredProjects,
    trendingProjects,
    getFeaturedProjects,
    getTrendingProjects,
    totalpages,
    pageNumber,
    pageSize,
  };
});
