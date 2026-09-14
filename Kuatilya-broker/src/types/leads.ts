export interface LeadBudget {
  min: number
  max: number
}

export type LeadStatus = "Cold" | "Warm" | "Hot"
export type LeadPropertyType = "residential" | "commercial"
export type LeadLookingTo = "buy" | "rent" | "sell" | "lease_out"
export type LeadStage =
  | "new_lead"
  | "prospecting"
  | "visits"
  | "negotiations"
  | "won"
  | "lost"
  | "junk"
  | "closed"
export type LeadProjectStatusPreference =
  | "under_construction"
  | "ready_to_move"
  | "newly_launched"
export type LeadProjectTypePreference =
  | "gated_amenities"
  | "standalone"
  | "gated_no_amenities"
  | "standalone_amenities"

export interface LeadAssociationRef {
  _id: string
  name?: string
  email?: string
  phoneNumber?: string
}

export interface Lead {
  _id: string
  brokerId: string
  brokerIds: string[]
  projectIds: string[]
  builderIds: string[]
  brokers: LeadAssociationRef[]
  projects: LeadAssociationRef[]
  builders: LeadAssociationRef[]
  name: string
  phone: string
  email: string
  source: string
  sourceDetails?: string
  preferredLocation: string
  city?: string
  region?: string
  subRegion?: string
  locality?: string
  budget: LeadBudget
  status: LeadStatus
  propertyType?: LeadPropertyType
  lookingTo?: LeadLookingTo
  stage?: LeadStage
  notes: string
  internalNote?: string
  nextFollowUpAt: string | null
  isConverted: boolean
  convertedAt: string | null
  assignedToUserId?: string
  projectStatusPreferences?: LeadProjectStatusPreference[]
  projectTypePreferences?: LeadProjectTypePreference[]
  createdAt: string
  updatedAt: string
}

export interface LeadListData {
  leads: Lead[]
  totalPages: number
  totalLeads: number
  pageSize: number
  pageNumber: number
}

export interface LeadResponse {
  status: number
  message: string
  data: LeadListData
}

export interface LeadStatsData {
  totalLeads: number,
  hot: number,
  warm: number,
  cold: number
}

export interface LeadStatsResponse{
  data: LeadStatsData
}

export interface CreateLeadPayload {
  name: string
  phone?: string
  email?: string
  source?: string
  sourceDetails?: string
  preferredLocation?: string
  city?: string
  region?: string
  subRegion?: string
  locality?: string
  budget?: LeadBudget
  status?: LeadStatus
  propertyType?: LeadPropertyType
  lookingTo?: LeadLookingTo
  stage?: LeadStage
  notes?: string
  internalNote?: string
  nextFollowUpAt?: string
  builderIds?: string[]
  projectIds?: string[]
  projectStatusPreferences?: LeadProjectStatusPreference[]
  projectTypePreferences?: LeadProjectTypePreference[]
  assignedToUserId?: string
  brokerIds?: string[]
}

export interface CreateLeadResponse {
  status: number
  message: string
  data: {
    _id: string
  }
}
