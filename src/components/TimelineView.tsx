import React, { useState, useMemo } from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { JournalEntry, MOODS, Tag } from '@/lib/types';
import { formatDate, formatDateShort } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Calendar, 
  FileText,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface TimelineViewProps {
  onSelectDate: (date: string) => void;
}

const ENTRIES_PER_PAGE = 10;

export function TimelineView({ onSelectDate }: TimelineViewProps) {
  const { entries, allTags } = useJournal();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and search entries
  const filteredEntries = useMemo(() => {
    let result = [...entries];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        entry =>
          entry.title.toLowerCase().includes(query) ||
          entry.content.toLowerCase().includes(query)
      );
    }

    // Mood filter
    if (selectedMoods.length > 0) {
      result = result.filter(
        entry =>
          (entry.primaryMood && selectedMoods.includes(entry.primaryMood)) ||
          entry.secondaryMoods.some(m => selectedMoods.includes(m))
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      result = result.filter(entry =>
        entry.tags.some(t => selectedTags.includes(t))
      );
    }

    // Sort by date descending
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return result;
  }, [entries, searchQuery, selectedMoods, selectedTags]);

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / ENTRIES_PER_PAGE);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * ENTRIES_PER_PAGE,
    currentPage * ENTRIES_PER_PAGE
  );

  const toggleMood = (moodId: string) => {
    setSelectedMoods(prev =>
      prev.includes(moodId)
        ? prev.filter(id => id !== moodId)
        : [...prev, moodId]
    );
    setCurrentPage(1);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMoods([]);
    setSelectedTags([]);
    setCurrentPage(1);
  };

  const hasFilters = searchQuery || selectedMoods.length > 0 || selectedTags.length > 0;

  const getPreview = (content: string) => {
    const text = content.replace(/[#*_`~\[\]()>-]/g, '').trim();
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
  };

  return (
    <div className="space-y-4">
      {/* Search and filter bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search entries..."
            className="pl-10"
          />
        </div>
        
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
              {hasFilters && (
                <Badge variant="secondary" className="ml-1">
                  {(selectedMoods.length || 0) + (selectedTags.length || 0)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {hasFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </div>

              {/* Mood filters */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Moods</p>
                <div className="flex flex-wrap gap-1.5">
                  {MOODS.slice(0, 10).map(mood => (
                    <button
                      key={mood.id}
                      onClick={() => toggleMood(mood.id)}
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs',
                        'border transition-all',
                        selectedMoods.includes(mood.id)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:border-primary/50'
                      )}
                    >
                      {mood.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag filters */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={cn(
                        'px-2 py-1 rounded-md text-xs',
                        'border transition-all',
                        selectedTags.includes(tag.id)
                          ? 'bg-accent text-accent-foreground border-accent'
                          : 'bg-background border-border hover:border-accent/50'
                      )}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filters display */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery('')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {selectedMoods.map(moodId => {
            const mood = MOODS.find(m => m.id === moodId);
            return mood ? (
              <Badge key={moodId} variant="secondary" className="gap-1">
                {mood.emoji} {mood.name}
                <button onClick={() => toggleMood(moodId)}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ) : null;
          })}
          {selectedTags.map(tagId => {
            const tag = allTags.find(t => t.id === tagId);
            return tag ? (
              <Badge key={tagId} variant="secondary" className="gap-1">
                {tag.name}
                <button onClick={() => toggleTag(tagId)}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ) : null;
          })}
        </div>
      )}

      {/* Entries list */}
      <div className="space-y-3">
        {paginatedEntries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No entries found</p>
            <p className="text-sm">
              {hasFilters
                ? 'Try adjusting your filters'
                : 'Start writing your first journal entry'}
            </p>
          </div>
        ) : (
          paginatedEntries.map(entry => {
            const mood = MOODS.find(m => m.id === entry.primaryMood);
            const entryTags = allTags.filter(t => entry.tags.includes(t.id));

            return (
              <button
                key={entry.id}
                onClick={() => onSelectDate(entry.date)}
                className="w-full text-left gradient-card rounded-xl p-5 shadow-soft hover:shadow-medium transition-all animate-fade-in"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {formatDate(entry.date)}
                      </span>
                    </div>
                    
                    <h3 className="font-display text-lg font-semibold text-foreground truncate">
                      {entry.title || 'Untitled Entry'}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2 font-serif">
                      {getPreview(entry.content)}
                    </p>

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {mood && (
                        <span className="text-lg">{mood.emoji}</span>
                      )}
                      {entryTags.slice(0, 3).map(tag => (
                        <Badge key={tag.id} variant="outline" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                      {entryTags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{entryTags.length - 3}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {entry.wordCount} words
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
