package models

import (
	"encoding/json"
	"net/http"
	"time"
)

// Response Envelope
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   *APIError   `json:"error,omitempty"`
}

type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func RespondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(APIResponse{
		Success: true,
		Data:    data,
	})
}

func RespondError(w http.ResponseWriter, status int, code, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(APIResponse{
		Success: false,
		Error: &APIError{
			Code:    code,
			Message: message,
		},
	})
}

// User Models
type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type UserProfile struct {
	UserID                   string    `json:"user_id"`
	Name                     string    `json:"name"`
	AvatarID                 string    `json:"avatar_id,omitempty"`
	AvatarURL                string    `json:"avatar_url,omitempty"`
	CompanionName            string    `json:"companion_name,omitempty"`
	WellnessGoal             string    `json:"wellness_goal"`
	PrimaryGoal              string    `json:"primary_goal,omitempty"`
	SecondaryGoals           []string  `json:"secondary_goals,omitempty"`
	FitnessLevel             string    `json:"fitness_level"`
	PreferredWorkoutDuration int       `json:"preferred_workout_duration"`
	WorkoutLocation          string    `json:"workout_location,omitempty"`
	AvailableEquipment       []string  `json:"available_equipment,omitempty"`
	PreferredActivities      []string  `json:"preferred_activities,omitempty"`
	DietaryPreference        string    `json:"dietary_preference"`
	ExerciseLimitations      []string  `json:"exercise_limitations"`
	PCOSPCODMode             bool      `json:"pcos_pcod_mode"`
	UpdatedAt                time.Time `json:"updated_at"`
}

type UserPreferences struct {
	UserID          string    `json:"user_id"`
	ThemePreference string    `json:"theme_preference"` // light, dark, system
	QuietMode       bool      `json:"quiet_mode"`
	CompanionName   string    `json:"companion_name,omitempty"`
	NotifyPeriod    bool      `json:"notify_period"`
	NotifyCheckin   bool      `json:"notify_checkin"`
	NotifyHydration bool      `json:"notify_hydration"`
	NotifyWorkout   bool      `json:"notify_workout"`
	NotifyNutrition bool      `json:"notify_nutrition"`
	NotifyInsights  bool      `json:"notify_insights"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// Cycle Models
type CycleSettings struct {
	UserID          string    `json:"user_id"`
	LastPeriodStart string    `json:"last_period_start"` // YYYY-MM-DD
	PeriodDuration  int       `json:"period_duration"`
	AvgCycleLength  int       `json:"avg_cycle_length"`
	IsRegular       bool      `json:"is_regular"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type CycleRecord struct {
	ID             string    `json:"id"`
	UserID         string    `json:"user_id"`
	StartDate      string    `json:"start_date"`
	EndDate        *string   `json:"end_date,omitempty"`
	CycleLength    *int      `json:"cycle_length,omitempty"`
	PeriodDuration int       `json:"period_duration"`
	Notes          string    `json:"notes,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
}

// Daily Check-in Models
type DailyCheckin struct {
	ID                 string    `json:"id"`
	UserID             string    `json:"user_id"`
	Date               string    `json:"date"`               // YYYY-MM-DD
	BleedingStatus     string    `json:"bleeding_status"`    // period_started, period_continuing, period_ended, no_bleeding
	Mood               string    `json:"mood,omitempty"`     // Great, Good, Okay, Low, Bad
	Energy             string    `json:"energy,omitempty"`   // High, Medium, Low
	Bloating           string    `json:"bloating,omitempty"` // None, Mild, Moderate, High
	Cramps             string    `json:"cramps,omitempty"`   // None, Mild, Moderate, Severe
	Sleep              string    `json:"sleep,omitempty"`    // Good, Okay, Poor
	WaterML            int       `json:"water_ml"`
	NutritionAdherence string    `json:"nutrition_adherence,omitempty"` // Followed, Partially followed, Did not follow
	Notes              string    `json:"notes,omitempty"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

// Gamification Models (Stage 5 & Stage 6)
type Quest struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Category    string `json:"category"`   // movement, strength, flexibility, mindfulness, nutrition, hydration
	Difficulty  string `json:"difficulty"` // Beginner, Intermediate, Advanced
	DurationMin int    `json:"duration_min"`
	XPReward    int    `json:"xp_reward"`
	Completed   bool   `json:"completed"`
	CompletedAt string `json:"completed_at,omitempty"`
	ActionLabel string `json:"action_label"`
	ActionRoute string `json:"action_route,omitempty"`
	ExerciseID  string `json:"exercise_id,omitempty"`
	MealID      string `json:"meal_id,omitempty"`
	AssetKey    string `json:"asset_key,omitempty"`
}

type Achievement struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Category    string `json:"category"` // quest, movement, mindfulness, strength, consistency, level
	Icon        string `json:"icon"`
	Unlocked    bool   `json:"unlocked"`
	UnlockedAt  string `json:"unlocked_at,omitempty"`
	Progress    int    `json:"progress"`
	MaxProgress int    `json:"max_progress"`
}

type GamificationState struct {
	UserID         string         `json:"user_id"`
	Level          int            `json:"level"`
	LevelTitle     string         `json:"level_title"`
	CurrentXP      int            `json:"current_xp"`
	XPForNextLevel int            `json:"xp_for_next_level"`
	TotalXPEarned  int            `json:"total_xp_earned"`
	StreakDays     int            `json:"streak_days"`
	Quests         []*Quest       `json:"quests"`
	Achievements   []*Achievement `json:"achievements"`
	LastActiveDate string         `json:"last_active_date"`
}

// Medical & Wellness Disclaimer Constant (Single source of truth per §9)
const MedicalDisclaimer = "Urjaa provides wellness and educational recommendations and does not replace professional medical care."
