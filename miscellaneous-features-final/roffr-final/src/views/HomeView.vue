<script setup>
import FadeIn from '@/components/FadeIn.vue';
import GroupBuyHero from '@/sections/homeSections/GroupBuyHero.vue';
import DealOfTheDay from '@/sections/homeSections/DealOfTheDay.vue';
import GroupBuyDealsSection from '@/sections/homeSections/GroupBuyDealsSection.vue';
import FeaturedProjectsSection from '@/sections/homeSections/FeaturedProjectsSection.vue';
import HowItWorks from '@/sections/homeSections/HowItWorks.vue';
import AboutSection from '@/sections/homeSections/AboutSection.vue';
import ExploreByVideo from '@/sections/homeSections/ExploreByVideo.vue';
import BlogsInsights from '@/sections/homeSections/BlogsInsights.vue';
import FindRealtorBanner from '@/sections/homeSections/FindRealtorBanner.vue';
import FaqSection from '@/sections/homeSections/FaqSection.vue';
</script>

<template>
  <main>
    <FadeIn :duration="0.8">
      <GroupBuyHero />
    </FadeIn>

    <FadeIn :duration="0.8" :delay="0.05">
      <DealOfTheDay />
    </FadeIn>

    <FadeIn :duration="0.8">
      <FindRealtorBanner />
    </FadeIn>

    <FadeIn :duration="0.8">
      <GroupBuyDealsSection />
    </FadeIn>

    <FadeIn :duration="0.8">
      <FeaturedProjectsSection />
    </FadeIn>

    <FadeIn :duration="0.8">
      <HowItWorks />
    </FadeIn>

    <FadeIn :duration="0.8">
      <AboutSection />
    </FadeIn>

    <FadeIn :duration="0.8">
      <ExploreByVideo />
    </FadeIn>

    <FadeIn :duration="0.8">
      <BlogsInsights />
    </FadeIn>

    <!-- <FadeIn :duration="0.8">
      <InTheNews />
    </FadeIn> -->

    <FadeIn :duration="0.8">
      <FaqSection />
    </FadeIn>
  </main>
</template>
