<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const error = ref("Network Error")
const reminders = ref([])
</script>

<template>
  <section class="space-y-4 px-6 bg-background">
    <!-- HEADER -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Reminder Management</h1>
      <Button>
        <Plus class="size-4! mr-1" />
        Add Reminder
      </Button>
    </div>

    <!-- ERROR VIEW -->
    <div v-if="error" class="p-4 bg-red-100 text-red-700 rounded-md text-sm font-medium">
      {{ error }}
    </div>

    <!-- EMPTY VIEW -->
    <div class="flex flex-col items-center justify-center py-20 text-muted-foreground text-[14px]">
      No reminders yet. Click "Add Reminder" or ask R Circle Work Space.
    </div>
  </section>
</template>
