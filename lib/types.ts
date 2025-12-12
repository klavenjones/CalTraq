export type ActivityLevel = 'not_very_active' | 'lightly_active' | 'active' | 'very_active';

export type Goal = 'lose' | 'maintain' | 'gain';

export type Sex = 'male' | 'female' | 'other';

export interface Profile {
  _id: string;
  _creationTime: number;
  userId: string;
  age: number;
  sex: Sex;
  height: number; // in cm
  weight: number; // in kg
  bodyFatPercentage: number; // 0-100
  activityLevel: ActivityLevel;
  goal: Goal;
  createdAt: number;
  updatedAt: number;
}

export interface DailyLog {
  _id: string;
  _creationTime: number;
  userId: string;
  date: string; // YYYY-MM-DD format
  calories?: number;
  protein?: number; // in grams
  weight?: number; // in kg
  notes?: string;
  createdAt: number;
}

export interface CalculatedMetrics {
  leanBodyMass: number; // in kg
  bmr: number; // in kcal/day
  estimatedTDEE: number; // in kcal/day
  dailyCalorieTarget: number; // in kcal/day
  dailyProteinTarget: number; // in grams/day
  realWorldTDEE?: number; // in kcal/day (estimated from recent data)
}

