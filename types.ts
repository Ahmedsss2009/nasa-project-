export interface Condition {
  name: string;
  likelihood: number; // 0-100
  description: string;
  value?: number;
  unit?: string;
}

export interface PredictionData {
  location: string;
  date: string;
  comfortScore: number; // 0-10
  conditions: Condition[];
  summary: string;
  recommendations: string[];
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface FullPredictionResult {
  prediction: PredictionData;
  sources: GroundingSource[];
}

export interface HistoryItem extends PredictionData {
  id: string;
}

// New types for Country Overview
export interface RegionalBreakdown {
  region: string;
  summary: string;
}

export interface CountryOverviewData {
  country: string;
  month: number;
  year: number;
  overallSummary: string;
  regionalBreakdowns: RegionalBreakdown[];
  travelAdvice: string[];
}

export interface FullCountryOverviewResult {
    overview: CountryOverviewData;
    sources: GroundingSource[];
}

// Discriminated union for prediction state
export type AnyPredictionResult = 
  | { type: 'daily', data: FullPredictionResult }
  | { type: 'country', data: FullCountryOverviewResult };