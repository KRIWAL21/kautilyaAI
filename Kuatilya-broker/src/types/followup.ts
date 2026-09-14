export interface FollowUpStats {
  today: number
  pending: number
  completed: number
  total: number
}

export interface FollowUpStatsResponse {
  status: number
  message: string
  data: FollowUpStats
}


export interface FollowUp {
  _id: string
  leadId: string
  brokerId: string
  scheduledAt: string // ISO date
  note: string
  userNote?: string
  projectName?: string
  leadName?: string
  leadPhone?: string
  actionType: "Call" | "Meeting" | "WhatsApp" | "Email" | string
  leadStatus: "Interested" | "Site Visit Booking" | "Meeting" | "Booking Registration" | string
  status: "Pending" | "Completed" | "Cancelled" | string
  createdAt: string
  updatedAt: string
}


export interface FollowUpListResponse {
  followUps: FollowUp[]
  totalPages: number
  totalFollowUps: number
  pageSize: number
  pageNumber: number
}

export interface FollowUpLeadSummary {
  leadId: string
  leadName?: string
  leadPhone?: string
  currentFollowUp: FollowUp
  lastFollowUp?: FollowUp | null
  lastActivity?: string | null
  lastUpdated?: string | null
}

export interface FollowUpByLeadListResponse {
  followUps: FollowUpLeadSummary[]
  totalPages: number
  totalFollowUps: number
  pageSize: number
  pageNumber: number
}

export interface FollowUpByLeadResponse {
  status: number
  message: string
  data: FollowUpByLeadListResponse
}

export interface FollowUpAuditChange {
  field: string
  before: string | number | boolean | null
  after: string | number | boolean | null
}

export interface FollowUpAuditLog {
  _id: string
  followUpId: string
  leadId: string
  brokerId: string
  action: "CREATE" | "UPDATE"
  changes: FollowUpAuditChange[]
  beforeState?: Record<string, unknown>
  afterState?: Record<string, unknown>
  leadName?: string
  leadPhone?: string
  brokerName?: string
  brokerPhone?: string
  createdAt?: string
  updatedAt?: string
}

export interface FollowUpAuditLogListResponse {
  auditLogs: FollowUpAuditLog[]
  totalPages: number
  totalAuditLogs: number
  pageSize: number
  pageNumber: number
}

export interface FollowUpAuditLogResponse {
  status: number
  message: string
  data: FollowUpAuditLogListResponse
}


export interface FollowUpResponse {
  status: number
  message: string
  data: FollowUpListResponse
}


export interface CreateFollowUpPayload {
  leadId: string
  scheduledAt: string // ISO string
  note: string
  actionType: "Call" | "Meeting" | "WhatsApp" | "Email" | string
  leadStatus?: "Interested" | "Site Visit Booking" | "Meeting" | "Booking Registration" | string
  status: "Pending" | "Completed" | "Cancelled" | string
}

export interface FollowUpFilters {
  search?: string
  status?: string
  actionType?: string
  leadId?: string
}

export interface FollowUpAuditLogFilters {
  leadId?: string
  followUpId?: string
  action?: "CREATE" | "UPDATE"
}

export interface CreateFollowUpResponse {
  status: number
  message: string
  data: {
    _id: string
  }
}

