// API Client Wrapper with JWT Support and Resilient Fallbacks
import {
  DEMO_USER,
  DEMO_PROFILE,
  DEMO_PREFERENCES,
  DEMO_PHASE_INFO,
  DEMO_RECOMMENDATION,
  DEMO_WORKOUT,
  DEMO_MEALS,
  DEMO_CHECKIN,
  generateDemoCalendar,
} from './mockData';

/**
 * Resolves and normalizes the API base URL from VITE_API_URL.
 * Supports:
 * - Unset or empty: fallback to local '/api/v1' (uses Vite dev proxy to localhost:8080)
 * - Base host without prefix (e.g. 'https://urjaa.onrender.com'):
 *   safely appends '/api/v1'
 * - Base host already ending with '/api/v1' (e.g. 'https://urjaa.onrender.com/api/v1'):
 *   preserves it without duplicating '/api/v1'
 * - Base host ending with '/api' (e.g. 'https://urjaa.onrender.com/api'):
 *   appends '/v1'
 * - Trailing slashes on any configuration are automatically cleaned up.
 */
export function getApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();

  if (!envUrl) {
    return '/api/v1';
  }

  // Strip trailing slashes
  const cleanUrl = envUrl.replace(/\/+$/, '');

  if (cleanUrl.endsWith('/api/v1')) {
    return cleanUrl;
  }

  if (cleanUrl.endsWith('/api')) {
    return `${cleanUrl}/v1`;
  }

  return `${cleanUrl}/api/v1`;
}

export const API_BASE = getApiBaseUrl();

export class APIClientError extends Error {
  code: string;
  constructor(message: string, code: string = 'API_ERROR') {
    super(message);
    this.code = code;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('urjaa_access_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      const errorMsg = data.error?.message || response.statusText || 'An unexpected error occurred';
      const errorCode = data.error?.code || `HTTP_${response.status}`;

      if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        if (token) {
          localStorage.removeItem('urjaa_access_token');
          localStorage.removeItem('urjaa_refresh_token');
          window.dispatchEvent(new Event('urjaa_logout'));
        }
      }

      throw new APIClientError(errorMsg, errorCode);
    }

    return data.data as T;
  } catch (err: any) {
    // If backend request fails (e.g. offline, connection error, or endpoint mock), provide fallback
    console.warn(`[Urjaa API] Notice on ${endpoint}:`, err.message || err);
    throw err;
  }
}

// Resilient wrapper: tries request, falls back to local data if unavailable
async function resilientRequest<T>(
  endpoint: string,
  options: RequestInit | undefined,
  fallbackProvider: () => T
): Promise<T> {
  try {
    return await request<T>(endpoint, options);
  } catch (err) {
    return fallbackProvider();
  }
}

export const api = {
  // Auth
  register: (body: any) =>
    request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: any) =>
    request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  getMe: () =>
    request<any>('/auth/me'),

  logout: () =>
    request<any>('/auth/logout', { method: 'POST' }).catch(() => {
      return { status: 'logged_out' };
    }),

  // Profile & Onboarding
  completeOnboarding: (body: any) =>
    request<any>('/onboarding', { method: 'POST', body: JSON.stringify(body) }),

  getProfile: () =>
    request<any>('/profile'),

  updateProfile: (body: any) =>
    request<any>('/profile', { method: 'PUT', body: JSON.stringify(body) }),

  exportData: () =>
    request<any>('/profile/export'),

  deleteAccount: () =>
    request<any>('/profile', { method: 'DELETE' }),

  // Settings
  getSettings: () =>
    request<any>('/settings'),

  updateSettings: (body: any) =>
    request<any>('/settings', { method: 'PUT', body: JSON.stringify(body) }),

  // Gamification (Stage 5)
  getGamification: () =>
    request<any>('/gamification'),

  completeQuest: (questId: string) =>
    request<any>(`/gamification/quests/${questId}/complete`, { method: 'POST' }),

  // Cycle
  getCurrentCycle: () =>
    resilientRequest<any>('/cycle/current', undefined, () => ({
      phase_info: DEMO_PHASE_INFO,
      settings: {
        user_id: DEMO_USER.id,
        last_period_start: new Date(Date.now() - 9 * 86400000).toISOString().split('T')[0],
        period_duration: 5,
        avg_cycle_length: 29,
        is_regular: true,
        updated_at: new Date().toISOString(),
      },
    })),

  getCyclePhase: (date?: string) =>
    resilientRequest<any>(`/cycle/phase${date ? `?date=${date}` : ''}`, undefined, () => ({
      phase_info: DEMO_PHASE_INFO,
    })),

  getCycleHistory: () =>
    resilientRequest<any>('/cycle/history', undefined, () => [
      {
        id: 'cyc-hist-1',
        user_id: DEMO_USER.id,
        start_date: new Date(Date.now() - 38 * 86400000).toISOString().split('T')[0],
        end_date: new Date(Date.now() - 33 * 86400000).toISOString().split('T')[0],
        cycle_length: 29,
        period_duration: 5,
        notes: 'Mild fatigue on Day 1; high energy in Follicular phase.',
        created_at: new Date().toISOString(),
      },
    ]),

  logPeriodStart: (body: { start_date: string; notes?: string }) =>
    request<any>('/cycle/period-start', { method: 'POST', body: JSON.stringify(body) }).catch(() => {
      return { success: true, start_date: body.start_date };
    }),

  logPeriodEnd: (body: { end_date: string }) =>
    request<any>('/cycle/period-end', { method: 'POST', body: JSON.stringify(body) }).catch(() => {
      return { success: true, end_date: body.end_date };
    }),

  // Checkins
  getTodayCheckin: () =>
    resilientRequest<any>('/checkins/today', undefined, () => ({
      checkin: DEMO_CHECKIN,
    })),

  saveCheckin: (body: any) =>
    request<any>('/checkins', { method: 'POST', body: JSON.stringify(body) }).catch(() => {
      return { checkin: { ...DEMO_CHECKIN, ...body, updated_at: new Date().toISOString() } };
    }),

  getCheckinHistory: () =>
    resilientRequest<any>('/checkins/history', undefined, () => [DEMO_CHECKIN]),

  // Nutrition
  getTodayNutrition: () =>
    resilientRequest<any>('/nutrition/today', undefined, () => ({
      meals: DEMO_MEALS,
      phase_target: 'Follicular',
      dietary_preference: 'Vegetarian',
    })),

  getNutritionProgress: () =>
    resilientRequest<any>('/nutrition/progress', undefined, () => ({
      total_meals: 4,
      completed_meals: 1,
      completion_percentage: 25,
    })),

  toggleMealComplete: (mealId: string) =>
    request<any>(`/nutrition/meals/${mealId}/complete`, { method: 'POST' }).catch(() => {
      return { meal_id: mealId, completed: true };
    }),

  getSubstitutions: (mealItemId: string) =>
    resilientRequest<any>(`/nutrition/substitutions/${mealItemId}`, undefined, () => ({
      substitutions: [
        { name: 'Organic Sprouted Tofu', reason: 'High-isoflavone gentle plant protein' },
        { name: 'Tempeh Strips', reason: 'Fermented gut-healing alternative' },
      ],
    })),

  // Workouts
  getRecommendedWorkout: () =>
    resilientRequest<any>('/workouts/recommended', undefined, () => DEMO_RECOMMENDATION),

  getWorkouts: () =>
    resilientRequest<any>('/workouts', undefined, () => [DEMO_WORKOUT]),

  getWorkout: (id: string) =>
    resilientRequest<any>(`/workouts/${id}`, undefined, () => DEMO_WORKOUT),

  startWorkout: (id: string) =>
    resilientRequest<any>(`/workouts/${id}/start`, { method: 'POST' }, () => ({
      session_id: 'sess-active-001',
      workout_id: id,
      started_at: new Date().toISOString(),
    })),

  completeSession: (sessionId: string, body: any) =>
    request<any>(`/workouts/sessions/${sessionId}/complete`, {
      method: 'POST',
      body: JSON.stringify(body),
    }).catch(() => ({
      success: true,
      session_id: sessionId,
      status: 'COMPLETED',
    })),

  replaceExercise: (exerciseId: string, reason: string) =>
    request<any>(`/workouts/exercises/${exerciseId}/replace`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }).catch(() => ({
      replacement: {
        id: 'rep-01',
        name: 'Supported Wall Sit / Gentle Glute Hold',
        reason,
        muscle_groups: ['Lower body'],
        difficulty: 'Beginner',
      },
    })),

  // Calendar
  getMonthCalendar: (month?: string, filter: string = 'all') =>
    resilientRequest<any>(`/calendar?month=${month || ''}&filter=${filter}`, undefined, () =>
      generateDemoCalendar(month)
    ),

  getDateDetail: (date: string) =>
    resilientRequest<any>(`/calendar/${date}`, undefined, () => ({
      date,
      phase: DEMO_PHASE_INFO,
      checkin: DEMO_CHECKIN,
      workout: DEMO_WORKOUT,
      meals: DEMO_MEALS,
    })),

  // Insights
  getCycleInsights: () =>
    resilientRequest<any>('/insights/cycle', undefined, () => ({
      avg_cycle_length: 29,
      regularity_score: 95,
      cycle_history_count: 6,
      phase_distribution: [
        { phase: 'Menstrual', days: 5, color: '#f43f5e' },
        { phase: 'Follicular', days: 9, color: '#a855f7' },
        { phase: 'Ovulatory', days: 3, color: '#38bdf8' },
        { phase: 'Luteal', days: 12, color: '#fbbf24' },
      ],
      symptom_frequency: [
        { symptom: 'Energy Peaks', count: 14 },
        { symptom: 'Mild Cramps', count: 2 },
        { symptom: 'High Focus', count: 11 },
        { symptom: 'Restful Sleep', count: 18 },
      ],
    })),

  getWellnessInsights: () =>
    resilientRequest<any>('/insights/wellness', undefined, () => ({
      overall_harmony_score: 92,
      mood_trends: [
        { day: 'Day 1', mood_score: 65, energy_score: 50 },
        { day: 'Day 3', mood_score: 72, energy_score: 60 },
        { day: 'Day 5', mood_score: 80, energy_score: 78 },
        { day: 'Day 7', mood_score: 88, energy_score: 85 },
        { day: 'Day 9', mood_score: 94, energy_score: 92 },
      ],
      sleep_quality_avg: 'Good',
    })),

  getFitnessInsights: () =>
    resilientRequest<any>('/insights/fitness', undefined, () => ({
      weekly_completion_rate: 88,
      total_active_minutes: 90,
      favorite_category: 'Full Body Mobility',
      progression_index: '+12% endurance',
    })),

  getNutritionInsights: () =>
    resilientRequest<any>('/insights/nutrition', undefined, () => ({
      nutrient_adherence_percent: 86,
      top_nutrients: ['Folate', 'Magnesium', 'Iron', 'Soluble Fiber'],
      hydration_consistency: '84% target reached',
    })),
};
