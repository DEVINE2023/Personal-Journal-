import { JournalEntry, MOODS, Tag, DEFAULT_TAGS } from '@/lib/types';
import { formatDate } from '@/lib/storage';
import { getCustomTags } from '@/lib/storage';

export async function exportToPDF(entries: JournalEntry[], dateRange?: { start: string; end: string }) {
  // Filter entries by date range if provided
  let filteredEntries = [...entries];
  
  if (dateRange) {
    filteredEntries = entries.filter(entry => {
      return entry.date >= dateRange.start && entry.date <= dateRange.end;
    });
  }

  // Sort by date ascending
  filteredEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (filteredEntries.length === 0) {
    alert('No entries found for the selected date range');
    return;
  }

  const allTags = [...DEFAULT_TAGS, ...getCustomTags()];

  // Generate HTML content
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Journal Export</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:wght@400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Lora', Georgia, serif;
          line-height: 1.8;
          color: #2D3436;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
        }
        
        .cover {
          text-align: center;
          page-break-after: always;
          padding: 100px 0;
        }
        
        .cover h1 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 48px;
          margin-bottom: 20px;
          color: #5C7F6B;
        }
        
        .cover .subtitle {
          font-style: italic;
          color: #666;
          font-size: 18px;
        }
        
        .cover .date-range {
          margin-top: 40px;
          font-size: 14px;
          color: #888;
        }
        
        .entry {
          page-break-inside: avoid;
          margin-bottom: 60px;
          padding-bottom: 40px;
          border-bottom: 1px solid #ddd;
        }
        
        .entry:last-child {
          border-bottom: none;
        }
        
        .entry-date {
          font-size: 14px;
          color: #888;
          margin-bottom: 8px;
        }
        
        .entry-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 28px;
          margin-bottom: 16px;
          color: #2D3436;
        }
        
        .entry-meta {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
          font-size: 14px;
          color: #666;
        }
        
        .entry-mood {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .entry-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .tag {
          background: #f5f5f5;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 12px;
        }
        
        .entry-content {
          font-size: 16px;
          white-space: pre-wrap;
        }
        
        .entry-content h1, .entry-content h2, .entry-content h3 {
          font-family: 'Playfair Display', Georgia, serif;
          margin: 20px 0 10px;
        }
        
        .entry-content p {
          margin-bottom: 16px;
        }
        
        .entry-content blockquote {
          border-left: 3px solid #5C7F6B;
          padding-left: 16px;
          font-style: italic;
          color: #666;
          margin: 16px 0;
        }
        
        .word-count {
          font-size: 12px;
          color: #aaa;
          margin-top: 20px;
        }
        
        @media print {
          body {
            padding: 20px;
          }
          
          .entry {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="cover">
        <h1>My Journal</h1>
        <p class="subtitle">A collection of thoughts and reflections</p>
        <p class="date-range">
          ${dateRange 
            ? `${formatDate(dateRange.start)} – ${formatDate(dateRange.end)}`
            : `${filteredEntries.length} entries`
          }
        </p>
      </div>
      
      ${filteredEntries.map(entry => {
        const primaryMood = MOODS.find(m => m.id === entry.primaryMood);
        const entryTags = allTags.filter(t => entry.tags.includes(t.id));
        
        // Simple markdown to HTML
        let content = entry.content
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/^### (.*$)/gm, '<h3>$1</h3>')
          .replace(/^## (.*$)/gm, '<h2>$1</h2>')
          .replace(/^# (.*$)/gm, '<h1>$1</h1>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
          .replace(/\n\n/g, '</p><p>')
          .replace(/\n/g, '<br>');
        
        content = `<p>${content}</p>`;
        
        return `
          <div class="entry">
            <p class="entry-date">${formatDate(entry.date)}</p>
            <h2 class="entry-title">${entry.title || 'Untitled Entry'}</h2>
            
            <div class="entry-meta">
              ${primaryMood ? `
                <div class="entry-mood">
                  <span>${primaryMood.emoji}</span>
                  <span>${primaryMood.name}</span>
                </div>
              ` : ''}
              
              ${entryTags.length > 0 ? `
                <div class="entry-tags">
                  ${entryTags.map(t => `<span class="tag">${t.name}</span>`).join('')}
                </div>
              ` : ''}
            </div>
            
            <div class="entry-content">
              ${content}
            </div>
            
            <p class="word-count">${entry.wordCount} words</p>
          </div>
        `;
      }).join('')}
    </body>
    </html>
  `;

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for fonts to load then print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}
