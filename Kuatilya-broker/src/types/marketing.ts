export interface MarketingContent {
  _id: string
  brokerId: string
  type: "Image" | "Video" | "Text"
  projectName: string
  aiPrompt: string
  contentUrl: string
  configuration: string
  location: string
  theme: string
  status: "Generated" | "Pending" | "Failed"
  sharedOn: string[]
  shareCount: number
  title: string
  createdAt: string
  updatedAt: string
  __v: number
}


export interface MarketingData {
  marketingContent: MarketingContent[]
  totalPages: number
  totalContent: number
  pageSize: number
  pageNumber: number
}


export interface MarketingResponse {
  status: number
  message: string
  data: MarketingData
}

export interface GenerateAiImagePayload {
  propertyName: string
  brokerName: string
  brokerNumber: string
  stylingDesc?: string
}



export interface GenerateWhatsappPayload {
  projectName: string
  configuration: string
  location: string
  theme: string
}


export interface GeneratePptPayload {
  projectName: string
  configuration: string
  location: string
  theme: string
}

export interface GenerateVideoPayload {
  projectName: string
  configuration: string
  location: string
  theme: string
}

