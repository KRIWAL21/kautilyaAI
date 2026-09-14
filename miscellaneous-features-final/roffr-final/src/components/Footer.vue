<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <footer class="bg-[#080b12] text-white py-16 px-4 md:px-8 xl:px-0 font-outfit">
    <div class="max-w-7xl mx-auto">
      
      <!-- Top Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-16">
        
        <!-- Col 1: Brand -->
        <div class="lg:col-span-4 flex flex-col space-y-6">
          <img src="/svg/Global/main-logo-white.svg" alt="Roffr Logo" class="w-[160px]" />
          <p class="text-[#8c9aab] text-sm leading-relaxed pr-4 font-inter">
            The ultimate destination for smart real estate investments and group buying opportunities. Join the revolution today.
          </p>
          <div class="flex items-center gap-5 text-white mt-2">
            <a href="#" class="hover:text-orange-600 transition-colors"><i class="pi pi-twitter text-xl"></i></a>
            <a href="#" class="hover:text-orange-600 transition-colors"><i class="pi pi-linkedin text-xl"></i></a>
            <a href="#" class="hover:text-orange-600 transition-colors"><i class="pi pi-facebook text-xl"></i></a>
          </div>
        </div>

        <!-- Col 2: Quick Links -->
        <div class="lg:col-span-2 flex flex-col space-y-4">
          <h4 class="font-semibold text-white mb-2 tracking-wide font-inter">Quick Links</h4>
          <router-link to="/" class="text-[#8c9aab] hover:text-white transition-colors text-sm font-inter">Home</router-link>
          <router-link to="/properties" class="text-[#8c9aab] hover:text-white transition-colors text-sm font-inter">Properties</router-link>
          <router-link to="/about" class="text-[#8c9aab] hover:text-white transition-colors text-sm font-inter">About Us</router-link>
          <router-link to="/resources" class="text-[#8c9aab] hover:text-white transition-colors text-sm font-inter">Resources</router-link>
        </div>

        <!-- Col 3: Support -->
        <div class="lg:col-span-2 flex flex-col space-y-4">
          <h4 class="font-semibold text-white mb-2 tracking-wide font-inter">Support</h4>
          <router-link to="/contact" class="text-[#8c9aab] hover:text-white transition-colors text-sm font-inter">Contact Us</router-link>
          <router-link to="/privacy" class="text-[#8c9aab] hover:text-white transition-colors text-sm font-inter">Privacy Policy</router-link>
          <router-link to="/terms" class="text-[#8c9aab] hover:text-white transition-colors text-sm font-inter">Terms of Service</router-link>
          <router-link to="/faq" class="text-[#8c9aab] hover:text-white transition-colors text-sm font-inter">FAQs</router-link>
        </div>

        <!-- Col 4: Newsletter -->
        <div class="lg:col-span-4 flex flex-col space-y-4 lg:pl-10">
          <h4 class="font-semibold text-white mb-2 tracking-wide font-inter">Newsletter</h4>
          <p class="text-[#8c9aab] text-sm font-inter">
            Stay updated with the latest group deals.
          </p>
          <form @submit.prevent class="mt-2 flex flex-col space-y-3">
            <input 
              type="email" 
              placeholder="Your email" 
              class="bg-[#242735] text-white text-sm border-none rounded-lg px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-orange-600 placeholder-[#717a8a] font-inter shadow-inner"
            />
            <button 
              type="submit" 
              class="bg-[#1a1c22] border border-white/5 hover:bg-[#202229] transition-colors text-white font-semibold py-3.5 rounded-lg shadow-sm font-inter mt-1 tracking-wide"
            >
              Subscribe
            </button>
          </form>
        </div>

      </div>

      <!-- Bottom Line -->
      <div class="border-t border-white/10 pt-8 flex flex-col items-center">
        <p class="text-[#8c9aab] text-sm text-center font-inter tracking-wide">
          © 2024 ROFFER Real Estate Investment Studio. All Rights Reserved.
        </p>
      </div>

    </div>
  </footer>
</template>

<style scoped>
</style>
