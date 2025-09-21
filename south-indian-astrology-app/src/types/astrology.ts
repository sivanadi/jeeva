// TypeScript interfaces for astrology API

export interface BirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
  lat: number;
  lon: number;
  tz: string;
  ayanamsha?: string;
  house_system?: string;
  natal_ayanamsha?: string;
  natal_house_system?: string;
  transit_ayanamsha?: string;
  transit_house_system?: string;
}

export interface PlanetPositions {
  Sun: number;
  Moon: number;
  Mars: number;
  Mercury: number;
  Jupiter: number;
  Venus: number;
  Saturn: number;
  Rahu: number;
  Ketu: number;
}

export interface HousePositions {
  [key: string]: number;
}

export interface OtherDetails {
  natal_date_formatted: string;
  transit_date_formatted: string;
  natal_ayanamsha_name: string;
  transit_ayanamsha_name: string;
  ayanamsha_value_natal: number;
  ayanamsha_value_transit: number;
  natal_house_system_used: string;
  transit_house_system_used: string;
  timezone_used: string;
  natal_input_time_ut: number;
  transit_input_time_ut: number;
}

export interface PlanetLongitudes {
  Ascendant: number;
  Sun: number;
  Moon: number;
  Mars: number;
  Mercury: number;
  Jupiter: number;
  Venus: number;
  Saturn: number;
  Rahu: number;
  Ketu: number;
}

export interface HouseCusps {
  [key: string]: number; // "House 1", "House 2", etc.
}

export interface ApiResponse {
  other_details: OtherDetails;
  natal_planets: PlanetLongitudes;
  natal_house_cusps: HouseCusps;
  transit_planets: PlanetLongitudes;
  transit_house_cusps: HouseCusps;
}

export interface ApiError {
  detail: string;
  status?: number;
}

export interface ApiSettings {
  apiKey: string;
  baseUrl: string;
}

// South Indian chart display interfaces
export interface ChartPosition {
  sign: number; // 0-11 (Aries to Pisces)
  degree: number;
  planet?: string;
}

export interface SouthIndianChartData {
  positions: ChartPosition[];
  ascendant: number; // Sign number
}

// Zodiac signs
export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

export const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'] as const;