<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useBuilderStore } from "@/stores/builderStore";
import { debounce } from "@/utils/debounce";

const router = useRouter();
const builderStore = useBuilderStore();
const { builderList, builderListLoading, builderListError } =
  storeToRefs(builderStore);

const searchInput = ref("");
const searchTerm = ref("");

const liveSearch = debounce(async () => {
  searchTerm.value = searchInput.value.trim();
  await builderStore.getBuilderList({ search: searchTerm.value });
}, 300);

watch(searchInput, () => liveSearch());

onMounted(async () => {
  await builderStore.getBuilderList();
});

const builders = computed(() =>
  Array.isArray(builderList.value) ? builderList.value : [],
);

const goToDetails = (id) => {
  if (!id) return;
  router.push(`/builders/${id}`);
};

const initials = (name) =>
  (name || "?")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
</script>

<template>
  <section class="max-w-7xl mx-auto py-10 px-4 2xl:px-0 mt-10">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-marcellus text-gray-900">Builders &amp; Developers</h1>
        <p class="text-sm text-gray-500 mt-1">
          Browse verified builders and explore their projects.
        </p>
      </div>

      <div class="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 bg-white w-full md:w-96">
        <i class="pi pi-search text-gray-400"></i>
        <input
          v-model="searchInput"
          type="text"
          placeholder="Search by builder name…"
          class="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
        />
        <button
          v-if="searchInput"
          @click="searchInput = ''"
          class="text-gray-400 hover:text-gray-600"
          aria-label="Clear"
        >
          <i class="pi pi-times-circle"></i>
        </button>
      </div>
    </div>

    <p class="text-xs text-gray-500 mb-4">
      {{ builders.length }} builder{{ builders.length === 1 ? "" : "s" }}
      <span v-if="searchTerm">matching "{{ searchTerm }}"</span>
    </p>

    <div v-if="builderListError" class="bg-red-50 text-red-600 text-sm rounded-md p-3 mb-4">
      {{ builderListError }}
    </div>

    <!-- Loading skeleton -->
    <div
      v-if="builderListLoading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <div
        v-for="n in 8"
        :key="n"
        class="bg-white rounded-xl border overflow-hidden animate-pulse"
      >
        <div class="h-[140px] bg-gray-100"></div>
        <div class="p-4 space-y-2">
          <div class="h-4 bg-gray-100 rounded w-3/4"></div>
          <div class="h-3 bg-gray-100 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <div
      v-else-if="!builders.length"
      class="text-center py-16 text-gray-500 bg-white rounded-2xl border"
    >
      <i class="pi pi-building text-5xl text-gray-300 mb-4 block"></i>
      <p>No builders found.</p>
    </div>

    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <div
        v-for="builder in builders"
        :key="builder._id"
        @click="goToDetails(builder._id)"
        class="bg-white rounded-xl border shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition"
      >
        <div class="h-[140px] bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
          <img
            v-if="builder?.logo"
            :src="builder.logo"
            :alt="builder.companyName"
            class="h-20 object-contain"
          />
          <div
            v-else
            class="h-20 w-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold border-4 border-white shadow"
          >
            {{ initials(builder?.companyName) }}
          </div>
        </div>

        <div class="p-4 text-sm text-gray-700">
          <h2 class="font-semibold text-base text-gray-900 line-clamp-1">
            {{ builder?.companyName || "Unnamed builder" }}
          </h2>
          <p class="text-xs text-gray-500 mb-3 line-clamp-2">
            {{ builder?.aboutUs || "Trusted real estate developer" }}
          </p>

          <div class="border-t my-2"></div>

          <div class="flex justify-between py-1 text-xs">
            <span class="text-gray-500">RERA</span>
            <span class="text-gray-800 line-clamp-1 ml-2">
              {{ builder?.newReraNumber || "—" }}
            </span>
          </div>
          <div class="flex justify-between py-1 text-xs">
            <span class="text-gray-500">Phone</span>
            <span class="text-gray-800">{{ builder?.contactNumber || "—" }}</span>
          </div>
          <div class="flex justify-between py-1 text-xs">
            <span class="text-gray-500">Email</span>
            <span class="text-gray-800 truncate ml-2">
              {{ builder?.email || "—" }}
            </span>
          </div>

          <button
            class="mt-3 w-full bg-black text-white text-xs py-2 rounded-full hover:bg-gray-800 transition"
            @click.stop="goToDetails(builder._id)"
          >
            View profile
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
