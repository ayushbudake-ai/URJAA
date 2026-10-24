import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  ArrowLeftRight,
  CheckCircle2,
  X,
  Volume2,
  VolumeX,
  Plus,
  Video,
  Sparkles,
} from 'lucide-react';
import { Workout, WorkoutExercise, Exercise } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ExerciseAnimation } from './ExerciseAnimations';
import { IllustratedExerciseAvatar } from '../exercise/IllustratedExerciseAvatar';
import { ExerciseReplaceModal } from './ExerciseReplaceModal';
import { PostWorkoutModal } from './PostWorkoutModal';
import { CloudinaryMedia } from '../media/CloudinaryMedia';
import { getMediaForExercise } from '../../constants/mediaManifest';

export type SessionState = 'PREPARING' | 'EXERCISE' | 'REST' | 'COMPLETE';

interface WorkoutSessionProps {
  workout: Workout;
  onExit: () => void;
  onFinished: (durationSeconds: number, effort: 'Too easy' | 'Good' | 'Hard') => void;
}

export const WorkoutSession: React.FC<WorkoutSessionProps> = ({
  workout,
  onExit,
  onFinished,
}) => {
  const [exercisesList, setExercisesList] = useState<WorkoutExercise[]>(workout?.exercises || []);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [sessionState, setSessionState] = useState<SessionState>('PREPARING');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [mediaMode, setMediaMode] = useState<'video' | 'animation'>('animation');
  const [isModified, setIsModified] = useState<boolean>(false);

  // Timers and Rep Counters
  const [prepSeconds, setPrepSeconds] = useState<number>(5);
  const [exerciseSecondsLeft, setExerciseSecondsLeft] = useState<number>(30);
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(20);
  const [currentRepsDone, setCurrentRepsDone] = useState<number>(0);
  const [totalWorkoutDuration, setTotalWorkoutDuration] = useState<number>(0);

  // Modals
  const [isReplaceOpen, setIsReplaceOpen] = useState<boolean>(false);
  const [isPostWorkoutOpen, setIsPostWorkoutOpen] = useState<boolean>(false);

  const currentItem = exercisesList[currentIndex];
  const currentEx = currentItem?.exercise;
  const isTimeMode = currentItem?.mode === 'time';
  const targetReps = currentItem?.target || 10;
  const targetSeconds = currentItem?.target_seconds || 30;

  const currentMedia = getMediaForExercise(currentEx?.id, currentEx?.name, workout?.category);

  // Initialize countdown on exercise change
  useEffect(() => {
    if (currentItem) {
      setExerciseSecondsLeft(currentItem.target_seconds || 30);
      setRestSecondsLeft(currentItem.rest_seconds || 20);
      setCurrentRepsDone(0);
      setIsModified(false);
    }
  }, [currentIndex, currentItem]);

  // Overall workout clock timer
  useEffect(() => {
    if (sessionState === 'COMPLETE' || isPaused) return;
    const interval = setInterval(() => {
      setTotalWorkoutDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionState, isPaused]);

  // State Machine Timer Logic
  useEffect(() => {
    if (isPaused) return;

    // 1. PREPARING STATE
    if (sessionState === 'PREPARING') {
      if (prepSeconds <= 0) {
        setSessionState('EXERCISE');
        return;
      }
      const timer = setTimeout(() => setPrepSeconds((s) => s - 1), 1000);
      return () => clearTimeout(timer);
    }

    // 2. EXERCISE STATE (Time Mode countdown)
    if (sessionState === 'EXERCISE' && isTimeMode) {
      if (exerciseSecondsLeft <= 0) {
        handleExerciseComplete();
        return;
      }
      const timer = setTimeout(() => setExerciseSecondsLeft((s) => s - 1), 1000);
      return () => clearTimeout(timer);
    }

    // 3. REST STATE
    if (sessionState === 'REST') {
      if (restSecondsLeft <= 0) {
        handleNextExercise();
        return;
      }
      const timer = setTimeout(() => setRestSecondsLeft((s) => s - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [sessionState, prepSeconds, exerciseSecondsLeft, restSecondsLeft, isPaused, isTimeMode]);

  const handleExerciseComplete = () => {
    if (currentIndex >= exercisesList.length - 1) {
      setSessionState('COMPLETE');
      setIsPostWorkoutOpen(true);
    } else {
      setSessionState('REST');
      setRestSecondsLeft(currentItem?.rest_seconds || 20);
    }
  };

  const handleNextExercise = () => {
    setSessionState('EXERCISE');
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePreviousExercise = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSessionState('EXERCISE');
    }
  };

  const handleSkipExercise = () => {
    handleExerciseComplete();
  };

  const handleAddRep = () => {
    const nextReps = currentRepsDone + 1;
    setCurrentRepsDone(nextReps);
    if (nextReps >= targetReps) {
      handleExerciseComplete();
    }
  };

  const handleExerciseReplaced = (newExercise: Exercise) => {
    setExercisesList((prev) => {
      const updated = [...prev];
      updated[currentIndex] = {
        ...updated[currentIndex],
        exercise_id: newExercise.id,
        exercise: newExercise,
      };
      return updated;
    });
    setIsReplaceOpen(false);
  };

  if (!workout || exercisesList.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-ivory-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-xl font-serif font-bold text-plum-950 dark:text-white">
            No exercises available
          </h2>
          <p className="text-sm text-plum-600 dark:text-slate-400">
            This workout does not have any exercises configured yet.
          </p>
          <Button variant="primary" onClick={onExit}>
            Return to Workouts
          </Button>
        </div>
      </div>
    );
  }

  // Progress Percentage
  const progressPercent = Math.round(((currentIndex + (sessionState === 'REST' ? 1 : 0)) / exercisesList.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-ivory-50 dark:bg-slate-950 flex flex-col justify-between overflow-hidden">
      {/* Top Session Action Bar */}
      <div className="px-4 py-3.5 border-b border-plum-100/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          className="p-2 rounded-xl text-plum-600 hover:text-plum-950 dark:text-slate-400 dark:hover:text-white hover:bg-ivory-100 dark:hover:bg-slate-800 transition-colors"
          title="Exit workout"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-plum-950 dark:text-white">
            {workout.title}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-plum-500 dark:text-slate-500 mt-0.5 inline-block">
              {sessionState === 'REST' ? 'Resting' : `Exercise ${currentIndex + 1} of ${exercisesList.length}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl text-plum-600 hover:text-plum-950 dark:text-slate-400 dark:hover:text-slate-200"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <Badge variant="blush" size="sm">
            {Math.floor(totalWorkoutDuration / 60)}:
            {String(totalWorkoutDuration % 60).padStart(2, '0')}
          </Badge>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto w-full overflow-y-auto">
        {/* PREPARING SCREEN */}
        {sessionState === 'PREPARING' && (
          <div className="flex flex-col items-center animate-fade-in">
            <span className="text-xs font-bold uppercase tracking-widest text-blush-600 dark:text-blush-400 mb-2">
              Get Ready
            </span>
            <div className="w-24 h-24 rounded-full bg-blush-50 dark:bg-rose-950/80 border-4 border-blush-500 flex items-center justify-center text-4xl font-extrabold text-blush-600 dark:text-rose-400 my-4 shadow-soft">
              {prepSeconds}
            </div>
            <h2 className="text-2xl font-bold text-plum-950 dark:text-white mt-2">
              {currentEx?.name || 'First Movement'}
            </h2>
            <p className="text-xs text-plum-600 dark:text-slate-400 max-w-xs mt-1">
              Take a deep breath and settle into your comfortable space.
            </p>
          </div>
        )}

        {/* ACTIVE EXERCISE SCREEN */}
        {sessionState === 'EXERCISE' && (
          <div className="flex flex-col items-center w-full">
            {/* Media Visual Stage */}
            <div className="my-2 w-full max-w-sm">
              {mediaMode === 'video' && currentMedia ? (
                <div className="rounded-3xl overflow-hidden border border-plum-100/70 dark:border-slate-800 shadow-soft">
                  <CloudinaryMedia
                    assetKey={currentMedia.assetKey}
                    aspectRatio="16:9"
                    animationArchetype={currentEx?.animation_type}
                    containerClassName="w-full max-h-56"
                    customFallback={
                      <IllustratedExerciseAvatar
                        movementType={currentEx?.animation_type || 'squat_pattern'}
                        exerciseName={currentEx?.name || 'Movement'}
                        isPlaying={!isPaused}
                        isModified={isModified}
                      />
                    }
                  />
                </div>
              ) : (
                <div className="rounded-3xl overflow-hidden border border-plum-100/60 dark:border-slate-800 shadow-soft">
                  <IllustratedExerciseAvatar
                    movementType={currentEx?.animation_type || 'squat_pattern'}
                    exerciseName={currentEx?.name || 'Movement'}
                    isPlaying={!isPaused}
                    isModified={isModified}
                  />
                </div>
              )}

              {/* Modification & Media Switcher Controls */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={() => setIsModified((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                    isModified
                      ? 'bg-urjaa-pistachio/40 border-urjaa-pistachio text-plum-950 font-bold'
                      : 'bg-ivory-100 dark:bg-slate-800 text-plum-700 dark:text-slate-300 border-plum-200/50'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-urjaa-rose" />
                  <span>{isModified ? 'Low-Impact Form Active' : 'Low-Impact Form'}</span>
                </button>

                {currentMedia && (
                  <button
                    type="button"
                    onClick={() => setMediaMode(mediaMode === 'video' ? 'animation' : 'video')}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-ivory-100 hover:bg-blush-50 text-plum-700 dark:bg-slate-800 dark:text-slate-300 border border-plum-200/50 transition-colors"
                  >
                    {mediaMode === 'video' ? (
                      <>
                        <Sparkles className="w-3 h-3 text-blush-500" />
                        <span>Illustrated Avatar</span>
                      </>
                    ) : (
                      <>
                        <Video className="w-3 h-3 text-blush-500" />
                        <span>Cloudinary Video</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-plum-950 dark:text-white mt-2">
              {currentEx?.name || 'Exercise'}
            </h2>

            {/* Target Display (Reps or Time) */}
            {isTimeMode ? (
              <div className="flex flex-col items-center my-3">
                <span className="text-5xl font-black text-rose-600 dark:text-rose-400 tracking-tight font-mono">
                  {exerciseSecondsLeft}s
                </span>
                <span className="text-xs text-plum-500 mt-1">Time Remaining</span>
              </div>
            ) : (
              <div className="flex flex-col items-center my-3">
                <span className="text-5xl font-black text-plum-950 dark:text-white tracking-tight font-mono">
                  {currentRepsDone} <span className="text-2xl text-plum-400">/ {targetReps}</span>
                </span>
                <span className="text-xs text-plum-500 mt-1">Reps Completed</span>
              </div>
            )}

            {/* Manual +1 Rep Button for Rep-based mode */}
            {!isTimeMode && (
              <button
                type="button"
                onClick={handleAddRep}
                className="my-2 px-8 py-3.5 rounded-2xl bg-blush-500 hover:bg-blush-600 active:scale-95 text-white font-bold text-base shadow-soft flex items-center gap-2 transition-all"
              >
                <Plus className="w-5 h-5 stroke-[3]" />
                <span>+1 Rep Completed</span>
              </button>
            )}

            {/* In-Session Replace Link */}
            <div className="mt-3 flex items-center gap-4 text-xs">
              <button
                type="button"
                onClick={() => setIsReplaceOpen(true)}
                className="inline-flex items-center gap-1 text-plum-600 hover:text-blush-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Swap Exercise</span>
              </button>
            </div>
          </div>
        )}

        {/* REST SCREEN */}
        {sessionState === 'REST' && (
          <div className="flex flex-col items-center w-full animate-fade-in">
            <span className="text-xs font-bold uppercase tracking-widest text-skyblue-600 dark:text-skyblue-400 mb-2">
              Rest & Hydrate
            </span>
            <div className="w-28 h-28 rounded-full bg-skyblue-50 dark:bg-sky-950/80 border-4 border-skyblue-400 flex items-center justify-center text-4xl font-extrabold text-skyblue-600 dark:text-sky-300 my-4 shadow-soft">
              {restSecondsLeft}s
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleNextExercise}
              className="mt-2 text-xs"
            >
              Skip Rest & Begin
            </Button>

            {currentIndex + 1 < exercisesList.length && (
              <div className="mt-6 p-4 rounded-2xl bg-ivory-100/90 dark:bg-slate-900 border border-plum-100/60 dark:border-slate-800 text-center max-w-xs w-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-plum-500">
                  Coming Up Next
                </span>
                <h4 className="text-sm font-semibold text-plum-950 dark:text-white mt-0.5">
                  {exercisesList[currentIndex + 1]?.exercise?.name || 'Next movement'}
                </h4>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Workout Controller */}
      <div className="px-6 py-5 border-t border-plum-100/70 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={handlePreviousExercise}
            disabled={currentIndex === 0}
            className="p-3 rounded-2xl text-plum-600 dark:text-slate-400 hover:bg-ivory-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
            title="Previous exercise"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="p-4 rounded-3xl bg-plum-950 dark:bg-white text-white dark:text-plum-950 shadow-md hover:scale-105 active:scale-95 transition-all"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-6 h-6 fill-current" /> : <Pause className="w-6 h-6 fill-current" />}
          </button>

          <button
            type="button"
            onClick={handleSkipExercise}
            className="p-3 rounded-2xl text-plum-600 dark:text-slate-400 hover:bg-ivory-100 dark:hover:bg-slate-800 transition-all"
            title="Next or Skip exercise"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Replace Exercise Modal */}
      <ExerciseReplaceModal
        isOpen={isReplaceOpen}
        onClose={() => setIsReplaceOpen(false)}
        currentExerciseId={currentEx?.id || ''}
        onReplaced={handleExerciseReplaced}
      />

      {/* Post Workout Rating Modal */}
      <PostWorkoutModal
        isOpen={isPostWorkoutOpen}
        durationSeconds={totalWorkoutDuration}
        exercisesCompleted={exercisesList.length}
        onSubmitEffort={(effort) => onFinished(totalWorkoutDuration, effort)}
      />
    </div>
  );
};
