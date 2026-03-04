export type DogType = 'standard' | 'brachycephalic' | 'cold_climate' | 'puppy_senior';
export type DogSize = 'small' | 'medium' | 'large';

export interface DogProfile {
  name: string;
  breed: string;
  type: DogType;
  size: DogSize;
  imageUrl?: string;
}

export interface WeatherData {
  temp: number;
  humidity: number;
  clouds: number;
  timestamp: number;
  condition: string;
  description?: string;
  icon?: string;
}

export interface DailyForecast {
  date: string;
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
  condition: string;
  comfort: ComfortLevel;
}

export interface ComfortLevel {
  level: number;
  status: string;
  advice: string;
  color: string;
  icon: string;
}

export interface Location {
  id: string;
  name: string;
  prefecture: string;
  lat: number;
  lon: number;
}
