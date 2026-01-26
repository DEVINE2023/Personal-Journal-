import React, { useState, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Heading2,
  Eye,
  Edit3
} from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = useCallback((prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = 
      value.substring(0, start) + 
      prefix + 
      selectedText + 
      suffix + 
      value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange]);

  const toolbarButtons = [
    { icon: Bold, action: () => insertMarkdown('**', '**'), title: 'Bold' },
    { icon: Italic, action: () => insertMarkdown('*', '*'), title: 'Italic' },
    { icon: Heading2, action: () => insertMarkdown('\n## ', '\n'), title: 'Heading' },
    { icon: Quote, action: () => insertMarkdown('\n> ', '\n'), title: 'Quote' },
    { icon: List, action: () => insertMarkdown('\n- ', '\n'), title: 'Bullet List' },
    { icon: ListOrdered, action: () => insertMarkdown('\n1. ', '\n'), title: 'Numbered List' },
  ];

  const renderMarkdown = (text: string) => {
    // Simple markdown to HTML conversion
    let html = text
      // Escape HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-5 mb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
      // Bold and italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Blockquotes
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-2">$1</blockquote>')
      // Lists
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-6 list-decimal">$1</li>')
      .replace(/^- (.*$)/gm, '<li class="ml-6 list-disc">$1</li>')
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br/>');

    return `<p class="mb-4">${html}</p>`;
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {toolbarButtons.map(({ icon: Icon, action, title }) => (
            <Button
              key={title}
              type="button"
              variant="ghost"
              size="sm"
              onClick={action}
              className="h-8 w-8 p-0"
              title={title}
              disabled={isPreview}
            >
              <Icon className="w-4 h-4" />
            </Button>
          ))}
        </div>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
          className="h-8 gap-1.5"
        >
          {isPreview ? (
            <>
              <Edit3 className="w-4 h-4" />
              Edit
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Preview
            </>
          )}
        </Button>
      </div>

      {/* Editor / Preview */}
      {isPreview ? (
        <div 
          className={cn(
            "min-h-[300px] p-4 rounded-lg border bg-background/50",
            "prose-journal"
          )}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
        />
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Start writing your thoughts..."}
          className={cn(
            "min-h-[300px] resize-none font-serif text-base leading-relaxed",
            "bg-background/50 focus:bg-background transition-colors"
          )}
        />
      )}
    </div>
  );
}
