<script setup lang="ts">
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Phone, MessageCircle } from 'lucide-vue-next'
</script>

<template>
  <div class="px-6 mt-8">
    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
      We <span class="text-orange-500 text-3xl mt-1">♥</span> Brokerpreneurs
    </h2>
    <Card class="bg-card border-border p-8 flex flex-col md:flex-row items-center justify-between gap-6 rounded-xl">
      <div class="text-xl font-medium">Need any help? You can reach us here.</div>
      <div class="flex gap-4">
        <Button variant="outline" class="bg-transparent border-zinc-700 hover:bg-zinc-800 text-white rounded-md px-6">
          <Phone class="w-4 h-4 mr-2" /> Call Now
        </Button>
        <Button variant="outline" class="bg-transparent border-zinc-700 hover:bg-zinc-800 text-white rounded-md px-6">
          <MessageCircle class="w-4 h-4 mr-2" /> WhatsApp
        </Button>
      </div>
    </Card>
  </div>
</template>
