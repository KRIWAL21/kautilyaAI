# React & Vue 3 Masterclass: Interview Edition

This guide covers the most critical frontend concepts for React (Next.js) and Vue 3 (Composition API), using **real production code from your Kautilya AI Broker Network project**. 

Since your project uniquely uses *both* React (for the client-facing microsites) and Vue 3 (for the broker dashboard), you are in a fantastic position to compare and contrast them in an interview.

---

## Part 1: Vue 3 (Composition API)

Your broker dashboard (`Kuatilya-broker`) is built with Vue 3 using the modern `<script setup>` syntax. Interviewers will want to know if you understand how reactivity works in Vue compared to React.

### 1. Reactivity: `ref` and `computed`
**Concept:** Unlike React, where you must use a `set` function to trigger a re-render, Vue wraps variables in a proxy (`ref` or `reactive`). When you mutate the `.value` property, Vue automatically tracks the dependency and updates the UI.

**From your project (`MicrositeShareCard.vue`):**
```vue
<script setup lang="ts">
import { ref, computed } from "vue";

// 1. ref: creates a reactive boolean
const copied = ref(false);

async function copyUrl() {
  await navigator.clipboard.writeText(personalUrl.value);
  // Mutating the value directly triggers a re-render
  copied.value = true; 
  setTimeout(() => { copied.value = false; }, 2000);
}

// 2. computed: a reactive variable derived from other reactive state
const effectiveUserId = computed(
  () => props.userId || localStorage.getItem("userId") || "dummy"
);
</script>

<template>
  <!-- Vue automatically unwraps '.value' in the template -->
  <button :class="copied ? 'bg-emerald' : 'bg-primary'">
    {{ copied ? "Copied!" : "Copy" }}
  </button>
</template>
```
**Interview POV:** If asked, "What is the difference between React's `useMemo` and Vue's `computed`?", answer: *"Vue's `computed` automatically tracks its dependencies. In React, I have to manually declare the dependency array for `useMemo`. If I forget a dependency in React, it introduces bugs; Vue handles it natively via its Proxy system."*

### 2. Props and Type Definitions (`defineProps`)
**Concept:** Passing data from a parent component down to a child component.

**From your project (`MicrositeShareCard.vue`):**
```vue
<script setup lang="ts">
// Defining strictly typed props in Vue with default values
interface Props {
  projectId: string;
  userId: string;
  projectName?: string;
  micrositeBaseUrl?: string;
}

const props = withDefaults(defineProps<Props>(), {
  projectName: "this project",
  micrositeBaseUrl: "http://localhost:3000",
});
</script>
```

### 3. Global State Management (Pinia vs. Vuex/Redux)
**Concept:** Sharing state across many components without "prop drilling".
**Interview POV:** Interviewers often ask why you chose a specific state management library. 
**Your Answer:** *"I used Pinia instead of Vuex because it natively supports TypeScript without requiring complex wrappers, it drops the concept of 'mutations' (which were redundant in Vuex), and its stores are modular by design. It's essentially the Vue equivalent of React's Zustand."*

---

## Part 2: React (Next.js App Router)

Your client-facing microsites (`real-estate-microsite-vida-new`) are built with React and Next.js. 

### 1. Client Components vs. Server Components
**Concept:** Next.js 13+ introduced React Server Components (RSC). By default, all components render on the server (node.js environment), which is amazing for SEO. If a component needs interactivity (like a form or a button click), it must be a "Client Component".

**From your project (`GetInTouch.tsx` and `FloatingEnquireForm.tsx`):**
```tsx
// This directive MUST be at the very top of the file!
'use client' 

import { useState } from 'react'

export default function GetInTouch({ project, user }: GetInTouchProps) {
  // useState only works in Client Components because the server cannot 
  // track user interactions (like typing in an input field).
  const [formData, setFormData] = useState({ fullName: '', email: '' });
  // ...
}
```
**Interview POV:** If asked, "How does Next.js improve performance?", explain that you render the heavy project data (`ProjectDetails`) on the Server, and only ship JavaScript to the browser for interactive islands like the `GetInTouch` form.

### 2. React State & Immutability (`useState`)
**Concept:** React state is immutable. You cannot do `formData.fullName = "John"`. You must provide a brand new object to `setFormData`.

**From your project (`FloatingEnquireForm.tsx`):**
```tsx
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  
  setFormData((prev) => ({
    ...prev, // Copies the old state (email, phone, message)
    [name]: value, // Dynamically updates the specific field that changed
  }));
}
```

### 3. Next.js Dynamic Routing
**Concept:** Catching dynamic URL parameters to render customized pages. This is the core of your "Lead Attribution" system.

**How your project handles it:**
Your directory structure has dynamic segments: `app/[projectId]/[userId]/page.tsx`.
```tsx
// The page component receives the URL parameters automatically
export default async function MicrositePage({ params }: { params: { projectId: string, userId: string } }) {
  
  // You fetch the specific project and broker based on the URL
  const project = await fetchProjectById(params.projectId);
  const broker = await fetchBrokerById(params.userId);

  return (
    <main>
      <h1>{project.name}</h1>
      {/* Passing the data down to the Client Components */}
      <FloatingEnquireForm project={project} user={broker} />
    </main>
  );
}
```
**Interview POV:** Explain that this dynamic routing allows a single codebase to instantly generate thousands of unique, personalized broker sites on the fly. 

---

## Part 3: Comparing React vs. Vue (The Ultimate Interview Question)

If an interviewer asks: **"Since you used both, what is your take on React vs. Vue 3?"**

Here is a highly professional, senior-level response you can give based on your project:

*"I intentionally used both frameworks where they shined best. 

I chose **Vue 3** for the complex **B2B Broker Dashboard**. Vue's Composition API and reactivity system (`ref`/`computed`) made handling complex state, like defining dynamic X/Y coordinates for the collateral watermark, incredibly clean. I didn't have to worry about stale closures or dependency arrays like I would with React's `useEffect` or `useMemo`.

However, I chose **React (Next.js)** for the **Client-Facing Microsites**. Because these sites are shared via WhatsApp and social media, Server-Side Rendering (SSR) and perfect Open Graph metadata were absolute requirements. Next.js's App Router handles dynamic parameterized routing (`/[projectId]/[userId]`) natively on the server, ensuring rapid load times and excellent SEO, which Vue's Nuxt.js does well, but React's ecosystem for edge-deployed SSR is currently unmatched.

In short: Vue offered me rapid, boilerplate-free development for a highly interactive SPA dashboard, while React/Next.js gave me the robust server-rendering power needed for public-facing viral content."*
