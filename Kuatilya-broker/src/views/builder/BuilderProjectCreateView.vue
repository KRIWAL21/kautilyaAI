<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useProjectStore } from "@/store/ProjectStore";
import { toast } from "vue-sonner";
import LocationPicker from "@/sections/ProjectSections/LocationPicker.vue";

const router = useRouter();
const store = useProjectStore();

// -- Steps ----------------------------------------------------
const STEPS = ["Basic Info", "Amenities", "Location", "Review"];
const step = ref(0);

// -- Form data ------------------------------------------------
const form = reactive({
  projectName: "",
  description: "",
  projectType: "Residential",
  minPrice: null as number | null,
  maxPrice: null as number | null,
  projectStatus: "Under Construction",
  reraNo: "",
  amenities: [] as string[],
  city: "",
  state: "",
  address: "",
  coordinates: null as { lat: number; lng: number } | null,
});

// -- Amenities catalog ----------------------------------------
const AMENITIES = [
  "Swimming Pool", "Garden", "Walking Track", "Temple", "Gym", "Clubhouse",
  "Kids Play Area", "24H Security", "Covered Parking", "Power Backup",
  "Lift/Elevator", "Sports Court", "Yoga Deck", "Co-working Space",
  "Amphitheatre", "Pet Zone", "Jogging Track", "Meditation Garden",
  "BBQ Area", "Rooftop Lounge", "EV Charging", "Solar Power",
  "Rainwater Harvesting", "CCTV Surveillance", "Intercom", "Concierge",
  "Mini Theatre", "Table Tennis", "Badminton Court", "Cricket Net",
];
const customAmenity = ref("");

function toggleAmenity(a: string) {
  const idx = form.amenities.indexOf(a);
  idx === -1 ? form.amenities.push(a) : form.amenities.splice(idx, 1);
}
function addCustomAmenity() {
  const t = customAmenity.value.trim();
  if (t && !form.amenities.includes(t)) { form.amenities.push(t); }
  customAmenity.value = "";
}

// -- Location picker v-model ----------------------------------
const locationData = ref<{ lat: number; lng: number; city: string; state: string; address: string } | null>(null);
function onLocationUpdate(v: any) {
  locationData.value = v;
  form.city = v.city;
  form.state = v.state;
  form.address = v.address;
  form.coordinates = v.lat && v.lng ? { lat: v.lat, lng: v.lng } : null;
}

// -- Navigation -----------------------------------------------
const canNext = computed(() => {
  if (step.value === 0) return !!form.projectName.trim();
  return true;
});

function next() { if (step.value < STEPS.length - 1 && canNext.value) step.value++; }
function back() { if (step.value > 0) step.value--; }

// -- Submit ---------------------------------------------------
const submitting = ref(false);

async function submit() {
  if (!form.projectName.trim()) { toast.error("Project name is required"); return; }
  submitting.value = true;
  try {
    const payload = {
      projectName: form.projectName.trim(),
      description: form.description.trim() || undefined,
      projectType: form.projectType,
      minPrice: form.minPrice || undefined,
      maxPrice: form.maxPrice || undefined,
      projectStatus: form.projectStatus,
      reraNo: form.reraNo.trim() || undefined,
      amenities: form.amenities,
      city: form.city.trim() || undefined,
      state: form.state.trim() || undefined,
      address: form.address.trim() || undefined,
      coordinates: form.coordinates || undefined,
    };
    const created = await store.createProject(payload);
    toast.success("Project created successfully!");
    router.push({ name: "builder-project-detail", params: { id: created._id } });
  } catch (e: any) {
    toast.error(e?.response?.data?.message || "Failed to create project");
  } finally {
    submitting.value = false;
  }
}

function fmt(n: number | null): string {
  if (!n) return "-";
  if (n >= 1e7) return "?" + (n / 1e7).toFixed(2) + " Cr";
  if (n >= 1e5) return "?" + (n / 1e5).toFixed(2) + " L";
  return "?" + n.toLocaleString("en-IN");
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6 p-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <button @click="router.back()" class="rounded-lg border p-2 hover:bg-muted transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Create New Project</h1>
        <p class="text-sm text-muted-foreground">Fill in project details in {{ STEPS.length }} simple steps</p>
      </div>
    </div>

    <!-- Step progress -->
    <div class="flex items-center gap-0">
      <template v-for="(label, i) in STEPS" :key="i">
        <div class="flex flex-col items-center gap-1">
          <div
            class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300"
            :class="i < step ? 'bg-primary text-primary-foreground' : i === step ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : 'bg-muted text-muted-foreground'"
          >
            <svg v-if="i < step" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span class="text-xs font-medium" :class="i === step ? 'text-primary' : 'text-muted-foreground'">{{ label }}</span>
        </div>
        <div v-if="i < STEPS.length - 1" class="mb-5 h-px flex-1 transition-colors duration-300" :class="i < step ? 'bg-primary' : 'bg-border'" />
      </template>
    </div>

    <!-- Step content -->
    <div class="rounded-2xl border bg-card p-6 shadow-sm">

      <!-- Step 0: Basic Info -->
      <div v-if="step === 0" class="space-y-5">
        <h2 class="text-lg font-semibold">Basic Project Information</h2>

        <div class="space-y-1.5">
          <label class="text-sm font-medium">Project Name <span class="text-destructive">*</span></label>
          <input v-model="form.projectName" placeholder="e.g. Wallfort Heights Phase 3" class="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium">Description</label>
          <textarea v-model="form.description" rows="3" placeholder="Brief description of the project..." class="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Project Type</label>
            <select v-model="form.projectType" class="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option>Residential</option>
              <option>Commercial</option>
              <option>Plotted</option>
              <option>Mixed Use</option>
              <option>Township</option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Project Status</label>
            <select v-model="form.projectStatus" class="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option>Under Construction</option>
              <option>Ready to Move</option>
              <option>Upcoming</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Min Price (?)</label>
            <input v-model.number="form.minPrice" type="number" placeholder="e.g. 4500000" class="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <p class="text-xs text-muted-foreground">{{ fmt(form.minPrice) }}</p>
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Max Price (?)</label>
            <input v-model.number="form.maxPrice" type="number" placeholder="e.g. 9500000" class="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <p class="text-xs text-muted-foreground">{{ fmt(form.maxPrice) }}</p>
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium">RERA Number</label>
          <input v-model="form.reraNo" placeholder="e.g. P52100012345" class="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>

      <!-- Step 1: Amenities -->
      <div v-else-if="step === 1" class="space-y-5">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Amenities</h2>
          <span class="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{{ form.amenities.length }} selected</span>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="am in AMENITIES"
            :key="am"
            type="button"
            @click="toggleAmenity(am)"
            class="rounded-full border px-3 py-1.5 text-sm transition-all duration-150"
            :class="form.amenities.includes(am)
              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
              : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5'"
          >{{ am }}</button>
        </div>

        <!-- Custom amenity -->
        <div class="flex gap-2">
          <input
            v-model="customAmenity"
            placeholder="Add custom amenity..."
            class="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            @keydown.enter.prevent="addCustomAmenity"
          />
          <button type="button" @click="addCustomAmenity" class="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition">Add</button>
        </div>

        <!-- Selected custom ones -->
        <div v-if="form.amenities.filter(a => !AMENITIES.includes(a)).length" class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Custom</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="a in form.amenities.filter(a => !AMENITIES.includes(a))"
              :key="a"
              class="flex items-center gap-1.5 rounded-full border border-primary bg-primary/10 px-3 py-1 text-sm text-primary"
            >
              {{ a }}
              <button @click.prevent="toggleAmenity(a)" class="text-primary hover:opacity-70">×</button>
            </span>
          </div>
        </div>
      </div>

      <!-- Step 2: Location -->
      <div v-else-if="step === 2" class="space-y-4">
        <h2 class="text-lg font-semibold">Project Location</h2>
        <p class="text-sm text-muted-foreground">Type your city and state to auto-zoom the map, or click directly on the map to pin the exact location.</p>
        <LocationPicker :model-value="locationData" @update:model-value="onLocationUpdate" />
      </div>

      <!-- Step 3: Review -->
      <div v-else-if="step === 3" class="space-y-5">
        <h2 class="text-lg font-semibold">Review & Create</h2>

        <div class="divide-y rounded-xl border bg-muted/20">
          <div class="flex justify-between px-4 py-3 text-sm">
            <span class="text-muted-foreground">Project Name</span>
            <span class="font-semibold">{{ form.projectName }}</span>
          </div>
          <div class="flex justify-between px-4 py-3 text-sm">
            <span class="text-muted-foreground">Type</span>
            <span>{{ form.projectType }}</span>
          </div>
          <div class="flex justify-between px-4 py-3 text-sm">
            <span class="text-muted-foreground">Status</span>
            <span>{{ form.projectStatus }}</span>
          </div>
          <div class="flex justify-between px-4 py-3 text-sm">
            <span class="text-muted-foreground">Price Range</span>
            <span>{{ fmt(form.minPrice) }} – {{ fmt(form.maxPrice) }}</span>
          </div>
          <div class="flex justify-between px-4 py-3 text-sm">
            <span class="text-muted-foreground">RERA</span>
            <span>{{ form.reraNo || "—" }}</span>
          </div>
          <div class="flex justify-between px-4 py-3 text-sm">
            <span class="text-muted-foreground">Amenities</span>
            <span class="font-medium text-primary">{{ form.amenities.length }} selected</span>
          </div>
          <div class="flex justify-between px-4 py-3 text-sm">
            <span class="text-muted-foreground">Location</span>
            <span>{{ [form.city, form.state].filter(Boolean).join(", ") || "—" }}</span>
          </div>
          <div v-if="form.coordinates" class="flex justify-between px-4 py-3 text-sm">
            <span class="text-muted-foreground">Coordinates</span>
            <span class="font-mono text-xs">{{ form.coordinates.lat.toFixed(4) }}, {{ form.coordinates.lng.toFixed(4) }}</span>
          </div>
        </div>

        <div v-if="form.amenities.length" class="space-y-2">
          <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Amenities</p>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="a in form.amenities" :key="a" class="rounded-full border bg-muted/50 px-2 py-0.5 text-xs">{{ a }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation buttons -->
    <div class="flex items-center justify-between gap-3">
      <button
        type="button"
        @click="back"
        :disabled="step === 0"
        class="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-40"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
        Back
      </button>

      <button
        v-if="step < STEPS.length - 1"
        type="button"
        @click="next"
        :disabled="!canNext"
        class="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 disabled:opacity-40"
      >
        Next
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
      </button>

      <button
        v-else
        type="button"
        @click="submit"
        :disabled="submitting"
        class="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 disabled:opacity-50"
      >
        <svg v-if="submitting" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        {{ submitting ? "Creating..." : "Create Project" }}
      </button>
    </div>
  </div>
</template>
