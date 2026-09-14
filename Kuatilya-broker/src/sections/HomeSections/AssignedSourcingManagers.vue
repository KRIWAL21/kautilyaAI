<script setup lang="ts">
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfileStore } from "@/store/ProfileStore";

const profileStore = useProfileStore();
const { profileData } = storeToRefs(profileStore);

onMounted(async () => {
  if (!profileData.value) {
    await profileStore.getProfileData();
  }
});

const sourcingManagers = computed(() => profileData.value?.sourcingManagers ?? []);
</script>

<template>
  <section class="px-6 mt-6">
    <Card>
      <CardHeader>
        <CardTitle class="text-[20px]">Assigned Sourcing Managers</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="sourcingManagers.length > 0" class="flex flex-wrap gap-2">
          <Badge
            v-for="manager in sourcingManagers"
            :key="manager._id"
            variant="outline"
            class="text-sm"
          >
            {{ manager.name || manager.companyName || manager._id }}
          </Badge>
        </div>

        <p v-else class="text-sm text-muted-foreground">
          No sourcing manager assigned yet.
        </p>
      </CardContent>
    </Card>
  </section>
</template>
