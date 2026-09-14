<script setup>
</script>

<template>
  <section class="bg-gray-50 py-12">
    <div class="max-w-7xl mx-auto px-4 xl:px-0">

      <!-- Title -->
      <div class="flex items-center gap-4 mb-10">
        <div class="flex-1 border-t border-dashed border-gray-300"></div>
        <div class="text-center">
          <p class="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-1">As featured in</p>
          <h3 class="text-sm font-bold text-[#1a2b5f] tracking-widest uppercase">In The News</h3>
        </div>
        <div class="flex-1 border-t border-dashed border-gray-300"></div>
      </div>

      <!-- Logo cards -->
      <div class="flex items-center justify-center flex-wrap gap-4 md:gap-6">

        <!-- YourStory -->
        <div class="bg-white rounded-2xl px-7 py-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center gap-3">
          <div class="leading-none">
            <div class="text-[20px] font-black tracking-tight leading-none">
              <span class="text-[#EB3131]">YOUR</span><br/>
              <span class="text-[#EB3131]">STORY</span>
            </div>
          </div>
          <div class="w-px h-8 bg-gray-200 mx-1"></div>
          <div class="text-[7.5px] font-bold text-gray-400 leading-tight uppercase tracking-wide">
            INSPIRE<br/>INNOVATE<br/>IGNITE
          </div>
        </div>

        <!-- The Economic Times -->
        <div class="bg-white rounded-2xl px-7 py-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-center">
          <div class="text-[8px] font-semibold text-gray-400 tracking-widest uppercase mb-1">The</div>
          <div class="text-[18px] font-black text-gray-800 leading-none" style="font-family: Georgia, serif;">
            Economic Times
          </div>
        </div>

        <!-- Indian Express -->
        <div class="bg-white rounded-2xl px-7 py-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-center">
          <div class="text-[7px] font-semibold text-gray-400 tracking-widest uppercase mb-1">The New</div>
          <div class="text-[17px] font-black text-gray-800 leading-none tracking-wide uppercase" style="font-family: Georgia, serif;">
            Indian Express
          </div>
        </div>

        <!-- Mint -->
        <div class="bg-white rounded-2xl px-7 py-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-center">
          <div class="text-[7px] font-semibold text-gray-400 tracking-widest uppercase mb-1">Live</div>
          <div class="text-[22px] font-black text-gray-800 leading-none italic" style="font-family: Georgia, serif;">
            Mint
          </div>
        </div>

        <!-- Business Standard -->
        <div class="bg-white rounded-2xl px-7 py-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-center">
          <div class="text-[7px] font-semibold text-gray-400 tracking-widest uppercase mb-1">The</div>
          <div class="text-[15px] font-black text-gray-800 leading-none tracking-wide uppercase" style="font-family: Georgia, serif;">
            Business Standard
          </div>
        </div>

      </div>
    </div>
  </section>
</template>
