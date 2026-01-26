import React, { useState } from 'react';
import { JournalProvider, useJournal } from '@/contexts/JournalContext';
import { LockScreen } from '@/components/LockScreen';
import { JournalEditor } from '@/components/JournalEditor';
import { CalendarView } from '@/components/CalendarView';
import { TimelineView } from '@/components/TimelineView';
import { Dashboard } from '@/components/Dashboard';
import { Settings } from '@/components/Settings';
import { ExportDialog } from '@/components/ExportDialog';
import { exportToPDF } from '@/lib/exportPDF';
import { getTodayDate } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  List, 
  BarChart3,
  Flame,
  PenLine
} from 'lucide-react';
import { cn } from '@/lib/utils';

type View = 'dashboard' | 'calendar' | 'timeline' | 'editor';

function JournalApp() {
  const { isAuthenticated, isSetup, entries, streakData } = useJournal();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Show lock screen if not authenticated
  if (!isAuthenticated) {
    return <LockScreen />;
  }

  // Show editor if a date is selected
  if (selectedDate) {
    return (
      <JournalEditor
        date={selectedDate}
        onBack={() => setSelectedDate(null)}
      />
    );
  }

  const handleNewEntry = () => {
    setSelectedDate(getTodayDate());
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  const handleExportPDF = () => {
    exportToPDF(entries);
  };

  const todayEntry = entries.find(e => e.date === getTodayDate());

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-xl font-semibold text-foreground">
                  Reflect
                </h1>
              </div>
            </div>

            {/* Streak indicator */}
            {streakData.currentStreak > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-streak/10">
                <Flame className="w-4 h-4 text-streak animate-flicker" />
                <span className="text-sm font-medium text-foreground">
                  {streakData.currentStreak} day streak
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <ExportDialog />
              <Settings onExportPDF={handleExportPDF} />
              <Button onClick={handleNewEntry} className="gap-2">
                {todayEntry ? (
                  <>
                    <PenLine className="w-4 h-4" />
                    <span className="hidden sm:inline">Continue Today</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">New Entry</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as View)}>
          {/* Tab navigation */}
          <TabsList className="mb-8 w-full sm:w-auto">
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="animate-fade-in">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-1">
                Welcome back
              </h2>
              <p className="text-muted-foreground">
                Here's an overview of your journaling journey
              </p>
            </div>
            <Dashboard />
          </TabsContent>

          {/* Calendar */}
          <TabsContent value="calendar" className="animate-fade-in">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-1">
                Calendar
              </h2>
              <p className="text-muted-foreground">
                Navigate your entries by date
              </p>
            </div>
            <CalendarView onSelectDate={handleSelectDate} />
          </TabsContent>

          {/* Timeline */}
          <TabsContent value="timeline" className="animate-fade-in">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-1">
                Timeline
              </h2>
              <p className="text-muted-foreground">
                Browse and search all your entries
              </p>
            </div>
            <TimelineView onSelectDate={handleSelectDate} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Empty state for new users */}
      {entries.length === 0 && currentView === 'dashboard' && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-8 pointer-events-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <PenLine className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
              Start Your Journey
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Your journal awaits. Write your first entry and begin reflecting on your days.
            </p>
            <Button size="lg" onClick={handleNewEntry} className="gap-2">
              <Plus className="w-5 h-5" />
              Write First Entry
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Index() {
  return (
    <JournalProvider>
      <JournalApp />
    </JournalProvider>
  );
}
