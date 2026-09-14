import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { blogs, CATEGORIES, CITIES, PROPERTY_TYPES } from '@/data/blogsData'

export const useBlogStore = defineStore('blogs', () => {
  const searchQuery    = ref('')
  const activeCategory = ref('')
  const activeCity     = ref('')
  const activeType     = ref('')
  const currentPage    = ref(1)
  const PAGE_SIZE      = 12

  // Reset to page 1 whenever any filter changes
  watch([searchQuery, activeCategory, activeCity, activeType], () => {
    currentPage.value = 1
  })

  const filteredBlogs = computed(() => {
    let list = blogs
    const q = searchQuery.value.trim().toLowerCase()
    if (q) {
      list = list.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.keywords.some(k => k.toLowerCase().includes(q))
      )
    }
    if (activeCategory.value) list = list.filter(b => b.category      === activeCategory.value)
    if (activeCity.value)     list = list.filter(b => b.city          === activeCity.value)
    if (activeType.value)     list = list.filter(b => b.property_type === activeType.value)
    return list
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(filteredBlogs.value.length / PAGE_SIZE)))

  const pagedBlogs = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    return filteredBlogs.value.slice(start, start + PAGE_SIZE)
  })

  const hasActiveFilter = computed(
    () => !!(searchQuery.value || activeCategory.value || activeCity.value || activeType.value)
  )

  const clearFilters = () => {
    searchQuery.value    = ''
    activeCategory.value = ''
    activeCity.value     = ''
    activeType.value     = ''
  }

  const getBlogBySlug = slug => blogs.find(b => b.slug === slug)
  const getBlogById   = id   => blogs.find(b => b.id   === id)

  return {
    // filter state
    searchQuery, activeCategory, activeCity, activeType,
    currentPage, PAGE_SIZE,
    // read-only data
    CATEGORIES, CITIES, PROPERTY_TYPES,
    // computed
    filteredBlogs, totalPages, pagedBlogs, hasActiveFilter,
    // actions
    clearFilters, getBlogBySlug, getBlogById,
  }
})
