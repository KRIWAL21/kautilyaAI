// Chanakya Astra API: user = broker, company = builder, super-admin = super admin
const endpoints = {
  // Broker (user) endpoints
  brokerTasks: "/broker-task-management",
  teamMembers: "/team-members",
  brokers: "/users",
  brokerProfile: "/users/profile/me",
  brokerProfileStatus: "/users/profile/complete",
  selectRole: "/users/auth/select-role",
  notifications: "/notification-center/broker/me",
  notificationsReadAll: "/notification-center/broker/me/read-all",
  // Broker-scoped leads (users/leads)
  leads: "/users/leads",
  brokerLeadCreate: "/users/broker/leads",
  leadStats: "/users/leads/stats",
  // Customer-backed leads (canonical lead records in customer module)
  customerLeads: "/customers/leads-from-micro",
  customers: "/customers/customer",
  invoices: "/invoices",
  // Broker-scoped Sourcing Managers
  mappedSourcingManagers: "/sourcing-manager-broker/me/sourcing-managers",
  // Broker-scoped projects (projects/broker)
  project: "/projects/broker",
  projectDetail: "/projects/broker",
  projectOffers: "/offers/project",
  // Marketing / AI content (broker-specific; may stay on separate service until integrated)
  marketing: "/marketing",
  marketingImage: "/marketing/ai/image",
  marketingWhatsapp: "/marketing/ai/whatsapp",
  marketingPpt: "/marketing/ai/ppt",
  marketingVideo: "/marketing/ai/video",
  generateGamma: "/ai-content-creator/generate-a-gamma",
  generateGammaStatus: "/ai-content-creator/status",
  downloadPpt: "/ai-content-creator/download",
  generateVideo: "/ai-content-creator/generate-video",
  videoStatus: "/ai-content-creator/video-status",
  enhancePrompt: "/ai-content-creator/enhance-prompt",
  perplexityChat: "/ai-content-creator/perplexity-chat",
  perplexityChatHistory: "/ai-content-creator/perplexity-chat/history",
  generatePoster: "/ai-content-creator/generate-poster",
  generateSlideshow: "/ai-content-creator/generate-slideshow",
  slideshowStatus: "/ai-content-creator/slideshow-status",
  followup: "/follow-ups",
  followupByLead: "/follow-ups/by-lead",
  followupstats: "/follow-ups/stats",
  followupAuditLogs: "/follow-ups/audit-logs",
  events: "/events",
  eventRegistrations: "/event-registrations",
  siteVisits: "/site-visits",
  siteVisitsMe: "/site-visits/agent/me",
  siteVisitsStats: "/site-visits/stats/visits",
  brokerInvitations: "/broker-invitations/broker/me",
  brokerInvitationRespondBase: "/broker-invitations/broker",
  brokerBuilderSuggestions: "/broker-invitations/broker/builder-suggestions",
  brokerBuilderRequest: "/broker-invitations/broker/request",
  brokerAvailableBuilders: "/broker-invitations/broker/available-builders",
  companiesAll: "/company",
  // New: Image generation via our own NestJS backend (replaces n8n webhook)
  marketingImageGenerate: "/marketing-image-gen/generate",
  // -- Builder Project Management ---------------------------------
  builderProjects: "/projects/builder/mine",
  createProject: "/projects",
  projectById: "/projects",
  projectCollateral: "/projects",           // + /:id/collateral
  projectCollateralSpots: "/projects",      // + /:id/collateral/:colId/spots
};

export default endpoints;
