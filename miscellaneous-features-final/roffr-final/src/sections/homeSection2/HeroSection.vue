<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useSearchStore } from "@/stores/SearchStore";
import { useProjectStore } from "@/stores/projectStore";
import { debounce } from "@/utils/debounce";

const router = useRouter();

const searchStore = useSearchStore();
const { searchSuggestionData, term, city: storeCity } = storeToRefs(searchStore);

const projectStore = useProjectStore();
const { uniqueCitiesData } = storeToRefs(projectStore);

// Reactive UI state — these were referenced in the template but never declared.
const containerRef = ref(null);
const searchInput = ref("");
const selectedCity = ref("");
const cityDropdownOpen = ref(false);
const suggestionsVisible = ref(false);

const suggestionsList = computed(() =>
  Array.isArray(searchSuggestionData.value)
    ? searchSuggestionData.value
    : searchSuggestionData.value?.data || [],
);

// Fetch suggestions on debounced typing.
// City is included so when the term yields nothing the backend can fall back
// to nearby items in the picked city instead of returning an empty list.
const fetchSuggestions = debounce(async () => {
  const t = (searchInput.value || "").trim();
  // Allow empty term ONLY when a city is picked — that surfaces "what's
  // available in this city" suggestions before the user types anything.
  if (t.length < 2 && !selectedCity.value) {
    searchSuggestionData.value = [];
    suggestionsVisible.value = false;
    return;
  }
  term.value = t;
  storeCity.value = selectedCity.value;
  await searchStore.getSearchSuggestion();
  suggestionsVisible.value = true;
}, 300);

watch(searchInput, () => {
  fetchSuggestions();
});

const onCitySelect = (city) => {
  selectedCity.value = city;
  storeCity.value = city;
  cityDropdownOpen.value = false;
  // Refresh suggestions with the new city context.
  fetchSuggestions();
};

const goToResults = () => {
  const query = {};
  if (searchInput.value?.trim()) query.q = searchInput.value.trim();
  if (selectedCity.value) query.city = selectedCity.value;
  suggestionsVisible.value = false;
  router.push({ path: "/search", query });
};

const onSearchButtonClicked = () => {
  goToResults();
};

const onSuggestionClick = (suggestion) => {
  if (!suggestion) return;
  // If the suggestion has a routable id, jump straight to the detail page.
  if (suggestion.type === "project" && suggestion._id) {
    router.push(`/project-details/${suggestion._id}`);
    return;
  }
  if (suggestion.type === "property" && suggestion._id) {
    router.push(`/property-details/${suggestion._id}`);
    return;
  }
  // Fallback — push the suggestion title into the search and run a list query.
  searchInput.value = suggestion.title || searchInput.value;
  goToResults();
};

// Click-outside closes both dropdowns.
const handleClickOutside = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    suggestionsVisible.value = false;
    cityDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  if (!uniqueCitiesData.value?.length) {
    projectStore.getProjectCities();
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <section class="relative">
    <div class="">
      <img
        src="https://images.unsplash.com/photo-1563891315366-4606cd73a33f?q=1920&auto=format"
        alt=""
        class="w-full h-[500px] xl:h-[700px] object-cover"
      />

      <div class="absolute inset-0 bg-black/60"></div>
    </div>

    <div
      class="text-center absolute top-[35%] -translate-x-1/2 left-1/2 text-white w-full"
    >
      <div class="">
        <h1 class="font-outfit text-[35px] md:text-[50px] xl:text-[75px]">Why Pay More Alone?</h1>
        <p class="font-inter text-[14px] xl:text-[20px] md:max-w-3xl mx-auto">
          Unlock massive savings through the power of collective buying. Join
          thousands of smart families securing their dream homes together.
        </p>
      </div>

      <div
        ref="containerRef"
        class="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl p-[1px] rounded-full bg-gradient-to-r from-orange-500 to-red-600 shadow-xl relative mt-6 mx-auto"
      >
        <div
          class="w-full flex items-center bg-white rounded-full px-2 sm:px-3 py-1.5 sm:py-2 gap-1 sm:gap-2"
        >
          <!-- City dropdown -->
          <div class="relative flex items-center">
            <button
              type="button"
              class="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-gray-700 text-xs sm:text-sm font-medium outline-none hover:text-orange-600 transition-colors"
              @click.stop="cityDropdownOpen = !cityDropdownOpen"
            >
              <span class="truncate max-w-[90px] sm:max-w-[140px]">
                {{ selectedCity || "All cities" }}
              </span>
              <i
                class="pi text-[10px] sm:text-xs"
                :class="cityDropdownOpen ? 'pi-chevron-up' : 'pi-chevron-down'"
              ></i>
            </button>

            <div class="h-5 sm:h-6 w-px bg-gray-300 mx-1.5 sm:mx-2"></div>

            <ul
              v-if="cityDropdownOpen"
              class="absolute top-full left-0 mt-2 w-40 sm:w-48 max-h-64 overflow-auto bg-white text-black rounded-2xl shadow-lg border border-gray-200 z-30 text-xs sm:text-sm"
            >
              <li
                class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                @click.stop="onCitySelect('')"
              >
                All cities
              </li>
              <li
                v-for="city in uniqueCitiesData"
                :key="city"
                class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                @click.stop="onCitySelect(city)"
              >
                {{ city }}
              </li>
            </ul>
          </div>

          <!-- Search input -->
          <input
            v-model="searchInput"
            type="text"
            class="w-full outline-none px-1.5 sm:px-2 text-gray-600 placeholder-gray-400 text-xs sm:text-sm md:text-base"
            placeholder="Search for locations, Developers, Projects"
            autocomplete="off"
            @focus="suggestionsVisible = !!suggestionsList.length"
            @keyup.enter="onSearchButtonClicked"
          />

          <!-- Search button -->
          <button
            @click="onSearchButtonClicked"
            class="h-8 w-8 sm:h-10 sm:w-10 min-w-[2rem] sm:min-w-[2.5rem] rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
          >
            <i class="pi pi-search text-xs sm:text-sm"></i>
          </button>

          <!-- Suggestions dropdown -->
          <ul
            v-if="suggestionsVisible && suggestionsList.length"
            class="absolute left-0 right-0 top-full mt-2 max-h-72 overflow-auto bg-white text-black rounded-2xl shadow-lg border border-gray-200 z-50 text-xs sm:text-sm"
          >
            <li
              v-for="(suggestion, index) in suggestionsList"
              :key="suggestion._id || index"
              class="px-3 sm:px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between gap-2"
              @click="onSuggestionClick(suggestion)"
            >
              <div class="text-left">
                <div class="font-medium">{{ suggestion.title }}</div>
                <div v-if="suggestion.subtitle" class="text-[11px] text-gray-500">
                  {{ suggestion.subtitle }}
                </div>
              </div>
              <span
                v-if="suggestion.type"
                class="text-[10px] uppercase px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200"
              >
                {{ suggestion.type }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>

  </section>
</template>
