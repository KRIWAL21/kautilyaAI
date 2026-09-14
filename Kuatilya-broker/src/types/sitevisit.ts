export interface SiteVisitProjectRef {
  _id: string
  name?: string
}

export interface SiteVisit {
  _id: string
  userId: string
  customerId?: string
  projectId?: SiteVisitProjectRef | string
  verificationToken?: string
  visitDate: string
  visitTime: string
  clientName: string
  clientPhoneNumber: number
  purposeOfVisit: string
  status: "pending" | "complete" | "incomplete" | string
  builderApprovalStatus?: "pending" | "approved" | "cancelled" | string
  visitCount?: number
  tagged?: boolean
  taggedDate?: string
  validityDays?: number
  remark?: string
  createdAt?: string
  updatedAt?: string
}

export interface SiteVisitByUserResponse {
  status?: number
  statusCode?: number
  message: string
  data: SiteVisit[]
}

export interface CreateSiteVisitPayload {
  projectId?: string
  userId?: string
  customerId?: string
  visitDate: string
  visitTime: string
  clientName: string
  clientPhoneNumber: number
  purposeOfVisit: string
  status?: "pending" | "complete" | "incomplete"
  remark?: string
  tagged?: boolean
  isActive?: boolean
  validityDays?: number
}
