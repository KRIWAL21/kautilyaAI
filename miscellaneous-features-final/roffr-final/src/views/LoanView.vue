<script setup>
import GsapFade from '@/components/GsapFade.vue'

import HeroSection from '@/sections/loanSection2/HeroSection.vue';
import HowSection from '@/sections/loanSection2/HowSection.vue';
import PersonalisedSection from '@/sections/loanSection2/PersonalisedSection.vue';
import ContactSection from '@/sections/loanSection2/ContactSection.vue';
</script>

<template>
  <main>
    <GsapFade direction="bottom" :duration="0.7" :triggerOffset="120">
      <HeroSection />
    </GsapFade>

    <GsapFade direction="bottom" :duration="0.7" :triggerOffset="120">
      <HowSection />
    </GsapFade>

    <GsapFade direction="bottom" :duration="0.7" :triggerOffset="120">
      <PersonalisedSection />
    </GsapFade>

    <GsapFade direction="bottom" :duration="0.7" :triggerOffset="120">
      <ContactSection />
    </GsapFade>
  </main>
</template>
