"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoggerProvider, useLogger } from '@/contexts/LoggerContext';
import Navigation from '@/app/components/Navigation';
import WorkoutLogger from '@/app/components/workoutLog';

function MainShell({ children }) {
  const { currentProfile, isLoading } = useAuth();
  const router = useRouter();
  const { loggerOpen, preselectedMuscle, openLogger, closeLogger } = useLogger();

  useEffect(() => {
    if (!isLoading && !currentProfile) router.replace('/login');
  }, [currentProfile, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-t3 text-[14px]">Loading…</div>
      </div>
    );
  }

  if (!currentProfile) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 pb-24 gt-scroll overflow-y-auto">
        {children}
      </main>

      {loggerOpen && (
        <WorkoutLogger
          preselectedMuscle={preselectedMuscle}
          onClose={closeLogger}
          onSave={closeLogger}
        />
      )}

      <Navigation onLogOpen={() => openLogger(null)} />
    </div>
  );
}

export default function MainLayout({ children }) {
  return (
    <LoggerProvider>
      <MainShell>{children}</MainShell>
    </LoggerProvider>
  );
}
