package gamification

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"urjaa-backend/internal/database"
	"urjaa-backend/internal/middleware"
	"urjaa-backend/internal/models"
)

func setupTestHandler(userID string) (*Handler, *database.DB) {
	storage := database.NewMemoryStorage()
	db := &database.DB{Storage: storage}

	// Seed profile with primary fitness goal
	storage.Profiles[userID] = &models.UserProfile{
		UserID:      userID,
		PrimaryGoal: "Build strength",
		UpdatedAt:   time.Now(),
	}

	handler := NewHandler(db)
	return handler, db
}

func TestGamificationInitialState(t *testing.T) {
	userID := "test-user-001"
	handler, _ := setupTestHandler(userID)

	req := httptest.NewRequest("GET", "/api/v1/gamification", nil)
	ctx := context.WithValue(req.Context(), middleware.UserIDKey, userID)
	req = req.WithContext(ctx)

	w := httptest.NewRecorder()
	handler.GetGamification(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d: %s", w.Code, w.Body.String())
	}

	var resp struct {
		Success bool                     `json:"success"`
		Data    models.GamificationState `json:"data"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if resp.Data.Level != 1 {
		t.Errorf("Expected initial level 1, got %d", resp.Data.Level)
	}
	if resp.Data.LevelTitle != "Gentle Spark" {
		t.Errorf("Expected title 'Gentle Spark', got %s", resp.Data.LevelTitle)
	}
	if resp.Data.TotalXPEarned != 0 {
		t.Errorf("Expected initial total XP 0, got %d", resp.Data.TotalXPEarned)
	}
	if len(resp.Data.Quests) != 4 {
		t.Errorf("Expected 4 daily quests, got %d", len(resp.Data.Quests))
	}
	if len(resp.Data.Achievements) != 7 {
		t.Errorf("Expected 7 achievements, got %d", len(resp.Data.Achievements))
	}
}

func TestCompleteQuestAndIdempotency(t *testing.T) {
	userID := "test-user-002"
	handler, _ := setupTestHandler(userID)

	// 1. Complete movement quest first time (+80 XP)
	req1 := httptest.NewRequest("POST", "/api/v1/gamification/quests/quest-movement/complete", nil)
	ctx1 := context.WithValue(req1.Context(), middleware.UserIDKey, userID)
	req1 = req1.WithContext(ctx1)

	w1 := httptest.NewRecorder()
	handler.CompleteQuest(w1, req1)

	if w1.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d: %s", w1.Code, w1.Body.String())
	}

	var resp1 struct {
		Success bool `json:"success"`
		Data    struct {
			EarnedXP int                      `json:"earned_xp"`
			State    models.GamificationState `json:"state"`
		} `json:"data"`
	}
	if err := json.Unmarshal(w1.Body.Bytes(), &resp1); err != nil {
		t.Fatalf("Failed to unmarshal resp1: %v", err)
	}

	if resp1.Data.EarnedXP != 80 {
		t.Errorf("Expected 80 earned XP, got %d", resp1.Data.EarnedXP)
	}
	if resp1.Data.State.TotalXPEarned != 80 {
		t.Errorf("Expected total XP 80, got %d", resp1.Data.State.TotalXPEarned)
	}

	// 2. Complete again (idempotent duplicate request) -> should earn 0 XP and not inflate total
	req2 := httptest.NewRequest("POST", "/api/v1/gamification/quests/quest-movement/complete", nil)
	ctx2 := context.WithValue(req2.Context(), middleware.UserIDKey, userID)
	req2 = req2.WithContext(ctx2)

	w2 := httptest.NewRecorder()
	handler.CompleteQuest(w2, req2)

	if w2.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK on duplicate, got %d", w2.Code)
	}

	var resp2 struct {
		Success bool `json:"success"`
		Data    struct {
			EarnedXP int                      `json:"earned_xp"`
			State    models.GamificationState `json:"state"`
		} `json:"data"`
	}
	if err := json.Unmarshal(w2.Body.Bytes(), &resp2); err != nil {
		t.Fatalf("Failed to unmarshal resp2: %v", err)
	}

	if resp2.Data.EarnedXP != 0 {
		t.Errorf("Expected 0 earned XP for duplicate completion, got %d", resp2.Data.EarnedXP)
	}
	if resp2.Data.State.TotalXPEarned != 80 {
		t.Errorf("Expected total XP to remain 80, got %d", resp2.Data.State.TotalXPEarned)
	}

	// 3. Verify achievement unlocked
	firstQuestUnlocked := false
	for _, ach := range resp2.Data.State.Achievements {
		if ach.ID == "ach-first-quest" && ach.Unlocked {
			firstQuestUnlocked = true
		}
	}
	if !firstQuestUnlocked {
		t.Errorf("Expected 'ach-first-quest' achievement to be unlocked after quest completion")
	}
}
