// Frontend TypeScript Type Definitions for Urjaa

export type PhaseType = 'Menstrual' | 'Follicular' | 'Ovulatory' | 'Luteal';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';
export type DietaryPreference = 'Vegetarian' | 'Eggetarian' | 'Non-vegetarian' | 'Vegan';
export type FitnessLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type ThemePreference = 'system' | 'light' | 'dark';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface UserProfile {
  user_id: string;
  name: string;
  wellness_goal: string;
  primary_goal?: string;
  secondary_goals?: string[];
  fitness_level: FitnessLevel;
  preferred_workout_duration: number;
  workout_location?: string;
  available_equipment?: string[];
  preferred_activities?: string[];
  dietary_preference: DietaryPreference;
  exercise_limitations: string[];
  pcos_pcod_mode: boolean;
  avatar_id?: string;
  avatar_url?: string;
  companion_name?: string;
  updated_at: string;
}

export interface UserPreferences {
  user_id: string;
  theme_preference: ThemePreference;
  quiet_mode: boolean;
  companion_name?: string;
  notify_period: boolean;
  notify_checkin: boolean;
  notify_hydration: boolean;
  notify_workout: boolean;
  notify_nutrition: boolean;
  notify_insights: boolean;
  updated_at: string;
}

export interface CycleSettings {
  user_id: string;
  last_period_start: string; // YYYY-MM-DD
  period_duration: number;
  avg_cycle_length: number;
  is_regular: boolean;
  updated_at: string;
}

export interface CycleRecord {
  id: string;
  user_id: string;
  start_date: string;
  end_date?: string;
  cycle_length?: number;
  period_duration: number;
  notes?: string;
  created_at: string;
}

export interface PhaseInfo {
  current_phase: PhaseType;
  cycle_day: number;
  total_cycle_length: number;
  estimated_ovulation_day: number;
  estimated_next_period: string;
  days_until_next_period: number;
  confidence_score: number;
  confidence_level: ConfidenceLevel;
  confidence_label: string;
  is_irregular: boolean;
  phase_description: string;
  energy_trend: string;
  recommended_focus: string;
}

export interface DailyCheckin {
  id: string;
  user_id: string;
  date: string;
  bleeding_status: 'period_started' | 'period_continuing' | 'period_ended' | 'no_bleeding' | string;
  mood?: 'Great' | 'Good' | 'Okay' | 'Low' | 'Bad' | string;
  energy?: 'High' | 'Medium' | 'Low' | string;
  bloating?: 'None' | 'Mild' | 'Moderate' | 'High' | string;
  cramps?: 'None' | 'Mild' | 'Moderate' | 'Severe' | string;
  sleep?: 'Good' | 'Okay' | 'Poor' | string;
  water_ml: number;
  nutrition_adherence?: 'Followed' | 'Partially followed' | 'Did not follow' | string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SubstitutionOption {
  name: string;
  reason: string;
}

export interface MealItem {
  id: string;
  meal_id: string;
  food_name: string;
  portion: string;
  category: string;
  substitution_options: SubstitutionOption[];
}

export interface Meal {
  id: string;
  title: string;
  meal_type: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
  phase_target: string;
  dietary_preference: DietaryPreference;
  description: string;
  key_nutrients: string[];
  prep_time_min: number;
  items?: MealItem[];
}

export interface RecommendedMeal {
  meal: Meal;
  completed: boolean;
  phase_focus: PhaseType;
}

export type AnimationType =
  | 'squat_pattern'
  | 'push_pattern'
  | 'static_hold'
  | 'jumping_pattern'
  | 'lunge_pattern'
  | 'plank_pattern'
  | 'stretch_pattern';

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[];
  difficulty: FitnessLevel;
  equipment: string;
  type: 'reps' | 'time';
  default_reps: number;
  default_duration_seconds: number;
  rest_seconds: number;
  instructions: string[];
  common_mistakes: string[];
  quiet_friendly: boolean;
  low_impact: boolean;
  animation_type: AnimationType;
  progression_exercise_id?: string;
  regression_exercise_id?: string;
}

export interface WorkoutExercise {
  exercise_id: string;
  exercise?: Exercise;
  order_index: number;
  mode: 'reps' | 'time';
  target: number;
  target_seconds: number;
  rest_seconds: number;
}

export interface Workout {
  id: string;
  title: string;
  description: string;
  category: string;
  phase_target: string;
  intensity: string;
  estimated_duration_min: number;
  is_quiet: boolean;
  is_low_impact: boolean;
  exercises?: WorkoutExercise[];
}

export interface DailyRecommendation {
  date: string;
  cycle_phase: PhaseType;
  cycle_day: number;
  workout: Workout | null;
  workout_focus: string;
  intensity_level: string;
  nutrition_focus: string;
  recommended_nutrients: string[];
  hydration_target_ml: number;
  hydration_tip: string;
  recovery_note: string;
  is_pcos_adapted: boolean;
  personalization_reason?: string;
  disclaimer: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  unlocked: boolean;
  unlocked_at?: string;
  progress: number;
  max_progress: number;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_id: string;
  workout_title: string;
  status: 'COMPLETED' | 'SKIPPED' | 'IN_PROGRESS';
  duration_seconds: number;
  completion_rate: number;
  perceived_effort?: 'Too easy' | 'Good' | 'Hard';
  scheduled_date: string;
  started_at: string;
  completed_at?: string;
}

export type CalendarFilter =
  | 'all'
  | 'cycle'
  | 'exercise'
  | 'nutrition'
  | 'hydration'
  | 'mood'
  | 'energy'
  | 'sleep'
  | 'consistency';

export interface CalendarDay {
  date: string;
  day_of_month: number;
  day_of_week: string;
  is_future: boolean;
  is_today: boolean;
  cycle_day: number;
  estimated_phase: PhaseType;
  is_period: boolean;
  is_estimated_period: boolean;
  is_ovulation_window: boolean;
  workout_status: 'COMPLETED' | 'SKIPPED' | 'NONE';
  workout_title?: string;
  workout_minutes?: number;
  nutrition_status: 'Followed' | 'Partial' | 'Not followed' | 'Not logged';
  meals_completed: number;
  water_ml: number;
  water_target_ml: number;
  water_percentage: number;
  mood?: string;
  energy?: string;
  sleep?: string;
  bloating?: string;
  cramps?: string;
  checkin_completed: boolean;
  consistency_score: number;
}

export interface MonthSummary {
  month: string;
  days_in_month: number;
  days: CalendarDay[];
  active_filter: CalendarFilter;
  checkin_streak_days: number;
  workout_streak_days: number;
  hydration_streak: number;
  overall_consistency_score: number;
  supportive_streak_message: string;
}


// ==========================================
// AVATAR STUDIO & DIGITAL IDENTITY
// ==========================================

export type AvatarStyle = 'celestial' | 'cybernetic' | 'bioluminescent' | 'ethereal';
export type AvatarAuraColor = 'rose' | 'sapphire' | 'violet' | 'amber' | 'emerald';
export type AvatarGlowIntensity = 'soft' | 'radiant' | 'hyper';

export interface UserAvatar {
  id: string;
  sourceImage?: string; // Data URL or uploaded preview
  generatedAvatarUrl?: string; // Rendered / styled avatar
  style: AvatarStyle;
  auraColor: AvatarAuraColor;
  energyLevel: number; // 0 - 100
  title: string; // e.g. "Cosmic Voyager", "Solar Alchemist", "Harmonic Seeker"
  glowIntensity: AvatarGlowIntensity;
  createdAt: string;
}

// ==========================================
// INTELLIGENT AI COMPANION
// ==========================================

export interface CompanionMessage {
  id: string;
  sender: 'user' | 'companion' | 'system';
  text: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    route?: string;
    actionKey?: string;
  }[];
  phaseContext?: PhaseType;
}

export interface CompanionPersona {
  name: string;
  role: string;
  currentThought: string;
  energyFrequency: number;
  activeFocus: string;
}

// ==========================================
// MY UNIVERSE SPATIAL DESTINATIONS
// ==========================================

export interface UniversePortal {
  id: string;
  name: string;
  title: string;
  tagline: string;
  route: string;
  iconName: string;
  accentColor: string;
  glowColor: string;
  statusBadge: string;
  progressPercent: number;
  environmentName: string;
  coordinates: { x: number; y: number }; // normalized orbital angle/radius
}
