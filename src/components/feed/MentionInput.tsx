import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { User, Hash } from 'lucide-react';

interface MentionOption {
  id: string;
  name: string;
  type: 'person' | 'community';
  avatar?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string, mentions: any[]) => void;
  placeholder: string;
  className?: string;
}

export const MentionInput = ({ value, onChange, placeholder, className }: MentionInputProps) => {
  const { user } = useAuth();
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionOptions, setMentionOptions] = useState<MentionOption[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentions, setMentions] = useState<any[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = async (newValue: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    setCursorPosition(cursorPos);

    // Check for @ mentions
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);

    if (atMatch) {
      const query = atMatch[1];
      setMentionQuery(query);
      // Show mentions immediately when @ is typed
      if (query.length >= 0) {
        setShowMentions(true);
        // Debounce the searchMentions call
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
          searchMentions(query);
        }, 250);
      }
    } else {
      setShowMentions(false);
    }

    onChange(newValue, mentions);
  };

  const searchMentions = async (query: string) => {
    const options: MentionOption[] = [];

    // Search for existing communities first
    if (query.length >= 2 || query.length === 0) {
      const { data: communities } = await supabase
        .from('communities')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .limit(5);

      if (communities) {
        options.push(...communities.map(c => ({
          id: c.id,
          name: c.name,
          type: 'community' as const
        })));
      }

      // If no existing community matches exactly, suggest creating one
      if (query.length >= 2) {
        const exactMatch = communities?.find(c => c.name.toLowerCase() === query.toLowerCase());
        if (!exactMatch) {
          options.push({
            id: `create-${query}`,
            name: query,
            type: 'community' as const
          });
        }
      }

      // Search for people
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${query}%`)
        .limit(3);

      if (profiles) {
        options.push(...profiles.map(p => ({
          id: p.id,
          name: p.username || 'anonymous',
          type: 'person' as const,
          avatar: p.avatar_url
        })));
      }
    }

    setMentionOptions(options);
  };

  const selectMention = async (option: MentionOption) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    let newText: string;
    let mentionText: string;
    let finalMentionId = option.id;

    if (option.type === 'community') {
      // If this is a "create new community" option
      if (option.id.startsWith('create-')) {
        // Create the community
        const { data: newCommunity, error } = await supabase.rpc('create_community_if_not_exists', {
          community_name: option.name,
          creator_id: user?.id
        });
        
        if (!error && newCommunity) {
          finalMentionId = newCommunity;
        }
      }
      mentionText = `@${option.name}`;
    } else {
      mentionText = `@${option.name}`;
    }

    newText = textBeforeCursor.slice(0, atIndex) + mentionText + ' ' + textAfterCursor;

    const newMentions = [...mentions, {
      id: finalMentionId,
      name: option.name,
      type: option.type,
      start: atIndex,
      end: atIndex + mentionText.length
    }];

    setMentions(newMentions);
    setShowMentions(false);
    onChange(newText, newMentions);

    // Set cursor position after mention
    setTimeout(() => {
      if (textarea) {
        const newCursorPos = atIndex + mentionText.length + 1;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }
    }, 0);
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        rows={3}
      />
      
      {showMentions && mentionOptions.length > 0 && (
        <div className="absolute z-50 w-64 mt-1 bg-black/90 border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          <div className="p-2">
            {mentionOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => selectMention(option)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
              >
                {option.type === 'person' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Hash className="w-4 h-4 text-green-500" />
                )}
                <span className="text-sm text-white">
                  {option.name}
                  {option.id.startsWith('create-') && (
                    <span className="text-xs text-gray-500 ml-1">(create new)</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
