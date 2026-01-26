import { JournalEntry, UserSettings, StreakData, Tag, AppState } from './types';

const STORAGE_KEYS = {
  ENTRIES: 'journal_entries',
  SETTINGS: 'journal_settings',
  CUSTOM_TAGS: 'journal_custom_tags',
  STREAK: 'journal_streak',
  SESSION: 'journal_session',
};

// Simple hash function for password (in production, use bcrypt via backend)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'journal_salt_v1');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Storage functions
export function getEntries(): JournalEntry[] {
  const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
  return data ? JSON.parse(data) : [];
}

export function saveEntries(entries: JournalEntry[]): void {
  localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
}

export function getEntry(date: string): JournalEntry | undefined {
  const entries = getEntries();
  return entries.find(e => e.date === date);
}

export function saveEntry(entry: JournalEntry): void {
  const entries = getEntries();
  const existingIndex = entries.findIndex(e => e.date === entry.date);
  
  if (existingIndex >= 0) {
    entries[existingIndex] = { ...entry, updatedAt: new Date().toISOString() };
  } else {
    entries.push(entry);
  }
  
  saveEntries(entries);
  updateStreakData();
}

export function deleteEntry(date: string): void {
  const entries = getEntries();
  const filtered = entries.filter(e => e.date !== date);
  saveEntries(filtered);
  updateStreakData();
}

// Settings
export function getSettings(): UserSettings | null {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : null;
}

export function saveSettings(settings: UserSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function isAppSetup(): boolean {
  return getSettings() !== null;
}

// Custom tags
export function getCustomTags(): Tag[] {
  const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_TAGS);
  return data ? JSON.parse(data) : [];
}

export function saveCustomTags(tags: Tag[]): void {
  localStorage.setItem(STORAGE_KEYS.CUSTOM_TAGS, JSON.stringify(tags));
}

export function addCustomTag(tag: Tag): void {
  const tags = getCustomTags();
  tags.push(tag);
  saveCustomTags(tags);
}

// Session management
export function setSession(authenticated: boolean): void {
  if (authenticated) {
    sessionStorage.setItem(STORAGE_KEYS.SESSION, 'true');
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION);
  }
}

export function isSessionValid(): boolean {
  return sessionStorage.getItem(STORAGE_KEYS.SESSION) === 'true';
}

// Streak calculation
export function getStreakData(): StreakData {
  const data = localStorage.getItem(STORAGE_KEYS.STREAK);
  if (data) {
    return JSON.parse(data);
  }
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastEntryDate: null,
    missedDays: [],
  };
}

export function saveStreakData(streak: StreakData): void {
  localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
}

export function updateStreakData(): void {
  const entries = getEntries();
  if (entries.length === 0) {
    saveStreakData({
      currentStreak: 0,
      longestStreak: 0,
      lastEntryDate: null,
      missedDays: [],
    });
    return;
  }

  // Sort entries by date descending
  const sortedDates = entries
    .map(e => e.date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const latestEntryDate = new Date(sortedDates[0]);
  latestEntryDate.setHours(0, 0, 0, 0);

  // Check if streak is still active (entry today or yesterday)
  const isStreakActive = 
    latestEntryDate.getTime() === today.getTime() ||
    latestEntryDate.getTime() === yesterday.getTime();

  let currentStreak = 0;
  const missedDays: string[] = [];

  if (isStreakActive) {
    // Count consecutive days
    let checkDate = latestEntryDate;
    const entryDatesSet = new Set(sortedDates);

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (entryDatesSet.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  const allDates = [...sortedDates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
  for (let i = 0; i < allDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(allDates[i - 1]);
      const currDate = new Date(allDates[i]);
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  // Find missed days in the last 30 days
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const entryDatesSet = new Set(sortedDates);

  for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    if (!entryDatesSet.has(dateStr) && d < today) {
      missedDays.push(dateStr);
    }
  }

  const streakData: StreakData = {
    currentStreak,
    longestStreak,
    lastEntryDate: sortedDates[0] || null,
    missedDays: missedDays.slice(-10), // Keep last 10 missed days
  };

  saveStreakData(streakData);
}

// Word count helper
export function countWords(text: string): number {
  return text
    .replace(/[#*_`~\[\]()]/g, '') // Remove markdown
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;
}

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Format date for display
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
