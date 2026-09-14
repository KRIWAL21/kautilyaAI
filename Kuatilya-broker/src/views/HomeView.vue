<script setup lang="ts">
import HomeHeader from '@/sections/HomeSections/HomeHeader.vue'
import HomeHero from '@/sections/HomeSections/HomeHero.vue'
import HomeScoreCards from '@/sections/HomeSections/HomeScoreCards.vue'
import HomeRecentSiteVisits from '@/sections/HomeSections/HomeRecentSiteVisits.vue'
import HomeSupportBanner from '@/sections/HomeSections/HomeSupportBanner.vue'
import RecentLeads from '@/sections/HomeSections/RecentLeads.vue'
import HomeContent from '@/sections/HomeSections/HomeContent.vue'
</script>

<template>
    <section class="pb-12 bg-background">
        <HomeHeader/>
        <HomeHero/>
        <HomeScoreCards/>
        <HomeRecentSiteVisits/>
        <HomeSupportBanner/>
        <RecentLeads/>
        <HomeContent/>
    </section>
</template>
