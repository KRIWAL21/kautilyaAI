<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Button } from '@/components/ui/button'
import { UserPlus, Calendar, CalendarDays, Building, Percent } from 'lucide-vue-next'
import { useProfileStore } from '@/store/ProfileStore'
import { storeToRefs } from 'pinia'

const profileStore = useProfileStore()
const { profileData } = storeToRefs(profileStore)

onMounted(async () => {
  await profileStore.getProfileData()
})

const brokerName = computed(() =>
  profileData.value?.name || profileData.value?.fullName || 'Broker'
)

const quickLinks = [
  { label: 'Add Lead',           to: '/leads',      icon: UserPlus    },
  { label: 'Schedule Follow up', to: '/follow-up',  icon: Calendar    },
  { label: 'Events',             to: '/events',     icon: CalendarDays },
  { label: 'Post Property',      to: '/properties', icon: Building    },
  { label: 'Deal of the Day',    to: '/projects',   icon: Percent     },
]
</script>

<template>
  <div class="px-6 space-y-4">
    <div>
      <h1 class="text-2xl font-bold">Welcome Back, {{ brokerName }}!</h1>
      <p class="text-sm text-muted-foreground mt-1">Here's what's happening with your pipeline today</p>
    </div>

    <div class="flex flex-wrap gap-3">
      <RouterLink
        v-for="link in quickLinks"
        :key="link.to"
        :to="link.to"
      >
        <Button class="bg-[#e11d48] text-white hover:bg-[#be123c]">
          <component :is="link.icon" class="mr-2 h-4 w-4" />
          {{ link.label }}
        </Button>
      </RouterLink>
    </div>
  </div>
</template>
