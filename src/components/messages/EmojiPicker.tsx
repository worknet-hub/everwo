
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}

const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👎', '🎉', '🔥', '💯'];

export const EmojiPicker = ({ isOpen, onClose, onEmojiSelect }: EmojiPickerProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="emoji-picker-description">
        <DialogTitle className="sr-only">Emoji Picker</DialogTitle>
        <DialogDescription id="emoji-picker-description">
          Select an emoji to insert into your message.
        </DialogDescription>
        <div className="grid grid-cols-5 gap-2 p-4">
          {commonEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onEmojiSelect(emoji)}
              className="text-2xl p-2 rounded hover:bg-gray-100 transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
