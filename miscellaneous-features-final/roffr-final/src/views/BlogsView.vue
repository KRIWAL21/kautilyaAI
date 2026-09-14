<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useBlogStore } from '@/stores/blogsStore'

const router = useRouter()
const store  = useBlogStore()

const {
  searchQuery, activeCategory, activeCity, activeType,
  currentPage, totalPages, pagedBlogs, hasActiveFilter,
} = storeToRefs(store)

// Static arrays — plain values, not reactive refs
const { CATEGORIES, CITIES, PROPERTY_TYPES } = store

const goToBlog = slug => router.push(`/blog-details/${slug}`)

// Visible page numbers (max 5 around current)
const pageNumbers = computed(() => {
  const total = totalPages.value
  const cur   = currentPage.value
  const delta = 2
  const range = []
  for (let i = Math.max(1, cur - delta); i <= Math.min(total, cur + delta); i++) range.push(i)
  if (range[0] > 2) range.unshift('...')
  if (range[0] !== 1) range.unshift(1)
  if (range[range.length - 1] < total - 1) range.push('...')
  if (range[range.length - 1] !== total) range.push(total)
  return range
})
</script>

<template>
  <main class="bg-gray-50 min-h-screen pb-16">

    <!-- ── Hero header ──────────────────────────────────── -->
    <div class="bg-white border-b border-gray-100 pt-24 pb-8">
      <div class="max-w-7xl mx-auto px-4 2xl:px-0">
        <p class="text-xs font-semibold text-[#EB3131] uppercase tracking-widest mb-2">Blog & Insights</p>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          Real Estate<br class="hidden md:block" /> Knowledge Hub
        </h1>
        <p class="text-sm text-gray-500 mt-2">{{ store.filteredBlogs.length.toLocaleString('en-IN') }} articles across {{ CITIES.length }} cities</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 2xl:px-0 pt-6">

      <!-- ── Filters bar ──────────────────────────────────── -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 space-y-4">

        <!-- Search -->
        <div class="relative">
          <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by title, description or keyword…"
            class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#EB3131] focus:bg-white transition"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <i class="pi pi-times text-xs"></i>
          </button>
        </div>

        <!-- Category chips -->
        <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            @click="activeCategory = ''"
            class="shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition whitespace-nowrap"
            :class="!activeCategory ? 'bg-[#EB3131] text-white border-[#EB3131]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#EB3131] hover:text-[#EB3131]'"
          >All</button>
          <button
            v-for="cat in CATEGORIES"
            :key="cat"
            @click="activeCategory = activeCategory === cat ? '' : cat"
            class="shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition whitespace-nowrap"
            :class="activeCategory === cat ? 'bg-[#EB3131] text-white border-[#EB3131]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#EB3131] hover:text-[#EB3131]'"
          >{{ cat }}</button>
        </div>

        <!-- City + Property type dropdowns + clear -->
        <div class="flex flex-wrap gap-3 items-center">
          <select
            v-model="activeCity"
            class="flex-1 min-w-[140px] text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-700 focus:outline-none focus:border-[#EB3131] transition"
          >
            <option value="">All Cities</option>
            <option v-for="city in CITIES" :key="city" :value="city">{{ city }}</option>
          </select>

          <select
            v-model="activeType"
            class="flex-1 min-w-[160px] text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-700 focus:outline-none focus:border-[#EB3131] transition"
          >
            <option value="">All Property Types</option>
            <option v-for="type in PROPERTY_TYPES" :key="type" :value="type">{{ type }}</option>
          </select>

          <button
            v-if="hasActiveFilter"
            @click="store.clearFilters()"
            class="flex items-center gap-1.5 text-xs font-semibold text-[#EB3131] border border-[#EB3131] px-4 py-2.5 rounded-xl hover:bg-red-50 transition whitespace-nowrap"
          >
            <i class="pi pi-filter-slash text-xs"></i>
            Clear filters
          </button>
        </div>
      </div>

      <!-- ── Blog grid ──────────────────────────────────── -->
      <div v-if="pagedBlogs.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <article
          v-for="blog in pagedBlogs"
          :key="blog.id"
          @click="goToBlog(blog.slug)"
          class="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer group flex flex-col"
        >
          <!-- Cover image -->
          <div class="h-44 overflow-hidden shrink-0 relative bg-gray-100">
            <img
              :src="blog.img"
              :alt="blog.title"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              @error="$event.target.src='/dummy/dummy-case2.webp'"
            />
            <span class="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-gray-600 uppercase tracking-wider px-2.5 py-1 rounded-full">
              {{ blog.category }}
            </span>
          </div>

          <!-- Body -->
          <div class="p-4 flex flex-col gap-2 flex-1">
            <!-- City + property type tags -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[10px] font-medium text-[#EB3131] bg-red-50 px-2 py-0.5 rounded-full">{{ blog.city }}</span>
              <span class="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{{ blog.property_type }}</span>
            </div>

            <h3 class="font-bold text-gray-900 text-[14px] leading-snug line-clamp-2 flex-1">
              {{ blog.title }}
            </h3>

            <p class="text-[11px] text-gray-400 leading-relaxed line-clamp-2">
              {{ blog.description }}
            </p>

            <!-- Footer -->
            <div class="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-gray-100">
              <span class="text-[11px] font-semibold text-[#EB3131]">Read More →</span>
              <div class="flex items-center gap-1 text-[10px] text-gray-400">
                <i class="pi pi-clock text-[9px]"></i>
                <span>{{ blog.reading_time_min }} min read</span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-24">
        <i class="pi pi-inbox text-5xl text-gray-200 mb-4 block"></i>
        <p class="text-gray-500 font-medium">No blogs match your filters.</p>
        <button @click="store.clearFilters()" class="mt-4 text-sm text-[#EB3131] underline">
          Clear all filters
        </button>
      </div>

      <!-- ── Pagination ──────────────────────────────────── -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-1.5 mt-10 flex-wrap">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="w-9 h-9 rounded-full border flex items-center justify-center text-sm transition"
          :class="currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:border-[#EB3131] hover:text-[#EB3131]'"
        >
          <i class="pi pi-angle-left text-xs"></i>
        </button>

        <template v-for="p in pageNumbers" :key="p">
          <span v-if="p === '...'" class="px-1 text-gray-400 text-sm">…</span>
          <button
            v-else
            @click="currentPage = p"
            class="w-9 h-9 rounded-full border text-sm font-semibold transition"
            :class="currentPage === p
              ? 'bg-[#EB3131] text-white border-[#EB3131]'
              : 'border-gray-200 text-gray-600 hover:border-[#EB3131] hover:text-[#EB3131]'"
          >{{ p }}</button>
        </template>

        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="w-9 h-9 rounded-full border flex items-center justify-center text-sm transition"
          :class="currentPage === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:border-[#EB3131] hover:text-[#EB3131]'"
        >
          <i class="pi pi-angle-right text-xs"></i>
        </button>
      </div>

    </div>
  </main>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
