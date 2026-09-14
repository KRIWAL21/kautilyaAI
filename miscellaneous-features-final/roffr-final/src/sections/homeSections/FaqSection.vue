<script setup>
import { ref } from "vue";

const faqs = [
  {
    id: 1,
    question: "How Can I Save Money While Buying a Property?",
    answer:
      "Through ROFFR's group buying model, multiple buyers pool together to purchase properties collectively. This gives us strong negotiating power with developers, resulting in discounts of 5–15% compared to individual buyers — savings that can run into lakhs.",
  },
  {
    id: 2,
    question: "Why Should I Buy Through ROFFR?",
    answer:
      "ROFFR is India's first real estate group buying platform. We offer RERA-verified projects, transparent pricing, expert guidance, and collective bargaining power that individual buyers simply can't access on their own.",
  },
  {
    id: 3,
    question: "Are the Properties Verified?",
    answer:
      "Yes. Every project listed on ROFFR is RERA-registered and goes through our internal verification process. We check legal clearances, builder track record, construction quality, and project approvals before listing.",
  },
  {
    id: 4,
    question: "Do You Help with Home Loan Assistance?",
    answer:
      "Absolutely. Our dedicated loan assistance team works with leading banks and NBFCs to help you secure the best home loan rates. We handle documentation, eligibility checks, and follow-ups so the process is smooth for you.",
  },
  {
    id: 5,
    question: "Can I Invest in Properties Outside My City?",
    answer:
      "Yes. ROFFR lists projects across multiple cities. Our team provides virtual tours, detailed project reports, and dedicated support so you can confidently invest in properties outside your home city.",
  },
  {
    id: 6,
    question: "What Types of Properties Do You Offer?",
    answer:
      "We list a wide range of properties — 1BHK, 2BHK, 3BHK apartments, villas, plots, and commercial spaces across Tier-1 and Tier-2 cities. Both ready-to-move and under-construction options are available.",
  },
];

const openId = ref(null);

const toggle = (id) => {
  openId.value = openId.value === id ? null : id;
};
</script>

<template>
  <section class="max-w-7xl mx-auto py-14 px-4 xl:px-0">
    <div class="bg-white border border-gray-200 rounded-2xl px-6 md:px-10 py-8 shadow-sm">

      <!-- Title -->
      <h2 class="font-intertight font-bold text-[22px] md:text-[26px] text-[#1a2b5f] mb-6">
        Frequently asked question
      </h2>

      <!-- FAQ list -->
      <div class="divide-y divide-gray-200">
        <div
          v-for="faq in faqs"
          :key="faq.id"
          class="py-4"
        >
          <!-- Question row -->
          <button
            class="w-full flex items-center justify-between gap-4 text-left group"
            @click="toggle(faq.id)"
          >
            <span
              class="text-sm md:text-[15px] font-semibold transition-colors duration-200"
              :class="openId === faq.id ? 'text-[#EB3131]' : 'text-gray-800 group-hover:text-[#EB3131]'"
            >
              {{ faq.question }}
            </span>

            <!-- +/– icon -->
            <span
              class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-all duration-200"
              :class="openId === faq.id
                ? 'bg-[#EB3131] border-[#EB3131] text-white rotate-45'
                : 'border-gray-300 text-gray-500 group-hover:border-[#EB3131] group-hover:text-[#EB3131]'"
            >
              <i class="pi pi-plus text-[10px]"></i>
            </span>
          </button>

          <!-- Answer -->
          <transition name="faq-expand">
            <p
              v-if="openId === faq.id"
              class="mt-3 text-sm text-gray-500 leading-relaxed pr-10"
            >
              {{ faq.answer }}
            </p>
          </transition>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.faq-expand-enter-active,
.faq-expand-leave-active {
  transition: max-height 0.3s ease, opacity 0.25s ease;
  overflow: hidden;
  max-height: 200px;
}
.faq-expand-enter-from,
.faq-expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
