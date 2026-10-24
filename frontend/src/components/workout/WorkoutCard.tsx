import React from 'react';
import { Clock, Play, VolumeX, Shield, Sparkles } from 'lucide-react';
import { Workout } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { CloudinaryMedia } from '../media/CloudinaryMedia';
import { getMediaForExercise } from '../../constants/mediaManifest';

interface WorkoutCardProps {
  workout: Workout | null | undefined;
  onStart: () => void;
  isRecommended?: boolean;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  onStart,
  isRecommended = false,
}) => {
  if (!workout) {
    return (
      <Card className="p-8 text-center bg-white dark:bg-slate-900 border-plum-100/70">
        <p className="text-sm text-plum-600 dark:text-slate-400">
          No workout details available right now.
        </p>
      </Card>
    );
  }

  const exercises = workout.exercises || [];
  const firstEx = exercises[0]?.exercise;
  const mediaEntry = getMediaForExercise(firstEx?.id, firstEx?.name, workout.category);

  return (
    <Card
      className={`relative overflow-hidden transition-all flex flex-col justify-between ${
        isRecommended
          ? 'border-blush-300 dark:border-rose-800/80 bg-gradient-to-br from-blush-50/70 via-white to-ivory-50 dark:from-slate-900 dark:via-rose-950/20 dark:to-slate-900 shadow-soft'
          : 'hover:border-blush-200 dark:hover:border-slate-700'
      }`}
    >
      <div>
        {isRecommended && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-blush-600 dark:text-rose-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recommended For Today</span>
          </div>
        )}

        {/* Media Preview Banner */}
        {mediaEntry && (
          <div className="mb-3.5 rounded-2xl overflow-hidden border border-plum-100/60 dark:border-slate-800">
            <CloudinaryMedia
              assetKey={mediaEntry.assetKey}
              aspectRatio="16:9"
              animationArchetype={firstEx?.animation_type}
              containerClassName="max-h-36"
            />
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-plum-950 dark:text-white">
              {workout.title}
            </h4>
            <p className="text-xs text-plum-600 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
              {workout.description}
            </p>
          </div>
        </div>

        {/* Badges & Meta */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <Badge size="sm" variant="blush">
            {workout.category}
          </Badge>
          <Badge size="sm" variant="neutral">
            {workout.intensity}
          </Badge>
          {workout.is_quiet && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-ivory-100 dark:bg-slate-800 text-plum-700 dark:text-slate-300 border border-plum-100/40">
              <VolumeX className="w-2.5 h-2.5" />
              Quiet
            </span>
          )}
          {workout.is_low_impact && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-ivory-100 dark:bg-slate-800 text-plum-700 dark:text-slate-300 border border-plum-100/40">
              <Shield className="w-2.5 h-2.5" />
              Low Impact
            </span>
          )}
        </div>
      </div>

      {/* Card Action */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-plum-100/60 dark:border-slate-800/80">
        <div className="flex items-center gap-1 text-xs text-plum-500">
          <Clock className="w-3.5 h-3.5" />
          <span>{workout.estimated_duration_min} mins</span>
        </div>

        <Button
          size="sm"
          variant={isRecommended ? 'rose' : 'primary'}
          leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
          onClick={onStart}
        >
          Start Session
        </Button>
      </div>
    </Card>
  );
};
