export interface AssociationRef {
  _id: string
  name: string
  phoneNumber?: string
  id?: string
}

export interface BrokerProfile {
  _id: string
  name: string
  phoneNumber: string
  email: string

  companyId: string | null

  sourcingManagerId?: AssociationRef | null

  chanakyaPoints: number
  marketingCollateralCount: number
  micrositeCount: number
  brokerageLadderCount: number
  projectBrochureCount: number

  builders: AssociationRef[]
  sourcingManagers: AssociationRef[]

  createdAt: string
  updatedAt: string
}

export interface BrokerProfileResponse {
  status: number
  message: string
  data: BrokerProfile
}

export interface ProfileStatusData {
  isComplete: boolean
  missingFields: string[]
}

export interface ProfileStatusResponse {
  status: number
  message: string
  data: ProfileStatusData
}
