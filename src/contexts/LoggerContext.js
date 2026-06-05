"use client";
import { createContext, useContext, useState, useCallback } from 'react';

const LoggerContext = createContext(null);

export function LoggerProvider({ children }) {
  const [loggerOpen, setLoggerOpen] = useState(false);
  const [preselectedMuscle, setPreselectedMuscle] = useState(null);

  const openLogger = useCallback((muscle = null) => {
    setPreselectedMuscle(muscle);
    setLoggerOpen(true);
  }, []);

  const closeLogger = useCallback(() => {
    setLoggerOpen(false);
    setPreselectedMuscle(null);
  }, []);

  return (
    <LoggerContext.Provider value={{ loggerOpen, preselectedMuscle, openLogger, closeLogger }}>
      {children}
    </LoggerContext.Provider>
  );
}

export function useLogger() {
  const ctx = useContext(LoggerContext);
  if (!ctx) throw new Error('useLogger must be used inside LoggerProvider');
  return ctx;
}
