# Kautilya AI Broker Network - SDE Interview Guide

This guide is designed to help you pitch your project effectively in software engineering interviews, justify your technical choices, and handle deep-dive questions on architecture, generative AI, and DevOps.

---

## 1. How to Pitch the Project (The "Elevator Pitch")

**The Problem:** 
In the real estate industry, builders and brokers struggle with disconnected workflows. Builders create marketing collateral (brochures, posters) but lack a structured way to distribute it to brokers. Brokers, in turn, have to manually edit PDFs/images to add their contact details before sharing them with clients. Additionally, answering client queries about properties is manual and time-consuming.

**The Solution (What you built):**
"I built the **Kautilya AI Broker Network**, a B2B SaaS platform that bridges the gap between real estate builders and brokers. It consists of a centralized dashboard where builders can upload projects and marketing collateral. Brokers can then log in, select a project, and instantly generate **watermarked marketing materials** stamped with their own contact details. 

To take it a step further, the platform dynamically generates **personalized Next.js microsites** for each broker-project combination, ensuring that any leads generated from the microsite are directly attributed to the broker. 

Finally, I integrated **Generative AI (Google Gemini & Perplexity)** to automate property research, dynamically generate marketing posters from text prompts, and provide an AI chatbot (Chanakya GPT) to help brokers instantly answer client queries."

**Key Achievements to Highlight:**
- **Microservices Architecture:** Decoupled the broker dashboard (Vue.js) from the dynamic client-facing microsites (Next.js) for optimal SEO and performance.
- **Dynamic Content Generation:** Implemented a system to programmatically stamp broker details onto images.
- **AI Integration:** Orchestrated multi-step AI pipelines (Perplexity for research + Gemini Pro for prompts + Gemini Flash for image generation).

---

## 2. Technical Stack & Justifications (The "Why")

Interviewers love asking *why* you chose a specific technology. Here is how to defend your stack:

### Backend: NestJS vs. Express.js
**What you used:** NestJS (Node.js) with TypeScript.
**Why:** 
* "I initially considered Express.js, but as the project grew to include multiple modules (Users, Projects, Leads, AI Content, Site Visits), Express became too unstructured. I switched to **NestJS** because its Angular-like dependency injection and modular architecture forced a clean separation of concerns (Controllers, Services, Modules). It also comes with built-in support for DTOs and decorators, which made validating incoming payload data much easier."*

### Database: MongoDB (via Mongoose) vs. PostgreSQL
**What you used:** MongoDB
**Why:**
* "Real estate data is inherently unstructured and highly variable. A project might have floor plans, varying numbers of amenities, dynamic marketing collateral spots, and different types of offers. MongoDB allowed for a flexible schema. For example, adding an array of `marketingCollateralSpots` with dynamic X/Y coordinates didn't require complex database migrations like it would in a SQL database."*

### Frontend Dashboard: Vue 3 (Composition API) & Vite
**What you used:** Vue 3 (Pinia for state management), Tailwind CSS, Shadcn Vue.
**Why:**
* "I chose Vue 3 with the Composition API over React for the dashboard because of its reactivity system and cleaner component lifecycle management. Pinia provided a much simpler and less boilerplate-heavy state management solution compared to Redux. Vite was chosen over Webpack for its instant hot-module replacement (HMR), which drastically sped up development."*

### Client-Facing Microsite: Next.js (React)
**What you used:** Next.js 14
**Why Next.js when the dashboard is Vue?**
* "The broker dashboard is a gated, authenticated app, so Client-Side Rendering (Vue) is perfect. However, the personalized project microsites need to be shared with potential home buyers via WhatsApp. These sites **must** be SEO-optimized and support rich link previews (Open Graph tags). Next.js provides Server-Side Rendering (SSR) and dynamic routing (`/[projectId]/[userId]`), allowing me to fetch project and broker data on the server before the page loads, ensuring fast perceived load times and perfect social sharing previews."*

### AI Stack: Google Gemini & Perplexity AI
**What you used:** Gemini Pro/Flash, Perplexity AI.
**Why not just OpenAI (ChatGPT)?**
* "I designed an orchestrated AI pipeline. I used **Perplexity AI** first because it excels at real-time web search to fetch accurate, up-to-date public data about a specific real estate project. I then passed that data into **Gemini Pro** because of its massive context window and strong instruction-following capabilities to generate a highly structured image prompt. Finally, I used **Gemini Flash Image** for the actual image generation because it offers excellent speed-to-quality ratio for marketing assets."*

---

## 3. Core Technical Concepts to Master

Be prepared to explain how these specific features work under the hood:

### 1. Dynamic Collateral Stamping (Watermarking)
**How it works:** The builder uploads a base image to AWS S3. In the Vue frontend (`SpotEditor.vue`), the builder visually clicks on the image to define "Spots" (X/Y coordinates relative to image width/height) where the broker's Name, Phone, or QR code should appear. When a broker views the collateral, the frontend overlays their specific details at those exact percentages using CSS absolute positioning, and can use HTML Canvas to generate a final downloadable image.

### 2. Multi-Step Generative AI Pipeline
**How it works:** You built a service (`marketing-image-gen.service.ts`) that acts like a DAG (Directed Acyclic Graph):
1. Takes a project name.
2. Calls Perplexity API to get JSON data (amenities, location).
3. Calls Google Places API to fetch a real photo of the property.
4. Uploads the photo to ImgBB to get a public URL.
5. Sends the property JSON to Gemini 2.5 Pro to generate a strict, formatted text prompt.
6. Feeds the text prompt + base64 image into Gemini Flash to generate a final marketing poster.

### 3. Dynamic Routing & Lead Attribution (Next.js)
**How it works:** The microsite uses dynamic segments `app/[projectId]/[userId]/page.tsx`. When a user visits the URL, Next.js parses the params, fetches the project details and the broker details from the NestJS backend in parallel (`Promise.all`). If a buyer fills out the "Enquire Now" form, the payload includes the `userId` from the URL, ensuring the lead is saved in the database under that specific broker.

### 4. OTP Authentication (Prototype Phase)
**How it works:** In production, this uses an SMS provider like Twilio to send a 6-digit code. For the prototype/testing phase, you implemented a bypass (e.g., hardcoded `123456` or dummy user IDs) to allow rapid QA testing without incurring SMS costs. *Note: In an interview, explicitly state that this is a mocked service for the prototype and explain how the Twilio integration works in the production environment.*

---

## 4. Anticipated Interview Questions & Answers

### Q: "How do you handle state management across the broker dashboard?"
**Answer:** "I use **Pinia** in Vue 3. I structured my stores by domain (e.g., `AuthStore`, `ProjectStore`, `ProfileStore`). Since I'm using the Composition API, my stores look like standard Vue composables with `ref` and `computed`. For example, when a broker logs in, the `AuthStore` persists the JWT token in `localStorage`. The `ProjectStore` accesses this token via Axios interceptors to fetch projects specific to that broker."

### Q: "What happens if the Perplexity API fails during the image generation pipeline?"
**Answer:** "I implemented error handling and fallbacks. If the Perplexity API times out or returns malformed JSON, I wrap it in a `try/catch` and provide a fallback object using the basic property name. Since the pipeline uses `Promise.all` to fetch data and photos concurrently, I ensure a failure in one doesn't crash the Node process, but instead degrades gracefully (e.g., using a placeholder white image if Google Places fails)."

### Q: "How do you handle Cross-Origin Resource Sharing (CORS) since you have three different applications running?"
**Answer:** "The NestJS backend runs on port 3333, the Vue app on 5173, and the Next.js app on 3000. In my NestJS `main.ts`, I explicitly enabled CORS (`app.enableCors()`) so that both frontend applications can make `fetch` and `axios` requests to the backend without the browser blocking them due to Same-Origin Policy violations."

### Q: "How would you deploy this to production?" (DevOps)
**Answer:** 
"For a scalable deployment:
1. **Frontend (Vue & Next.js):** I would deploy the Next.js microsite to **Vercel** to take advantage of their Edge network and native SSR caching. The Vue dashboard (which is a static SPA) could be hosted on AWS S3 + CloudFront or Vercel as well.
2. **Backend (NestJS):** I would containerize the NestJS app using Docker and deploy it to AWS ECS (Fargate) or a PaaS like Render/Railway.
3. **Database:** MongoDB Atlas for managed database hosting.
4. **Media:** AWS S3 for storing uploaded project collaterals, served behind a CDN."

---

## 5. Tips for the Interview

1. **Own the Prototype Status:** Don't apologize for mocked OTPs or dummy users. Frame them as intentional engineering decisions: *"To enable rapid parallel development and save on third-party API costs during the PoC phase, I abstracted the auth layer to accept a mock OTP."*
2. **Highlight Product Thinking:** Engineering is about solving business problems. Emphasize that you didn't just write code; you solved the "Lead Attribution" problem for brokers by designing the dynamic URL scheme (`/project/brokerId`).
3. **Be Honest About Limitations:** If asked how the Next.js app handles extreme traffic, admit that currently it fetches data on every request (`cache: 'no-store'`). Explain that for production, you would implement Incremental Static Regeneration (ISR) to cache the microsites and only rebuild them when a builder updates project details.
