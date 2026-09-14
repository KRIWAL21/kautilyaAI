<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Label from "@/components/ui/label/Label.vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-vue-next";
import { VueTelInput } from "vue-tel-input";
import "vue-tel-input/vue-tel-input.css";
import { useTeamMemberStore } from "@/store/TeamMemberStore";

const teamMemberStore = useTeamMemberStore();

const form = ref({
  name: "",
  role: "",
  email: "",
  phone: "",
});

const dialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const deletingMemberId = ref<string | null>(null);

onMounted(() => {
  teamMemberStore.fetchTeamMembers();
});

const addMember = async () => {
  if (!form.value.name || !form.value.email || !form.value.phone) return;

  try {
    const normalizedEmail = form.value.email.trim().toLowerCase();
    const normalizedPhone = form.value.phone.trim();
    const hasDuplicateEmail = teamMemberStore.teamMembers.some(
      (member) => member.email?.trim().toLowerCase() === normalizedEmail,
    );
    const hasDuplicatePhone = teamMemberStore.teamMembers.some(
      (member) => member.phone?.trim() === normalizedPhone,
    );

    if (hasDuplicateEmail) {
      teamMemberStore.error = "Email already exists for this team member list";
      return;
    }

    if (hasDuplicatePhone) {
      teamMemberStore.error = "Contact number already exists for this team member list";
      return;
    }

    await teamMemberStore.createTeamMember({
      name: form.value.name,
      email: normalizedEmail,
      phone: normalizedPhone,
      role: form.value.role || "Agent",
    });
    
    form.value = { name: "", role: "", email: "", phone: "" };
    dialogOpen.value = false;
  } catch (error) {
    console.error(error);
  }
};

const deleteMember = (id: string) => {
  deletingMemberId.value = id;
  deleteDialogOpen.value = true;
};

const confirmDeleteMember = async () => {
  if (!deletingMemberId.value) return;

  await teamMemberStore.deleteTeamMember(deletingMemberId.value);
  deleteDialogOpen.value = false;
  deletingMemberId.value = null;
};
</script>

<template>
  <section class="space-y-4 px-6 bg-background">
    <!-- HEADER -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">
        Team Members</h1>

      <Dialog v-model:open="dialogOpen">
        <DialogTrigger as-child>
          <Button><Plus />Add Member</Button>
        </DialogTrigger>

        <DialogContent class="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>

          <div class="space-y-3">
            <div class="space-y-2">
              <Label>Name *</Label>
              <Input v-model="form.name" placeholder="Enter name" required />
            </div>

            <div class="space-y-2">
              <Label>Email *</Label>
              <Input type="email" v-model="form.email" placeholder="Enter email address" required />
            </div>

            <div class="space-y-2">
              <Label>Phone *</Label>
              <!-- <Input v-model="form.phone" placeholder="Enter phone number" required /> -->
              <VueTelInput
                v-model="form.phone"
                mode="international"
                class="mt-2"
                :default-country="'IN'"
                :enabled-country-code="true"
                required
              />
            </div>

            <div class="space-y-2">
              <Label>Role</Label>
              <Input v-model="form.role" placeholder="e.g. Agent, Manager" />
            </div>

            <Button class="w-full mt-4" @click="addMember" :disabled="teamMemberStore.saving">
              <Loader2 v-if="teamMemberStore.saving" class="mr-2 h-4 w-4 animate-spin" />
              Save Member
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog v-model:open="deleteDialogOpen">
        <DialogContent class="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Team Member</DialogTitle>
          </DialogHeader>

          <p class="text-sm text-muted-foreground">
            Are you sure you want to delete this team member? This action cannot be undone.
          </p>

          <div class="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              @click="deleteDialogOpen = false"
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              @click="confirmDeleteMember"
              :disabled="teamMemberStore.saving"
            >
              <Loader2
                v-if="teamMemberStore.saving"
                class="mr-2 h-4 w-4 animate-spin"
              />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

    <!-- ERROR ALERT -->
    <div v-if="teamMemberStore.error" class="p-4 bg-red-100 text-red-700 rounded-md">
      {{ teamMemberStore.error }}
    </div>

    <!-- LOADING STATE -->
    <div v-if="teamMemberStore.loading" class="flex justify-center p-12">
      <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
    </div>

    <!-- TEAM GRID -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <Card
        v-for="member in teamMemberStore.teamMembers"
        :key="member._id"
        class="p-4 flex flex-col items-center text-center space-y-3 relative"
      >
        <!-- DELETE BUTTON -->
        <Button
          variant="destructive"
          size="sm"
          class="absolute top-2 right-2"
          @click="deleteMember(member._id)"
          :disabled="teamMemberStore.saving"
        >
          Delete
        </Button>

        <!-- IMAGE (Placeholder avatar) -->
        <img
          :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`"
          alt="avatar"
          class="w-20 h-20 rounded-full object-cover border"
        />

        <!-- INFO -->
        <div class="w-full">
          <h2 class="font-semibold truncate" :title="member.name">{{ member.name }}</h2>
          <p class="text-sm text-muted-foreground truncate" :title="member.role">
            {{ member.role || 'Agent' }} • 
            <span :class="member.status === 'Active' ? 'text-green-500' : 'text-red-500'">{{ member.status || 'Active' }}</span>
          </p>
          <div class="mt-2 text-xs text-muted-foreground space-y-1">
            <p class="truncate" :title="member.email">{{ member.email }}</p>
            <p>{{ member.phone }}</p>
          </div>
        </div>
      </Card>
      
      <div v-if="teamMemberStore.teamMembers.length === 0" class="col-span-full py-12 text-center text-muted-foreground">
        No team members found. Click "Add Member" to create one.
      </div>
    </div>
  </section>
</template>