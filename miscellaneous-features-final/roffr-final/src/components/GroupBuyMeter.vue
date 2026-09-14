<script setup>
import { computed } from 'vue'
import { gbInfo } from '@/data/groupBuy.js'
import { WHATSAPP } from '@/data/properties.js'

const props = defineProps({
  project: { type: Object, required: true },
})

const gb = computed(() => gbInfo(props.project))

const statusClass = computed(() => {
  if (!gb.value) return ''
  if (gb.value.closing) return 'closing'
  if (gb.value.hot) return 'hot'
  return ''
})

const joinViaWhatsapp = (e) => {
  e.stopPropagation()
  const g = gb.value
  if (!g) return
  const text = `Hi Arpan, ${props.project.projectName} (${props.project.venue || ''}) ke Group Buy mein join karna chahta hoon. Status: ${g.joined}/${g.slots} joined, ${g.daysLeft} days left, ${g.discount} discount = ${g.rsSavings} savings. EOI process aur next step bataiye.`
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank')
}
</script>

<template>
  <div v-if="gb" class="prop-gb" :class="statusClass" @click="joinViaWhatsapp">
    <div v-if="gb.ribbon" class="prop-gb-ribbon">{{ gb.ribbon }}</div>

    <div class="prop-gb-hero">
      <div class="prop-gb-savings-block">
        <div class="prop-gb-savings-label">Bachat / saver</div>
        <div class="prop-gb-savings-amt">{{ gb.rsSavings }}</div>
        <div class="prop-gb-savings-sub">({{ gb.discount }} group discount)</div>
      </div>
      <div class="prop-gb-cta">
        <div class="prop-gb-cta-label">Join with</div>
        <div class="prop-gb-cta-amt">₹0.01%</div>
        <div class="prop-gb-cta-sub">EOI · refundable</div>
      </div>
    </div>

    <div class="prop-gb-bar">
      <div class="prop-gb-fill" :style="{ width: gb.pct + '%' }"></div>
    </div>

    <div class="prop-gb-foot">
      <span class="prop-gb-joined"><strong>{{ gb.joined }}</strong>/{{ gb.slots }} joined</span>
      <span class="prop-gb-viewing">👥 {{ gb.viewing }} viewing</span>
      <span class="prop-gb-days">{{ gb.daysLeft }} days left</span>
    </div>

    <div v-if="gb.lastJoined" class="prop-gb-activity">
      <span class="prop-gb-dot"></span>Latest: <strong>{{ gb.lastJoined }}</strong>
    </div>

    <div class="prop-gb-tap">Group Buy mein join karo →</div>
  </div>
</template>
