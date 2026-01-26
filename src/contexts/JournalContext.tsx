import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  JournalEntry, 
  UserSettings, 
  StreakData, 
  Tag, 
  DEFAULT_TAGS,
  AppState 
} from '@/lib/types';
import {
  getEntries,
  saveEntry as saveEntryToStorage,
  deleteEntry as deleteEntryFromStorage,
  getSettings,
  saveSettings,
  getCustomTags,
  saveCustomTags,
  getStreakData,
  isSessionValid,
  setSession,
  hashPassword,
  verifyPassword,
  isAppSetup,
  updateStreakData,
  generateId,
  countWords,
  getTodayDate,
} from '@/lib/storage';

interface JournalContextType {
  // Auth state
  isAuthenticated: boolean;
  isSetup: boolean;
  
  // Data
  entries: JournalEntry[];
  allTags: Tag[];
  customTags: Tag[];
  settings: UserSettings | null;
  streakData: StreakData;
  
  // Actions
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  setupApp: (password: string) => Promise<void>;
  
  // Entry management
  getEntryByDate: (date: string) => JournalEntry | undefined;
  saveEntry: (entry: Partial<JournalEntry> & { date: string }) => void;
  deleteEntry: (date: string) => void;
  
  // Tags
  addCustomTag: (name: string) => Tag;
  
  // Settings
  updateTheme: (theme: 'light' | 'dark' | 'system') => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  
  // Refresh data
  refreshData: () => void;
}

const JournalContext = createContext<JournalContextType | null>(null);

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [customTags, setCustomTags] = useState<Tag[]>([]);
  const [settings, setSettingsState] = useState<UserSettings | null>(null);
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastEntryDate: null,
    missedDays: [],
  });

  const allTags = [...DEFAULT_TAGS, ...customTags];

  const refreshData = useCallback(() => {
    setEntries(getEntries());
    setCustomTags(getCustomTags());
    setSettingsState(getSettings());
    setStreakData(getStreakData());
  }, []);

  // Initialize state
  useEffect(() => {
    const setup = isAppSetup();
    setIsSetup(setup);
    
    if (setup && isSessionValid()) {
      setIsAuthenticated(true);
      refreshData();
    }
  }, [refreshData]);

  // Apply theme
  useEffect(() => {
    if (settings?.theme) {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      
      if (settings.theme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(systemDark ? 'dark' : 'light');
      } else {
        root.classList.add(settings.theme);
      }
    }
  }, [settings?.theme]);

  const login = async (password: string): Promise<boolean> => {
    const currentSettings = getSettings();
    if (!currentSettings) return false;

    const isValid = await verifyPassword(password, currentSettings.passwordHash);
    if (isValid) {
      setSession(true);
      setIsAuthenticated(true);
      refreshData();
    }
    return isValid;
  };

  const logout = () => {
    setSession(false);
    setIsAuthenticated(false);
  };

  const setupApp = async (password: string) => {
    const passwordHash = await hashPassword(password);
    const newSettings: UserSettings = {
      passwordHash,
      theme: 'light',
      createdAt: new Date().toISOString(),
    };
    saveSettings(newSettings);
    setSession(true);
    setIsSetup(true);
    setIsAuthenticated(true);
    setSettingsState(newSettings);
  };

  const getEntryByDate = (date: string): JournalEntry | undefined => {
    return entries.find(e => e.date === date);
  };

  const saveEntry = (entryData: Partial<JournalEntry> & { date: string }) => {
    const existing = getEntryByDate(entryData.date);
    const now = new Date().toISOString();

    const entry: JournalEntry = {
      id: existing?.id || generateId(),
      date: entryData.date,
      title: entryData.title || '',
      content: entryData.content || '',
      primaryMood: entryData.primaryMood ?? existing?.primaryMood ?? null,
      secondaryMoods: entryData.secondaryMoods ?? existing?.secondaryMoods ?? [],
      tags: entryData.tags ?? existing?.tags ?? [],
      wordCount: countWords(entryData.content || ''),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    saveEntryToStorage(entry);
    refreshData();
  };

  const deleteEntryHandler = (date: string) => {
    deleteEntryFromStorage(date);
    refreshData();
  };

  const addCustomTagHandler = (name: string): Tag => {
    const newTag: Tag = {
      id: generateId(),
      name,
      isCustom: true,
    };
    const updatedTags = [...customTags, newTag];
    saveCustomTags(updatedTags);
    setCustomTags(updatedTags);
    return newTag;
  };

  const updateTheme = (theme: 'light' | 'dark' | 'system') => {
    if (settings) {
      const updated = { ...settings, theme };
      saveSettings(updated);
      setSettingsState(updated);
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    if (!settings) return false;
    
    const isValid = await verifyPassword(oldPassword, settings.passwordHash);
    if (!isValid) return false;

    const newHash = await hashPassword(newPassword);
    const updated = { ...settings, passwordHash: newHash };
    saveSettings(updated);
    setSettingsState(updated);
    return true;
  };

  return (
    <JournalContext.Provider
      value={{
        isAuthenticated,
        isSetup,
        entries,
        allTags,
        customTags,
        settings,
        streakData,
        login,
        logout,
        setupApp,
        getEntryByDate,
        saveEntry,
        deleteEntry: deleteEntryHandler,
        addCustomTag: addCustomTagHandler,
        updateTheme,
        changePassword,
        refreshData,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
}
