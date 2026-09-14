<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const sectionRef = ref(null);

const countDeals = ref(0);
const countSaved = ref(0);
const countPrice = ref(0);

let observer = null;
let animated = false;

const animateCounter = (setter, target, duration = 1600) => {
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    setter(Math.round(eased * target));
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        animateCounter((v) => (countDeals.value = v), 500);
        animateCounter((v) => (countSaved.value = v), 2);
        animateCounter((v) => (countPrice.value = v), 15);
      }
    },
    { threshold: 0.2 }
  );
  if (sectionRef.value) observer.observe(sectionRef.value);
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <section ref="sectionRef" class="max-w-7xl mx-auto py-14 px-4 xl:px-0">

    <!-- ── Headline ─────────────────────────────────────────────── -->
    <div class="mb-7 max-w-xl">
      <h2 class="font-intertight font-bold text-[30px] md:text-[38px] xl:text-[44px] text-gray-900 leading-[1.15]">
        Unlock unbeatable deals through group buyings
      </h2>
      <p class="mt-3 text-gray-400 text-[15px] leading-relaxed">
        Save big, stay secure, and enjoy full support from start to finish.
      </p>

      <!-- Animated counters -->
      <div class="flex items-center gap-8 mt-7 flex-wrap">
        <div>
          <p class="text-2xl font-bold text-gray-900 tabular-nums">{{ countDeals }}+</p>
          <p class="text-[11px] text-gray-400 mt-0.5 uppercase tracking-wide">Deals done</p>
        </div>
        <div class="w-px h-9 bg-gray-200 shrink-0"></div>
        <div>
          <p class="text-2xl font-bold text-gray-900 tabular-nums">₹{{ countSaved }}Cr+</p>
          <p class="text-[11px] text-gray-400 mt-0.5 uppercase tracking-wide">Saved</p>
        </div>
        <div class="w-px h-9 bg-gray-200 shrink-0"></div>
        <div>
          <p class="text-2xl font-bold text-gray-900 tabular-nums">{{ countPrice }}%</p>
          <p class="text-[11px] text-gray-400 mt-0.5 uppercase tracking-wide">Better price</p>
        </div>
      </div>
    </div>

    <!-- ── Card ───────────────────────────────────────────────────── -->
    <div
      class="relative rounded-[28px] overflow-hidden py-10"
      style="background: linear-gradient(135deg, #E8622A 0%, #C0392B 100%);"
    >
      <!-- Subtle tile texture -->
      <div
        class="absolute inset-0 pointer-events-none opacity-[0.07]"
        style="background-image: repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 44px), repeating-linear-gradient(90deg, #fff, #fff 1px, transparent 1px, transparent 64px);"
      ></div>

      <div class="relative z-10 flex min-h-[340px] md:min-h-[400px]">

        <!-- Left: content -->
        <div class="flex flex-col justify-between px-8 md:px-12 py-10 w-full md:w-[55%] shrink-0">
          <div>
            <h3 class="text-white font-bold text-[42px] md:text-[52px] xl:text-[60px] leading-[1.1] mb-5">
              About Roffr
            </h3>
            <p class="text-white/80 text-sm md:text-[18px] leading-relaxed max-w-[420px]">
              Buying a home is expensive, but what if home buyers could team up with their future
              neighbours &amp; negotiate better deals just like big investors do? That's what we've
              built at ROFFR — a platform that helps homebuyers unlock exclusive discounts through
              collective buying.
            </p>
          </div>

          <!-- Buttons -->
          <div class="flex items-center gap-3 mt-8 flex-wrap">
            <button
              @click="router.push('/contact')"
              class="px-6 py-3 rounded-full bg-white text-gray-900 text-sm font-semibold hover:bg-white/90 transition-colors shadow-sm"
            >
              Get in touch
            </button>
            <button
              @click="router.push('/about')"
              class="flex items-center gap-2 px-6 py-3 rounded-full bg-[#9b2626] text-white text-sm font-semibold hover:bg-[#7f1d1d] transition-colors"
            >
              <i class="pi pi-external-link text-xs"></i>
              Learn More
            </button>
          </div>
        </div>

        <!-- Right: building image (desktop) -->
        <div class="hidden md:block absolute right-0 top-0 bottom-0 w-[48%] pointer-events-none select-none">
          <img
            src="/images/AboutPage/aboutHero/about-building.png"
            alt="Building"
            class="absolute bottom-0 right-0 h-[100%] w-full object-contain object-right-bottom"
          />
        </div>

      </div>
    </div>

  </section>
</template>
