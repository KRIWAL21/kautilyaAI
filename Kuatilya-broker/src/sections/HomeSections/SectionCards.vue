<script setup lang="ts">
import { onMounted } from "vue";
import { useProfileStore } from "@/store/ProfileStore";
import { useLeadStore } from "@/store/LeadStore";
import { storeToRefs } from "pinia";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-vue";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

onMounted(async () => {
  await profileStore.getProfileData();
  await leadStore.getLeadStats();
});

const profileStore = useProfileStore();
const { profileData } = storeToRefs(profileStore);

const leadStore = useLeadStore();
const { leadStatsData } = storeToRefs(leadStore);
</script>

<template>
  <div class="px-6">
    <h1 class="font-bold text-[30px]">Kautilya AI Growth Dashboard</h1>

    <div class="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-2 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 mt-4">
      <Card class="@container/card">
        <CardHeader>
          <CardDescription class="font-semibold text-[16px]">Appointments</CardDescription>
          <CardTitle
            class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
          >
            0
          </CardTitle>
        </CardHeader>
      </Card>
      <Card class="@container/card">
        <CardHeader>
          <CardDescription class="font-semibold text-[16px]">Visited</CardDescription>
          <CardTitle
            class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
          >
            0
          </CardTitle>
        </CardHeader>
      </Card>
      <Card class="@container/card">
        <CardHeader>
          <CardDescription class="font-semibold text-[16px]">Not Visited</CardDescription>
          <CardTitle
            class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
          >
            0
          </CardTitle>
        </CardHeader>
      </Card>
      <Card class="@container/card">
        <CardHeader>
          <CardDescription class="font-semibold text-[16px]">Booking Done</CardDescription>
          <CardTitle
            class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
          >
            0
          </CardTitle>
        </CardHeader>
      </Card>
      <Card class="@container/card">
        <CardHeader>
          <CardDescription class="font-semibold text-[16px]">Total Tagging</CardDescription>
          <CardTitle
            class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
          >
            0
          </CardTitle>
        </CardHeader>
      </Card>
      <Card class="@container/card">
        <CardHeader>
          <CardDescription class="font-semibold text-[16px]">Total Earning</CardDescription>
          <CardTitle
            class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
          >
            0
          </CardTitle>
        </CardHeader>
      </Card>
    </div>

    <h1 class="font-bold text-[30px] capitalize mt-4">Welcome Back, {{ profileData?.name }}</h1>
    <p class="opacity-70">Here's whats happening with your pipeline today</p>
  </div>
  <div
    class="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-2 gap-4 px-6 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 mt-4"
  >
    <Card class="@container/card">
      <CardHeader>
        <CardDescription class="font-semibold text-[16px]">Total Leads</CardDescription>
        <CardTitle
          class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
        >
          {{ leadStatsData?.totalLeads }}
        </CardTitle>
      </CardHeader>
    </Card>
    <Card class="@container/card">
      <CardHeader>
        <CardDescription class="font-semibold text-[16px]">Hot</CardDescription>
        <CardTitle
          class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
        >
          {{ leadStatsData?.hot }}
        </CardTitle>
      </CardHeader>
    </Card>
    <Card class="@container/card">
      <CardHeader>
        <CardDescription class="font-semibold text-[16px]">Warm</CardDescription>
        <CardTitle
          class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
        >
          {{ leadStatsData?.warm }}
        </CardTitle>
      </CardHeader>
    </Card>
    <Card class="@container/card">
      <CardHeader>
        <CardDescription class="font-semibold text-[16px]">Cold</CardDescription>
        <CardTitle
          class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
        >
          {{ leadStatsData?.cold }}
        </CardTitle>
      </CardHeader>
    </Card>
  </div>
</template>
