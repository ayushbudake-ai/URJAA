import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/common/Button';
import {
  Settings,
  Bell,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { MEDICAL_DISCLAIMER } from '../constants';
import { CompanionOrb } from '../components/companion/CompanionOrb';

export const SettingsPage: React.FC = () => {
  const { profile, preferences, refreshUserData } = useAuth();
  const { theme, setTheme } = useTheme();

  // Companion personalization
  const [companionName, setCompanionName] = useState(
    profile?.companion_name || 'Aura'
  );
  const [companionTone, setCompanionTone] = useState(
    'Gentle & Nurturing'
  );

  // Notification preferences
  const [notifyPeriod, setNotifyPeriod] = useState(
    preferences?.notify_period ?? true
  );
  const [notifyCheckin, setNotifyCheckin] = useState(
    preferences?.notify_checkin ?? true
  );
  const [notifyHydration, setNotifyHydration] = useState(
    preferences?.notify_hydration ?? true
  );
  const [notifyWorkout, setNotifyWorkout] = useState(
    preferences?.notify_workout ?? true
  );
  const [notifyNutrition, setNotifyNutrition] = useState(
    preferences?.notify_nutrition ?? true
  );
  const [notifyInsights, setNotifyInsights] = useState(
    preferences?.notify_insights ?? true
  );

  // App preferences
  const [quietMode, setQuietMode] = useState(
    preferences?.quiet_mode ?? false
  );
  const [pcosMode, setPcosMode] = useState(
    profile?.pcos_pcod_mode ?? false
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (preferences) {
      setNotifyPeriod(preferences.notify_period ?? true);
      setNotifyCheckin(preferences.notify_checkin ?? true);
      setNotifyHydration(preferences.notify_hydration ?? true);
      setNotifyWorkout(preferences.notify_workout ?? true);
      setNotifyNutrition(preferences.notify_nutrition ?? true);
      setNotifyInsights(preferences.notify_insights ?? true);
      setQuietMode(preferences.quiet_mode ?? false);

      if (preferences.companion_name) {
        setCompanionName(preferences.companion_name);
      }
    }

    if (profile) {
      setPcosMode(profile.pcos_pcod_mode ?? false);

      if (profile.companion_name) {
        setCompanionName(profile.companion_name);
      }
    }
  }, [preferences, profile]);

  const handleSave = async () => {
    setIsLoading(true);
    setIsSaved(false);
    setSaveError('');

    try {
      const safeName = companionName.trim() || 'Aura';

      await api.updateSettings({
        theme_preference: theme,
        quiet_mode: quietMode,
        companion_name: safeName,
        notify_period: notifyPeriod,
        notify_checkin: notifyCheckin,
        notify_hydration: notifyHydration,
        notify_workout: notifyWorkout,
        notify_nutrition: notifyNutrition,
        notify_insights: notifyInsights,
      });

      await api.updateProfile({
        companion_name: safeName,
        pcos_pcod_mode: pcosMode,
      });

      await refreshUserData();

      setCompanionName(safeName);
      setIsSaved(true);

      window.setTimeout(() => {
        setIsSaved(false);
      }, 2500);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveError(
        'Could not save settings. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const nameSuggestions = [
    'Aura',
    'Mira',
    'Nova',
    'Sol',
    'Lyra',
    'Zephyr',
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-2 border-b border-plum-100/70 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-plum-600 dark:text-slate-400 mb-1">
          <Settings className="w-4 h-4 text-urjaa-rose" />
          <span className="uppercase tracking-wider font-mono text-[11px]">
            Preferences & Companions
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-plum-950 dark:text-white tracking-tight">
          Application Settings
        </h1>

        <p className="text-xs sm:text-sm text-plum-600 dark:text-slate-400 mt-1">
          Customize your AI companion, appearance, personal preferences, and
          daily notifications.
        </p>
      </div>

      {/* Success message */}
      {isSaved && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Error message */}
      {saveError && (
        <div
          role="alert"
          className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300"
        >
          {saveError}
        </div>
      )}

      {/* 1. AI Companion Personalization */}
      <section className="rounded-3xl border border-urjaa-lavender/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-2xl bg-urjaa-lavender/30 border border-urjaa-lavender/60">
              <CompanionOrb
                name={companionName}
                state="welcome"
                size={44}
              />
            </div>

            <div>
              <h3 className="font-serif font-bold text-base text-plum-950 dark:text-white">
                AI Companion Identity
              </h3>

              <p className="text-xs text-plum-600 dark:text-slate-400">
                Personalize your companion experience.
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-urjaa-lavender/50 text-urjaa-plum">
            Active: {companionName || 'Aura'}
          </span>
        </div>

        <div>
          <label
            htmlFor="companion-name"
            className="block text-xs font-semibold uppercase tracking-wider text-plum-600 dark:text-slate-400 mb-1.5"
          >
            Companion Name
          </label>

          <input
            id="companion-name"
            type="text"
            value={companionName}
            onChange={(event) => setCompanionName(event.target.value)}
            placeholder="e.g. Aura"
            maxLength={24}
            className="w-full px-3.5 py-2.5 rounded-xl bg-urjaa-ivory/60 dark:bg-slate-800 border border-plum-200 dark:border-slate-700 text-sm text-plum-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-urjaa-rose"
          />

          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[10px] text-plum-500">
              Quick options:
            </span>

            {nameSuggestions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCompanionName(option)}
                className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                  companionName === option
                    ? 'bg-urjaa-lavender text-urjaa-plum border-urjaa-lavender font-bold'
                    : 'bg-white dark:bg-slate-800 text-plum-600 border-plum-100'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-plum-600 dark:text-slate-400 mb-1.5">
            Supportive Tone
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              'Gentle & Nurturing',
              'Mindful & Grounded',
              'Direct & Motivating',
            ].map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => setCompanionTone(tone)}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                  companionTone === tone
                    ? 'border-urjaa-lavender bg-urjaa-lavender/40 text-urjaa-plum shadow-subtle'
                    : 'border-plum-100 dark:border-slate-800 bg-white dark:bg-slate-800 text-plum-600'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>

          <p className="text-[10px] text-plum-500 dark:text-slate-400 mt-2">
            Tone selection is currently a local UI preference.
          </p>
        </div>
      </section>

      {/* 2. Theme Selection */}
      <section className="rounded-3xl border border-plum-100/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-soft">
        <h3 className="block text-xs font-semibold uppercase tracking-wider text-plum-600 dark:text-slate-400 mb-3">
          Appearance & Theme
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light Mode', icon: Sun },
            { id: 'dark', label: 'Dark Mode', icon: Moon },
            { id: 'system', label: 'System Default', icon: Sparkles },
          ].map((option) => {
            const Icon = option.icon;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTheme(option.id as typeof theme)}
                aria-pressed={theme === option.id}
                className={`py-3 px-3 rounded-2xl text-xs font-semibold flex flex-col items-center gap-2 border transition-all ${
                  theme === option.id
                    ? 'border-urjaa-rose bg-urjaa-blush/40 text-plum-950 dark:border-rose-500 dark:bg-rose-600 dark:text-white shadow-subtle'
                    : 'border-plum-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-plum-600 dark:text-slate-400 hover:border-plum-300'
                }`}
              >
                <Icon className="w-4 h-4 text-urjaa-rose" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. PCOS / PCOD Mode */}
      <section className="rounded-3xl border border-plum-100/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-plum-950 dark:text-white">
                PCOS / PCOD Support Mode
              </span>

              <span className="px-2 py-0.5 rounded-full bg-urjaa-blush text-[10px] text-urjaa-plum font-semibold">
                Gentle Protocol
              </span>
            </div>

            <p className="text-xs text-plum-600 dark:text-slate-400 mt-1 leading-relaxed">
              Enables additional wellness preferences for your personalized
              experience.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input
              type="checkbox"
              checked={pcosMode}
              onChange={(event) => setPcosMode(event.target.checked)}
              className="sr-only peer"
              aria-label="Enable PCOS / PCOD Support Mode"
            />

            <div className="w-11 h-6 bg-plum-200 dark:bg-slate-700 rounded-full peer-focus:outline-none peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-urjaa-rose" />
          </label>
        </div>
      </section>

      {/* 4. Quiet Mode */}
      <section className="rounded-3xl border border-plum-100/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-plum-950 dark:text-white">
                Quiet Mode Default
              </span>

              <span className="px-2 py-0.5 rounded-full bg-urjaa-skyblue/50 text-[10px] text-plum-900 font-semibold">
                No Jumping
              </span>
            </div>

            <p className="text-xs text-plum-600 dark:text-slate-400 mt-1 leading-relaxed">
              Prefer exercises without jumping or loud floor impacts, ideal
              for apartments or late-evening workouts.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input
              type="checkbox"
              checked={quietMode}
              onChange={(event) => setQuietMode(event.target.checked)}
              className="sr-only peer"
              aria-label="Enable Quiet Mode"
            />

            <div className="w-11 h-6 bg-plum-200 dark:bg-slate-700 rounded-full peer-focus:outline-none peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-urjaa-rose" />
          </label>
        </div>
      </section>

      {/* 5. Notification Preferences */}
      <section className="rounded-3xl border border-plum-100/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-soft space-y-3">
        <div className="flex items-center gap-2 text-plum-950 dark:text-white font-bold text-sm mb-1">
          <Bell className="w-4 h-4 text-urjaa-rose" />
          <span>Notifications & Daily Reminders</span>
        </div>

        {[
          {
            label: 'Upcoming Cycle & Period Notice',
            checked: notifyPeriod,
            setter: setNotifyPeriod,
          },
          {
            label: 'Daily 20-Second Check-in Reminder',
            checked: notifyCheckin,
            setter: setNotifyCheckin,
          },
          {
            label: 'Gentle Hydration Prompts',
            checked: notifyHydration,
            setter: setNotifyHydration,
          },
          {
            label: "Today's Workout Movement Suggestion",
            checked: notifyWorkout,
            setter: setNotifyWorkout,
          },
          {
            label: 'Meal & Nutrition Recipe Ideas',
            checked: notifyNutrition,
            setter: setNotifyNutrition,
          },
          {
            label: 'Weekly Rhythm & Health Insights',
            checked: notifyInsights,
            setter: setNotifyInsights,
          },
        ].map((item) => (
          <label
            key={item.label}
            className="flex items-center justify-between gap-3 py-2 border-b border-plum-100/60 dark:border-slate-800 last:border-0 text-xs cursor-pointer"
          >
            <span className="text-plum-800 dark:text-slate-300 font-medium">
              {item.label}
            </span>

            <input
              type="checkbox"
              checked={item.checked}
              onChange={(event) => item.setter(event.target.checked)}
              className="w-4 h-4 rounded text-urjaa-rose bg-white dark:bg-slate-800 border-plum-300 focus:ring-urjaa-rose"
            />
          </label>
        ))}
      </section>

      {/* 6. Personalization & Privacy */}
      <section className="rounded-3xl border border-plum-100/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-soft space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4" />
          </div>

          <div>
            <h3 className="font-serif font-bold text-base text-plum-950 dark:text-white">
              Personalization & Privacy
            </h3>

            <p className="text-xs text-plum-600 dark:text-slate-400">
              Review the profile information used for personalization.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-ivory-50 dark:bg-slate-800/60 border border-plum-100/60 dark:border-slate-700/60 space-y-2 text-xs">
          <div className="flex justify-between gap-3 py-1 border-b border-plum-100/40 dark:border-slate-700/40">
            <span className="text-plum-600 dark:text-slate-400">
              Primary Goal:
            </span>

            <span className="font-semibold text-plum-950 dark:text-white text-right">
              {profile?.primary_goal ||
                profile?.wellness_goal ||
                'Build strength'}
            </span>
          </div>

          <div className="flex justify-between gap-3 py-1 border-b border-plum-100/40 dark:border-slate-700/40">
            <span className="text-plum-600 dark:text-slate-400">
              Experience & Duration:
            </span>

            <span className="font-semibold text-plum-950 dark:text-white text-right">
              {profile?.fitness_level || 'Beginner'} •{' '}
              {profile?.preferred_workout_duration || 15} min
            </span>
          </div>

          <div className="flex justify-between gap-3 py-1">
            <span className="text-plum-600 dark:text-slate-400">
              Nutrition Preference:
            </span>

            <span className="font-semibold text-plum-950 dark:text-white text-right">
              {profile?.dietary_preference || 'Vegetarian'}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-plum-500 dark:text-slate-400 leading-relaxed">
          Your settings are associated with your account. Data deletion
          controls should only be enabled when the corresponding backend
          functionality is implemented.
        </p>
      </section>

      {/* Save Settings */}
      <Button
        variant="blush"
        size="lg"
        onClick={handleSave}
        disabled={isLoading}
        className="w-full shadow-soft py-3 font-semibold"
      >
        {isLoading ? 'Saving...' : 'Save Settings'}
      </Button>

      {/* Medical Disclaimer */}
      <p className="text-[10px] text-plum-400 dark:text-slate-400 text-center leading-relaxed mt-4 max-w-xl mx-auto">
        {MEDICAL_DISCLAIMER}
      </p>
    </div>
  );
};
