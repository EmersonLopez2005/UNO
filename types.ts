export enum AspectRatio {
  PORTRAIT = '9:16',
  LANDSCAPE = '16:9',
  SQUARE = '1:1',
  PORTRAIT_3_4 = '3:4',
  LANDSCAPE_4_3 = '4:3',
  PORTRAIT_2_3 = '2:3',
  ULTRAWIDE = '21:9'
}

export type PosterStyle = 'RACE' | 'LAUNCH' | 'GARAGE' | 'PADDOCK';
export type ArtPosterStyle = 'ILLUSTRATION' | 'REALISTIC' | 'LAUNCH_CLOSEUP' | 'POP_ART' | 'NEON_NIGHT' | 'SURREALIST' | 'HOLOGRAPHIC' | 'COMIC_BOOM' | 'STYLE_TRANSFER' | 'COEN_POHL' | 'SABINUS' | 'MINIMALIST_ILLUSTRATION' | 'SPEED_GRAFFITI';
export type MerchItemType = 'RACING_SUIT' | 'SHORT_SLEEVE' | 'CAR_MODEL' | 'COFFEE' | 'MERCH_COLLECTION';
export type GenerationFormat = '3D_EFFECT' | 'THREE_VIEW';

export type AppView = 'LANDING' | 'RACING' | 'MERCH' | 'POSTER_DESIGN' | 'STYLE_TRANSFER' | 'CAR_DESIGN';

export interface PosterRequest {
  carModel1: string;
  carModel2?: string;
  livery: string;
  perspective: string;
  aspectRatio: AspectRatio;
  posterStyle: PosterStyle;
  generationFormat?: GenerationFormat;
  sponsorLogo?: string; // base64
  teamLogo?: string;    // base64
  customPattern?: string; // base64
  carReferenceImage?: string; // base64
  carReferenceImage2?: string; // base64
}

export interface ArtPosterRequest {
  carImage?: string;
  carImage2?: string;
  sponsorLogo?: string;
  teamLogo?: string;
  eventLogo?: string;
  styleCustomPrompt?: string; 
  userSupplement?: string;
  style: ArtPosterStyle;
  aspectRatio: AspectRatio;
  styleReferenceImage?: string; // For Style Transfer feature
}

export interface MerchRequest {
  itemType: MerchItemType;
  teamLogo?: string;    // base64
  sponsorLogo?: string; // base64
  carReference?: string; // base64
  patternReference?: string; // base64 for collection design
  aspectRatio: AspectRatio;
  styleDescription?: string; 
  suitTemplateId?: string; 
  primaryColor?: string;
  secondaryColor?: string;
  baseColor?: string; 
}

export interface GeneratedAsset {
  id: string;
  imageUrl: string;
  timestamp: number;
  type: 'POSTER' | 'MERCH' | 'ART_POSTER' | 'STYLE_TRANSFER';
  request: PosterRequest | MerchRequest | ArtPosterRequest;
  prompt?: string;
}