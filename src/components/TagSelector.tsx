import React, { useState } from 'react';
import { useJournal } from '@/contexts/JournalContext';
import { cn } from '@/lib/utils';
import { Plus, X, Tag as TagIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tagIds: string[]) => void;
}

export function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const { allTags, addCustomTag } = useJournal();
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const handleTagClick = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const handleAddTag = () => {
    if (newTagName.trim()) {
      const newTag = addCustomTag(newTagName.trim());
      onTagsChange([...selectedTags, newTag.id]);
      setNewTagName('');
      setShowAddTag(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <TagIcon className="w-4 h-4" />
          Tags
        </h3>
        <button
          type="button"
          onClick={() => setShowAddTag(!showAddTag)}
          className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add tag
        </button>
      </div>

      {showAddTag && (
        <div className="flex gap-2 animate-fade-in">
          <Input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="New tag name..."
            className="h-9"
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            autoFocus
          />
          <Button size="sm" onClick={handleAddTag}>
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowAddTag(false);
              setNewTagName('');
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {allTags.map(tag => {
          const isSelected = selectedTags.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleTagClick(tag.id)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all',
                'border hover:shadow-soft',
                isSelected
                  ? 'bg-accent text-accent-foreground border-accent'
                  : 'bg-background border-border hover:border-accent/50',
                tag.isCustom && 'italic'
              )}
            >
              <span>{tag.name}</span>
              {isSelected && <X className="w-3 h-3" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
