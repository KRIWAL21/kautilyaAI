import { defineStore } from "pinia";
import { makeRequest } from "@/request/request";
import endpoints from "@/request/endpoints";
import { ref, computed } from "vue";

// Backend response shape (after wrapping):
// { statusCode, message, data: { results, total, page, limit, type } }
// For type='all', `results` is [{ kind: 'project'|'property', doc: {...} }, ...]
// For type='project'|'property', `results` is [doc, ...]
export const useSearchStore = defineStore("search", () => {
  const searchSuggestionData = ref([]);
  const selectedFilter = ref("all"); // 'all' | 'project' | 'property'
  const term = ref("");
  const city = ref("");
  const page = ref(1);
  const limit = ref(12);

  const results = ref([]); // raw backend results array
  const total = ref(0);
  const loading = ref(false);
  const error = ref(null);
  const fallback = ref(false); // true when backend returned nearby/recent because strict search was empty
  const fallbackReason = ref(null); // 'nearby-in-city' | 'recent' | null

  // Filters (kept here so the store stays the single source of truth).
  const priceMin = ref(null);
  const priceMax = ref(null);
  const bhk = ref("");
  const unitType = ref("");
  const projectStatus = ref("");
  const sortBy = ref("newest"); // 'newest' | 'oldest' | 'price-asc' | 'price-desc'

  // Normalized list for the UI: [{ id, kind, title, subtitle, image, price?, doc }]
  const items = computed(() => {
    return (results.value || []).map((entry) => {
      // Unified mode wraps as { kind, doc }
      const isWrapped =
        entry &&
        typeof entry === "object" &&
        "kind" in entry &&
        "doc" in entry;
      const kind = isWrapped ? entry.kind : selectedFilter.value;
      const doc = isWrapped ? entry.doc : entry;

      if (kind === "project") {
        return {
          id: doc?._id || doc?.id,
          kind: "project",
          title: doc?.projectName || "Project",
          subtitle:
            doc?.venue ||
            doc?.glocation ||
            [doc?.city].filter(Boolean).join(", "),
          image:
            doc?.propertyPictures?.[0] ||
            doc?.floorPlan?.[0] ||
            "",
          minPrice: Number(doc?.minPrice ?? 0),
          maxPrice: Number(doc?.maxPrice ?? 0),
          doc,
        };
      }

      // property
      return {
        id: doc?._id || doc?.id,
        kind: "property",
        title: doc?.title || "Property",
        subtitle:
          [
            doc?.location?.locality,
            doc?.location?.city,
            doc?.location?.state,
          ]
            .filter(Boolean)
            .join(", ") || "",
        image: doc?.media?.images?.[0] || "",
        bhk: doc?.property_details?.bhk || "",
        unitType: doc?.property_details?.unit_type || "",
        doc,
      };
    });
  });

  const setFilters = (opts = {}) => {
    if (opts.type !== undefined) selectedFilter.value = opts.type;
    if (opts.term !== undefined) term.value = opts.term;
    if (opts.city !== undefined) city.value = opts.city;
    if (opts.page !== undefined) page.value = opts.page;
    if (opts.limit !== undefined) limit.value = opts.limit;
    if (opts.priceMin !== undefined) priceMin.value = opts.priceMin;
    if (opts.priceMax !== undefined) priceMax.value = opts.priceMax;
    if (opts.bhk !== undefined) bhk.value = opts.bhk;
    if (opts.unitType !== undefined) unitType.value = opts.unitType;
    if (opts.projectStatus !== undefined) projectStatus.value = opts.projectStatus;
    if (opts.sortBy !== undefined) sortBy.value = opts.sortBy;
  };

  // Run a unified search with the current filters (or override via opts).
  const runSearch = async (opts = {}) => {
    setFilters(opts);
    loading.value = true;
    error.value = null;
    try {
      const params = {
        type: selectedFilter.value,
        page: page.value,
        limit: limit.value,
      };
      if (term.value) params.term = term.value;
      if (city.value) params.city = city.value;
      if (priceMin.value !== null && priceMin.value !== "") {
        params.priceMin = priceMin.value;
      }
      if (
        priceMax.value !== null &&
        priceMax.value !== "" &&
        priceMax.value !== Infinity
      ) {
        params.priceMax = priceMax.value;
      }
      if (bhk.value) params.bhk = bhk.value;
      if (unitType.value) params.unitType = unitType.value;
      if (projectStatus.value) params.projectStatus = projectStatus.value;
      if (sortBy.value && sortBy.value !== "newest") {
        params.sortBy = sortBy.value;
      }

      const response = await makeRequest(
        endpoints.search,
        "GET",
        {},
        {},
        params,
        0,
      );

      const payload = response?.data ?? {};
      results.value = Array.isArray(payload.results) ? payload.results : [];
      total.value = Number(payload.total ?? 0);
      fallback.value = Boolean(payload.fallback);
      fallbackReason.value = payload.fallbackReason ?? null;
    } catch (err) {
      console.error("Error in fetching search", err);
      error.value =
        err?.response?.data?.message ?? "Failed to load search results";
      results.value = [];
      total.value = 0;
      fallback.value = false;
      fallbackReason.value = null;
    } finally {
      loading.value = false;
    }
  };

  // Suggestions (debounced from caller).
  // Pass the current city so suggestions stay locally relevant when the term doesn't match anything.
  const getSearchSuggestion = async () => {
    try {
      const params = { limit: 8 };
      if (term.value) params.term = term.value;
      if (city.value) params.city = city.value;

      const response = await makeRequest(
        endpoints.searchSuggestion,
        "GET",
        {},
        {},
        params,
        0,
      );
      searchSuggestionData.value = response?.data || [];
    } catch (err) {
      console.error("Error in fetching suggestions", err);
      searchSuggestionData.value = [];
    }
  };

  // Backwards-compat shim — older code calls getSearchData() with no args.
  const getSearchData = (opts = {}) => runSearch(opts);

  const reset = () => {
    results.value = [];
    total.value = 0;
    error.value = null;
    page.value = 1;
    fallback.value = false;
    fallbackReason.value = null;
  };

  const clearFilters = () => {
    priceMin.value = null;
    priceMax.value = null;
    bhk.value = "";
    unitType.value = "";
    projectStatus.value = "";
    sortBy.value = "newest";
  };

  return {
    // state
    searchSuggestionData,
    selectedFilter,
    term,
    city,
    page,
    limit,
    results,
    total,
    loading,
    error,
    fallback,
    fallbackReason,
    priceMin,
    priceMax,
    bhk,
    unitType,
    projectStatus,
    sortBy,

    // computed
    items,

    // actions
    setFilters,
    runSearch,
    getSearchData,
    getSearchSuggestion,
    reset,
    clearFilters,
  };
});
