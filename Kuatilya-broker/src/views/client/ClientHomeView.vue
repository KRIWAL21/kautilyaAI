<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { toast } from "vue-sonner";
import {
  IconMapPin, IconCalendar, IconSearch, IconBuildingSkyscraper,
  IconCheck, IconX, IconClock, IconStar, IconPhone
} from "@tabler/icons-vue";

interface Property {
  _id: string;
  title: string;
  location: string;
  price: string;
  type: string;
  bedrooms?: number;
  description?: string;
  builder?: string;
}

interface SiteVisit {
  _id: string;
  property?: { title?: string; location?: string };
  broker?: { name?: string; phoneNumber?: string };
  visitDate: string;
  slotTime?: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
}

const properties = ref<Property[]>([]);
const myVisits = ref<SiteVisit[]>([]);
const isLoading = ref(false);
const searchQuery = ref("");
const showBookingModal = ref(false);
const selectedProperty = ref<Property | null>(null);
const bookingDate = ref("");
const bookingSlot = ref("10:00 AM");

const slots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

const filteredProperties = computed(() => {
  if (!searchQuery.value) return properties.value;
  const q = searchQuery.value.toLowerCase();
  return properties.value.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.location.toLowerCase().includes(q)
  );
});

const loadData = async () => {
  isLoading.value = true;
  try {
    properties.value = [
      { _id: "1", title: "Wallfort Woods Phase 2", location: "Vidhan Sabha Road, Raipur", price: "45 Lakh", type: "Residential", bedrooms: 2, builder: "Wallfort Group" },
      { _id: "2", title: "Green Valley Apartments", location: "Naya Raipur Sector 27", price: "62 Lakh", type: "Residential", bedrooms: 3, builder: "Green Valley Infra" },
      { _id: "3", title: "Shriram Grand City", location: "Sarona, Raipur", price: "38 Lakh", type: "Residential", bedrooms: 2, builder: "Shriram Properties" },
      { _id: "4", title: "Commercial Hub Block A", location: "VIP Road, Raipur", price: "1.2 Cr", type: "Commercial", builder: "Sunrise Builders" },
      { _id: "5", title: "Shankar Nagar Luxury Flats", location: "Shankar Nagar, Raipur", price: "85 Lakh", type: "Residential", bedrooms: 3, builder: "Elite Properties" },
      { _id: "6", title: "Budget Homes Mowa", location: "Mowa, Raipur", price: "28 Lakh", type: "Residential", bedrooms: 2, builder: "Budget Homes Ltd" },
    ];
    myVisits.value = [
      { _id: "v1", property: { title: "Wallfort Woods Phase 2", location: "Vidhan Sabha Road" }, broker: { name: "Aayush Agarwal", phoneNumber: "+91 9876543210" }, visitDate: "2026-08-25", slotTime: "10:00 AM", status: "CONFIRMED" },
    ];
  } finally {
    isLoading.value = false;
  }
};

const openBooking = (property: Property) => {
  selectedProperty.value = property;
  bookingDate.value = "";
  showBookingModal.value = true;
};

const bookVisit = async () => {
  if (!bookingDate.value) {
    toast.error("Please select a date");
    return;
  }
  // Will POST to /site-visits once backend is ready
  myVisits.value.unshift({
    _id: Date.now().toString(),
    property: { title: selectedProperty.value?.title, location: selectedProperty.value?.location },
    broker: { name: "Auto-assigned Broker", phoneNumber: "+91 9800000000" },
    visitDate: bookingDate.value,
    slotTime: bookingSlot.value,
    status: "PENDING",
  });
  showBookingModal.value = false;
  toast.success("Site visit booked! A broker will be assigned shortly.");
};

const statusConfig = (status: string) => {
  if (status === "CONFIRMED") return { color: "text-green-500 bg-green-500/10", icon: IconCheck, label: "Confirmed" };
  if (status === "PENDING") return { color: "text-yellow-500 bg-yellow-500/10", icon: IconClock, label: "Pending" };
  if (status === "COMPLETED") return { color: "text-blue-500 bg-blue-500/10", icon: IconStar, label: "Completed" };
  if (status === "CANCELLED") return { color: "text-red-500 bg-red-500/10", icon: IconX, label: "Cancelled" };
  return { color: "text-muted-foreground bg-muted", icon: IconClock, label: status };
};

onMounted(loadData);
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Find Your Home</h1>
      <p class="text-muted-foreground text-sm mt-1">Browse properties and book site visits with our experts</p>
    </div>

    <!-- My Visits Summary -->
    <div v-if="myVisits.length > 0" class="rounded-xl border bg-card">
      <div class="p-4 border-b">
        <h2 class="font-semibold flex items-center gap-2">
          <IconCalendar class="size-4 text-primary" />
          My Upcoming Site Visits
        </h2>
      </div>
      <div class="divide-y">
        <div
          v-for="visit in myVisits"
          :key="visit._id"
          class="p-4 flex items-center justify-between hover:bg-muted/30 transition"
        >
          <div class="space-y-1">
            <p class="font-medium text-sm">{{ visit.property?.title }}</p>
            <p class="text-xs text-muted-foreground flex items-center gap-1">
              <IconMapPin class="size-3" /> {{ visit.property?.location }}
            </p>
            <p class="text-xs text-muted-foreground flex items-center gap-1" v-if="visit.broker">
              <IconPhone class="size-3" /> {{ visit.broker?.name }} · {{ visit.broker?.phoneNumber }}
            </p>
          </div>
          <div class="text-right space-y-1">
            <p class="text-xs font-medium">{{ visit.visitDate }}</p>
            <p class="text-xs text-muted-foreground">{{ visit.slotTime }}</p>
            <span
              class="text-xs px-2 py-0.5 rounded-full font-medium"
              :class="statusConfig(visit.status).color"
            >
              {{ statusConfig(visit.status).label }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="relative">
      <IconSearch class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <input
        v-model="searchQuery"
        placeholder="Search by name or location..."
        class="w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>

    <!-- Properties Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="prop in filteredProperties"
        :key="prop._id"
        class="rounded-xl border bg-card hover:shadow-md transition-shadow overflow-hidden group"
      >
        <!-- Property image placeholder -->
        <div class="h-36 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
          <IconBuildingSkyscraper class="size-12 text-primary/40" />
        </div>
        <div class="p-4 space-y-2">
          <div class="flex items-start justify-between gap-2">
            <h3 class="font-semibold text-sm leading-tight">{{ prop.title }}</h3>
            <span class="shrink-0 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{{ prop.type }}</span>
          </div>
          <p class="text-xs text-muted-foreground flex items-center gap-1">
            <IconMapPin class="size-3 shrink-0" /> {{ prop.location }}
          </p>
          <p class="text-xs text-muted-foreground">{{ prop.builder }}</p>
          <div class="flex items-center justify-between pt-2">
            <div>
              <p class="text-xs text-muted-foreground">{{ prop.bedrooms ? `${prop.bedrooms} BHK · ` : '' }}Starting</p>
              <p class="font-bold text-base">₹{{ prop.price }}</p>
            </div>
            <button
              @click="openBooking(prop)"
              class="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary/90 transition"
            >
              Book Visit
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Modal -->
    <Teleport to="body">
      <div v-if="showBookingModal" class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-card border rounded-2xl w-full max-w-md shadow-2xl">
          <div class="flex items-center justify-between p-6 border-b">
            <div>
              <h3 class="font-semibold text-lg">Book a Site Visit</h3>
              <p class="text-sm text-muted-foreground mt-0.5">{{ selectedProperty?.title }}</p>
            </div>
            <button @click="showBookingModal = false" class="text-muted-foreground hover:text-foreground">
              <IconX class="size-5" />
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="text-sm font-medium block mb-1">Select Date *</label>
              <input
                type="date"
                v-model="bookingDate"
                :min="new Date().toISOString().split('T')[0]"
                class="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label class="text-sm font-medium block mb-2">Select Time Slot *</label>
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="slot in slots"
                  :key="slot"
                  type="button"
                  @click="bookingSlot = slot"
                  class="text-xs px-2 py-1.5 rounded-lg border transition font-medium"
                  :class="bookingSlot === slot
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:border-primary hover:text-primary'"
                >
                  {{ slot }}
                </button>
              </div>
            </div>
            <div class="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              A broker will be auto-assigned to your visit. You'll receive a confirmation once confirmed.
            </div>
          </div>
          <div class="p-6 border-t flex gap-3">
            <button @click="showBookingModal = false" class="flex-1 border rounded-lg py-2 text-sm font-medium hover:bg-muted transition">Cancel</button>
            <button @click="bookVisit" class="flex-1 bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium hover:bg-primary/90 transition">
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
