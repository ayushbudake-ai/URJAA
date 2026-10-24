import React from 'react';
import { Clock, CheckCircle2, Circle, ArrowLeftRight, Sparkles } from 'lucide-react';
import { Meal } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { CloudinaryImage } from '../media/CloudinaryImage';

interface MealCardProps {
  meal: Meal;
  completed: boolean;
  onToggleComplete: () => void;
  onOpenSubstitute: () => void;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  completed,
  onToggleComplete,
  onOpenSubstitute,
}) => {
  if (!meal) {
    return null;
  }

  return (
    <Card
      className={`transition-all flex flex-col justify-between ${
        completed
          ? 'border-pistachio-300 dark:border-emerald-800 bg-pistachio-50/40 dark:bg-emerald-950/20'
          : 'hover:border-blush-200 dark:hover:border-rose-900/60'
      }`}
    >
      <div>
        {/* Subtle Nutrition Visual Header */}
        <div className="mb-3.5 rounded-2xl overflow-hidden border border-plum-100/50 dark:border-slate-800">
          <CloudinaryImage
            publicId={`urjaa/nutrition/${meal.dietary_preference.toLowerCase()}_${meal.meal_type.toLowerCase()}`}
            alt={`${meal.title} - ${meal.dietary_preference} ${meal.meal_type}`}
            aspectRatio="16:9"
            containerClassName="max-h-32"
          />
        </div>

        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blush-600 dark:text-rose-400">
                {meal.meal_type}
              </span>
              <Badge size="sm" variant="outline">
                {meal.dietary_preference}
              </Badge>
            </div>
            <h4
              className={`text-base font-semibold text-plum-950 dark:text-white ${
                completed ? 'line-through text-plum-400 dark:text-slate-400' : ''
              }`}
            >
              {meal.title}
            </h4>
          </div>

          <button
            type="button"
            onClick={onToggleComplete}
            className="p-1 text-plum-400 hover:text-pistachio-600 transition-colors"
            title={completed ? 'Mark as not completed' : 'Mark as completed'}
          >
            {completed ? (
              <CheckCircle2 className="w-6 h-6 text-pistachio-600 dark:text-emerald-400 fill-pistachio-100 dark:fill-emerald-950/80" />
            ) : (
              <Circle className="w-6 h-6 text-plum-200 dark:text-slate-700 hover:text-blush-500" />
            )}
          </button>
        </div>

        <p className="text-xs text-plum-600 dark:text-slate-400 mt-2 leading-relaxed">
          {meal.description}
        </p>

        {/* Key Nutrients */}
        {meal.key_nutrients && meal.key_nutrients.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {meal.key_nutrients.map((nut) => (
              <span
                key={nut}
                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-ivory-100 dark:bg-slate-800 text-plum-800 dark:text-slate-300 border border-plum-100/50"
              >
                <Sparkles className="w-2.5 h-2.5 text-blush-500" />
                {nut}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer: Prep time & Replace button */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-plum-100/60 dark:border-slate-800/80 text-xs">
        <div className="flex items-center gap-1 text-plum-500">
          <Clock className="w-3.5 h-3.5" />
          <span>{meal.prep_time_min} mins prep</span>
        </div>

        <button
          type="button"
          onClick={onOpenSubstitute}
          className="inline-flex items-center gap-1 text-blush-600 dark:text-rose-400 hover:text-blush-700 font-medium text-xs hover:underline"
        >
          <ArrowLeftRight className="w-3 h-3" />
          <span>Replace</span>
        </button>
      </div>
    </Card>
  );
};
