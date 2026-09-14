<template>
  <main>

    <!-- ══ HERO ══════════════════════════════════════════════════════════════ -->
    <section class="max-w-7xl mx-auto py-20 pt-32 px-4 2xl:px-0 text-center">
      <span class="inline-block font-inter font-semibold text-[0.7rem] tracking-[0.15em] uppercase text-orange-500 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5 mb-6">
        Dashboard Suite
      </span>
      <h1 class="title-text mx-auto max-w-4xl">
        Purpose-built dashboards for every
        <span class="font-instument italic text-orange-600">real estate professional</span>
      </h1>
      <p class="font-inter text-[1.1rem] text-[#5b6771] mt-6 max-w-2xl mx-auto leading-relaxed">
        Roffr's two dedicated platforms give brokers and builders exactly what
        they need — no clutter, no compromise. Pick your role and take control
        of your business.
      </p>

      <!-- Quick jump pills -->
      <div class="flex items-center justify-center gap-4 mt-10 flex-wrap">
        <a href="#r-circle"
          class="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#0c1c28] text-[#0c1c28] font-inter font-semibold text-sm hover:bg-[#0c1c28] hover:text-white transition-colors duration-200">
          <span class="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></span>
          R Circle — Broker Dashboard
        </a>
        <a href="#r-os"
          class="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#0c1c28] text-[#0c1c28] font-inter font-semibold text-sm hover:bg-[#0c1c28] hover:text-white transition-colors duration-200">
          <span class="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></span>
          R Os — Builder Dashboard
        </a>
      </div>
    </section>

    <!-- ══ R CIRCLE ══════════════════════════════════════════════════════════ -->
    <section id="r-circle" class="py-20 px-4">
      <div class="max-w-7xl mx-auto 2xl:px-0">

        <!-- Label -->
        <div class="flex items-center gap-3 mb-4">
          <span class="w-8 h-[2px] bg-orange-500 rounded-full"></span>
          <span class="font-inter font-semibold text-[0.7rem] tracking-[0.15em] uppercase text-orange-500">
            Broker Dashboard
          </span>
        </div>

        <!-- Two-column layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          <!-- Left: content -->
          <div class="space-y-8">
            <div>
              <h2 class="title-text">R Circle</h2>
              <p class="font-inter text-[1.05rem] text-[#5b6771] mt-4 leading-relaxed">
                R Circle is Roffr's dedicated command centre for channel partners and
                brokers. Manage your entire book of business — leads, site visits,
                commissions, and inventory — from one clean interface, so you spend
                less time on admin and more time closing.
              </p>
            </div>

            <!-- What it does -->
            <div>
              <h3 class="font-outfit font-bold text-[1.2rem] text-[#0c1c28] mb-4">What it does</h3>
              <ul class="space-y-3">
                <li v-for="feature in rcircleFeatures" :key="feature"
                  class="flex items-start gap-3 font-inter text-[0.95rem] text-[#3a4554]">
                  <span class="mt-1 w-5 h-5 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center flex-shrink-0">
                    <svg class="w-2.5 h-2.5 text-orange-500" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3"/>
                    </svg>
                  </span>
                  {{ feature }}
                </li>
              </ul>
            </div>

            <!-- CTA -->
            <div>
              <button class="base-btn">Get Early Access</button>
            </div>
          </div>

          <!-- Right: image -->
          <div class="w-full">
            <div class="rounded-2xl overflow-hidden" style="box-shadow: 0 8px 40px rgba(0,0,0,0.10);">
              <img src="/images/PlatformPage/rcircle.png" alt="R Circle broker dashboard" class="w-full object-cover object-left block" style="height: 520px;" />
            </div>
          </div>
        </div>

        <!-- Benefits -->
        <div class="mt-16">
          <h3 class="font-outfit font-bold text-[1.2rem] text-[#0c1c28] mb-8">Key benefits</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="benefit in rcircleBenefits" :key="benefit.title"
              class="border border-gray-100 rounded-2xl p-6 space-y-3 bg-white hover:-translate-y-1 transition-transform duration-200"
              style="box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
              <div class="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <span class="text-xl">{{ benefit.icon }}</span>
              </div>
              <p class="font-outfit font-semibold text-[1rem] text-[#0c1c28]">{{ benefit.title }}</p>
              <p class="font-inter text-[0.9rem] text-[#5b6771] leading-relaxed">{{ benefit.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Divider -->
    <div class="max-w-7xl mx-auto px-4 2xl:px-0">
      <div class="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
    </div>

    <!-- ══ R OS ═══════════════════════════════════════════════════════════════ -->
    <section id="r-os" class="py-20 px-4">
      <div class="max-w-7xl mx-auto 2xl:px-0">

        <!-- Label -->
        <div class="flex items-center gap-3 mb-4">
          <span class="w-8 h-[2px] bg-orange-500 rounded-full"></span>
          <span class="font-inter font-semibold text-[0.7rem] tracking-[0.15em] uppercase text-orange-500">
            Builder Dashboard
          </span>
        </div>

        <!-- Two-column layout (reversed) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          <!-- Left: image placeholder -->
          <div class="w-full order-2 lg:order-1">
            <div class="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-3 text-gray-300">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <p class="font-inter text-sm font-medium">Dashboard preview coming soon</p>
            </div>
          </div>

          <!-- Right: content -->
          <div class="space-y-8 order-1 lg:order-2">
            <div>
              <h2 class="title-text">R Os</h2>
              <p class="font-inter text-[1.05rem] text-[#5b6771] mt-4 leading-relaxed">
                R Os is Roffr's operating system for builders and developers. Publish
                projects, manage channel partners at scale, track buyer activity in
                real time, and make pricing decisions backed by live data — all without
                juggling multiple tools.
              </p>
            </div>

            <!-- What it does -->
            <div>
              <h3 class="font-outfit font-bold text-[1.2rem] text-[#0c1c28] mb-4">What it does</h3>
              <ul class="space-y-3">
                <li v-for="feature in rosFeatures" :key="feature"
                  class="flex items-start gap-3 font-inter text-[0.95rem] text-[#3a4554]">
                  <span class="mt-1 w-5 h-5 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center flex-shrink-0">
                    <svg class="w-2.5 h-2.5 text-orange-500" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3"/>
                    </svg>
                  </span>
                  {{ feature }}
                </li>
              </ul>
            </div>

            <!-- CTA -->
            <div>
              <button class="base-btn">Get Early Access</button>
            </div>
          </div>
        </div>

        <!-- Benefits -->
        <div class="mt-16">
          <h3 class="font-outfit font-bold text-[1.2rem] text-[#0c1c28] mb-8">Key benefits</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="benefit in rosBenefits" :key="benefit.title"
              class="border border-gray-100 rounded-2xl p-6 space-y-3 bg-white hover:-translate-y-1 transition-transform duration-200"
              style="box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
              <div class="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <span class="text-xl">{{ benefit.icon }}</span>
              </div>
              <p class="font-outfit font-semibold text-[1rem] text-[#0c1c28]">{{ benefit.title }}</p>
              <p class="font-inter text-[0.9rem] text-[#5b6771] leading-relaxed">{{ benefit.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ BOTTOM CTA ═════════════════════════════════════════════════════════ -->
    <section class="py-20 px-4 bg-[#080b12]">
      <div class="max-w-7xl mx-auto 2xl:px-0 text-center">
        <h2 class="font-outfit font-bold text-white text-[clamp(1.8rem,4vw,2.8rem)] leading-tight max-w-3xl mx-auto">
          Ready to run your real estate business on Roffr?
        </h2>
        <p class="font-inter text-[1rem] text-white/60 mt-4 max-w-xl mx-auto">
          Join brokers and builders already on the waitlist for early access to
          R Circle and R Os.
        </p>
        <div class="flex items-center justify-center gap-4 mt-8 flex-wrap">
          <button class="base-btn">Join the Waitlist</button>
          <a href="/contact"
            class="font-inter font-semibold text-sm text-white/70 hover:text-white underline underline-offset-4 transition-colors duration-150">
            Contact us instead
          </a>
        </div>
      </div>
    </section>

  </main>
</template>

<script setup>
const rcircleFeatures = [
  'Track all active leads, follow-ups, and site visit schedules in one place',
  'Browse and share verified project inventory directly with buyers',
  'Monitor real-time commission status and payout history',
  'Access project brochures, floor plans, and RERA documents instantly',
  'Get performance insights — conversion rates, top projects, revenue trends',
  'Coordinate with builders on buyer queries and booking updates',
]

const rcircleBenefits = [
  {
    icon: '📈',
    title: 'Close more deals',
    desc: 'A unified pipeline view means no lead slips through the cracks and follow-ups happen on time.',
  },
  {
    icon: '💸',
    title: 'Transparent commissions',
    desc: 'See exactly what you have earned, what is pending, and when payouts are due — no more chasing builders.',
  },
  {
    icon: '⚡',
    title: 'Faster turnaround',
    desc: 'Instant access to verified project documents means you can respond to buyer questions in minutes, not hours.',
  },
  {
    icon: '🤝',
    title: 'Stronger builder relationships',
    desc: 'Direct communication channel with developer teams removes back-and-forth over WhatsApp and email.',
  },
  {
    icon: '📊',
    title: 'Performance clarity',
    desc: 'Know which projects are converting, where your revenue is coming from, and where to focus next.',
  },
  {
    icon: '📱',
    title: 'Built for the field',
    desc: 'Fully responsive interface works seamlessly on mobile so you can manage your business on the go.',
  },
]

const rosFeatures = [
  'Publish and manage RERA-approved projects with full media and floor plan support',
  'Onboard and manage your entire channel partner network from one panel',
  'Track every site visit, inquiry, and booking linked to your projects',
  'Set and update pricing, unit availability, and inventory in real time',
  'Monitor channel partner performance and assign leads to top closers',
  'Access sales analytics, conversion funnels, and revenue projections',
]

const rosBenefits = [
  {
    icon: '🏗️',
    title: 'Faster project sales',
    desc: 'Publish once, reach an entire network of verified channel partners who are actively selling your projects.',
  },
  {
    icon: '🔗',
    title: 'Channel partner control',
    desc: 'Onboard, track, and incentivise your broker network without spreadsheets or manual reconciliation.',
  },
  {
    icon: '📡',
    title: 'Real-time buyer data',
    desc: 'See who is interested, who has visited, and where bookings are in progress — updated live.',
  },
  {
    icon: '🎯',
    title: 'Smarter pricing decisions',
    desc: 'Live inventory and demand signals help you hold price where it matters and offer incentives where it counts.',
  },
  {
    icon: '📋',
    title: 'Compliance ready',
    desc: 'RERA documentation, project approvals, and audit trails are stored and accessible when you need them.',
  },
  {
    icon: '💼',
    title: 'One platform, all projects',
    desc: 'Manage multiple projects, phases, and unit types under a single builder profile without context-switching.',
  },
]
</script>
