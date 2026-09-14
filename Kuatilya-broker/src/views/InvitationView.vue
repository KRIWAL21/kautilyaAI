<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useInvitationStore } from "@/store/InvitationStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "vue-sonner";
import type { BuilderSuggestion } from "@/types/invitation";

const invitationStore = useInvitationStore();
const {
  invitations,
  loading,
  responding,
  builderSuggestions,
  searchingBuilders,
} = storeToRefs(invitationStore);

const builderQuery = ref("");
const requestNote = ref("");
const requestingBuilderId = ref<string | null>(null);
  const invitationQuery = ref("");

const invitationBuilderCards = computed(() => {
  return invitations.value
    .map((invite) => {
      if (!invite.companyId || typeof invite.companyId === "string") return null;
      return {
        _id: invite.companyId._id,
        companyName: invite.companyId.companyName,
        contactNumber: invite.companyId.contactNumber,
        email: invite.companyId.email,
      } as BuilderSuggestion;
    })
    .filter((builder): builder is BuilderSuggestion => !!builder);
});

const availableBuilderCards = computed(() => {
  const merged = [...builderSuggestions.value, ...invitationBuilderCards.value];
  const deduped = merged.reduce((acc: BuilderSuggestion[], builder) => {
    if (!acc.find((item) => item._id === builder._id)) {
      acc.push(builder);
    }
    return acc;
  }, []);

  const q = builderQuery.value.trim().toLowerCase();
  if (!q) return deduped;

  return deduped.filter((builder) => {
    return (
      (builder.companyName || "").toLowerCase().includes(q) ||
      (builder.contactNumber || "").toLowerCase().includes(q) ||
      (builder.email || "").toLowerCase().includes(q)
    );
  });
});

const filteredInvitations = computed(() => {
  const q = invitationQuery.value.trim().toLowerCase();
  if (!q) return invitations.value;

  return invitations.value.filter((invite) => {
    const company = companyName(invite.companyId).toLowerCase();
    const phone = (invite.brokerPhoneNumber || "").toLowerCase();
    const note = (invite.note || "").toLowerCase();
    const direction = (invite.direction || "").toLowerCase();

    return (
      company.includes(q) ||
      phone.includes(q) ||
      note.includes(q) ||
      direction.includes(q)
    );
  });
});

const requestedBuilderIds = computed(() => {
  return new Set(
    invitations.value
      .filter(
        (invite) =>
          invite.direction === "broker_to_builder" &&
          invite.status !== "rejected" &&
          invite.companyId &&
          typeof invite.companyId !== "string",
      )
          .map((invite) => (invite.companyId as { _id: string })._id),
  );
});

onMounted(() => {
  invitationStore.getInvitations();
  invitationStore.getAvailableBuilders();
});

const companyName = (company: any) => {
  if (!company) return "Unknown Builder";
  if (typeof company === "string") return company;
  return company.companyName || company._id || "Unknown Builder";
};

const statusVariant = (status: string) => {
  const normalized = status?.toLowerCase();
  if (normalized === "accepted") return "default";
  if (normalized === "pending") return "secondary";
  return "outline";
};

const directionLabel = (direction?: string) => {
  if (direction === "broker_to_builder") return "Your Request";
  return "Builder Invite";
};

const respond = async (id: string, action: "accept" | "reject") => {
  try {
    await invitationStore.respondToInvitation(id, action);
    toast.success(`Invitation ${action}ed successfully`);
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Failed to update invitation");
  }
};

const requestBuilder = async (builder: BuilderSuggestion) => {
  if (requestingBuilderId.value || requestedBuilderIds.value.has(builder._id)) return;
  requestingBuilderId.value = builder._id;
  try {
    await invitationStore.requestBuilderAssociation({
      companyId: builder._id,
      note: requestNote.value.trim() || undefined,
    });
    toast.success("Builder request sent successfully");
    requestNote.value = "";
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Failed to send builder request");
  } finally {
    requestingBuilderId.value = null;
  }
};
</script>

<template>
  <section class="space-y-4 px-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Builder Invitations</h1>
      <Button variant="outline" @click="invitationStore.getInvitations()">Refresh</Button>
    </div>

    <!-- <div class="rounded-md border bg-card p-4 space-y-3">
      <h2 class="font-semibold">Available Builders (Click Card To Request)</h2>
      <input
        v-model="builderQuery"
        type="text"
        placeholder="Type builder name/phone/email"
        class="w-full rounded-md border bg-background px-3 py-2 text-sm"
      />
      <input
        v-model="requestNote"
        type="text"
        placeholder="Note (optional)"
        class="w-full rounded-md border bg-background px-3 py-2 text-sm"
      />

      <div v-if="searchingBuilders" class="rounded-md border p-2 text-xs text-muted-foreground">
        Loading available builders...
      </div>
      <div v-else-if="!availableBuilderCards.length" class="rounded-md border p-2 text-xs text-muted-foreground">
        No builders available for invitation
      </div>
      <div v-else class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="builder in availableBuilderCards"
          :key="builder._id"
          :data-disabled="requestedBuilderIds.has(builder._id)"
          :class="[
            'rounded-md border bg-background p-3 hover:bg-muted/40',
            (requestingBuilderId === builder._id || requestedBuilderIds.has(builder._id))
              ? 'opacity-70 cursor-not-allowed'
              : 'cursor-pointer'
          ]"
          @click="!requestingBuilderId && !requestedBuilderIds.has(builder._id) && requestBuilder(builder)"
        >
          <p class="font-semibold">{{ builder.companyName || "Unknown Builder" }}</p>
          <p class="text-sm text-muted-foreground">{{ builder.contactNumber || "No phone" }}</p>
          <p class="text-xs text-muted-foreground">{{ builder.email || "No email" }}</p>
          <p v-if="!requestedBuilderIds.has(builder._id)" class="text-xs text-primary mt-1">
            Tap to send request
          </p>
          <p v-else class="text-xs text-muted-foreground mt-1">Request already sent</p>
          <p
            v-if="requestingBuilderId === builder._id"
            class="text-xs text-primary mt-1"
          >
            Sending...
          </p>
        </div>
      </div>
    </div> -->

    <div class="rounded-md bg-card">
      <input
        v-model="invitationQuery"
        type="text"
        placeholder="Search by company, phone, note..."
        class="w-full rounded-md border bg-background px-3 py-2 text-sm"
      />
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="rounded-md border p-6 text-sm text-muted-foreground text-center"
    >
      Loading invitations...
    </div>

    <!-- Empty -->
    <div
      v-else-if="!filteredInvitations.length"
      class="rounded-md border p-6 text-sm text-muted-foreground text-center"
    >
      No invitations found.
    </div>

    <!-- List -->
    <div v-else class="space-y-3">
      <h2 class="font-semibold">All Invitations</h2>
      <div
        v-for="invite in filteredInvitations"
        :key="invite._id"
        class="rounded-md border bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <p class="font-semibold">{{ companyName(invite.companyId) }}</p>
          <p class="text-sm text-muted-foreground">{{ invite.brokerPhoneNumber }}</p>
          <p class="text-xs text-muted-foreground">{{ invite.note || "No note" }}</p>
          <p class="text-xs text-muted-foreground">{{ directionLabel(invite.direction) }}</p>
        </div>

        <div class="flex items-center gap-2">
          <Badge class="capitalize" :variant="statusVariant(invite.status)">{{ invite.status }}</Badge>
          <template v-if="invite.status === 'pending' && invite.direction !== 'broker_to_builder'">
            <Button size="sm" :disabled="responding" @click="respond(invite._id, 'accept')">
              Accept
            </Button>
            <Button size="sm" variant="outline" :disabled="responding" @click="respond(invite._id, 'reject')">
              Reject
            </Button>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>