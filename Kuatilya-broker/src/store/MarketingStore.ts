import { defineStore } from "pinia";
import { ref } from "vue";
import { makeRequest } from "@/request/request.ts";
import endpoints from "@/request/endpoints.ts";
import type { MarketingContent, MarketingResponse, GenerateAiImagePayload, GenerateWhatsappPayload, GeneratePptPayload, GenerateVideoPayload } from "@/types/marketing";

export const useMarketingStore = defineStore("marketing", () => {
  const marketingData = ref<MarketingContent[]>([]);
  const totalPages = ref(0);
  const totalCount = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(10);

  const getMarketingData = async (
    size = 10,
    page = 1,
    filters: {
      search?: string;
      status?: string;
    } = {},
  ) => {
    try {
      const params = {
        pageSize: size,
        pageNumber: page,
        search: filters.search || undefined,
        status: filters.status || undefined,
      };

      const response: MarketingResponse = await makeRequest(
        endpoints.marketing,
        "GET",
        {},
        {},
        params,
        0,
      );

      marketingData.value = response.data.marketingContent;
      totalPages.value = response.data.totalPages;
      totalCount.value = response.data.totalContent;
      currentPage.value = response.data.pageNumber;
      pageSize.value = response.data.pageSize;
    } catch (error) {
      console.error("Error fetching marketing content", error);
    }
  };

  const generateAiImage = async (payload: GenerateAiImagePayload) => {
    try {
      const response = await makeRequest(
        endpoints.marketingImageGenerate,  // → /marketing-image-gen/generate on astra-service (port 3333)
        "POST",
        payload,
        {},
        {},
        0
      );

      return response;
    } catch (error) {
      console.error("Error generating AI image", error);
      throw error;
    }
  };



  const generateWhatsapp = async (payload: GenerateWhatsappPayload) => {
    try {
      const response = await makeRequest(
        endpoints.marketingVideo,
        "POST",
        payload, 
        {},
        {},
        0
      );

      return response;
    } catch (error) {
      console.error("Error generating Video", error);
      throw error;
    }
  };


  const generatePpt = async (payload: GeneratePptPayload) => {
    try {
      const response = await makeRequest(
        endpoints.marketingPpt,
        "POST",
        payload, 
        {},
        {},
        0
      );

      return response;
    } catch (error) {
      console.error("Error generating Ppt", error);
      throw error;
    }
  };


  const generateVideo = async (payload: GenerateVideoPayload) => {
    try {
      const response = await makeRequest(
        endpoints.marketingPpt,
        "POST",
        payload, 
        {},
        {},
        0
      );

      return response;
    } catch (error) {
      console.error("Error generating Video", error);
      throw error;
    }
  };

  return {
    marketingData,
    getMarketingData,
    generateAiImage,
    generateWhatsapp,
    generatePpt,
    generateVideo,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
  };
});
