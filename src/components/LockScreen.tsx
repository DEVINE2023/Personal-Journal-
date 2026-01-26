import React, { useState } from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';

export function LockScreen() {
  const { isSetup, login, setupApp } = useJournal();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!isSetup) {
        // Setup mode
        if (password.length < 4) {
          setError('Password must be at least 4 characters');
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        await setupApp(password);
      } else {
        // Login mode
        const success = await login(password);
        if (!success) {
          setError('Incorrect password');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-display text-4xl font-semibold text-foreground mb-2">
            Reflect
          </h1>
          <p className="text-muted-foreground font-serif italic">
            Your private space for daily reflection
          </p>
        </div>

        {/* Auth card */}
        <div className="gradient-card rounded-2xl shadow-elevated p-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              {isSetup ? (
                <Lock className="w-5 h-5 text-primary" />
              ) : (
                <KeyRound className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-foreground">
                {isSetup ? 'Welcome back' : 'Set up your journal'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isSetup
                  ? 'Enter your password to continue'
                  : 'Create a password to protect your entries'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={isSetup ? 'Enter password' : 'Create password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 h-12 bg-background/50"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {!isSetup && (
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 bg-background/50"
              />
            )}

            {error && (
              <p className="text-sm text-destructive animate-fade-in">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading
                ? 'Please wait...'
                : isSetup
                ? 'Unlock Journal'
                : 'Create Journal'}
            </Button>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-muted-foreground mt-6 animate-fade-in">
          All your data is stored locally on this device
        </p>
      </div>
    </div>
  );
}
