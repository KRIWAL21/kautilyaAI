<script setup>
import AnimatedTitle from "@/components/AnimatedTitle.vue";

const form = {
  name: '',
  phone: '',
  email: '',
  subject: '',
  message: '',
}
</script>

<template>
  <main class="mt-20 max-w-7xl mx-auto px-4">
    <div class="flex flex-col items-center text-center">
      <AnimatedTitle text="Contact Us" customClass="title-text" />
      <AnimatedTitle customClass="font-outfit" text="Let’s get your questions answered! Fill out the form, and we’ll reach out within 24 hours."/>
    </div>

    <div class="my-10 flex flex-col lg:flex-row gap-10 items-center">
      <!-- Left: form -->
      <div class="w-full lg:w-1/2 space-y-5">
        <!-- Name -->
        <div>
          <label class="block text-xs font-outfit text-gray-400 mb-1">Name</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full h-14 rounded-md bg-[#F8F8F8] px-4 text-sm
                   outline-none border border-transparent focus:border-gray-200"
            placeholder="Sam"
          />
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-xs font-outfit text-gray-400 mb-1">Phone</label>
          <input
            v-model="form.phone"
            type="text"
            class="w-full h-14 rounded-md bg-[#F8F8F8] px-4 text-sm
                   outline-none border border-transparent focus:border-gray-200"
            placeholder="Phone"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="block text-xs font-outfit text-gray-400 mb-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full h-14 rounded-md bg-[#F8F8F8] px-4 text-sm
                   outline-none border border-transparent focus:border-gray-200"
            placeholder="Email"
          />
        </div>

        <!-- Subject -->
        <div>
          <label class="block text-xs font-outfit text-gray-400 mb-1">Subject</label>
          <input
            v-model="form.subject"
            type="text"
            class="w-full h-14 rounded-md bg-[#F8F8F8] px-4 text-sm
                   outline-none border border-transparent focus:border-gray-200"
            placeholder="Subject"
          />
        </div>

        <!-- Message -->
        <div>
          <label class="block text-xs font-outfit text-gray-400 mb-1">Message</label>
          <textarea
            v-model="form.message"
            rows="5"
            class="w-full rounded-md bg-[#F8F8F8] px-4 py-3 text-sm
                   outline-none border border-transparent focus:border-gray-200 resize-none"
            placeholder="Message"
          />
        </div>

        <!-- Button -->
        <button
          class="mt-4 inline-flex items-center justify-center px-10 py-3 rounded-full
                 text-white font-outfit text-sm
                 bg-gradient-to-r from-[#DDA439] to-[#EB3131]
                 shadow-[0_20px_35px_rgba(0,0,0,0.08)]"
        >
          Send Message
        </button>
      </div>

      <!-- Right: map -->
      <div class="w-full lg:w-1/2 flex justify-center">
        <img src="/images/Contact/map.png" alt="World map" class="max-w-full h-auto" />
      </div>
    </div>
  </main>
</template>
