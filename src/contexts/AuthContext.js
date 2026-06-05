"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import {
  getSession,
  setSession,
  clearSession,
  createProfile as storageCreateProfile,
  verifyPin,
} from '@/lib/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session) setCurrentProfile(session);
    setIsLoading(false);
  }, []);

  function login(profileId, pin) {
    if (!verifyPin(profileId, pin)) return false;
    setSession(profileId);
    setCurrentProfile(getSession());
    return true;
  }

  function logout() {
    clearSession();
    setCurrentProfile(null);
  }

  function createProfile(name, pin) {
    const profile = storageCreateProfile(name, pin);
    setSession(profile.id);
    setCurrentProfile(getSession());
    return profile;
  }

  return (
    <AuthContext.Provider value={{ currentProfile, isLoading, login, logout, createProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
