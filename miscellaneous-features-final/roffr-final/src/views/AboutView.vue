<script setup>
import GsapFade from '@/components/GsapFade.vue'

import HeroSection from '@/sections/aboutSection2/HeroSection.vue'
import PowerSection from '@/sections/aboutSection2/PowerSection.vue'
import WhyChooseSection from '@/sections/aboutSection2/WhyChooseSection.vue'
import TheCorePillars from '@/sections/aboutSection2/The Core Pillars.vue';
import MeetTheFounders from '@/sections/aboutSection2/MeetTheFounders.vue';
</script>

<template>
  <main>
    <GsapFade direction="bottom" :duration="0.7" :triggerOffset="120">
      <HeroSection />
    </GsapFade>

    <GsapFade direction="bottom" :duration="0.7" :triggerOffset="120">
      <PowerSection />
    </GsapFade>

    <GsapFade direction="bottom" :duration="0.7" :triggerOffset="120">
      <TheCorePillars />
    </GsapFade>

    <GsapFade direction="bottom" :duration="0.7" :triggerOffset="120">
      <MeetTheFounders />
    </GsapFade>

  </main>
</template>
