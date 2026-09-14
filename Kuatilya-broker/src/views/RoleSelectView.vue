<template>
  <div class="role-select-page">
    <!-- Animated background -->
    <div class="bg-gradient"></div>
    <div class="bg-orbs">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>

    <div class="content">
      <!-- Header -->
      <div class="header">
        <div class="logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="12" fill="url(#grad)"/>
            <path d="M12 20L20 12L28 20L20 28L12 20Z" fill="white" opacity="0.9"/>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="40" y2="40">
                <stop offset="0%" stop-color="#6366f1"/>
                <stop offset="100%" stop-color="#8b5cf6"/>
              </linearGradient>
            </defs>
          </svg>
          <span>Kautilya AI</span>
        </div>

        <div class="title-block">
          <h1>Welcome to the Network</h1>
          <p>Tell us who you are so we can personalize your experience perfectly.</p>
        </div>
      </div>

      <!-- Role Cards -->
      <div class="cards-grid">
        <!-- BROKER -->
        <button
          class="role-card"
          :class="{ selected: selectedRole === 'BROKER', loading: isLoading && selectedRole === 'BROKER' }"
          @click="selectRole('BROKER')"
          :disabled="isLoading"
          id="role-broker"
        >
          <div class="card-glow broker-glow"></div>
          <div class="card-inner">
            <div class="icon-wrap broker-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div class="card-text">
              <h3>Real Estate Broker</h3>
              <p>Manage leads, marketing campaigns, site visits, and your entire client pipeline from one powerful dashboard.</p>
            </div>
            <div class="card-features">
              <span class="feature-tag">Leads CRM</span>
              <span class="feature-tag">AI Marketing</span>
              <span class="feature-tag">Passbook</span>
              <span class="feature-tag">Site Visits</span>
            </div>
            <div class="select-indicator">
              <div class="check-circle">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span>Select this role</span>
            </div>
          </div>
        </button>

        <!-- BUILDER -->
        <button
          class="role-card"
          :class="{ selected: selectedRole === 'BUILDER', loading: isLoading && selectedRole === 'BUILDER' }"
          @click="selectRole('BUILDER')"
          :disabled="isLoading"
          id="role-builder"
        >
          <div class="card-glow builder-glow"></div>
          <div class="card-inner">
            <div class="icon-wrap builder-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"/>
              </svg>
            </div>
            <div class="card-text">
              <h3>Property Developer</h3>
              <p>List and manage your properties, track site visit bookings, receive real-time inquiries, and grow your project reach.</p>
            </div>
            <div class="card-features">
              <span class="feature-tag">List Properties</span>
              <span class="feature-tag">Inquiries</span>
              <span class="feature-tag">Visit Tracking</span>
              <span class="feature-tag">Analytics</span>
            </div>
            <div class="select-indicator">
              <div class="check-circle">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span>Select this role</span>
            </div>
          </div>
        </button>

        <!-- CLIENT -->
        <button
          class="role-card"
          :class="{ selected: selectedRole === 'CLIENT', loading: isLoading && selectedRole === 'CLIENT' }"
          @click="selectRole('CLIENT')"
          :disabled="isLoading"
          id="role-client"
        >
          <div class="card-glow client-glow"></div>
          <div class="card-inner">
            <div class="icon-wrap client-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
              </svg>
            </div>
            <div class="card-text">
              <h3>Property Buyer</h3>
              <p>Discover your dream home, browse verified listings, book site visits with expert brokers, and track your journey.</p>
            </div>
            <div class="card-features">
              <span class="feature-tag">Browse Properties</span>
              <span class="feature-tag">Book Site Visits</span>
              <span class="feature-tag">Expert Brokers</span>
              <span class="feature-tag">Wishlist</span>
            </div>
            <div class="select-indicator">
              <div class="check-circle">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span>Select this role</span>
            </div>
          </div>
        </button>
      </div>

      <!-- Error -->
      <div v-if="error" class="error-msg">{{ error }}</div>

      <!-- Loading overlay -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner"></div>
        <p>Setting up your portal…</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/AuthStore'

type Role = 'BROKER' | 'BUILDER' | 'CLIENT'

const router = useRouter()
const authStore = useAuthStore()

const selectedRole = ref<Role | null>(null)
const isLoading = ref(false)
const error = ref('')

async function selectRole(role: Role) {
  if (isLoading.value) return
  selectedRole.value = role
  isLoading.value = true
  error.value = ''

  try {
    await authStore.selectRole(role)

    // Route to the correct portal based on role
    if (role === 'BROKER') {
      router.push({ name: 'home' })
    } else if (role === 'BUILDER') {
      router.push({ name: 'builder-home' })
    } else if (role === 'CLIENT') {
      router.push({ name: 'client-home' })
    }
  } catch (err: any) {
    error.value = 'Something went wrong. Please try again.'
    isLoading.value = false
    selectedRole.value = null
  }
}
</script>

<style scoped>
.role-select-page {
  min-height: 100vh;
  background: #0a0a0f;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 24px;
  font-family: 'Inter', 'Outfit', sans-serif;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
}

.bg-orbs {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  animation: float 8s ease-in-out infinite;
}

.orb-1 {
  width: 500px; height: 500px;
  background: #6366f1;
  top: -200px; left: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 400px; height: 400px;
  background: #10b981;
  bottom: -150px; right: -100px;
  animation-delay: 3s;
}

.orb-3 {
  width: 300px; height: 300px;
  background: #f59e0b;
  top: 50%; left: 60%;
  animation-delay: 6s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -30px) scale(1.05); }
}

.content {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1100px;
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 56px;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
}

.title-block h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.04em;
  margin: 0 0 16px;
  background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-block p {
  font-size: 18px;
  color: rgba(255,255,255,0.5);
  max-width: 480px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Cards */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.role-card {
  position: relative;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  overflow: hidden;
}

.role-card:hover:not(:disabled) {
  border-color: rgba(255,255,255,0.18);
  transform: translateY(-4px);
  background: rgba(255,255,255,0.07);
}

.role-card:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.role-card.selected {
  border-color: rgba(255,255,255,0.3) !important;
  transform: translateY(-6px) !important;
}

.card-glow {
  position: absolute;
  inset: -1px;
  border-radius: 24px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.broker-glow { background: linear-gradient(135deg, rgba(99,102,241,0.3) 0%, transparent 60%); }
.builder-glow { background: linear-gradient(135deg, rgba(16,185,129,0.3) 0%, transparent 60%); }
.client-glow { background: linear-gradient(135deg, rgba(245,158,11,0.3) 0%, transparent 60%); }

.role-card:hover .card-glow,
.role-card.selected .card-glow {
  opacity: 1;
}

.card-inner {
  position: relative;
  z-index: 1;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.role-card:hover .icon-wrap {
  transform: scale(1.1) rotate(-3deg);
}

.broker-icon { background: rgba(99,102,241,0.2); color: #818cf8; }
.builder-icon { background: rgba(16,185,129,0.2); color: #34d399; }
.client-icon { background: rgba(245,158,11,0.2); color: #fbbf24; }

.card-text h3 {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
  letter-spacing: -0.02em;
}

.card-text p {
  font-size: 14px;
  color: rgba(255,255,255,0.5);
  line-height: 1.6;
  margin: 0;
}

.card-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.feature-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 100px;
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.6);
  border: 1px solid rgba(255,255,255,0.08);
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.select-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.4);
  font-size: 13px;
  font-weight: 500;
  transition: color 0.3s;
}

.role-card:hover .select-indicator,
.role-card.selected .select-indicator {
  color: rgba(255,255,255,0.8);
}

.check-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  flex-shrink: 0;
}

.role-card.selected .check-circle {
  background: #6366f1;
  border-color: #6366f1;
  color: white;
}

/* Error */
.error-msg {
  text-align: center;
  margin-top: 24px;
  color: #f87171;
  font-size: 14px;
  padding: 12px 20px;
  background: rgba(248, 113, 113, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(248, 113, 113, 0.2);
}

/* Loading overlay */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.loading-overlay p {
  color: rgba(255,255,255,0.8);
  font-size: 16px;
  font-weight: 500;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
