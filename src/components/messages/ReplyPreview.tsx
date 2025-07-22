
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Message } from '@/types/messages';

interface ReplyPreviewProps {
  replyingTo: Message;
  onCancel: () => void;
}

export const ReplyPreview = ({ replyingTo, onCancel }: ReplyPreviewProps) => {
  return (
    <div className="bg-muted/50 border-l-4 border-primary p-3 mx-4 mb-2 rounded-r-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-1">
            Replying to {replyingTo.sender?.full_name || 'Unknown User'}
          </p>
          <p className="text-sm text-foreground line-clamp-2">
            {replyingTo.content}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 ml-2"
          onClick={onCancel}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
