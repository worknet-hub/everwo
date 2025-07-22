import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChatHeader } from './ChatHeader';
import { MessagesList } from './MessagesList';
import { MessageInput } from './MessageInput';
import { ConnectionWarning } from './ConnectionWarning';
import { ReplyPreview } from './ReplyPreview';
import { Message, Conversation } from '@/types/messages';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ChatAreaProps {
  selectedConversation: string | null;
  selectedUser: Conversation | undefined;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  newMessage: string;
  currentUserId?: string;
  isConnected: boolean;
  replyingTo: Message | null;
  onNewMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onReply: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
  onCancelReply: () => void;
  onLoadOlderMessages?: () => void;
  hasMoreMessages?: boolean;
  isLoadingOlder?: boolean;
  userName?: string;
  sendAudioMessage?: (audioBlob: Blob, receiverId: string, replyToId?: string) => Promise<boolean>;
}

export const ChatArea = ({
  selectedConversation,
  selectedUser,
  messages,
  setMessages,
  newMessage,
  currentUserId,
  isConnected,
  replyingTo,
  onNewMessageChange,
  onSendMessage,
  onReply,
  onReact,
  onCancelReply,
  onLoadOlderMessages,
  hasMoreMessages = false,
  isLoadingOlder = false,
  userName,
  sendAudioMessage,
}: ChatAreaProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  // Ref for the scrollable messages area
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletedMessage, setDeletedMessage] = useState<Message | null>(null);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null);

  // Scroll only the messages area to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages]);

  // Delete message handler
  const handleDeleteMessage = async (messageId: string) => {
    // Remove from UI immediately
    setMessages((prev: Message[]) => prev.filter((msg) => msg.id !== messageId));
    
    // Delete from backend immediately
    const { error } = await supabase.from('messages').delete().eq('id', messageId);
    if (error) {
      console.error('Failed to delete message from database:', error);
      toast.error('Failed to delete message');
      // Optionally, restore the message in the UI if deletion fails
    }
  };

  // Edit message handler
  const handleEditMessage = (message: Message) => {
    setEditingMessage(message);
    setEditContent(message.content);
  };

  const handleEditSave = async () => {
    if (!editingMessage) return;
    // Update in backend
    await supabase.from('messages').update({ content: editContent }).eq('id', editingMessage.id);
    // Update in UI
    if (typeof setMessages === 'function') {
      setMessages((prev: Message[]) => prev.map((msg) => msg.id === editingMessage.id ? { ...msg, content: editContent } : msg));
    }
    setEditingMessage(null);
    setEditContent('');
  };

  const handleEditCancel = () => {
    setEditingMessage(null);
    setEditContent('');
  };

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-300 bg-[rgba(0,0,0,0.7)]">
        <div className="text-center">
          <p className="mb-4">Select a conversation to start messaging</p>
          <Button 
            onClick={() => navigate('/connections')}
            variant="outline"
            className="flex items-center gap-2 bg-white/10 border-white/20 hover:bg-white/20 text-white"
          >
            <UserPlus className="w-4 h-4" />
            Find people to connect with
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#000000]">
      {/* Desktop back icon */}
      {!isMobile && (
        <div className="flex items-center h-16 px-4 bg-black/80 sticky top-0 z-50">
          <div className="flex-1" />
        </div>
      )}
      {/* Desktop header (if any) */}
      {!isMobile && (
        <div className="relative z-30">
          <ChatHeader
            userName={userName || selectedUser?.full_name || 'Unknown User'}
            userAvatar={selectedUser?.avatar_url || ''}
            isConnected={isConnected}
            userId={selectedUser?.partner_id || ''}
          />
        </div>
      )}

      {!isConnected && <ConnectionWarning />}

      {/* Make only the messages area scrollable */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto pb-0" ref={messagesContainerRef}>
          <MessagesList
            messages={messages}
            currentUserId={currentUserId}
            partnerId={selectedConversation}
            onReply={onReply}
            onReact={onReact}
            onLoadOlderMessages={onLoadOlderMessages}
            hasMoreMessages={hasMoreMessages}
            isLoadingOlder={isLoadingOlder}
            onDelete={handleDeleteMessage}
            onEdit={handleEditMessage}
          />
          <div ref={messagesEndRef} />
        </div>
        {replyingTo && (
          <ReplyPreview
            replyingTo={replyingTo}
            onCancel={onCancelReply}
          />
        )}
        {/* Message input area, no extra background wrapper */}
        <MessageInput
          newMessage={newMessage}
          setNewMessage={onNewMessageChange}
          onSendMessage={onSendMessage}
          isConnected={isConnected}
          onSendAudioMessage={async (audioUrl, audioBlob) => {
            if (currentUserId && selectedConversation && sendAudioMessage) {
              await sendAudioMessage(audioBlob, selectedConversation, replyingTo?.id);
            }
          }}
        />
        {/* Black area below message input on mobile */}
      </div>
      {/* Edit message dialog */}
      {editingMessage && (
        <Dialog open={!!editingMessage} onOpenChange={handleEditCancel}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Message</DialogTitle>
            </DialogHeader>
            <textarea
              className="w-full rounded border p-2 min-h-[60px]"
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              maxLength={1000}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleEditCancel}>Cancel</Button>
              <Button onClick={handleEditSave}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
