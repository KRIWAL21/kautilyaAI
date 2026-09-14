import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

// -- Collateral Spot --------------------------------------------
export class CollateralSpot {
  id: string;
  x: number;       // percentage (0-100) of image width
  y: number;       // percentage (0-100) of image height
  label: 'name' | 'number' | 'both';
  fontSize: number;
  color: string;
  fontWeight: string;
  bgColor: string;
  bgOpacity: number;
}

export class ProjectCollateral {
  _id: string;
  imageUrl: string;
  title: string;
  spots: CollateralSpot[];
  uploadedAt: Date;
}

// -- Coordinates ------------------------------------------------
export class GeoCoordinates {
  lat: number;
  lng: number;
}

@Schema({ collection: 'projects', timestamps: true })
export class Project extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company' })
  companyId: string;

  @Prop({ required: true })
  projectName: string;

  @Prop()
  description: string;

  @Prop()
  builderName: string;

  @Prop()
  glocation: string;

  @Prop()
  venue: string;

  @Prop({ type: [{ number: String, status: String }] })
  projectReraNumber: any[];

  @Prop()
  projectStatus: string;

  @Prop()
  minPrice: number;

  @Prop()
  maxPrice: number;

  @Prop()
  avgPrice: number;

  @Prop({ type: [MongooseSchema.Types.Mixed] })
  commissionPlan: any[];

  @Prop({ type: [MongooseSchema.Types.Mixed] })
  marketingCollaterals: any[];

  @Prop({ type: [MongooseSchema.Types.Mixed] })
  marketingCollateralsVideo: any[];

  @Prop()
  microSiteLink: string;

  @Prop({ type: [MongooseSchema.Types.Mixed] })
  floorPlan: any[];

  @Prop()
  tourLink: string;

  @Prop()
  projectSourcingManager: string;

  @Prop([String])
  amenities: string[];

  @Prop({ type: [MongooseSchema.Types.Mixed] })
  brochure: any[];

  @Prop([String])
  propertyPictures: string[];

  @Prop([String])
  PropertyConfig: string[];

  @Prop()
  brokeragePdf: string;

  @Prop()
  brokerageText: string;

  @Prop()
  address: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop()
  landmark: string;

  @Prop()
  region: string;

  @Prop()
  readyToPossessDate: string;

  @Prop({ default: false })
  micrositeActive: boolean;

  @Prop()
  micrositeSlug: string;

  @Prop([String])
  nearbyAmenities: string[];

  @Prop()
  reraNo: string;

  @Prop({ default: true })
  showOnPortfolio: boolean;

  // -- NEW: GPS Coordinates ------------------------------------
  @Prop({ type: { lat: Number, lng: Number }, default: null })
  coordinates: GeoCoordinates;

  // -- NEW: Marketing Collateral with Spots -------------------
  @Prop({
    type: [{
      _id: { type: MongooseSchema.Types.ObjectId, auto: true },
      imageUrl: String,
      title: String,
      uploadedAt: { type: Date, default: Date.now },
      spots: [{
        id: String,
        x: Number,
        y: Number,
        label: { type: String, enum: ['name', 'number', 'both'], default: 'both' },
        fontSize: { type: Number, default: 18 },
        color: { type: String, default: '#ffffff' },
        fontWeight: { type: String, default: 'bold' },
        bgColor: { type: String, default: '#000000' },
        bgOpacity: { type: Number, default: 0.5 },
      }]
    }],
    default: []
  })
  marketingCollateralSpots: ProjectCollateral[];

  // -- NEW: Project Type ----------------------------------------
  @Prop({ default: 'Residential' })
  projectType: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
