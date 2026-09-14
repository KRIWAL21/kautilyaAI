<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { Search, MapPin, Building2, Eye, CheckCircle2, ChevronLeft, ChevronRight, Plus } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { makeRequest } from '@/request/request'

const activeTab = ref('Other Brokers\' Properties')
const tabs = ['My Properties', "Other Brokers' Properties"]

const projects = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')

const itemsPerPage = ref('10')
const currentPage = ref(1)

const mySavedPropertyIds = useLocalStorage<string[]>('my-saved-properties', [])

const filteredProjects = computed(() => {
  if (activeTab.value === 'My Properties') {
    return projects.value.filter(p => mySavedPropertyIds.value.includes(p._id))
  }
  return projects.value.filter(p => !mySavedPropertyIds.value.includes(p._id))
})

const paginatedProjects = computed(() => {
  const limit = parseInt(itemsPerPage.value, 10)
  const start = (currentPage.value - 1) * limit
  return filteredProjects.value.slice(start, start + limit)
})

const totalPages = computed(() => {
  const limit = parseInt(itemsPerPage.value, 10)
  return Math.ceil(filteredProjects.value.length / limit)
})

watch([itemsPerPage, activeTab], () => {
  currentPage.value = 1
})

// Debounce helper for search
let searchTimeout: any = null

const fetchProjects = async (search = '') => {
  loading.value = true
  try {
    const url = search ? `/projects/broker?search=${encodeURIComponent(search)}` : '/projects/broker'
    const res = await makeRequest(url, 'GET')
    
    // The backend returns { status: 'success', data: [...], totalCount: X }
    if (res.data) {
      const priorityProjects = [
        'iris at kashish park',
        'dosti west county',
        'emperor poonam chhaya chs',
        'vida crest',
        'godrej nurture'
      ]
      
      const sortedData = res.data.sort((a: any, b: any) => {
        const aName = (a.projectName || '').toLowerCase()
        const bName = (b.projectName || '').toLowerCase()
        
        const aIsPriority = priorityProjects.some(p => aName.includes(p))
        const bIsPriority = priorityProjects.some(p => bName.includes(p))
        
        if (aIsPriority && !bIsPriority) return -1
        if (!aIsPriority && bIsPriority) return 1
        return 0
      })
      
      projects.value = sortedData
    } else {
      projects.value = []
    }
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    projects.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProjects()
})

watch(searchQuery, (newVal) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchProjects(newVal)
  }, 500) // 500ms debounce
})

const formatPrice = (price: number) => {
  if (!price) return 'On Request'
  // Convert to Cr or L
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`
  }
  return `₹${price.toLocaleString()}`
}

const formatPriceRange = (min: number, max: number) => {
  if (!min && !max) return 'On Request'
  if (min && !max) return `From ${formatPrice(min)}`
  if (!min && max) return `Up to ${formatPrice(max)}`
  return `${formatPrice(min)} - ${formatPrice(max)}`
}

const addToMyProperties = (project: any) => {
  if (!mySavedPropertyIds.value.includes(project._id)) {
    mySavedPropertyIds.value.push(project._id)
    toast.success(`"${project.projectName || 'Property'}" added to My Properties!`);
  } else {
    toast.info(`"${project.projectName || 'Property'}" is already in My Properties.`);
  }
}
</script>

<template>
  <div class="h-full flex flex-col p-6 space-y-6 max-w-[1400px]">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Properties</h1>
        <p class="text-[14px] text-muted-foreground mt-1">
          Manage your listings and explore properties posted by other brokers.
        </p>
      </div>
      <Button 
        class="bg-[#ff4d4f] hover:bg-[#ff7875] text-white rounded-full h-10 px-5 font-semibold"
        @click="$router.push('/projects/create')"
      >
        + Post Property
      </Button>
    </div>

    <!-- Tabs -->
    <div class="flex items-center space-x-2 bg-[#121212] p-1 rounded-xl w-fit border border-border/40">
      <button 
        v-for="tab in tabs" 
        :key="tab"
        @click="activeTab = tab"
        class="px-5 py-2 rounded-lg text-[14px] font-medium transition-all"
        :class="activeTab === tab ? 'bg-[#ff4d4f] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Search and Filter Bar -->
    <div class="flex items-center gap-4 w-full max-w-3xl">
      <div class="relative flex-1">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          v-model="searchQuery"
          placeholder="Search by city, region, or project name..." 
          class="pl-12 h-11 bg-[#121212] border-border/40 rounded-xl text-foreground placeholder:text-muted-foreground text-[14px]"
        />
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground whitespace-nowrap">Show:</span>
        <Select v-model="itemsPerPage">
          <SelectTrigger class="w-[100px] bg-[#121212] border-border/40 rounded-xl">
            <SelectValue placeholder="10" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="1000">1000</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Main Content Area -->
    <div v-if="loading" class="flex-1 flex items-center justify-center min-h-[350px]">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff4d4f]"></div>
    </div>

    <template v-else>
      <div v-if="paginatedProjects.length > 0" class="flex flex-col space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Property Card -->
          <div 
            v-for="project in paginatedProjects" 
            :key="project._id"
          class="group flex flex-col bg-card border border-border/40 rounded-2xl overflow-hidden hover:border-[#ff4d4f]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#ff4d4f]/5 cursor-pointer"
        >
          <!-- Thumbnail -->
          <div class="relative aspect-video w-full overflow-hidden bg-[#121212]">
            <img 
              v-if="project.propertyPictures?.length > 0" 
              :src="project.propertyPictures[0]" 
              :alt="project.projectName"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-muted-foreground">
              <Building2 class="w-10 h-10 opacity-20" />
            </div>
            
            <!-- Badges -->
            <div class="absolute top-3 left-3 flex gap-2">
              <span v-if="project.projectStatus" class="px-2.5 py-1 text-xs font-semibold bg-black/60 backdrop-blur text-white rounded-md border border-white/10">
                {{ project.projectStatus }}
              </span>
              <span v-if="project.PropertyConfig?.[0]" class="px-2.5 py-1 text-xs font-semibold bg-[#ff4d4f]/90 backdrop-blur text-white rounded-md shadow-sm">
                {{ project.PropertyConfig[0] }}
              </span>
            </div>
          </div>

          <!-- Card Body -->
          <div class="p-5 flex flex-col flex-1">
            <h3 class="text-xl font-bold text-foreground line-clamp-1 mb-1">{{ project.projectName }}</h3>
            <div class="flex items-start text-muted-foreground text-sm mb-4">
              <MapPin class="w-4 h-4 mr-1.5 mt-0.5 shrink-0" />
              <span class="line-clamp-2">{{ project.address }}, {{ project.city }}</span>
            </div>
            
            <!-- Price and Details -->
            <div class="mt-auto grid grid-cols-2 gap-4 py-4 border-y border-border/40">
              <div>
                <p class="text-xs text-muted-foreground mb-1">Price Range</p>
                <p class="font-semibold text-foreground">
                  {{ formatPriceRange(project.minPrice, project.maxPrice) }}
                </p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground mb-1">Builder</p>
                <div class="flex items-center gap-2">
                  <img v-if="project.builderTheme?.logoUrl" :src="project.builderTheme.logoUrl" class="h-5 w-5 object-contain rounded-sm" />
                  <p class="font-semibold text-foreground line-clamp-1">
                    {{ project.builderDetails?.name || project.builderName || 'N/A' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between pt-4 mt-auto">
              <div class="flex items-center gap-1.5 text-xs text-muted-foreground" v-if="project.reraNo">
                <CheckCircle2 class="w-4 h-4 text-green-500" />
                RERA Registered
              </div>
              <div v-else></div>
              
              <div class="flex items-center gap-2">
                <Button v-if="activeTab !== 'My Properties'" variant="ghost" size="sm" @click.stop="addToMyProperties(project)" class="h-8 text-green-500 hover:text-white hover:bg-green-500 rounded-lg text-xs font-medium">
                  <Plus class="w-4 h-4 mr-1" />
                  Add
                </Button>
                <Button variant="ghost" size="sm" class="h-8 text-[#ff4d4f] hover:text-white hover:bg-[#ff4d4f] rounded-lg text-xs font-medium">
                  <Eye class="w-4 h-4 mr-1.5" />
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </div>
        </div>
        
        <!-- Pagination Controls -->
        <div class="flex items-center justify-between py-4">
          <div class="text-sm text-muted-foreground">
            Showing {{ filteredProjects.length === 0 ? 0 : ((currentPage - 1) * Number(itemsPerPage)) + 1 }} to {{ Math.min(currentPage * Number(itemsPerPage), filteredProjects.length) }} of {{ filteredProjects.length }} projects
          </div>
          <div class="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              class="bg-[#121212] border-border/40 hover:bg-[#1a1a1a]"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              <ChevronLeft class="w-4 h-4 mr-1" />
              Previous
            </Button>
            <div class="text-sm font-medium px-4">
              Page {{ currentPage }} of {{ totalPages || 1 }}
            </div>
            <Button
              variant="outline"
              size="sm"
              class="bg-[#121212] border-border/40 hover:bg-[#1a1a1a]"
              :disabled="currentPage === totalPages || totalPages === 0"
              @click="currentPage++"
            >
              Next
              <ChevronRight class="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex-1 flex flex-col items-center justify-center min-h-[350px] space-y-4">
        <div class="p-4 bg-[#121212] rounded-full mb-2">
          <Building2 class="w-10 h-10 text-muted-foreground" />
        </div>
        <p class="text-[15px] text-muted-foreground">
          {{ searchQuery ? 'No properties found for this search.' : 'No properties available right now.' }}
        </p>
        <Button v-if="searchQuery" variant="outline" @click="searchQuery = ''" class="border-border/40 bg-[#121212] text-foreground hover:bg-[#1a1a1a] rounded-xl h-10 px-6">
          Clear Search
        </Button>
        <Button v-else variant="outline" class="border-border/40 bg-[#121212] text-foreground hover:bg-[#1a1a1a] rounded-xl h-10 px-6" @click="$router.push('/projects/create')">
          Post your first property</Button>
      </div>
    </template>
  </div>
</template>
