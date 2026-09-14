<script setup lang="ts">
import { ref, onMounted } from "vue";
import { makeRequest } from "@/request/request";
import { toast } from "vue-sonner";
import {
  IconBuilding, IconMapPin, IconEye, IconPlus, IconX, IconCheck, IconClock
} from "@tabler/icons-vue";

interface Property {
  _id: string;
  title: string;
  location: string;
  price: string;
  type: string;
  status: string;
  bedrooms?: number;
  description?: string;
}

interface SiteVisit {
  _id: string;
  property?: { title?: string; location?: string };
  client?: { name?: string; phoneNumber?: string };
  broker?: { name?: string };
  visitDate: string;
  slotTime?: string;
  status: string;
}

const properties = ref<Property[]>([]);
const siteVisits = ref<SiteVisit[]>([]);
const isLoading = ref(false);
const showAddModal = ref(false);

const newProp = ref({
  title: "", location: "", price: "", type: "Residential", bedrooms: 2, description: ""
});

const stats = ref({ totalProperties: 0, pendingVisits: 0, confirmedVisits: 0, completedVisits: 0 });

const loadData = async () => {
  isLoading.value = true;
  try {
    // Mock data for now — will connect to /properties/mine and /site-visits/builder/me
    properties.value = [
      { _id: "1", title: "Wallfort Woods Phase 2", location: "Vidhan Sabha Road, Raipur", price: "45 Lakh", type: "Residential", status: "Active", bedrooms: 2 },
      { _id: "2", title: "Green Valley Apartments", location: "Naya Raipur Sector 27", price: "62 Lakh", type: "Residential", status: "Active", bedrooms: 3 },
      { _id: "3", title: "Commercial Hub Block A", location: "VIP Road, Raipur", price: "1.2 Cr", type: "Commercial", status: "Sold" },
    ];
    siteVisits.value = [
      { _id: "sv1", property: { title: "Wallfort Woods Phase 2" }, client: { name: "Rahul Sharma", phoneNumber: "+91 9876543210" }, broker: { name: "Aayush Agarwal" }, visitDate: "2026-08-25", slotTime: "10:30 AM", status: "CONFIRMED" },
      { _id: "sv2", property: { title: "Green Valley Apartments" }, client: { name: "Priya Mehta", phoneNumber: "+91 9823456789" }, broker: { name: "Vikram Singh" }, visitDate: "2026-08-26", slotTime: "3:00 PM", status: "PENDING" },
    ];
    stats.value = {
      totalProperties: 3,
      pendingVisits: 1,
      confirmedVisits: 1,
      completedVisits: 0,
    };
  } finally {
    isLoading.value = false;
  }
};

const addProperty = async () => {
  if (!newProp.value.title || !newProp.value.location || !newProp.value.price) {
    toast.error("Please fill in all required fields");
    return;
  }
  // Will POST to /properties once Phase 2 backend is ready
  properties.value.unshift({
    _id: Date.now().toString(),
    ...newProp.value,
    status: "Active",
  });
  stats.value.totalProperties++;
  showAddModal.value = false;
  newProp.value = { title: "", location: "", price: "", type: "Residential", bedrooms: 2, description: "" };
  toast.success("Property listed successfully!");
};

const statusColor = (status: string) => {
  if (status === "CONFIRMED") return "text-green-500 bg-green-500/10";
  if (status === "PENDING") return "text-yellow-500 bg-yellow-500/10";
  if (status === "COMPLETED") return "text-blue-500 bg-blue-500/10";
  if (status === "CANCELLED") return "text-red-500 bg-red-500/10";
  return "text-muted-foreground bg-muted";
};

onMounted(loadData);
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Builder Dashboard</h1>
        <p class="text-muted-foreground text-sm mt-1">Manage your properties and track site visits</p>
      </div>
      <button
        @click="showAddModal = true"
        class="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition"
      >
        <IconPlus class="size-4" />
        Add Property
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="rounded-xl border bg-card p-4 space-y-1">
        <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider">Properties</p>
        <p class="text-2xl font-bold">{{ stats.totalProperties }}</p>
      </div>
      <div class="rounded-xl border bg-card p-4 space-y-1">
        <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pending Visits</p>
        <p class="text-2xl font-bold text-yellow-500">{{ stats.pendingVisits }}</p>
      </div>
      <div class="rounded-xl border bg-card p-4 space-y-1">
        <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider">Confirmed</p>
        <p class="text-2xl font-bold text-green-500">{{ stats.confirmedVisits }}</p>
      </div>
      <div class="rounded-xl border bg-card p-4 space-y-1">
        <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider">Completed</p>
        <p class="text-2xl font-bold text-blue-500">{{ stats.completedVisits }}</p>
      </div>
    </div>

    <!-- Properties Table -->
    <div class="rounded-xl border bg-card">
      <div class="p-4 border-b flex items-center justify-between">
        <h2 class="font-semibold flex items-center gap-2">
          <IconBuilding class="size-4 text-primary" />
          My Properties
        </h2>
      </div>
      <div class="divide-y">
        <div
          v-for="prop in properties"
          :key="prop._id"
          class="flex items-center justify-between p-4 hover:bg-muted/30 transition"
        >
          <div class="space-y-1">
            <p class="font-medium text-sm">{{ prop.title }}</p>
            <p class="text-xs text-muted-foreground flex items-center gap-1">
              <IconMapPin class="size-3" /> {{ prop.location }}
            </p>
            <p class="text-xs text-muted-foreground">{{ prop.bedrooms ? `${prop.bedrooms} BHK · ` : '' }}{{ prop.type }}</p>
          </div>
          <div class="text-right space-y-1">
            <p class="font-semibold text-sm">₹{{ prop.price }}</p>
            <span
              class="text-xs px-2 py-0.5 rounded-full font-medium"
              :class="prop.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'"
            >
              {{ prop.status }}
            </span>
          </div>
        </div>
        <div v-if="properties.length === 0" class="p-8 text-center text-muted-foreground text-sm">
          No properties listed yet. Click "Add Property" to get started.
        </div>
      </div>
    </div>

    <!-- Site Visits -->
    <div class="rounded-xl border bg-card">
      <div class="p-4 border-b">
        <h2 class="font-semibold flex items-center gap-2">
          <IconMapPin class="size-4 text-primary" />
          Incoming Site Visits
        </h2>
      </div>
      <div class="divide-y">
        <div
          v-for="visit in siteVisits"
          :key="visit._id"
          class="p-4 flex items-center justify-between hover:bg-muted/30 transition"
        >
          <div class="space-y-1">
            <p class="font-medium text-sm">{{ visit.property?.title ?? 'Unknown Property' }}</p>
            <p class="text-xs text-muted-foreground">Client: {{ visit.client?.name }} · {{ visit.client?.phoneNumber }}</p>
            <p class="text-xs text-muted-foreground">Broker: {{ visit.broker?.name }}</p>
          </div>
          <div class="text-right space-y-1">
            <p class="text-xs font-medium">{{ visit.visitDate }}</p>
            <p class="text-xs text-muted-foreground">{{ visit.slotTime }}</p>
            <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="statusColor(visit.status)">
              {{ visit.status }}
            </span>
          </div>
        </div>
        <div v-if="siteVisits.length === 0" class="p-8 text-center text-muted-foreground text-sm">
          No site visits booked for your properties yet.
        </div>
      </div>
    </div>

    <!-- Add Property Modal -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-card border rounded-2xl w-full max-w-lg shadow-2xl">
          <div class="flex items-center justify-between p-6 border-b">
            <h3 class="font-semibold text-lg">List a New Property</h3>
            <button @click="showAddModal = false" class="text-muted-foreground hover:text-foreground">
              <IconX class="size-5" />
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="text-sm font-medium block mb-1">Property Title *</label>
              <input v-model="newProp.title" placeholder="e.g. Wallfort Woods Phase 2" class="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="text-sm font-medium block mb-1">Location *</label>
              <input v-model="newProp.location" placeholder="e.g. Vidhan Sabha Road, Raipur" class="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium block mb-1">Price *</label>
                <input v-model="newProp.price" placeholder="e.g. 45 Lakh" class="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label class="text-sm font-medium block mb-1">Bedrooms</label>
                <select v-model="newProp.bedrooms" class="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                  <option v-for="n in [1,2,3,4,5]" :key="n" :value="n">{{ n }} BHK</option>
                </select>
              </div>
            </div>
            <div>
              <label class="text-sm font-medium block mb-1">Type</label>
              <select v-model="newProp.type" class="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Residential</option>
                <option>Commercial</option>
                <option>Plot</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-medium block mb-1">Description</label>
              <textarea v-model="newProp.description" rows="3" placeholder="Brief description of the property..." class="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>
          </div>
          <div class="p-6 border-t flex gap-3">
            <button @click="showAddModal = false" class="flex-1 border rounded-lg py-2 text-sm font-medium hover:bg-muted transition">Cancel</button>
            <button @click="addProperty" class="flex-1 bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium hover:bg-primary/90 transition">
              List Property
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
