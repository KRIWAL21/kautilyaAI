import { defineStore } from "pinia";
import { ref } from "vue";
import { makeRequest } from "@/request/request";
import endpoints from "@/request/endpoints";

export interface GenerateGammaPayload {
  prompt: string;
  numCards?: number;
  format?: "presentation" | "document" | "webpage" | "social";
  additionalInstructions?: string;
  exportAs?: "pdf" | "pptx";
}

export interface GammaGeneration {
  generationId: string;
  prompt: string;
  title?: string;
  status: "queued" | "pending" | "completed" | "failed";
  gammaUrl?: string | null;
  exportUrl?: string | null;
  format?: string;
  exportAs?: string;
  numCards?: number;
  createdAt: string;
}

export interface VideoGeneration {
  requestId: string;
  prompt: string;
  status: "queued" | "pending" | "in_progress" | "completed" | "failed";
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  duration?: number | null;
  aspectRatio?: string;
  createdAt: string;
}

export interface PerplexityChatResponse {
  message: string;
  data: {
    outputText: string;
    preset: string;
    historyId?: string;
    credits?: PerplexityCreditSummary;
    raw?: any;
  };
}

export interface PerplexityCreditSummary {
  limit: number;
  used: number;
  remaining: number;
  costPerMessage: number;
}

export interface PerplexityHistoryItem {
  _id: string;
  preset: string;
  userMessage: string;
  assistantMessage: string;
  creditsUsed: number;
  responseId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PerplexityHistoryResponse {
  message: string;
  data: {
    history: PerplexityHistoryItem[];
    credits: PerplexityCreditSummary;
  };
}

const STORAGE_KEY = "gamma_ppt_generations";

function loadFromStorage(): GammaGeneration[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: GammaGeneration[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const VIDEO_STORAGE_KEY = "fal_video_generations";

function loadVideosFromStorage(): VideoGeneration[] {
  try {
    const raw = localStorage.getItem(VIDEO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveVideosToStorage(items: VideoGeneration[]) {
  localStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify(items));
}

export const useAiContentCreatorStore = defineStore(
  "ai-content-creator",
  () => {
    const generations = ref<GammaGeneration[]>(loadFromStorage());
    const videoGenerations = ref<VideoGeneration[]>(loadVideosFromStorage());
    const historyVideos = ref<any[]>([]);

    const fetchVideoHistory = async () => {
      try {
        const response = await makeRequest(
          `${endpoints.marketing}?type=Video&sortBy=createdAt&sortOrder=desc`,
          "GET",
        );
        if ((response as any)?.marketingContent) {
          historyVideos.value = (response as any).marketingContent;
        } else if ((response as any)?.data?.marketingContent) {
          historyVideos.value = (response as any).data.marketingContent;
        }
      } catch (e) {
        console.error("Failed to fetch video history", e);
      }
    };

    const generateGamma = async (payload: GenerateGammaPayload) => {
      const response = await makeRequest(
        endpoints.generateGamma,
        "POST",
        payload,
        {},
        {},
        0,
      );

      const result = response as {
        status: number;
        message: string;
        data: { generationId?: string; status?: string; provider?: string };
      };

      // Persist to local list
      if (result.data?.generationId) {
        const entry: GammaGeneration = {
          generationId: result.data.generationId,
          prompt: payload.prompt,
          status: "queued",
          format: payload.format,
          exportAs: payload.exportAs,
          numCards: payload.numCards,
          createdAt: new Date().toISOString(),
        };
        generations.value = [entry, ...generations.value];
        saveToStorage(generations.value);
      }

      return result;
    };

    const getStatus = async (generationId: string) => {
      const response = await makeRequest(
        endpoints.generateGammaStatus,
        "GET",
        {},
        {},
        {},
        0,
        generationId,
      );

      const result = response as {
        message: string;
        data: {
          generationId: string;
          status: string;
          gammaUrl?: string | null;
          exportUrl?: string | null;
          title?: string | null;
          creditsDeducted?: number | null;
          creditsRemaining?: number | null;
        };
      };

      // Update local record
      const idx = generations.value.findIndex(
        (g) => g.generationId === generationId,
      );
      if (idx !== -1) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const existing = generations.value[idx]!;
        generations.value[idx] = {
          generationId: result.data.generationId ?? existing.generationId,
          prompt: existing.prompt,
          createdAt: existing.createdAt,
          format: existing.format,
          exportAs: existing.exportAs,
          numCards: existing.numCards,
          status: result.data.status as GammaGeneration["status"],
          gammaUrl: result.data.gammaUrl ?? existing.gammaUrl,
          exportUrl: result.data.exportUrl ?? existing.exportUrl,
          title: result.data.title ?? existing.title,
        };
        saveToStorage(generations.value);
      }

      return result;
    };

    const removeGeneration = (generationId: string) => {
      generations.value = generations.value.filter(
        (g) => g.generationId !== generationId,
      );
      saveToStorage(generations.value);
    };

    // ── Video ────────────────────────────────────────────────

    const generateVideo = async (payload: {
      prompt: string;
      duration?: string;
      aspectRatio?: string;
    }) => {
      const response = await makeRequest(
        endpoints.generateVideo,
        "POST",
        payload,
      );
      const result = response as {
        message: string;
        data: {
          requestId?: string;
          status?: string;
          statusUrl?: string;
          responseUrl?: string;
        };
      };

      if (result.data?.requestId) {
        const entry: VideoGeneration = {
          requestId: result.data.requestId,
          prompt: payload.prompt,
          status: "queued",
          aspectRatio: payload.aspectRatio || "16:9",
          createdAt: new Date().toISOString(),
        };
        videoGenerations.value = [entry, ...videoGenerations.value];
        saveVideosToStorage(videoGenerations.value);
      }
      return result;
    };

    const getVideoStatus = async (requestId: string) => {
      const response = await makeRequest(
        endpoints.videoStatus,
        "GET",
        {},
        {},
        {},
        0,
        requestId,
      );
      const result = response as {
        message: string;
        data: {
          requestId: string;
          status: string;
          videoUrl?: string | null;
          thumbnailUrl?: string | null;
          duration?: number | null;
        };
      };

      const idx = videoGenerations.value.findIndex(
        (v) => v.requestId === requestId,
      );
      if (idx !== -1) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const existing = videoGenerations.value[idx]!;
        videoGenerations.value[idx] = {
          ...existing,
          status: result.data.status as VideoGeneration["status"],
          videoUrl: result.data.videoUrl ?? existing.videoUrl,
          thumbnailUrl: result.data.thumbnailUrl ?? existing.thumbnailUrl,
          duration: result.data.duration ?? existing.duration,
        };
        saveVideosToStorage(videoGenerations.value);
      }
      return result;
    };

    const removeVideo = (requestId: string) => {
      videoGenerations.value = videoGenerations.value.filter(
        (v) => v.requestId !== requestId,
      );
      saveVideosToStorage(videoGenerations.value);
    };

    // ── json2video Slideshow ──────────────────────────────────────

    const generateSlideshow = async (payload: {
      propertyName: string;
      location: string;
      configuration?: string;
      price?: string;
      imageUrls?: string[];
      tagline?: string;
    }) => {
      const response = await makeRequest(
        endpoints.generateSlideshow,
        "POST",
        payload,
      );
      const result = response as {
        message: string;
        data: {
          projectId?: string;
          status?: string;
          propertyName?: string;
          location?: string;
        };
      };

      if (result.data?.projectId) {
        const entry: VideoGeneration = {
          requestId: result.data.projectId,
          prompt: `${result.data.propertyName} in ${result.data.location} (Slideshow)`,
          status: "queued",
          aspectRatio: "16:9",
          createdAt: new Date().toISOString(),
        };
        videoGenerations.value = [entry, ...videoGenerations.value];
        saveVideosToStorage(videoGenerations.value);
      }
      return result;
    };

    const getSlideshowStatus = async (projectId: string) => {
      const response = await makeRequest(
        endpoints.slideshowStatus,
        "GET",
        {},
        {},
        {},
        0,
        projectId,
      );
      const result = response as {
        message: string;
        data: {
          projectId: string;
          status: string;
          videoUrl?: string | null;
          thumbnailUrl?: string | null;
        };
      };

      const idx = videoGenerations.value.findIndex(
        (v) => v.requestId === projectId,
      );
      if (idx !== -1) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const existing = videoGenerations.value[idx]!;
        videoGenerations.value[idx] = {
          ...existing,
          status: result.data.status as VideoGeneration["status"],
          videoUrl: result.data.videoUrl ?? existing.videoUrl,
          thumbnailUrl: result.data.thumbnailUrl ?? existing.thumbnailUrl,
        };
        saveVideosToStorage(videoGenerations.value);
      }
      return result;
    };

    // ── Gemini ────────────────────────────────────────────────

    const enhancePrompt = async (
      rawPrompt: string,
      type: "video" | "ppt" | "image",
    ) => {
      const response = await makeRequest(endpoints.enhancePrompt, "POST", {
        rawPrompt,
        type,
      });
      return response as {
        message: string;
        data: { enhancedPrompt: string; originalPrompt: string };
      };
    };

    const generatePoster = async (payload: {
      propertyName: string;
      location: string;
      configuration?: string;
      price?: string;
      style?: string;
      amenities?: string;
    }) => {
      const response = await makeRequest(
        endpoints.generatePoster,
        "POST",
        payload,
      );
      return response as {
        message: string;
        data: {
          contentUrl: string;
          prompt: string;
          propertyName: string;
          location: string;
        };
      };
    };

    const perplexityChat = async (payload: {
      input: string;
      preset?: string;
    }) => {
      const response = await makeRequest(
        endpoints.perplexityChat,
        "POST",
        payload,
      );
      return response as PerplexityChatResponse;
    };

    const fetchPerplexityChatHistory = async (limit = 30) => {
      const response = await makeRequest(
        endpoints.perplexityChatHistory,
        "GET",
        {},
        {},
        { limit },
      );
      return response as PerplexityHistoryResponse;
    };

    return {
      generations,
      videoGenerations,
      generateGamma,
      getStatus,
      removeGeneration,
      generateVideo,
      getVideoStatus,
      removeVideo,
      enhancePrompt,
      generatePoster,
      perplexityChat,
      fetchPerplexityChatHistory,
      generateSlideshow,
      getSlideshowStatus,
      historyVideos,
      fetchVideoHistory,
    };
  },
);
