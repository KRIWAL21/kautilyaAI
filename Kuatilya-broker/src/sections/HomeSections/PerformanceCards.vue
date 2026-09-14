<script setup lang="ts">
import { RouterLink } from "vue-router";
import {
  UserPlus,
  Megaphone,
  Calendar,
  // ChartColumnDecreasing,
  // Handshake,
  // Plus,
} from "lucide-vue-next";
// import {
//   Card,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
import Button from "@/components/ui/button/Button.vue";
</script>

<template>
  <div class="px-6 mt-6">
    <h1 class="font-bold text-[25px]">Quick Actions</h1>

    <div class="mt-4 flex flex-wrap gap-4">
      <router-link to="/leads">
        <Button>
          <UserPlus />
          <p>Add lead</p>
        </Button>
      </router-link>
     <router-link to="/follow-up">
       <Button>
        <Megaphone />
        <p>Schedule Follow Up</p>
      </Button>
     </router-link>
      <!-- <router-link to="/marketing">
        <Button>
        <Calendar />
        <p>Create Marketing</p>
      </Button>
      </router-link> -->
    </div>
  </div>

  <!-- <div class="px-6 mt-6">
    <h1 class="font-bold text-[25px]">Performance Overview</h1>
  </div> -->

  <!-- <div
    class="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3 mt-2"
  >
    <Card class="@container/card">
      <CardHeader>
        <CardDescription class="text-[20px] flex items-center gap-1">
          <Plus/>
          <p>Total Leads</p>
        </CardDescription>
        <CardTitle
          class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
        >
          24
        </CardTitle>
      </CardHeader>
    </Card>
    <Card class="@container/card">
      <CardHeader>
        <CardDescription class="text-[20px] flex gap-2 items-center">
          <Handshake />
          <p>Conversion</p>
        </CardDescription>
        <CardTitle
          class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
        >
          1,234
        </CardTitle>
      </CardHeader>
    </Card>
    <Card class="@container/card">
      <CardHeader>
        <CardDescription class="text-[20px] flex gap-2">
          <ChartColumnDecreasing />
          <p>Conversion Rate</p>
        </CardDescription>
        <CardTitle
          class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
        >
          8.4%
        </CardTitle>
      </CardHeader>
    </Card>
  </div> -->
</template>
