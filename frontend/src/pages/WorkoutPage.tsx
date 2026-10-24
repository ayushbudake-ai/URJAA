import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Workout } from '../types';
import { WorkoutCard } from '../components/workout/WorkoutCard';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/ErrorState';
import {
  Flame,
  VolumeX,
  Sparkles,
  Heart,
  Coffee,
  Play,
  Clock,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { DURATION_OPTIONS, MEDICAL_DISCLAIMER } from '../constants';

export const WorkoutPage: React.FC = () => {
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [recommendedId, setRecommendedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDuration, setSelectedDuration] = useState<number | 'all'>('all');
  const [quietOnly, setQuietOnly] = useState<boolean>(false);
  const [isLowMotivationMode, setIsLowMotivationMode] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkouts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rec = await api.getRecommendedWorkout().catch(() => null);
      if (rec?.workout) {
        setRecommendedId(rec.workout.id);
      }

      const list = await api.getWorkouts();
      setWorkouts(list || []);
    } catch (err: any) {
      console.error('Failed to load workouts', err);
      setError(err.message || 'Could not load workout library');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const categories = ['All', 'Full body', 'Lower body', 'Upper body', 'Core', 'Mobility', 'Recovery'];

  const filteredWorkouts = workouts.filter((w) => {
    if (selectedCategory !== 'All' && w.category !== selectedCategory) return false;
    if (selectedDuration !== 'all' && w.estimated_duration_min > selectedDuration) return false;
    if (quietOnly && !w.is_quiet) return false;
    return true;
  });

  const recommendedWorkout = workouts.find((w) => w.id === recommendedId) || workouts[0] || null;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-56 rounded-3xl" />
          <Skeleton className="h-56 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadWorkouts} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header: Fitness & Athletic Movement Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">
            <Flame className="w-4 h-4 text-rose-600" />
            <span className="uppercase tracking-widest text-[10px]">Guided Movement System</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
            Workout & Movement
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            50+ exercises seeded across all muscle groups with quiet apartment modes and step-down regression chains.
          </p>
        </div>

        {/* Low-Motivation Day Compassion Toggle */}
        <button
          type="button"
          onClick={() => setIsLowMotivationMode(!isLowMotivationMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold border transition-all ${
            isLowMotivationMode
              ? 'border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
          }`}
        >
          <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Low Energy Today?</span>
        </button>
      </div>

      {/* Low-Motivation Compassion Banner */}
      {isLowMotivationMode && (
        <div className="p-5 sm:p-6 rounded-3xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 animate-in fade-in duration-200">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Not feeling a full workout today? That's completely okay.
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed max-w-xl">
                Restorative movement honors your cycle as deeply as hard training. Choose a 5-minute pelvic tension release, a mindful stretch, or rest without guilt.
              </p>
              <div className="flex flex-wrap gap-2.5 mt-3.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white dark:bg-slate-900 border-amber-300 text-amber-900 dark:text-amber-200"
                  onClick={() => navigate('/workout/session/66666666-0000-0000-0000-000000000002')}
                >
                  5-Min Gentle Pelvic Flow
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white dark:bg-slate-900 border-amber-300 text-amber-900 dark:text-amber-200"
                  onClick={() => navigate('/workout/session/66666666-0000-0000-0000-000000000001')}
                >
                  Pelvic Tension Release
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Recommended Movement Spotlight Hero */}
      {recommendedWorkout && (
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-soft relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-rose-500/20 text-[10px] font-bold text-rose-300 uppercase tracking-wider">
                  Recommended for Today
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {recommendedWorkout.category}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white mt-1">
                {recommendedWorkout.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                {recommendedWorkout.description}
              </p>

              <div className="flex items-center gap-4 mt-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <Clock className="w-4 h-4 text-rose-400" />
                  <span>{recommendedWorkout.estimated_duration_min} minutes</span>
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>{recommendedWorkout.intensity} Intensity</span>
                </span>
                {recommendedWorkout.is_quiet && (
                  <span className="flex items-center gap-1 text-sky-300">
                    <VolumeX className="w-4 h-4" />
                    <span>Quiet Friendly</span>
                  </span>
                )}
              </div>
            </div>

            <Button
              variant="rose"
              size="lg"
              onClick={() => navigate(`/workout/session/${recommendedWorkout.id}`)}
              leftIcon={<Play className="w-4 h-4 fill-white" />}
              className="shrink-0 text-sm py-4 px-6 shadow-sm"
            >
              Start Guided Workout
            </Button>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="space-y-3.5">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCategory(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === c
                  ? 'bg-slate-900 text-white dark:bg-rose-600 dark:text-white shadow-sm'
                  : 'bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Duration & Quiet Toggle Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Max Duration:</span>
            <button
              onClick={() => setSelectedDuration('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedDuration === 'all'
                  ? 'bg-slate-900 text-white dark:bg-rose-600 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All
            </button>
            {DURATION_OPTIONS.slice(0, 4).map((mins) => (
              <button
                key={mins}
                onClick={() => setSelectedDuration(mins)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedDuration === mins
                    ? 'bg-slate-900 text-white dark:bg-rose-600 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                &le;{mins}m
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setQuietOnly(!quietOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              quietOnly
                ? 'border-sapphire-500 bg-sapphire-50 text-sapphire-700 dark:bg-sapphire-950/60 dark:text-sapphire-300 font-semibold shadow-sm'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Quiet Mode (No Jumping)</span>
          </button>
        </div>
      </div>

      {/* Workouts Grid */}
      {filteredWorkouts.length === 0 ? (
        <Card className="text-center p-8 text-xs text-slate-500">
          No workouts matching these filters. Try resetting category or duration filters.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWorkouts.map((w) => (
            <WorkoutCard
              key={w.id}
              workout={w}
              isRecommended={w.id === recommendedId}
              onStart={() => navigate(`/workout/session/${w.id}`)}
            />
          ))}
        </div>
      )}

      {/* Medical Disclaimer */}
      <p className="text-[10px] text-slate-400 text-center leading-relaxed mt-4">
        {MEDICAL_DISCLAIMER}
      </p>
    </div>
  );
};
