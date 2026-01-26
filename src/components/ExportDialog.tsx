import React, { useState } from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { exportToPDF } from '@/lib/exportPDF';
import { getTodayDate } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Download, Calendar } from 'lucide-react';

export function ExportDialog() {
  const { entries } = useJournal();
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(getTodayDate());
  const [exportAll, setExportAll] = useState(true);

  // Get date range from entries
  const sortedDates = entries
    .map(e => e.date)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
  const earliestDate = sortedDates[0] || getTodayDate();
  const latestDate = sortedDates[sortedDates.length - 1] || getTodayDate();

  const handleExport = () => {
    if (exportAll) {
      exportToPDF(entries);
    } else if (startDate && endDate) {
      exportToPDF(entries, { start: startDate, end: endDate });
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Journal</DialogTitle>
          <DialogDescription>
            Export your journal entries as a beautifully formatted PDF
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant={exportAll ? 'default' : 'outline'}
              onClick={() => setExportAll(true)}
              className="flex-1"
            >
              All Entries ({entries.length})
            </Button>
            <Button
              variant={!exportAll ? 'default' : 'outline'}
              onClick={() => {
                setExportAll(false);
                if (!startDate) setStartDate(earliestDate);
              }}
              className="flex-1"
            >
              Date Range
            </Button>
          </div>

          {!exportAll && (
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={earliestDate}
                  max={endDate || latestDate}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || earliestDate}
                  max={latestDate}
                />
              </div>
            </div>
          )}

          <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <p>
              {exportAll
                ? `This will export all ${entries.length} journal entries.`
                : startDate && endDate
                ? `This will export entries from ${startDate} to ${endDate}.`
                : 'Select a date range to continue.'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={!exportAll && (!startDate || !endDate)}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
