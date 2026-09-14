<script setup lang="ts">
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const blogs = [
  { title: "Raipur Investment Guide", desc: "Detailed investment insights for Raipur real estate market.", img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80" },
  { title: "Raipur Brokers Network", desc: "List and insights of broker networks in Raipur.", img: "https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&w=400&q=80" },
  { title: "Raipur Investment Alpha", desc: "Advanced investment strategies for Raipur market.", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80" }
];

const news = [
  { title: "Guideline rate revision update for urban property registration #1", desc: "Policy update linked to Raipur and Chhattisgarh real estate ecosystem within the last 60-day window.", img: "https://images.unsplash.com/photo-1532375810565-faa2c3d526a6?auto=format&fit=crop&w=400&q=80" },
  { title: "Registry cost relief after cess removal discussed in market #2", desc: "Registration update linked to Raipur and Chhattisgarh real estate ecosystem within the last 60-day tracking window.", img: "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=400&q=80" },
  { title: "Illegal plotting enforcement action in Raipur zone #3", desc: "Enforcement update linked to Raipur and Chhattisgarh real estate ecosystem within the last 60-day tracking window.", img: "https://images.unsplash.com/photo-1604709848576-96eb2818619a?auto=format&fit=crop&w=400&q=80" }
];
</script>

<template>
  <div class="px-6 mt-8 pb-12 space-y-10">
    <!-- Blogs -->
    <div>
      <h2 class="text-2xl font-bold mb-6">Our Blogs</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card v-for="(blog, i) in blogs" :key="i" class="bg-card border-border overflow-hidden flex flex-col rounded-xl">
          <div class="h-48 overflow-hidden">
            <img :src="blog.img" class="w-full h-full object-cover" />
          </div>
          <CardContent class="p-6 flex-1">
            <h3 class="font-bold text-lg mb-2 leading-tight">{{ blog.title }}</h3>
            <p class="text-sm text-muted-foreground">{{ blog.desc }}</p>
          </CardContent>
          <CardFooter class="px-6 pb-6 pt-0">
            <Button class="w-full bg-[#e11d48] hover:bg-[#be123c] text-white">Preview PDF</Button>
          </CardFooter>
        </Card>
      </div>
    </div>

    <!-- News -->
    <div>
      <h2 class="text-2xl font-bold mb-6">News</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card v-for="(item, i) in news" :key="i" class="bg-[#246377]/10 dark:bg-card border-border overflow-hidden flex flex-col rounded-xl">
          <div class="h-48 overflow-hidden">
            <img :src="item.img" class="w-full h-full object-cover" />
          </div>
          <CardContent class="p-6 flex-1">
            <h3 class="font-bold text-lg mb-2 leading-tight">{{ item.title }}</h3>
            <p class="text-sm text-muted-foreground">{{ item.desc }}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
