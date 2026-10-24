import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  PhaseInfo,
  DailyCheckin,
  DailyRecommendation,
  RecommendedMeal,
  Meal,
  Exercise,
} from '../types';
import {
  DEMO_PHASE_INFO,
  DEMO_RECOMMENDATION,
  DEMO_MEALS,
} from '../api/mockData';
import {
  getGamificationState,
  completeQuest,
  GamificationState,
} from '../services/gamificationService';

import { WellnessProgressSummary } from '../components/dashboard/WellnessProgressSummary';
import { DailyQuestsSection } from '../components/dashboard/DailyQuestsSection';
import { QuickWellnessCheckin } from '../components/dashboard/QuickWellnessCheckin';
import { RecentActivitySummary } from '../components/dashboard/RecentActivitySummary';
import { CompanionPresenceCard } from '../components/companion/CompanionPresenceCard';
import { UserAvatarBadge } from '../components/avatar/UserAvatarBadge';
import { ExerciseDetailModal } from '../components/exercise/ExerciseDetailModal';

import { PhaseBadge } from '../components/cycle/PhaseBadge';
import { CycleRing } from '../components/cycle/CycleRing';
import { PeriodLoggerModal } from '../components/cycle/PeriodLoggerModal';
import { WorkoutCard } from '../components/workout/WorkoutCard';
import { WaterTracker } from '../components/checkin/WaterTracker';
import { MealCard } from '../components/nutrition/MealCard';
import { SubstitutionModal } from '../components/nutrition/SubstitutionModal';
import { CompanionDrawer } from '../components/companion/CompanionDrawer';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Skeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/ErrorState';

import {
  Activity,
  CheckCircle2,
  Sparkles,
  MessageCircle,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, hasSettings, refreshUserData } = useAuth();

  const companionName = profile?.companion_name || 'Aura';

  const [phaseInfo, setPhaseInfo] = useState<PhaseInfo | null>(DEMO_PHASE_INFO);
  const [recommendation, setRecommendation] = useState<DailyRecommendation | null>(DEMO_RECOMMENDATION);
  const [todayCheckin, setTodayCheckin] = useState<DailyCheckin | null>(null);
  const [todayMeals, setTodayMeals] = useState<RecommendedMeal[]>(DEMO_MEALS);
  const [waterML, setWaterML] = useState<number>(0);

  // Gamification & Daily Quests state scoped to authenticated user
  const [gamification, setGamification] = useState<GamificationState>(() =>
    getGamificationState(user?.id)
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isPeriodLoggerOpen, setIsPeriodLoggerOpen] = useState<boolean>(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState<boolean>(false);
  const [substituteMeal, setSubstituteMeal] = useState<Meal | null>(null);
  const [isCompanionOpen, setIsCompanionOpen] = useState<boolean>(false);
  const [activeExerciseModal, setActiveExerciseModal] = useState<Exercise | null>(null);

  // Celebration banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenExercise = (quest?: any) => {
    const title = quest?.title?.toLowerCase() || '';
    if (title.includes('squat')) {
      setActiveExerciseModal({
        id: 'ex-squat',
        name: quest?.title || 'Gentle Bodyweight Squats',
        category: 'Strength & Alignment',
        muscle_groups: ['Quads', 'Glutes', 'Core'],
        difficulty: 'Beginner',
        equipment: 'Bodyweight',
        type: 'reps',
        default_reps: 10,
        default_duration_seconds: 60,
        rest_seconds: 30,
        instructions: [
          'Stand with feet shoulder-width apart, toes pointing comfortably outward.',
          'Hinge at hips, bend knees, and lower torso with a straight, tall spine.',
          'Descend until thighs approach parallel to the floor, tracking knees over toes.',
          'Press evenly through heels and midfoot to return smoothly to standing.'
        ],
        common_mistakes: ['Allowing knees to cave inward', 'Rounding upper spine'],
        quiet_friendly: true,
        low_impact: true,
        animation_type: 'squat_pattern',
      });
    } else if (title.includes('cat-cow') || title.includes('stretch') || title.includes('mobility') || title.includes('flow')) {
      setActiveExerciseModal({
        id: 'ex-catcow',
        name: quest?.title || 'Cat-Cow Spinal Flow',
        category: 'Spinal Mobility & Breath',
        muscle_groups: ['Spine', 'Core', 'Pelvic Basin'],
        difficulty: 'Beginner',
        equipment: 'Mat',
        type: 'time',
        default_reps: 8,
        default_duration_seconds: 90,
        rest_seconds: 15,
        instructions: [
          'Begin in tabletop position with wrists under shoulders and knees under hips.',
          'Inhale slowly as you drop belly towards floor, lift chest and tailbone gently.',
          'Exhale smoothly as you arch spine towards ceiling, releasing head between arms.',
          'Flow gently in rhythm with your breath without forcing range of motion.'
        ],
        common_mistakes: ['Hyperextending the neck', 'Holding breath during transitions'],
        quiet_friendly: true,
        low_impact: true,
        animation_type: 'stretch_pattern',
      });
    } else if (title.includes('child') || title.includes('relax') || title.includes('rest')) {
      setActiveExerciseModal({
        id: 'ex-childspose',
        name: "Restorative Child's Pose",
        category: 'Rest & Decompression',
        muscle_groups: ['Hips', 'Spine', 'Shoulders'],
        difficulty: 'Beginner',
        equipment: 'Mat or Cushion',
        type: 'time',
        default_reps: 1,
        default_duration_seconds: 120,
        rest_seconds: 0,
        instructions: [
          'Kneel on mat with big toes touching and knees comfortably apart.',
          'Walk hands forward and fold torso gently between thighs.',
          'Rest forehead on mat or cushion, breathing softly into lower back and ribs.'
        ],
        common_mistakes: ['Holding tension in shoulders or neck'],
        quiet_friendly: true,
        low_impact: true,
        animation_type: 'static_hold',
      });
    } else {
      setActiveExerciseModal({
        id: 'ex-movement-general',
        name: quest?.title || 'Gentle Bodyweight Squats',
        category: 'Functional Stamina',
        muscle_groups: ['Lower body', 'Core'],
        difficulty: 'Beginner',
        equipment: 'Bodyweight',
        type: 'reps',
        default_reps: 10,
        default_duration_seconds: 60,
        rest_seconds: 30,
        instructions: [
          'Maintain an upright posture and comfortable stance.',
          'Descend with controlled breath, pausing momentarily at the bottom.',
          'Rise smoothly, keeping weight balanced across heels and arches.'
        ],
        common_mistakes: ['Rushing the downward phase'],
        quiet_friendly: true,
        low_impact: true,
        animation_type: 'squat_pattern',
      });
    }
  };

  const loadDashboardData = async () => {
    setError(null);

    try {
      // 1. Cycle info
      const cycleData = await api.getCurrentCycle().catch(() => null);
      if (cycleData?.phase_info) {
        setPhaseInfo(cycleData.phase_info);
      }

      // 2. Today's Checkin
      const checkinData = await api.getTodayCheckin().catch(() => null);
      if (checkinData?.checkin) {
        setTodayCheckin(checkinData.checkin);
        setWaterML(checkinData.checkin.water_ml || 0);
      }

      // 3. Recommended workout
      const recData = await api.getRecommendedWorkout().catch(() => null);
      if (recData) {
        setRecommendation(recData);
      }

      // 4. Today's meals
      const nutData = await api.getTodayNutrition().catch(() => null);
      if (nutData?.meals) {
        setTodayMeals(nutData.meals);
      }

      // 5. Server-backed Gamification & Daily Quests (Stage 5)
      const serverGam = await api.getGamification().catch(() => null);
      if (serverGam && serverGam.quests && serverGam.quests.length > 0) {
        setGamification({
          level: serverGam.level || 1,
          levelTitle: serverGam.level_title || 'Gentle Spark',
          currentXp: serverGam.current_xp || 0,
          xpForNextLevel: serverGam.xp_for_next_level || 200,
          totalXpEarned: serverGam.total_xp_earned || 0,
          streakDays: serverGam.streak_days || 1,
          quests: serverGam.quests.map((q: any) => ({
            id: q.id,
            title: q.title,
            description: q.description,
            xpReward: q.xp_reward,
            category: q.category as any,
            assetKey: q.asset_key || 'quest-kinetic-spark',
            completed: q.completed,
            completedAt: q.completed_at,
            actionLabel: q.action_label,
            actionRoute: q.action_route,
          })),
          lastActiveDate: serverGam.last_active_date || new Date().toISOString().split('T')[0],
        });
      }
    } catch (err: any) {
      console.warn('Notice loading dashboard updates:', err);
    }
  };

  useEffect(() => {
    if (!hasSettings && user) {
      navigate('/onboarding');
      return;
    }
    loadDashboardData();
  }, [hasSettings, user]);

  // Synchronize gamification state when user changes
  useEffect(() => {
    setGamification(getGamificationState(user?.id));
  }, [user?.id]);

  const handleQuestCompleted = async (questId: string) => {
    // 1. Attempt server-side gamification completion first
    try {
      const res = await api.completeQuest(questId);
      if (res && res.state) {
        const s = res.state;
        const mappedState: GamificationState = {
          level: s.level,
          levelTitle: s.level_title,
          currentXp: s.current_xp,
          xpForNextLevel: s.xp_for_next_level,
          totalXpEarned: s.total_xp_earned,
          streakDays: s.streak_days,
          quests: s.quests.map((q: any) => ({
            id: q.id,
            title: q.title,
            description: q.description,
            xpReward: q.xp_reward,
            category: q.category as any,
            assetKey: q.asset_key || 'quest-kinetic-spark',
            completed: q.completed,
            completedAt: q.completed_at,
            actionLabel: q.action_label,
            actionRoute: q.action_route,
          })),
          lastActiveDate: s.last_active_date,
        };
        setGamification(mappedState);
        if (res.earned_xp > 0) {
          setToastMessage(`✨ Quest Complete! Earned +${res.earned_xp} XP`);
          setTimeout(() => setToastMessage(null), 3500);
          return;
        }
      }
    } catch (err) {
      console.warn('[Gamification] Remote completion fallback to local storage:', err);
    }

    // 2. Client-side local storage fallback
    const result = completeQuest(questId, user?.id);
    setGamification(result.state);

    if (result.earnedXp > 0) {
      setToastMessage(
        result.leveledUp
          ? `🎉 Level Up! You reached Level ${result.state.level} • ${result.state.levelTitle}!`
          : `✨ Quest Complete! Earned +${result.earnedXp} XP`
      );
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleAddWater = async (amount: number) => {
    const nextVal = waterML + amount;
    setWaterML(nextVal);

    if (nextVal >= 500) {
      handleQuestCompleted('quest-hydration');
    }

    try {
      await api.saveCheckin({
        water_ml: nextVal,
        date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error('Failed to update water', err);
    }
  };

  const handleSetWater = async (total: number) => {
    setWaterML(total);
    if (total >= 500) {
      handleQuestCompleted('quest-hydration');
    }
    try {
      await api.saveCheckin({
        water_ml: total,
        date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error('Failed to set water', err);
    }
  };

  const handleToggleMeal = async (mealId: string) => {
    try {
      await api.toggleMealComplete(mealId);
      setTodayMeals((prev) =>
        prev.map((item) =>
          item.meal.id === mealId ? { ...item, completed: !item.completed } : item
        )
      );
      handleQuestCompleted('quest-nourish');
    } catch (err) {
      console.error('Failed to toggle meal', err);
    }
  };

  const handleCheckinSaved = (savedCheckin: DailyCheckin) => {
    setTodayCheckin(savedCheckin);
    if (savedCheckin.water_ml) setWaterML(savedCheckin.water_ml);
    handleQuestCompleted('quest-evening');
  };

  const handleRenameCompanion = async (newName: string) => {
    try {
      await api.updateProfile({ companion_name: newName });
      await api.updateSettings({ companion_name: newName });
      await refreshUserData();
    } catch (err) {
      console.error('Failed to update companion name', err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl md:col-span-2" />
        </div>
        <Skeleton className="h-48 rounded-3xl" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboardData} />;
  }

  // Authentic Greeting calculation
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const greetingName = profile?.name ? profile.name : user?.email ? user.email.split('@')[0] : '';
  const fullGreeting = greetingName ? `${timeGreeting}, ${greetingName}` : `${timeGreeting}`;

  const todayDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const completedQuests = gamification.quests.filter((q) => q.completed);

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-plum-950 text-white dark:bg-urjaa-rose px-4 py-2.5 rounded-2xl shadow-lg border border-plum-800 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-urjaa-blush" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── SECTION A: WELCOME HEADER ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-plum-100/70 dark:border-slate-800 shadow-soft">
        <div className="flex items-center gap-4">
          <UserAvatarBadge
            avatarId={profile?.avatar_id}
            avatarUrl={profile?.avatar_url}
            name={greetingName}
            size={56}
          />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-plum-600 dark:text-slate-400">
                {todayDateFormatted}
              </span>
              <span className="w-1 h-1 rounded-full bg-plum-300 dark:bg-slate-700" />
              <span className="text-xs font-semibold text-urjaa-rose">
                {phaseInfo?.current_phase || 'Follicular'} Phase
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-plum-950 dark:text-white mt-0.5">
              {fullGreeting}
            </h1>
          </div>
        </div>

        {/* Header Action Shortcuts */}
        <div className="flex items-center gap-2.5">
          <Link to="/check-in">
            <Button
              variant={todayCheckin ? 'outline' : 'blush'}
              size="sm"
              leftIcon={
                todayCheckin ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Activity className="w-4 h-4" />
                )
              }
            >
              {todayCheckin ? 'Pulse Logged' : '20s Pulse'}
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCompanionOpen(true)}
            leftIcon={<MessageCircle className="w-4 h-4 text-urjaa-rose" />}
          >
            Ask {companionName}
          </Button>
        </div>
      </div>

      {/* ─── COMPANION PRESENCE CARD ─────────────────────────────── */}
      <CompanionPresenceCard
        companionName={companionName}
        userName={greetingName || 'Friend'}
        phaseName={phaseInfo?.current_phase || 'Follicular'}
        cycleDay={phaseInfo?.cycle_day || 9}
        onOpenChat={() => setIsCompanionOpen(true)}
        onRenameCompanion={handleRenameCompanion}
      />

      {/* ─── SECTION B: WELLNESS PROGRESS SUMMARY ─────────────────── */}
      <WellnessProgressSummary
        gamification={gamification}
        completedQuestsCount={completedQuests.length}
        totalQuestsCount={gamification.quests.length}
      />

      {/* ─── SECTION C: DAILY QUESTS ────────────────────────────── */}
      <DailyQuestsSection
        quests={gamification.quests}
        onCompleteQuest={handleQuestCompleted}
        onOpenExercise={handleOpenExercise}
      />

      {/* ─── SECTION D: 20-SECOND WELLNESS PULSE ─────────────────── */}
      <QuickWellnessCheckin
        currentCheckin={todayCheckin}
        onCheckinSaved={handleCheckinSaved}
      />

      {/* ─── SECTION E: ACTIVITY AND PROGRESS SUMMARY ───────────── */}
      <RecentActivitySummary
        completedQuests={completedQuests}
        todayCheckin={todayCheckin}
        waterML={waterML}
      />

      {/* ─── SECTION F: CORE WELLNESS REALMS ─────────────────────── */}
      <div className="pt-2 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-serif font-bold text-plum-950 dark:text-white">
            Today's Synchronized Plan
          </h3>
          <span className="text-xs text-plum-500 dark:text-slate-400">
            Phase-Aware Recommendations
          </span>
        </div>

        {/* 1. Cycle & Biological Rhythm Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Card className="md:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-slate-900 border-plum-100/70 dark:border-slate-800">
            <CycleRing
              currentDay={phaseInfo?.cycle_day || 1}
              totalDays={phaseInfo?.total_cycle_length || 28}
              phase={phaseInfo?.current_phase || 'Follicular'}
              estimatedNextPeriodDays={phaseInfo?.days_until_next_period || 20}
              onLogClick={() => setIsPeriodLoggerOpen(true)}
            />
            {phaseInfo && (
              <div className="mt-3">
                <PhaseBadge
                  phase={phaseInfo.current_phase}
                  confidenceLabel={phaseInfo.confidence_label}
                />
              </div>
            )}
            <p className="text-xs text-plum-600 dark:text-slate-400 mt-3 leading-relaxed">
              {phaseInfo?.phase_description ||
                'Cycle tracking attuned to hormone metabolism and neuro-muscular stamina.'}
            </p>
          </Card>

          {/* 2. Today's Recommended Workout Card */}
          <div className="md:col-span-8">
            {recommendation?.workout ? (
              <WorkoutCard
                workout={recommendation.workout}
                isRecommended={true}
                onStart={() => navigate('/workout')}
              />
            ) : (
              <Card className="p-8 text-center bg-white dark:bg-slate-900 border-plum-100/70">
                <p className="text-sm text-plum-600 dark:text-slate-400">
                  No workout recommendation available right now.
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* 3. Hydration & Nutrition Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Hydration Tracker */}
          <div className="md:col-span-4">
            <WaterTracker
              waterML={waterML}
              targetML={2200}
              onAddWater={handleAddWater}
              onSetWater={handleSetWater}
            />
          </div>

          {/* Nutrition Meals */}
          <div className="md:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-plum-950 dark:text-white">
                Phase-Aligned Nutrition
              </h4>
              <Link
                to="/nutrition"
                className="text-xs font-semibold text-urjaa-rose hover:underline"
              >
                Full Meal Plan
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(todayMeals || [])
                .filter((item) => !!item?.meal)
                .slice(0, 2)
                .map((item) => (
                  <MealCard
                    key={item.meal.id}
                    meal={item.meal}
                    completed={item.completed}
                    onToggleComplete={() => handleToggleMeal(item.meal.id)}
                    onOpenSubstitute={() => setSubstituteMeal(item.meal)}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Period Logger Modal */}
      <PeriodLoggerModal
        isOpen={isPeriodLoggerOpen}
        onClose={() => setIsPeriodLoggerOpen(false)}
        onSuccess={loadDashboardData}
      />

      {/* Meal Substitution Modal */}
      {substituteMeal && (
        <SubstitutionModal
          isOpen={!!substituteMeal}
          onClose={() => setSubstituteMeal(null)}
          meal={substituteMeal}
          onSelectSubstitute={(subTitle) => {
            setTodayMeals((prev) =>
              prev.map((item) =>
                item.meal.id === substituteMeal.id
                  ? { ...item, meal: { ...item.meal, title: subTitle } }
                  : item
              )
            );
            setSubstituteMeal(null);
            handleQuestCompleted('quest-nourish');
          }}
        />
      )}

      {/* Assistant Slide-Out Drawer */}
      <CompanionDrawer
        isOpen={isCompanionOpen}
        onClose={() => setIsCompanionOpen(false)}
        onRenameCompanion={handleRenameCompanion}
        context={{
          userName: greetingName || '',
          companionName,
          primaryGoal: profile?.primary_goal,
          dietaryPreference: profile?.dietary_preference,
          phase: phaseInfo?.current_phase || 'Follicular',
          cycleDay: phaseInfo?.cycle_day || 9,
          energyLevel: todayCheckin?.energy || 'Balanced',
        }}
      />

      {/* Illustrated Exercise Avatar Demonstration Modal (Stage 5) */}
      {activeExerciseModal && (
        <ExerciseDetailModal
          isOpen={!!activeExerciseModal}
          onClose={() => setActiveExerciseModal(null)}
          exercise={activeExerciseModal}
          onCompleteExercise={() => {
            handleQuestCompleted('quest-movement');
          }}
        />
      )}
    </div>
  );
};
