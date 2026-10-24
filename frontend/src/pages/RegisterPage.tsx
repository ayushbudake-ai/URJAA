import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Heart, Mail, Lock, User, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(email, password, name);
      navigate('/onboarding');
    } catch (err: any) {
      if (
        err.code === 'USER_EXISTS' ||
        err.code === 'HTTP_409' ||
        err.message?.toLowerCase().includes('already exists')
      ) {
        setError('An account with this email already exists. Please sign in or use a different email address.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-urjaa-ivory dark:bg-slate-950 text-urjaa-plum dark:text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-urjaa-rose flex items-center justify-center text-white shadow-soft">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <span className="font-serif font-bold text-2xl text-plum-950 dark:text-white">Urjaa</span>
        </Link>
        <h2 className="text-2xl font-serif font-bold tracking-tight text-plum-950 dark:text-white">
          Create your account
        </h2>
        <p className="text-xs text-plum-600 dark:text-slate-400 mt-1">
          Begin your cycle-aware wellness journey with personalized movement, nutrition, and an attuned AI companion.
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-8 rounded-3xl border border-plum-100/80 dark:border-slate-800 shadow-soft">
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
              <div className="font-medium">{error}</div>
              {error.toLowerCase().includes('already exists') && (
                <div className="mt-2 pt-2 border-t border-rose-200/60 dark:border-rose-900/60">
                  <Link
                    to="/login"
                    className="font-semibold text-rose-700 dark:text-rose-300 underline hover:text-rose-900 dark:hover:text-rose-100 inline-flex items-center gap-1"
                  >
                    Go to Sign In &rarr;
                  </Link>
                </div>
              )}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-plum-600 dark:text-slate-400 mb-1.5">
                Your Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-urjaa-ivory/60 dark:bg-slate-800 border border-plum-200 dark:border-slate-700 text-sm text-plum-950 dark:text-white placeholder:text-plum-400 focus:outline-none focus:ring-2 focus:ring-urjaa-rose"
                />
                <User className="w-4 h-4 text-plum-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-plum-600 dark:text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-urjaa-ivory/60 dark:bg-slate-800 border border-plum-200 dark:border-slate-700 text-sm text-plum-950 dark:text-white placeholder:text-plum-400 focus:outline-none focus:ring-2 focus:ring-urjaa-rose"
                />
                <Mail className="w-4 h-4 text-plum-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-plum-600 dark:text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-urjaa-ivory/60 dark:bg-slate-800 border border-plum-200 dark:border-slate-700 text-sm text-plum-950 dark:text-white placeholder:text-plum-400 focus:outline-none focus:ring-2 focus:ring-urjaa-rose"
                />
                <Lock className="w-4 h-4 text-plum-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <Button
              type="submit"
              variant="blush"
              size="md"
              disabled={isLoading}
              className="w-full justify-center mt-2 shadow-soft font-semibold"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isLoading ? 'Creating Account...' : 'Continue to Personalization'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-plum-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-urjaa-rose hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
