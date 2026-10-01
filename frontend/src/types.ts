export type Language = 'en' | 'hi' | 'mr';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  preferred_language: Language;
  avatar_url?: string;
  village?: string;
  district?: string;
  state?: string;
  bio?: string;
}

export interface Farm {
  id: number;
  farm_name: string;
  location: string;
  area_acres: number;
  primary_crop: string;
  crop_stage: string;
  soil_type: string;
  irrigation_method: string;
  sowing_date?: string;
}

export interface WeatherTelemetry {
  temperature_c: number;
  humidity_pct: number;
  rainfall_mm: number;
  rain_probability_pct: number;
  wind_speed_kmh: number;
  uv_index: string;
  condition: string;
  icon: string;
  location_name: string;
  advisory_headline: string;
  advisory_detail: string;
}

export interface ForecastItem {
  time: string;
  temp: number;
  rain_prob: number;
  condition: string;
}

export interface CropRiskData {
  disease_risk: 'LOW' | 'MEDIUM' | 'HIGH';
  water_stress: 'LOW' | 'MEDIUM' | 'HIGH';
  heat_stress: 'LOW' | 'MEDIUM' | 'HIGH';
  rainfall_risk: 'LOW' | 'MEDIUM' | 'HIGH';
  overall_score: number;
  summary: string;
  alerts: Array<{ type: string; severity: string; message: string }>;
}

export interface IrrigationAdvisory {
  recommendation: string;
  status_level: 'SAFE' | 'WARNING' | 'CRITICAL';
  reason: string;
  soil_moisture_pct: number;
  expected_water_mm: number;
  scheduled_window: string;
  next_review: string;
  crop_specific_notes: string;
}

export interface CropScanResult {
  id?: number;
  crop: string;
  disease: string;
  disease_scientific?: string;
  disease_marathi?: string;
  disease_hindi?: string;
  confidence: number;
  confidence_tier: 'HIGH' | 'MODERATE' | 'LOW';
  severity: 'LOW' | 'MODERATE' | 'HIGH';
  symptoms: string[];
  general_guidance: string;
  action_plan: string[];
  organic_options: Array<{ name: string; dose: string; benefit: string }>;
  chemical_options: Array<{ name: string; dose: string; benefit: string }>;
  disclaimer: string;
  image_url?: string;
  bounding_box?: { top_pct: number; left_pct: number; width_pct: number; height_pct: number; label: string };
  heatmap_data?: { salient_activation_score: number; gradcam_layer: string };
  is_low_confidence?: boolean;
  warning?: string;
  audio_advice_hi?: string;
  audio_advice_mr?: string;
  scanned_at?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  language: Language;
  sources?: Array<{ title: string; source_name: string; category: string; url?: string }>;
  time: string;
}

export interface MandiRate {
  id: number;
  market_name: string;
  commodity: string;
  variety: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  change_pct: number;
  trend: 'up' | 'down';
  arrival_quintals: number;
  optimal_window?: string;
}

export interface AgriculturalResource {
  id: number;
  title: string;
  category: string;
  district: string;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  distance_km?: number;
}
