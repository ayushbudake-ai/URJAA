package recommendation

import (
	"testing"
	"urjaa-backend/internal/cycle"
	"urjaa-backend/internal/database"
	"urjaa-backend/internal/models"
)

func TestRecommendation_MenstrualWithCramps(t *testing.T) {
	memDB := database.NewMemoryDB()
	svc := NewService(memDB)

	input := EngineInput{
		Phase:             cycle.PhaseMenstrual,
		CycleDay:          2,
		Energy:            "Low",
		Cramps:            "Moderate",
		FitnessLevel:      "Beginner",
		Goal:              "Better overall health",
		PreferredDuration: 15,
		QuietMode:         false,
		DietPreference:    "Vegetarian",
		PCOSMode:          false,
	}

	rec := svc.GenerateRecommendation(input)
	if rec == nil {
		t.Fatalf("expected recommendation, got nil")
	}
	if rec.CyclePhase != cycle.PhaseMenstrual {
		t.Errorf("expected menstrual phase, got %s", rec.CyclePhase)
	}
	if rec.IntensityLevel != "Gentle Recovery" {
		t.Errorf("expected Gentle Recovery for menstrual with cramps, got %s", rec.IntensityLevel)
	}
	if rec.Disclaimer != models.MedicalDisclaimer {
		t.Errorf("disclaimer mismatch: got %s", rec.Disclaimer)
	}
}

func TestRecommendation_EmptyWorkoutCatalog(t *testing.T) {
	memDB := database.NewMemoryDB()
	// Clear workouts to simulate missing or empty workout table
	memDB.Storage.Workouts = make(map[string]*database.WorkoutRecord)
	svc := NewService(memDB)

	input := EngineInput{
		Phase:             cycle.PhaseFollicular,
		CycleDay:          5,
		Energy:            "High",
		FitnessLevel:      "Beginner",
		Goal:              "Build strength",
		PreferredDuration: 20,
	}

	rec := svc.GenerateRecommendation(input)
	if rec == nil {
		t.Fatalf("expected recommendation even with empty workouts catalog")
	}
	if rec.Workout != nil {
		t.Errorf("expected workout to be nil when catalog is empty, got %+v", rec.Workout)
	}
	if rec.NutritionFocus == "" || rec.HydrationTargetML <= 0 {
		t.Errorf("expected valid nutrition and hydration targets despite missing workouts")
	}
}

func TestRecommendation_NewUserNoHistory(t *testing.T) {
	memDB := database.NewMemoryDB()
	svc := NewService(memDB)

	input := EngineInput{
		Phase:             cycle.PhaseMenstrual,
		CycleDay:          1,
		FitnessLevel:      "Beginner",
		Goal:              "Better overall health",
		PreferredDuration: 15,
	}

	rec := svc.GenerateRecommendation(input)
	if rec == nil {
		t.Fatalf("expected recommendation for new user")
	}
	if rec.Workout == nil {
		t.Fatalf("expected seeded default workout for new user, got nil")
	}
	if len(rec.Workout.Exercises) == 0 {
		t.Errorf("expected workout to contain exercises")
	}
}

func TestRecommendation_PCOSMode(t *testing.T) {
	memDB := database.NewMemoryDB()
	svc := NewService(memDB)

	input := EngineInput{
		Phase:             cycle.PhaseFollicular,
		CycleDay:          8,
		Energy:            "High",
		FitnessLevel:      "Beginner",
		Goal:              "Weight management",
		PreferredDuration: 15,
		PCOSMode:          true,
	}

	rec := svc.GenerateRecommendation(input)
	if !rec.IsPCOSAdapted {
		t.Errorf("expected PCOS adaptation flag true")
	}
	if rec.Disclaimer != models.MedicalDisclaimer {
		t.Errorf("disclaimer missing in PCOS mode")
	}
}
