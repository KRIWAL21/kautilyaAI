<script setup>
import { RouterView } from "vue-router";
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";
import { useBotStore } from "@/stores/botStore";
import { storeToRefs } from 'pinia';
import BotModal from "@/components/BotModal.vue";
import VideoContainer from "@/components/VideoContainer.vue";

const botStore = useBotStore()
const {isModalOpen} = storeToRefs(botStore)
</script>

<template>
  <main class="">
    <Navbar />
    <div class="relative">
      <RouterView />
      <div class="relative z-30">
        
        <!-- <button @click="isModalOpen = true" class="fixed bottom-5 right-5">
          <img src="/svg/Global/bot-logo.svg" class="w-[250px]" alt="" />
        </button> -->
      </div>
      <!-- <VideoContainer class="fixed -bottom-10 left-5 z-30"/> -->
      <BotModal/>
    </div>
    <Footer />
  </main>
</template>
