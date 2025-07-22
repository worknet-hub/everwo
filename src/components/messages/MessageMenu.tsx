
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Reply, Flag, Smile, Edit2, Trash2 } from 'lucide-react';
import { Message } from '@/types/messages';
import { ReportModal } from './ReportModal';
import { EmojiPicker } from './EmojiPicker';

interface MessageMenuProps {
  message: Message;
  isOwnMessage: boolean;
  onReply: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => void;
  onEdit?: (message: Message) => void;
}

export const MessageMenu = ({ message, isOwnMessage, onReply, onReact, onDelete, onEdit }: MessageMenuProps) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Only allow editing within 15 minutes of sending
  const canEdit = isOwnMessage && (Date.now() - new Date(message.created_at).getTime() < 15 * 60 * 1000);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Removed React option */}
          <DropdownMenuItem onClick={() => onReply(message)}>
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </DropdownMenuItem>
          {canEdit && onEdit && (
            <DropdownMenuItem onClick={() => onEdit(message)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
          )}
          {isOwnMessage && onDelete && (
            <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="text-red-600 focus:bg-red-100 focus:text-red-800">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          )}
          {!isOwnMessage && (
            <DropdownMenuItem onClick={() => setShowReportModal(true)}>
              <Flag className="h-4 w-4 mr-2" />
              Report
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Remove EmojiPicker for reactions */}

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        message={message}
      />

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Message</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this message? This action cannot be undone.</p>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { onDelete && onDelete(message.id); setShowDeleteConfirm(false); }}>Delete</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
