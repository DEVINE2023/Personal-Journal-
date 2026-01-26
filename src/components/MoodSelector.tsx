import React from 'react';
import { MOODS, Mood, MoodCategory } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MoodSelectorProps {
  primaryMood: string | null;
  secondaryMoods: string[];
  onPrimaryMoodChange: (moodId: string | null) => void;
  onSecondaryMoodsChange: (moodIds: string[]) => void;
}

export function MoodSelector({
  primaryMood,
  secondaryMoods,
  onPrimaryMoodChange,
  onSecondaryMoodsChange,
}: MoodSelectorProps) {
  const moodsByCategory = MOODS.reduce((acc, mood) => {
    if (!acc[mood.category]) {
      acc[mood.category] = [];
    }
    acc[mood.category].push(mood);
    return acc;
  }, {} as Record<MoodCategory, Mood[]>);

  const handleMoodClick = (moodId: string) => {
    if (primaryMood === moodId) {
      // Deselect primary
      onPrimaryMoodChange(null);
    } else if (secondaryMoods.includes(moodId)) {
      // Remove from secondary
      onSecondaryMoodsChange(secondaryMoods.filter(id => id !== moodId));
    } else if (!primaryMood) {
      // Set as primary
      onPrimaryMoodChange(moodId);
    } else if (secondaryMoods.length < 2) {
      // Add to secondary
      onSecondaryMoodsChange([...secondaryMoods, moodId]);
    }
  };

  const getCategoryLabel = (category: MoodCategory): string => {
    switch (category) {
      case 'positive':
        return 'Positive';
      case 'neutral':
        return 'Neutral';
      case 'negative':
        return 'Negative';
    }
  };

  const getCategoryColor = (category: MoodCategory): string => {
    switch (category) {
      case 'positive':
        return 'text-mood-positive';
      case 'neutral':
        return 'text-mood-neutral';
      case 'negative':
        return 'text-mood-negative';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">How are you feeling?</h3>
        <p className="text-sm text-muted-foreground">
          {primaryMood ? '1 primary' : '0'}{' '}
          {secondaryMoods.length > 0 ? `+ ${secondaryMoods.length} secondary` : ''}
        </p>
      </div>

      {(['positive', 'neutral', 'negative'] as MoodCategory[]).map(category => (
        <div key={category} className="space-y-2">
          <p className={cn('text-sm font-medium', getCategoryColor(category))}>
            {getCategoryLabel(category)}
          </p>
          <div className="flex flex-wrap gap-2">
            {moodsByCategory[category]?.map(mood => {
              const isPrimary = primaryMood === mood.id;
              const isSecondary = secondaryMoods.includes(mood.id);
              const isSelected = isPrimary || isSecondary;

              return (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => handleMoodClick(mood.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all',
                    'border hover:shadow-soft',
                    isSelected
                      ? isPrimary
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary text-secondary-foreground border-primary/50'
                      : 'bg-background border-border hover:border-primary/30'
                  )}
                >
                  <span>{mood.emoji}</span>
                  <span>{mood.name}</span>
                  {isPrimary && (
                    <span className="text-xs opacity-75">★</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <p className="text-xs text-muted-foreground">
        Click to set primary mood, click again for secondary (max 2)
      </p>
    </div>
  );
}
