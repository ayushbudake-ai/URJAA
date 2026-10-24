# URJAA Full-Stack Engineering Handover & Context Document

> **Project**: URJAA (Women's Cycle-Aware Wellness & AI Companion Platform)  
> **Repository**: https://github.com/ayushbudake-ai/URJAA  
> **Backend Deployment**: Render (`https://urjaa.onrender.com/api/v1`)  
> **Frontend Deployment**: Vercel  
> **Stack**: Go (net/http, PostgreSQL, in-memory repository) + React (TypeScript, Vite, Tailwind CSS, Recharts)

---

## 1. Executive Summary of What Was Done

This session resolved three major categories of backend and frontend production issues:
1. **Resolved Go Compilation Failure**: Missing model definitions (`Achievement`, `GamificationState.Achievements`) caused by a prior merge conflict.
2. **Configured Frontend-to-Backend Cloud Communication**: Replaced hardcoded relative API paths with an environment-driven `VITE_API_URL` pipeline that handles URL normalization and avoids segment duplication.
3. **Fixed Production Runtime Errors & Crashes**:
   - Fixed the critical React crash `TypeError: Cannot read properties of null (reading 'exercises')`.
   - Handled duplicate registration `HTTP 409 Conflict` gracefully with preserved input state and sign-in shortcuts.
   - Fixed `404 Not Found` errors for `favicon.svg` and Vercel SPA client route refreshes (`vercel.json`).
   - Added a React `ErrorBoundary` safety net to prevent white-screen crashes.

---

## 2. Issues & Root Cause Diagnoses

### Issue A: Go Build Errors
* **Errors**:
  - `internal/gamification/gamification_handler.go:169`: undefined `models.Achievement`
  - `internal/gamification/gamification_handler.go:212`: undefined `models.Achievement`
  - `internal/gamification/gamification_handler.go:313`: `models.GamificationState` has no field or method `Achievements`
* **Root Cause**:
  A git merge conflict resolution had accepted an older version of `internal/models/models.go` (Stage 5) while keeping the Stage 6 gamification handler in `internal/gamification/gamification_handler.go`.
* **Fix**:
  - Added `type Achievement struct` to `models.go` matching the TypeScript interface and JSON tags.
  - Added `Achievements []*Achievement` to `models.GamificationState`.
  - Maintained dynamic achievement evaluation on all state refresh and quest completion paths in `gamification_handler.go`.
  - Added assertions in `gamification_test.go`.

### Issue B: React Crash `TypeError: Cannot read properties of null (reading 'exercises')`
* **Symptoms**: Minified production error `index-*.js: Cannot read properties of null (reading 'exercises')`, causing HomePage dashboard crash.
* **Root Cause (Dual Backend + Frontend)**:
  1. **Backend**: On Render with PostgreSQL connected (`IsMock == false`), `NewMemoryStorage()` was initialized without calling `SeedDefaultData()`. Consequently, `Storage.Workouts` and `Storage.Exercises` were empty maps. When `GenerateRecommendation()` ran, no workout could be matched, returning `rec.Workout = nil`.
  2. **Frontend**: In `HomePage.tsx`, `{recommendation ? (<WorkoutCard workout={recommendation.workout} />) : ...}` evaluated to `true` because `recommendation` was a valid object containing `workout: null`. Passing `null` to `WorkoutCard` caused `workout.exercises` to throw an uncaught TypeError.
* **Fix**:
  - **Backend**: Called `storage.SeedDefaultData()` inside `NewMemoryStorage()` in `storage.go`, ensuring all 50+ exercises and workout templates are always populated in the in-memory cache.
  - **Frontend**:
    - Updated `DailyRecommendation.workout` in `types/index.ts` to `Workout | null`.
    - Added null checks in `WorkoutCard.tsx` (`if (!workout) return <Card>...`) and safe extraction (`workout.exercises || []`).
    - Guarded `recommendation?.workout` in `HomePage.tsx`.
    - Added empty checks and safe fallbacks in `WorkoutSession.tsx` and `WorkoutPage.tsx`.
    - Added `ErrorBoundary.tsx` wrapping the application in `main.tsx`.

### Issue C: Registration HTTP 409 (`USER_EXISTS`)
* **Symptoms**: Notice `[Urjaa API] Notice on /auth/register: A user with this email already exists`.
* **Fix**:
  - In `RegisterPage.tsx`, caught `USER_EXISTS` / `HTTP_409` errors.
  - Displayed a clear error message: *"An account with this email already exists. Please sign in or use a different email address."*
  - Added an inline link `<Link to="/login">Go to Sign In &rarr;</Link>`.
  - Retained the user's entered `name` and `email` state so they don't have to retype them.

### Issue D: HTTP 404 Responses
* **Symptoms**: Browser console reported 404 on `favicon.svg` and on direct browser refresh on Vercel routes.
* **Root Causes**:
  - No `public/favicon.svg` asset existed in the repository.
  - No `vercel.json` SPA rewrite rules existed, causing Vercel to look for static `.html` files for routes like `/home`, `/login`, etc.
* **Fix**:
  - Created `frontend/public/favicon.svg` with Urjaa branded SVG icon (auto-copied to `dist/` on build).
  - Created `frontend/vercel.json` and `vercel.json` with rewrite rules `/(.*) -> /index.html`.

### Issue E: API URL Configuration
* **Fix**:
  - Implemented `getApiBaseUrl()` in `frontend/src/api/client.ts` to dynamically resolve `import.meta.env.VITE_API_URL`.
  - Normalizes trailing slashes and handles both root domains (`https://urjaa.onrender.com`) and prefixed URLs (`https://urjaa.onrender.com/api/v1`) without duplicating `/api/v1`.
  - Falls back to `/api/v1` in local development to utilize the Vite dev proxy (`localhost:8080`).

---

## 3. Files Modified & Created

### Backend:
- `backend/internal/models/models.go`: Added `Achievement` struct and `Achievements` field to `GamificationState`.
- `backend/internal/gamification/gamification_handler.go`: Ensured `Achievements` are evaluated across all retrieval and completion paths.
- `backend/internal/gamification/gamification_test.go`: Added achievement assertions.
- `backend/internal/database/storage.go`: Seeded default data inside `NewMemoryStorage()`.
- `backend/internal/recommendation/recommendation_service_test.go`: Added tests for empty workout catalogs and new users.

### Frontend:
- `frontend/src/api/client.ts`: Configured `getApiBaseUrl()` with `VITE_API_URL` normalization.
- `frontend/src/types/index.ts`: Made `DailyRecommendation.workout` nullable (`Workout | null`).
- `frontend/src/components/workout/WorkoutCard.tsx`: Added null safety for `workout` and `exercises`.
- `frontend/src/components/workout/WorkoutSession.tsx`: Added empty exercise list guard.
- `frontend/src/components/nutrition/MealCard.tsx`: Added null guard for missing meal data.
- `frontend/src/pages/HomePage.tsx`: Guarded `recommendation?.workout` and `todayMeals`.
- `frontend/src/pages/WorkoutPage.tsx`: Handled empty workout catalogs gracefully.
- `frontend/src/pages/RegisterPage.tsx`: Enhanced HTTP 409 user-friendly handling and sign-in redirect.
- `frontend/src/components/common/ErrorBoundary.tsx` *(new)*: Global error boundary component.
- `frontend/src/main.tsx`: Wrapped root tree with `<ErrorBoundary>`.
- `frontend/public/favicon.svg` *(new)*: Created brand SVG favicon.
- `frontend/vercel.json` *(new)*: Vercel SPA rewrite configuration.
- `vercel.json` *(new)*: Root Vercel SPA rewrite configuration.
- `frontend/.env.example`: Updated with production and local API URL guidance.

---

## 4. Verification & Test Results

1. **Go Vet & Tests**:
   - `go vet ./...` $\rightarrow$ 0 warnings / errors.
   - `go test -v ./...` $\rightarrow$ 100% tests PASS (auth, calendar, cycle, gamification, recommendation).
2. **Frontend Typecheck & Production Build**:
   - `tsc && vite build` $\rightarrow$ Compiled with 0 TypeScript errors in ~28 seconds.
   - Generated valid bundle in `dist/` with `favicon.svg`.
3. **Live API Integration**:
   - Verified `https://urjaa.onrender.com/api/v1/health` $\rightarrow$ HTTP 200 OK.
   - Verified preflight `OPTIONS` requests $\rightarrow$ HTTP 200 OK with CORS headers.
   - Verified registration and duplicate `HTTP 409 Conflict` envelope.
