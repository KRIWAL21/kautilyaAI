import { createRouter, createWebHistory } from "vue-router";

// Layouts
import BaseLayout from "@/layouts/BaseLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";

// Pages â€” Broker Portal (existing)
import HomeView from "@/views/HomeView.vue";
import LeadView from "@/views/LeadView.vue";
import MarketingView from "@/views/MarketingView.vue";
import MarketingPptView from "@/views/MarketingPptView.vue";
import MarketingPptEditView from "@/views/MarketingPptEditView.vue";
import MarketingImageView from "@/views/MarketingImageView.vue";
import MarketingVideoView from "@/views/MarketingVideoView.vue";
import ProjectView from "@/views/ProjectView.vue";
import ProjectDetailView from "@/views/ProjectDetailView.vue";
import EventsView from "@/views/EventsView.vue";
import FollowUpView from "@/views/FollowUpView.vue";
import SiteVisitView from "@/views/SiteVisitView.vue";
import InvitationView from "@/views/InvitationView.vue";
import ProfileView from "@/views/ProfileView.vue";
import GenerateGammaView from "@/views/GenerateGammaView.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import TeamView from "@/views/TeamView.vue";
import TaskView from "@/views/TaskView.vue";
import GptView from "@/views/GptView.vue";
import PrivacyPolicyView from "@/views/PrivacyPolicyView.vue";
import TermsView from "@/views/TermsView.vue";
import TrainingView from "@/views/TrainingView.vue";
import ReminderView from "@/views/ReminderView.vue";
import BrokerNetworkView from "@/views/BrokerNetworkView.vue";
import PassbookView from "@/views/PassbookView.vue";
import GroupBuyView from "@/views/GroupBuyView.vue";
import PropertiesView from "@/views/PropertiesView.vue";

// Pages â€” Onboarding
import RoleSelectView from "@/views/RoleSelectView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // â”€â”€ Onboarding â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      name: "select-role",
      path: "/select-role",
      component: RoleSelectView,
      meta: { requiresAuth: true, skipRoleCheck: true },
    },

    // â”€â”€ Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      name: "",
      path: "/auth",
      component: AuthLayout,
      children: [
        {
          name: "login",
          path: "login",
          component: LoginView,
        },
        {
          name: "register",
          path: "register",
          component: RegisterView,
        },
      ],
    },

    // â”€â”€ Broker Portal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      path: "/",
      component: BaseLayout,
      meta: { requiresAuth: true, roles: ["BROKER", "broker", "agent", "agency", "owner", "buyer", "seller"] },
      children: [
        { name: "home", path: "/", component: HomeView },
        { name: "leads", path: "/leads", component: LeadView },
        { name: "profile", path: "/profile", component: ProfileView },
        { name: "marketing", path: "/marketing", component: MarketingView },
        { name: "marketing-ppt", path: "/marketing/ppt", component: MarketingPptView },
        { name: "marketing-ppt-edit", path: "/marketing/ppt/:id", component: MarketingPptEditView },
        { name: "marketing-image", path: "/marketing/image", component: MarketingImageView },
        { name: "marketing-video", path: "/marketing/video", component: MarketingVideoView },
        // -- Broker Projects + Collateral Spot Editor (Same as builder) -------------
        { name: "broker-projects", path: "/projects", component: () => import("@/views/builder/BuilderProjectsView.vue") },
        { name: "broker-project-create", path: "/projects/create", component: () => import("@/views/builder/BuilderProjectCreateView.vue") },
        { name: "broker-project-detail", path: "/projects/:id", component: () => import("@/views/builder/BuilderProjectDetailView.vue") },
        { name: "broker-collateral-editor", path: "/projects/:id/collateral/:colId", component: () => import("@/views/builder/BuilderCollateralEditorView.vue") },
        { name: "my-microsite", path: "/my-microsite", component: () => import("@/views/PersonalisedMicrositeView.vue") },
        { name: "broker-collateral", path: "/my-collateral", component: () => import("@/views/BrokerCollateralView.vue") },
        { name: "events", path: "/events", component: EventsView },
        { name: "follow-up", path: "/follow-up", component: FollowUpView },
        { name: "site-visits", path: "/site-visits", component: SiteVisitView },
        { name: "invitations", path: "/invitations", component: InvitationView },
        { name: "team", path: "/team", component: TeamView },
        { name: "tasks", path: "/tasks", component: TaskView },
        { name: "ai", path: "/ai", component: GptView },
        { name: "privacy-policy", path: "/privacy-policy", component: PrivacyPolicyView },
        { name: "terms-and-conditions", path: "/support/terms", component: TermsView },
        { name: "training", path: "/training", component: TrainingView },
        { name: "reminders", path: "/reminders", component: ReminderView },
        { name: "broker-network", path: "/broker-network", component: BrokerNetworkView },
        { name: "passbook", path: "/passbook", component: PassbookView },
        { name: "group-buy", path: "/group-buy", component: GroupBuyView },
        { name: "properties", path: "/properties", component: PropertiesView },
        { name: "generate-a-gamma", path: "/generate-a-gamma", component: GenerateGammaView },
      ],
    },

    // â”€â”€ Builder Portal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // (Pages will be added in Phase 2 â€” stub routes registered now)
    {
      path: "/builder",
      component: BaseLayout,
      meta: { requiresAuth: true, roles: ["BUILDER"] },
      children: [
        {
          name: "builder-home",
          path: "",
          component: () => import("@/views/builder/BuilderHomeView.vue"),
        },
        {
          name: "builder-properties",
          path: "properties",
          component: () => import("@/views/builder/BuilderPropertiesView.vue"),
        },
        {
          name: "builder-inquiries",
          path: "inquiries",
          component: () => import("@/views/builder/BuilderInquiriesView.vue"),
        },
        // -- Project Management + Collateral Spot Editor -------------
        {
          name: "builder-projects",
          path: "projects",
          component: () => import("@/views/builder/BuilderProjectsView.vue"),
        },
        {
          name: "builder-project-create",
          path: "projects/create",
          component: () => import("@/views/builder/BuilderProjectCreateView.vue"),
        },
        {
          name: "builder-project-detail",
          path: "projects/:id",
          component: () => import("@/views/builder/BuilderProjectDetailView.vue"),
        },
        {
          name: "builder-collateral-editor",
          path: "projects/:id/collateral/:colId",
          component: () => import("@/views/builder/BuilderCollateralEditorView.vue"),
        },
      ],
    },

    // â”€â”€ Client Portal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // (Pages will be added in Phase 3 â€” stub routes registered now)
    {
      path: "/client",
      component: BaseLayout,
      meta: { requiresAuth: true, roles: ["CLIENT"] },
      children: [
        {
          name: "client-home",
          path: "",
          component: () => import("@/views/client/ClientHomeView.vue"),
        },
        {
          name: "client-search",
          path: "search",
          component: () => import("@/views/client/PropertySearchView.vue"),
        },
        {
          name: "client-site-visits",
          path: "site-visits",
          component: () => import("@/views/client/MySiteVisitsView.vue"),
        },
      ],
    },
  ],
});

// â”€â”€ Global Navigation Guard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem("accessToken");
  let role = localStorage.getItem("userRole");

  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth);
  const skipRoleCheck = to.matched.some((r) => r.meta.skipRoleCheck);

  // Clean up stale role if token is gone (e.g. after logout or expiry)
  if (!token && role) {
    localStorage.removeItem("userRole");
    role = null;
  }

  // 1. Not logged in â†’ go to login
  if (requiresAuth && !token) {
    return next({ name: "login" });
  }

  // 2. Logged in but no role selected yet â†’ show role selection
  if (requiresAuth && token && !role && !skipRoleCheck) {
    return next({ name: "select-role" });
  }

  // 3. Already logged in, trying to access auth pages â†’ redirect to correct portal
  if (token && to.path.startsWith("/auth")) {
    return next(getPortalHome(role));
  }

  next();
});

function getPortalHome(role: string | null): string {
  if (role === "BUILDER") return "/builder";
  if (role === "CLIENT") return "/client";
  return "/"; // BROKER and legacy roles
}

export default router;

