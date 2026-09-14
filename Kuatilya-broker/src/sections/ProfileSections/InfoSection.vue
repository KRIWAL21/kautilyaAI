<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useProfileStore } from "@/store/ProfileStore";
import { storeToRefs } from "pinia";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import {
  MapPin,
  Globe,
  Phone,
  Mail,
  Pencil,
  Facebook,
  Instagram,
} from "lucide-vue-next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { toast } from "vue-sonner";

onMounted(async() => {
  await profileStore.getProfileData()
})

const profileStore = useProfileStore()
const {profileData} = storeToRefs(profileStore)

const isDialogOpen = ref(false)

const editForm = ref({
  name: '',
  role: '',
  city: '',
  languages: '',
  phoneNumber: '',
  email: '',
  specialization: ''
})

const openEditModal = () => {
  editForm.value = {
    name: profileData.value?.name || '',
    role: profileData.value?.role || '',
    city: profileData.value?.city || '',
    languages: profileData.value?.languages || '',
    phoneNumber: profileData.value?.phoneNumber || '',
    email: profileData.value?.email || '',
    specialization: profileData.value?.specialization || ''
  }
  isDialogOpen.value = true
}

const saveChanges = async () => {
  const success = await profileStore.updateProfileData(editForm.value)
  if (success) {
    toast.success("Profile updated successfully!")
    isDialogOpen.value = false
    await profileStore.getProfileData()
  } else {
    toast.error("Failed to update profile.")
  }
}
</script>

<template>
  <section class="px-6">
    <!-- Header -->
    <div>
      <h1 class="font-bold text-[30px]">Profile & Settings</h1>
      <p class="opacity-70">
        Manage your public broker profile and account security
      </p>
    </div>

    <!-- Profile Card -->
    <Card class="mt-6 bg-card/80 backdrop-blur">
      <CardContent class="p-6 space-y-6">
        <!-- Top Row -->
        <div
          class="flex flex-col xl:flex-row items-center justify-between gap-6"
        >
          <div class="flex flex-col xl:flex-row items-center gap-4">
            <Avatar class="h-36 w-36">
              <AvatarImage src="/avatar.jpg" />
              <AvatarFallback class="text-[30px]">{{ profileData?.name?.charAt(0).toUpperCase() }}</AvatarFallback>
            </Avatar>

            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-semibold">{{ profileData?.name }}</h2>
                <Badge variant="secondary" class="text-xs">
                  {{ profileData?.chanakyaPoints }}
                </Badge>
              </div>

              <div class="text-sm text-muted-foreground">
                  <p>GSTIN :- {{ profileData?.gstin }}</p>
                  <p>RERA NO :- {{ profileData?.reraNumber }}</p>
              </div>

              <div
                class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
              >
                <span class="flex items-center gap-1">
                  <MapPin class="h-4 w-4" />
                  <p v-for="value in profileData?.regions">
                    {{ value }},
                  </p>
                </span>
                <span class="flex items-center gap-1">
                  <Globe class="h-4 w-4" />
                  {{ profileData?.language }}
                </span>
              </div>
            </div>
          </div>

          <Dialog :open="isDialogOpen" @update:open="isDialogOpen = $event">
            <DialogTrigger as-child>
              <Button class="gap-2" @click="openEditModal">
                <Pencil />
                <p>Edit Profile</p>
              </Button>
            </DialogTrigger>

            <DialogContent class="sm:max-w-130">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Update your public broker information.
                </DialogDescription>
              </DialogHeader>

              <div class="space-y-4 py-4">
                <div class="space-y-2">
                  <Label>Full Name</Label>
                  <Input v-model="editForm.name" placeholder="Jonathan Miller" />
                </div>

                <div class="space-y-2">
                  <Label>Role / Title</Label>
                  <Input
                    v-model="editForm.role"
                    placeholder="Senior Residential Broker at Century Real Estate"
                  />
                </div>

                <div class="space-y-2">
                  <Label>Location</Label>
                  <Input v-model="editForm.city" placeholder="Miami, FL" />
                </div>

                <div class="space-y-2">
                  <Label>Languages</Label>
                  <Input v-model="editForm.languages" placeholder="English, Spanish, Portuguese" />
                </div>

                <div class="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input v-model="editForm.phoneNumber" placeholder="+1 (555) 0123-4567" />
                </div>

                <div class="space-y-2">
                  <Label>Email</Label>
                  <Input v-model="editForm.email" placeholder="jonathan.m@centuryre.com" />
                </div>

                <div class="space-y-2">
                  <Label>Specialization</Label>
                  <Input v-model="editForm.specialization" placeholder="Luxury Condos, Waterfront Properties" />
                </div>
              </div>

              <DialogFooter>
                <!-- <Button variant="secondary">Cancel</Button> -->
                <Button @click="saveChanges" :disabled="profileStore.isLoading">
                  {{ profileStore.isLoading ? 'Saving...' : 'Save Changes' }}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <!-- Divider -->
        <div class="h-px w-full bg-border" />

        <!-- Info Grid -->
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div class="space-y-1">
            <p class="text-xs uppercase tracking-wider text-muted-foreground">
              Mobile Number
            </p>
            <p class="flex items-center gap-2 text-sm">
              <Phone class="h-4 w-4 text-muted-foreground" />
              {{ profileData?.phoneNumber }}
            </p>
          </div>

          <div class="space-y-1">
            <p class="text-xs uppercase tracking-wider text-muted-foreground">
              Brokerage Email
            </p>
            <p class="flex items-center gap-2 text-sm">
              <Mail class="h-4 w-4 text-muted-foreground" />
              {{ profileData?.email }}
            </p>
          </div>

          <div class="space-y-1">
            <p class="text-xs uppercase tracking-wider text-muted-foreground">
              Specialization
            </p>
            <div class="flex items-center">
              <p class="text-sm ">{{ profileData?.specialization || '-' }}</p>
            </div>
          </div>

          <div class="space-y-1">
            <p class="text-xs uppercase tracking-wider text-muted-foreground">
              Associated Builders
            </p>
            <div class="flex flex-wrap gap-2">
              <Badge
                v-for="builder in profileData?.builders"
                :key="builder._id"
                variant="outline"
                class="text-xs"
              >
                {{ builder.companyName || builder.name || builder._id }}
              </Badge>
              <p
                v-if="!profileData?.builders || profileData.builders.length === 0"
                class="text-sm text-muted-foreground"
              >
                -
              </p>
            </div>
          </div>

          <div class="space-y-1">
            <p class="text-xs uppercase tracking-wider text-muted-foreground">
              Associated Sourcing Managers
            </p>
            <div class="flex flex-wrap gap-2">
              <Badge
                v-for="manager in profileData?.sourcingManagers"
                :key="manager._id"
                variant="outline"
                class="text-xs capitalize"
              >
                {{ manager.name || manager.companyName || manager._id }}
              </Badge>
              <p
                v-if="!profileData?.sourcingManagers || profileData.sourcingManagers.length === 0"
                class="text-sm text-muted-foreground"
              >
                -
              </p>
            </div>
          </div>

          <div class="space-y-1">
            <p class="text-xs uppercase tracking-wider text-muted-foreground">
              Social Presence
            </p>
            <div class="flex items-center gap-2 mt-2">
              <Button size="icon" variant="outline">
                <Facebook class="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline">
                <Instagram class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </section>
</template>
