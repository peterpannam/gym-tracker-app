"use client";
import { createContext, useContext, useState, useCallback } from 'react';

const LoggerContext = createContext(null);

export function LoggerProvider({ children }) {
  const [loggerOpen, setLoggerOpen] = useState(false);
  const [preselectedMuscle, setPreselectedMuscle] = useState(null);
  const [savedAt, setSavedAt] = useState(0);

  const openLogger = useCallback((muscle = null) => {
    setPreselectedMuscle(muscle);
    setLoggerOpen(true);
  }, []);

  const closeLogger = useCallback(() => {
    setLoggerOpen(false);
    setPreselectedMuscle(null);
  }, []);

  const notifySaved = useCallback(() => setSavedAt(Date.now()), []);

  return (
    <LoggerContext.Provider value={{ loggerOpen, preselectedMuscle, openLogger, closeLogger, savedAt, notifySaved }}>
      {children}
    </LoggerContext.Provider>
  );
}

export function useLogger() {
  const ctx = useContext(LoggerContext);
  if (!ctx) throw new Error('useLogger must be used inside LoggerProvider');
  return ctx;
}
