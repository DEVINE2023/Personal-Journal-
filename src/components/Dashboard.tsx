import React from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { MOODS, MoodCategory } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Flame, Trophy, Calendar, TrendingUp, BarChart3 } from 'lucide-react';

export function Dashboard() {
  const { entries, streakData, allTags } = useJournal();

  // Calculate mood distribution
  const moodStats = entries.reduce(
    (acc, entry) => {
      if (entry.primaryMood) {
        const mood = MOODS.find(m => m.id === entry.primaryMood);
        if (mood) {
          acc[mood.category] = (acc[mood.category] || 0) + 1;
          acc.moods[mood.id] = (acc.moods[mood.id] || 0) + 1;
        }
      }
      return acc;
    },
    { positive: 0, neutral: 0, negative: 0, moods: {} as Record<string, number> }
  );

  const totalMoods = moodStats.positive + moodStats.neutral + moodStats.negative;

  // Top moods
  const topMoods = Object.entries(moodStats.moods)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, count]) => ({
      mood: MOODS.find(m => m.id === id)!,
      count,
    }));

  // Tag usage
  const tagStats = entries.reduce((acc, entry) => {
    entry.tags.forEach(tagId => {
      acc[tagId] = (acc[tagId] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topTags = Object.entries(tagStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, count]) => ({
      tag: allTags.find(t => t.id === id),
      count,
    }))
    .filter(item => item.tag);

  // Word count stats
  const totalWords = entries.reduce((sum, e) => sum + e.wordCount, 0);
  const avgWords = entries.length > 0 ? Math.round(totalWords / entries.length) : 0;

  // Weekly word count trend
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const entry = entries.find(e => e.date === dateStr);
    last7Days.push({
      date: dateStr,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      words: entry?.wordCount || 0,
      hasEntry: !!entry,
    });
  }

  const maxWords = Math.max(...last7Days.map(d => d.words), 100);

  return (
    <div className="space-y-6">
      {/* Streak cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="gradient-card rounded-xl p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-streak/10">
              <Flame className="w-5 h-5 text-streak animate-flicker" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">
                {streakData.currentStreak}
              </p>
              <p className="text-xs text-muted-foreground">Current streak</p>
            </div>
          </div>
        </div>

        <div className="gradient-card rounded-xl p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">
                {streakData.longestStreak}
              </p>
              <p className="text-xs text-muted-foreground">Best streak</p>
            </div>
          </div>
        </div>

        <div className="gradient-card rounded-xl p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Calendar className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">
                {entries.length}
              </p>
              <p className="text-xs text-muted-foreground">Total entries</p>
            </div>
          </div>
        </div>

        <div className="gradient-card rounded-xl p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">
                {avgWords}
              </p>
              <p className="text-xs text-muted-foreground">Avg. words</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly activity */}
      <div className="gradient-card rounded-xl p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">This Week</h3>
        </div>
        <div className="flex items-end justify-between gap-2 h-32">
          {last7Days.map(day => (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <div className="w-full flex flex-col items-center justify-end h-24">
                <div
                  className={cn(
                    'w-full max-w-[40px] rounded-t-lg transition-all',
                    day.hasEntry ? 'bg-primary' : 'bg-muted'
                  )}
                  style={{
                    height: `${(day.words / maxWords) * 100}%`,
                    minHeight: day.hasEntry ? '8px' : '4px',
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{day.day}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground text-center mt-4">
          {totalWords.toLocaleString()} words written total
        </p>
      </div>

      {/* Mood distribution */}
      {totalMoods > 0 && (
        <div className="gradient-card rounded-xl p-6 shadow-soft">
          <h3 className="font-semibold text-foreground mb-4">Mood Distribution</h3>
          
          {/* Bar */}
          <div className="h-4 rounded-full overflow-hidden flex mb-4">
            <div
              className="bg-mood-positive transition-all"
              style={{ width: `${(moodStats.positive / totalMoods) * 100}%` }}
            />
            <div
              className="bg-mood-neutral transition-all"
              style={{ width: `${(moodStats.neutral / totalMoods) * 100}%` }}
            />
            <div
              className="bg-mood-negative transition-all"
              style={{ width: `${(moodStats.negative / totalMoods) * 100}%` }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-mood-positive" />
              <span className="text-muted-foreground">
                Positive ({Math.round((moodStats.positive / totalMoods) * 100)}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-mood-neutral" />
              <span className="text-muted-foreground">
                Neutral ({Math.round((moodStats.neutral / totalMoods) * 100)}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-mood-negative" />
              <span className="text-muted-foreground">
                Negative ({Math.round((moodStats.negative / totalMoods) * 100)}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Top moods and tags */}
      <div className="grid md:grid-cols-2 gap-4">
        {topMoods.length > 0 && (
          <div className="gradient-card rounded-xl p-6 shadow-soft">
            <h3 className="font-semibold text-foreground mb-4">Top Moods</h3>
            <div className="space-y-3">
              {topMoods.map(({ mood, count }) => (
                <div key={mood.id} className="flex items-center gap-3">
                  <span className="text-xl">{mood.emoji}</span>
                  <span className="flex-1 text-sm">{mood.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {count} {count === 1 ? 'time' : 'times'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {topTags.length > 0 && (
          <div className="gradient-card rounded-xl p-6 shadow-soft">
            <h3 className="font-semibold text-foreground mb-4">Top Tags</h3>
            <div className="space-y-3">
              {topTags.map(({ tag, count }) => (
                <div key={tag!.id} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="flex-1 text-sm">{tag!.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {count} {count === 1 ? 'entry' : 'entries'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
