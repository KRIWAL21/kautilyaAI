<script setup lang="ts">
import { onMounted } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLeadStore } from "@/store/LeadStore";
import { storeToRefs } from 'pinia';
import { Phone, Mail, IndianRupee, StickyNote, ArrowRight, User } from 'lucide-vue-next';

const leadStore = useLeadStore();
const { leadData } = storeToRefs(leadStore);

const fetchLeads = () => {
  leadStore.getLeadData();
};

onMounted(fetchLeads);

interface Lead {
  id: string
  name: string
  avatar: string
  status: 'HOT' | 'WARM' | 'COLD' | 'Hot' | 'Warm' | 'Cold'
  budget: any
  nextFollowUp: string
  phone?: string
  email?: string
  notes?: string
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'hot': return 'bg-red-500/10 text-red-500 border-red-500/20'
    case 'warm': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    case 'cold': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
  }
}

// Generate consistent gradient colors based on name string
const getAvatarGradient = (name: string) => {
  const colors = [
    'from-red-500 to-orange-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-purple-500 to-pink-500',
    'from-amber-500 to-yellow-500',
    'from-indigo-500 to-purple-500'
  ];
  if (!name) return colors[0];
  const charCode = name.charCodeAt(0);
  return colors[charCode % colors.length];
};
</script>

<template>
  <section class="px-6 mt-8 mb-12">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="font-bold text-2xl text-foreground flex items-center gap-2">
          <User class="w-6 h-6 text-primary" />
          Recent Leads Directory
        </h1>
        <p class="text-sm text-muted-foreground mt-1">Manage and contact your latest inquiries</p>
      </div>
      <Button variant="outline" size="sm" class="group" @click="$router.push('/leads')">
        View All <ArrowRight class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
    
    <div v-if="!leadData.length" class="rounded-2xl border border-dashed border-zinc-800 bg-[#111113] p-16 flex flex-col items-center justify-center">
      <User class="w-12 h-12 text-zinc-600 opacity-50 mb-4" />
      <p class="text-sm text-zinc-500">No leads found in your directory.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="lead in leadData.slice(0, 9)" 
        :key="lead._id" 
        class="group relative rounded-2xl border border-white/5 bg-zinc-950/50 p-5 hover:bg-zinc-900/80 hover:border-white/10 transition-all duration-300 overflow-hidden flex flex-col"
      >
        <!-- Background subtle glow on hover -->
        <div class="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <div class="relative z-10 flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div 
              class="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg bg-gradient-to-br"
              :class="getAvatarGradient(lead?.name)"
            >
              {{ lead?.name ? lead.name.charAt(0).toUpperCase() : '?' }}
            </div>
            <div>
              <h3 class="font-semibold text-white text-base line-clamp-1">{{ lead?.name || 'Unknown Lead' }}</h3>
              <div class="flex items-center gap-2 mt-1">
                <span 
                  class="text-xs px-2 py-0.5 rounded-full font-medium border"
                  :class="getStatusColor(lead?.status)"
                >
                  {{ lead?.status || 'NEW' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="relative z-10 space-y-3 flex-1">
          <div class="flex items-center gap-3 text-sm text-zinc-400">
            <div class="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
              <Phone class="w-3.5 h-3.5 text-zinc-300" />
            </div>
            <span class="truncate">{{ lead?.phone || 'No phone provided' }}</span>
          </div>
          
          <div class="flex items-center gap-3 text-sm text-zinc-400">
            <div class="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
              <Mail class="w-3.5 h-3.5 text-zinc-300" />
            </div>
            <span class="truncate">{{ lead?.email || 'No email provided' }}</span>
          </div>

          <div class="flex items-center gap-3 text-sm text-zinc-400">
            <div class="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
              <IndianRupee class="w-3.5 h-3.5 text-zinc-300" />
            </div>
            <span class="truncate">{{ lead?.budget?.max ? `₹${lead.budget.max}` : 'Budget not specified' }}</span>
          </div>
        </div>

        <!-- Notes Footer -->
        <div class="relative z-10 mt-4 pt-4 border-t border-white/5">
          <div class="flex items-start gap-2">
            <StickyNote class="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
            <p class="text-xs text-zinc-500 line-clamp-2 italic">
              {{ lead?.notes && lead.notes !== '-' ? lead.notes : 'No additional notes or comments for this lead.' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
