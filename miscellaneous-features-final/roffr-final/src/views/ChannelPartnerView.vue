<script setup>
import GsapFade from '@/components/GsapFade.vue'

import HeroSection from '@/sections/channelPartnerSection2/HeroSection.vue';
import BestCrmSection from '@/sections/channelPartnerSection2/BestCrmSection.vue';
import UnbeatableDealsSection from '@/sections/homeSections/UnbeatableDealsSection.vue';
import WorkSection from '@/sections/homeSections/WorkSection.vue';
</script>

<template>
  <main>
    <GsapFade direction="bottom" :duration="0.7" :triggerOffset="120">
      <HeroSection />
    </GsapFade>

    <GsapFade direction="bottom" :duration="0.7" :triggerOffset="120">
      <BestCrmSection />
    </GsapFade>

    <GsapFade direction="bottom" :duration="0.7" :triggerOffset="120">
      <UnbeatableDealsSection />
    </GsapFade>

    <GsapFade direction="bottom" :duration="0.7" :triggerOffset="120">
      <WorkSection />
    </GsapFade>
  </main>
</template>
