// Spot placed on a marketing collateral image
export interface CollateralSpot {
  id: string
  x: number
  y: number
  label: 'name' | 'number' | 'both'
  fontSize: number
  color: string
  fontWeight: string
  bgColor: string
  bgOpacity: number
}

export interface ProjectCollateral {
  _id: string
  imageUrl: string
  title: string
  spots: CollateralSpot[]
  uploadedAt: string
}

export interface GeoCoordinates {
  lat: number
  lng: number
}

export interface Project {
  _id: string
  companyId: string
  projectName: string
  description: string
  projectType: string
  projectStatus: string
  minPrice: number
  maxPrice: number
  avgPrice: number
  amenities: string[]
  nearbyAmenities: string[]
  city: string
  state: string
  address: string
  landmark: string
  region: string
  coordinates: GeoCoordinates | null
  reraNo: string
  projectReraNumber: Array<{ number: string; status: string }>
  marketingCollateralSpots: ProjectCollateral[]
  marketingCollaterals: any[]
  marketingCollateralsVideo: any[]
  floorPlan: any[]
  brochure: any[]
  propertyPictures: string[]
  PropertyConfig: string[]
  commissionPlan: any[]
  brokeragePdf: string
  brokerageText: string
  microSiteLink: string
  tourLink: string
  micrositeActive: boolean
  micrositeSlug: string
  readyToPossessDate: string
  showOnPortfolio: boolean
  builderName: string
  builderTheme: any | null
  builderDetails: { name: string; email: string; contact: string } | null
  createdAt: string
  updatedAt: string
}

export interface CreateProjectPayload {
  projectName: string
  description?: string
  projectType?: string
  minPrice?: number
  maxPrice?: number
  projectStatus?: string
  amenities?: string[]
  city?: string
  state?: string
  address?: string
  landmark?: string
  reraNo?: string
  coordinates?: GeoCoordinates
}

export interface AddCollateralPayload {
  imageUrl: string
  title?: string
  spots?: CollateralSpot[]
}

export interface UpdateSpotsPayload {
  spots: CollateralSpot[]
}
