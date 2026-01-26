// Mood types
export type MoodCategory = 'positive' | 'neutral' | 'negative';

export interface Mood {
  id: string;
  name: string;
  emoji: string;
  category: MoodCategory;
}

// Predefined moods
export const MOODS: Mood[] = [
  // Positive
  { id: 'happy', name: 'Happy', emoji: '😊', category: 'positive' },
  { id: 'excited', name: 'Excited', emoji: '🤩', category: 'positive' },
  { id: 'grateful', name: 'Grateful', emoji: '🙏', category: 'positive' },
  { id: 'peaceful', name: 'Peaceful', emoji: '😌', category: 'positive' },
  { id: 'loved', name: 'Loved', emoji: '🥰', category: 'positive' },
  { id: 'proud', name: 'Proud', emoji: '😤', category: 'positive' },
  { id: 'hopeful', name: 'Hopeful', emoji: '✨', category: 'positive' },
  { id: 'energetic', name: 'Energetic', emoji: '⚡', category: 'positive' },
  
  // Neutral
  { id: 'calm', name: 'Calm', emoji: '😐', category: 'neutral' },
  { id: 'thoughtful', name: 'Thoughtful', emoji: '🤔', category: 'neutral' },
  { id: 'tired', name: 'Tired', emoji: '😴', category: 'neutral' },
  { id: 'busy', name: 'Busy', emoji: '🏃', category: 'neutral' },
  { id: 'focused', name: 'Focused', emoji: '🎯', category: 'neutral' },
  { id: 'indifferent', name: 'Indifferent', emoji: '😶', category: 'neutral' },
  
  // Negative
  { id: 'sad', name: 'Sad', emoji: '😢', category: 'negative' },
  { id: 'anxious', name: 'Anxious', emoji: '😰', category: 'negative' },
  { id: 'stressed', name: 'Stressed', emoji: '😫', category: 'negative' },
  { id: 'angry', name: 'Angry', emoji: '😠', category: 'negative' },
  { id: 'frustrated', name: 'Frustrated', emoji: '😤', category: 'negative' },
  { id: 'lonely', name: 'Lonely', emoji: '🥺', category: 'negative' },
  { id: 'overwhelmed', name: 'Overwhelmed', emoji: '🤯', category: 'negative' },
];

// Tag types
export interface Tag {
  id: string;
  name: string;
  color?: string;
  isCustom: boolean;
}

export const DEFAULT_TAGS: Tag[] = [
  { id: 'work', name: 'Work', isCustom: false },
  { id: 'health', name: 'Health', isCustom: false },
  { id: 'travel', name: 'Travel', isCustom: false },
  { id: 'fitness', name: 'Fitness', isCustom: false },
  { id: 'family', name: 'Family', isCustom: false },
  { id: 'personal', name: 'Personal', isCustom: false },
  { id: 'learning', name: 'Learning', isCustom: false },
  { id: 'creative', name: 'Creative', isCustom: false },
];

// Journal Entry
export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD format, unique per entry
  title: string;
  content: string; // Markdown content
  primaryMood: string | null; // Mood ID
  secondaryMoods: string[]; // Up to 2 mood IDs
  tags: string[]; // Tag IDs
  wordCount: number;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

// User settings and auth
export interface UserSettings {
  passwordHash: string;
  theme: 'light' | 'dark' | 'system';
  createdAt: string;
}

// Streak data
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: string | null;
  missedDays: string[]; // Array of YYYY-MM-DD dates
}

// App state
export interface AppState {
  isAuthenticated: boolean;
  isSetup: boolean;
  entries: JournalEntry[];
  customTags: Tag[];
  settings: UserSettings | null;
  streakData: StreakData;
}
