<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useFollowUpStore } from "@/store/FollowUpStore";
import { useLeadStore } from "@/store/LeadStore";
import { storeToRefs } from "pinia";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-vue";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Button from "@/components/ui/button/Button.vue";
import { Plus } from "lucide-vue-next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "vue-sonner";

const followStore = useFollowUpStore();
const leadStore = useLeadStore();
const { followStatData, creating } = storeToRefs(followStore);
const { leadData } = storeToRefs(leadStore);

const isCreateDialogOpen = ref(false);

const newFollowUp = ref({
  leadId: "",
  scheduledAt: "",
  note: "",
  actionType: "Call",
  leadStatus: "Interested",
  status: "Pending",
});

const selectedLead = computed(() => {
  if (!newFollowUp.value.leadId) return null;
  return leadData.value.find((lead) => lead._id === newFollowUp.value.leadId) ?? null;
});

const formatSource = (source?: string) => {
  if (!source) return "-";
  return source
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

onMounted(async () => {
  await Promise.all([
    followStore.getFollowStats(),
    leadStore.getLeadData(100, 1),
  ]);

  if (!newFollowUp.value.leadId && leadData.value.length > 0) {
    newFollowUp.value.leadId = leadData.value[0]._id;
  }
});

const submitCreateFollowUp = async () => {
  if (!newFollowUp.value.leadId) {
    toast.error("Please select a lead");
    return;
  }

  if (!newFollowUp.value.scheduledAt) {
    toast.error("Please select schedule date and time");
    return;
  }

  await followStore.createFollowUp(newFollowUp.value);

  toast.success("Follow-up created successfully");

  isCreateDialogOpen.value = false;

  // reset
  newFollowUp.value = {
    leadId: leadData.value[0]?._id ?? "",
    scheduledAt: "",
    note: "",
    actionType: "Call",
    leadStatus: "Interested",
    status: "Pending",
  };
};
</script>

<template>
  <div class="px-6 flex items-center justify-between">
    <h1 class="font-bold text-[30px]">Follow Up's</h1>

    <Dialog v-model:open="isCreateDialogOpen">
      <DialogTrigger as-child>
        <Button>
          <Plus />
          Create Follow-Up
        </Button>
      </DialogTrigger>

      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Follow-Up</DialogTitle>
        </DialogHeader>

        <div class="grid grid-cols-2 gap-4">
          <!-- Lead -->
          <div class="col-span-2">
            <Label>Lead</Label>
            <Select v-model="newFollowUp.leadId">
              <SelectTrigger class="mt-2">
                <SelectValue placeholder="Select lead" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="lead in leadData"
                  :key="lead._id"
                  :value="lead._id"
                >
                  {{ lead.name || "Unnamed Lead" }} - {{ lead.phone || "No Phone" }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Lead Details -->
          <div>
            <Label>Lead Name</Label>
            <Input
              class="mt-2"
              :value="selectedLead?.name || '-'"
              disabled
            />
          </div>

          <div>
            <Label>Lead Phone</Label>
            <Input
              class="mt-2"
              :value="selectedLead?.phone || '-'"
              disabled
            />
          </div>

          <div class="col-span-2">
            <Label>Lead Source</Label>
            <Input
              class="mt-2"
              :value="formatSource(selectedLead?.source)"
              disabled
            />
          </div>

          <!-- Schedule -->
          <div class="col-span-2">
            <Label>Schedule Date & Time</Label>
            <Input
              class="mt-2"
              type="datetime-local"
              v-model="newFollowUp.scheduledAt"
            />
          </div>

          <!-- Action Type -->
          <div>
            <Label>Action Type</Label>
            <Input
              class="mt-2"
              v-model="newFollowUp.actionType"
              placeholder="Call / Meeting"
            />
          </div>

          <!-- Status -->
          <div>
            <Label>Status</Label>
            <Input
              class="mt-2"
              v-model="newFollowUp.status"
              placeholder="Pending"
            />
          </div>

          <div class="col-span-2">
            <Label>Lead Journey Status</Label>
            <Select v-model="newFollowUp.leadStatus">
              <SelectTrigger class="mt-2">
                <SelectValue placeholder="Select lead journey status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Interested">Interested</SelectItem>
                <SelectItem value="Site Visit Booking">Site Visit Booking</SelectItem>
                <SelectItem value="Meeting">Meeting</SelectItem>
                <SelectItem value="Booking Registration">Booking Registration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Note -->
          <div class="col-span-2">
            <Label>Note</Label>
            <Textarea
              class="mt-2"
              v-model="newFollowUp.note"
              placeholder="Discuss budget and preferred locations"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="isCreateDialogOpen = false">
            Cancel
          </Button>
          <Button :loading="creating" @click="submitCreateFollowUp">
            Create Follow-Up
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>

  <div
    class="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 mt-4"
  >
    <Card class="@container/card">
      <CardHeader>
        <CardDescription class="font-semibold text-[20px]"
          >Total</CardDescription
        >
        <CardTitle
          class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
        >
          {{ followStatData.total }}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <IconTrendingUp />
            +12.5%
          </Badge>
        </CardAction>
      </CardHeader>
    </Card>
    <Card class="@container/card">
      <CardHeader>
        <CardDescription class="font-semibold text-[20px]"
          >Today</CardDescription
        >
        <CardTitle
          class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
        >
          {{ followStatData.today }}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <IconTrendingDown />
            -20%
          </Badge>
        </CardAction>
      </CardHeader>
    </Card>
    <Card class="@container/card">
      <CardHeader>
        <CardDescription class="font-semibold text-[20px]"
          >Pending</CardDescription
        >
        <CardTitle
          class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
        >
          {{ followStatData.pending }}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <IconTrendingUp />
            +12.5%
          </Badge>
        </CardAction>
      </CardHeader>
    </Card>
    <Card class="@container/card">
      <CardHeader>
        <CardDescription class="font-semibold text-[20px]"
          >Completed</CardDescription
        >
        <CardTitle
          class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
        >
          {{ followStatData.completed }}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <IconTrendingUp />
            +4.5%
          </Badge>
        </CardAction>
      </CardHeader>
    </Card>
  </div>
</template>
