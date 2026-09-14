<script setup>
import { ref } from "vue";
import AnimatedTitle from "@/components/AnimatedTitle.vue";

const allFaqs = [
  {
    question: "What is Roffr?",
    answer: "Roffr is a group buying platform that helps multiple buyers come together to purchase real estate at better prices with transparent processes.",
  },
  {
    question: "How does Roffr work?",
    answer: "Buyers with similar requirements are grouped, projects are shortlisted, and negotiations are done on behalf of the group to secure better terms from developers.",
  },
  {
    question: "Why should I choose Roffr over brokers or traditional channels?",
    answer: "You get collective negotiation power, curated projects, and a structured, tech-driven buying journey instead of fragmented broker-led discovery.",
  },
  {
    question: "Is Roffr available in all cities?",
    answer: "The service is currently active in selected major cities and is being expanded to new locations in phases.",
  },
  {
    question: "How do I contact customer support?",
    answer: "You can reach the support team through the help centre on the website, email, or the dedicated WhatsApp/phone support number.",
  },
  {
    question: "How do I join a buyer group?",
    answer: "You simply sign up on Roffr, choose your preferred project, and join any group that matches your needs.",
  },
  {
    question: "What are the benefits of joining a group?",
    answer: "You get lower prices, better deals, priority access, and increased negotiation power as part of a group.",
  },
  {
    question: "What if my group is too small or doesn't fill up?",
    answer: "If a group doesn't reach the required size, Roffr helps merge or reassign members so you still get access to the offer.",
  },
  {
    question: "Can I choose my own group members?",
    answer: "Yes. You can join public groups or create private groups where you invite your own friends or family.",
  },
  {
    question: "Will I get early access to new projects and launches?",
    answer: "Yes, Roffr members often get early access and exclusive pre-launch offers.",
  },
  {
    question: "Do I need to pay to join Roffr?",
    answer: "You can browse and explore projects for free. Payments are only required for premium features or group confirmations.",
  },
  {
    question: "How much does the subscription cost?",
    answer: "Roffr offers simple and affordable subscription options based on the services you use.",
  },
];

const openQuestion = ref(allFaqs[0]?.question || "");

const toggleQuestion = (q) => {
  openQuestion.value = openQuestion.value === q ? "" : q;
};
</script>

<template>
  <section class="max-w-7xl mx-auto py-10 px-4 2xl:px-0">
    <div class="text-center mb-12">
      <AnimatedTitle text="Frequently Asked Questions" customClass="title-text" />
    </div>

    <div class="space-y-3">
      <div
        v-for="item in allFaqs"
        :key="item.question"
        class="rounded-2xl border border-[#f3e6de] bg-white overflow-hidden"
      >
        <button
          class="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 text-left"
          @click="toggleQuestion(item.question)"
        >
          <div class="flex items-center gap-3">
            <span
              class="flex h-6 w-6 items-center justify-center rounded-full border border-[#ffb29a] text-[#e35a2d] text-xs"
            >
              ?
            </span>
            <span
              class="text-sm font-medium"
              :class="
                openQuestion === item.question
                  ? 'text-[#e35a2d]'
                  : 'text-gray-800'
              "
            >
              {{ item.question }}
            </span>
          </div>
          <span
            class="h-6 w-6 flex items-center justify-center rounded-full bg-[#fff4ee] text-[#e35a2d] text-lg"
          >
            {{ openQuestion === item.question ? "−" : "+" }}
          </span>
        </button>

        <transition name="fade">
          <div
            v-if="openQuestion === item.question"
            class="px-8 sm:px-12 pb-4 text-xs sm:text-sm text-gray-600"
          >
            {{ item.answer }}
          </div>
        </transition>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
