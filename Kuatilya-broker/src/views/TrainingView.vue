<script setup lang="ts">
import { Play } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";

const videos = [
  {
    id: 1,
    title: "Real Estate Lead Generation (India)",
    description: "How brokers generate high-quality property leads using Facebook & Google Ads",
    thumbnail: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    badge: "Free",
    views: "2M+",
  },
  {
    id: 2,
    title: "How to Close Property Deals Faster",
    description: "Sales techniques to convert site visits into bookings",
    thumbnail: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&q=80",
    badge: "Paid",
    views: "330K+ VIEWS",
  },
  {
    id: 3,
    title: "Real Estate Sales Script Training",
    description: "Learn proven scripts to handle buyer objections and close deals",
    thumbnail: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80",
    badge: "Free",
    views: "",
  },
  {
    id: 4,
    title: "Mistakes in Marketing for Real Estate",
    description: "Generate and nurture leads using WhatsApp automation",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    badge: "Paid",
    views: "21K+ VIEWS",
  },
  {
    id: 5,
    title: "Site Visit to Booking Conversion Strategy",
    description: "Turn property visits into confirmed deals with structured follow ups",
    thumbnail: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80",
    badge: "Free",
    views: "4 Lakh+ Views",
  },
  {
    id: 6,
    title: "Real Estate CRM Training for Brokers",
    description: "Manage leads, track follow-ups, and improve conversions using CRM",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    badge: "Paid",
    views: "120K+ VIEWS",
  }
];
</script>

<template>
  <div class="p-6 pb-24 h-full flex flex-col space-y-6 max-w-[1400px] mx-auto w-full">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold tracking-tight">Training Videos</h1>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="video in videos" 
        :key="video.id" 
        class="group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg hover:border-border cursor-pointer"
      >
        <!-- Thumbnail Container -->
        <div class="relative aspect-video w-full overflow-hidden bg-muted">
          <img 
            :src="video.thumbnail" 
            :alt="video.title"
            class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          
          <!-- Badge overlay -->
          <div class="absolute top-3 left-3">
            <Badge 
              :variant="video.badge === 'Free' ? 'default' : 'secondary'"
              class="font-semibold shadow-sm px-2.5 py-0.5"
              :class="video.badge === 'Free' ? 'bg-[#c5f5e2] hover:bg-[#a9ead2] text-green-900' : 'bg-[#fff4ce] hover:bg-[#ffe8a1] text-amber-900'"
            >
              {{ video.badge }}
            </Badge>
          </div>
          
          <!-- Views overlay -->
          <div v-if="video.views" class="absolute bottom-3 right-3 px-2 py-1 bg-red-600/90 backdrop-blur-sm text-white text-[11px] font-bold rounded shadow-sm tracking-wide uppercase">
            {{ video.views }}
          </div>
          
          <!-- Play Button Overlay -->
          <div class="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/40 shadow-xl transform transition-transform group-hover:scale-110">
              <Play class="h-6 w-6 text-white ml-1 fill-white drop-shadow-md" />
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-5 flex flex-col flex-grow">
          <h3 class="font-semibold text-lg leading-tight mb-2 line-clamp-2">
            {{ video.title }}
          </h3>
          <p class="text-[14px] text-muted-foreground line-clamp-2 mt-auto">
            {{ video.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
