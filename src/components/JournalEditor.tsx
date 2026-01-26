import React, { useState, useEffect } from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { JournalEntry, MOODS } from '@/lib/types';
import { formatDate, getTodayDate, countWords, generateId } from '@/lib/storage';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { MoodSelector } from '@/components/MoodSelector';
import { TagSelector } from '@/components/TagSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Calendar,
  Clock,
  FileText
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface JournalEditorProps {
  date: string;
  onBack: () => void;
}

export function JournalEditor({ date, onBack }: JournalEditorProps) {
  const { getEntryByDate, saveEntry, deleteEntry } = useJournal();
  const existingEntry = getEntryByDate(date);
  
  const [title, setTitle] = useState(existingEntry?.title || '');
  const [content, setContent] = useState(existingEntry?.content || '');
  const [primaryMood, setPrimaryMood] = useState<string | null>(
    existingEntry?.primaryMood || null
  );
  const [secondaryMoods, setSecondaryMoods] = useState<string[]>(
    existingEntry?.secondaryMoods || []
  );
  const [tags, setTags] = useState<string[]>(existingEntry?.tags || []);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(
    existingEntry ? new Date(existingEntry.updatedAt) : null
  );

  const isToday = date === getTodayDate();
  const wordCount = countWords(content);

  // Auto-save after 2 seconds of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title || content) {
        handleSave(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, content, primaryMood, secondaryMoods, tags]);

  const handleSave = (silent = false) => {
    if (!silent) setIsSaving(true);
    
    saveEntry({
      date,
      title,
      content,
      primaryMood,
      secondaryMoods,
      tags,
    });
    
    setLastSaved(new Date());
    if (!silent) {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const handleDelete = () => {
    deleteEntry(date);
    onBack();
  };

  const getMoodDisplay = () => {
    if (!primaryMood) return null;
    const mood = MOODS.find(m => m.id === primaryMood);
    return mood ? `${mood.emoji} ${mood.name}` : null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">
                {isToday ? 'Today' : formatDate(date)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {existingEntry && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        journal entry for {formatDate(date)}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              
              <Button onClick={() => handleSave(false)} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8 animate-fade-in">
          {/* Title */}
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give this day a title..."
              className="text-2xl font-display border-0 border-b rounded-none px-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Mood selector */}
          <div className="gradient-card rounded-xl p-6 shadow-soft">
            <MoodSelector
              primaryMood={primaryMood}
              secondaryMoods={secondaryMoods}
              onPrimaryMoodChange={setPrimaryMood}
              onSecondaryMoodsChange={setSecondaryMoods}
            />
          </div>

          {/* Tags */}
          <div className="gradient-card rounded-xl p-6 shadow-soft">
            <TagSelector
              selectedTags={tags}
              onTagsChange={setTags}
            />
          </div>

          {/* Content editor */}
          <div className="gradient-card rounded-xl p-6 shadow-soft">
            <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Your thoughts
            </h3>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="What's on your mind today? Write freely..."
            />
          </div>

          {/* Footer info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>{wordCount} words</span>
              {getMoodDisplay() && (
                <span>Mood: {getMoodDisplay()}</span>
              )}
            </div>
            {lastSaved && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>
                  Last saved {lastSaved.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
