import React, { useState } from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { MOODS, MoodCategory } from '@/lib/types';
import { formatDateShort } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarViewProps {
  onSelectDate: (date: string) => void;
}

export function CalendarView({ onSelectDate }: CalendarViewProps) {
  const { entries, streakData } = useJournal();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const entryDates = new Set(entries.map(e => e.date));
  const entryMoods = entries.reduce((acc, entry) => {
    if (entry.primaryMood) {
      const mood = MOODS.find(m => m.id === entry.primaryMood);
      if (mood) {
        acc[entry.date] = mood;
      }
    }
    return acc;
  }, {} as Record<string, typeof MOODS[0]>);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isFuture = (day: number) => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const formatDateStr = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getMoodColor = (category: MoodCategory) => {
    switch (category) {
      case 'positive':
        return 'bg-mood-positive';
      case 'neutral':
        return 'bg-mood-neutral';
      case 'negative':
        return 'bg-mood-negative';
    }
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDateStr(day);
    const hasEntry = entryDates.has(dateStr);
    const mood = entryMoods[dateStr];
    const future = isFuture(day);
    const today = isToday(day);

    days.push(
      <button
        key={day}
        onClick={() => !future && onSelectDate(dateStr)}
        disabled={future}
        className={cn(
          'aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-all',
          'text-sm font-medium relative',
          future && 'opacity-30 cursor-not-allowed',
          !future && !hasEntry && 'hover:bg-muted',
          today && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
          hasEntry && 'bg-primary/10 hover:bg-primary/20'
        )}
      >
        <span className={cn(
          today && 'text-primary font-bold',
          hasEntry && 'text-primary'
        )}>
          {day}
        </span>
        {mood && (
          <span className="text-xs">{mood.emoji}</span>
        )}
        {hasEntry && !mood && (
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        )}
      </button>
    );
  }

  const monthYear = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="gradient-card rounded-xl p-6 shadow-soft">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-semibold">{monthYear}</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={previousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary/10" />
            <span>Entry exists</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>😊</span>
            <span>Positive</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>😐</span>
            <span>Neutral</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>😢</span>
            <span>Negative</span>
          </div>
        </div>
      </div>
    </div>
  );
}
