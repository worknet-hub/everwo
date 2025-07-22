import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, CheckCheck } from 'lucide-react';
import { useEffect, useRef, useLayoutEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/messages';
import { MessageMenu } from './MessageMenu';
import { MessageReactionsList } from './MessageReactionsList';
import React from 'react';
import { isEmojiOnly } from '@/lib/utils';

interface MessagesListProps {
  messages: Message[];
  currentUserId?: string;
  partnerId?: string;
  onReply: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
  onLoadOlderMessages?: () => void;
  hasMoreMessages?: boolean;
  isLoadingOlder?: boolean;
  onDelete?: (messageId: string) => void;
  onEdit?: (message: Message) => void;
}

function getImagePreviewUrl(url: string): string | null {
  // Imgur: https://imgur.com/xxxx or https://imgur.com/a/xxxx
  const imgurMatch = url.match(/^https?:\/\/(?:i\.)?imgur\.com\/(?:gallery\/|a\/)?([\w\d]+)(?:\.[a-zA-Z]+)?$/);
  if (imgurMatch) {
    return `https://i.imgur.com/${imgurMatch[1]}.jpg`;
  }
  // Dropbox: https://www.dropbox.com/s/xxxx/file.jpg?dl=0
  if (/dropbox\.com/.test(url)) {
    return url.replace(/\?dl=0$/, '?raw=1').replace(/\?dl=1$/, '?raw=1');
  }
  // Google Drive: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const gdriveMatch = url.match(/drive\.google\.com\/file\/d\/([\w-]+)\//);
  if (gdriveMatch) {
    return `https://drive.google.com/thumbnail?id=${gdriveMatch[1]}`;
  }
  // Direct image
  if (/(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.svg)$/i.test(url)) {
    return url;
  }
  return null;
}

function renderMessageContent(content: string) {
  const urlRegex = /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)(?=\s|$)/g;
  const parts = content.split(urlRegex);
  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-400 break-all hover:text-blue-300"
        >
          {part}
        </a>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export const MessagesList = ({ 
  messages, 
  currentUserId, 
  partnerId, 
  onReply, 
  onReact,
  onLoadOlderMessages,
  hasMoreMessages = false,
  isLoadingOlder = false,
  onDelete,
  onEdit
}: MessagesListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNearTop, setIsNearTop] = useState(false);

  // Mark messages as read when they come into view
  useEffect(() => {
    if (!currentUserId || !partnerId) return;

    const markMessagesAsRead = async () => {
      const unreadMessages = messages.filter(
        msg => msg.sender_id === partnerId && !msg.is_read
      );

      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map(msg => msg.id);
        
        const { error } = await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', messageIds);

        if (error) {
          console.error('Error marking messages as read:', error);
        }
      }
    };

    markMessagesAsRead();
  }, [messages, currentUserId, partnerId]);

  // Handle scroll to detect when user is near top for infinite scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onLoadOlderMessages) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      if (scrollTop < 100 && hasMoreMessages && !isLoadingOlder) {
        setIsNearTop(true);
        onLoadOlderMessages();
      } else {
        setIsNearTop(false);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [onLoadOlderMessages, hasMoreMessages, isLoadingOlder]);

  return (
    <div ref={containerRef} className="space-y-4 mt-6 overflow-x-hidden">
      {/* Loading indicator for older messages */}
      {isLoadingOlder && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
      
      {/* Show all messages */}
      {messages.map((message) => {
        return (
          <div
            key={message.id}
            className={`flex group ${
              message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
            } px-3 md:px-8`}
          >
            <div className="max-w-xs lg:max-w-md">
              {/* Reply preview */}
              {message.reply_to_message && (
                <div className={`mb-2 ${
                  message.sender_id === currentUserId ? 'text-right' : 'text-left'
                }`}>
                  <div className="bg-muted/50 border-l-2 border-primary p-2 rounded-lg text-xs">
                    <p className="text-muted-foreground mb-1">
                      Replying to {message.reply_to_message.sender?.full_name || 'Unknown User'}
                    </p>
                    <p className="text-foreground line-clamp-2">
                      {message.reply_to_message.content}
                    </p>
                  </div>
                </div>
              )}

              {/* Message bubble */}
              <div className="relative">
                {/* Check if the message is an image (single image, no extra text) */}
                {(() => {
                  const urlRegex = /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)(?=\s|$)/g;
                  const parts = message.content.split(urlRegex).filter(Boolean);
                  const isSingleImage =
                    parts.length === 1 && getImagePreviewUrl(parts[0]);
                  if (isSingleImage) {
                    const imgUrl = getImagePreviewUrl(parts[0]);
                    return (
                      <div className="relative flex flex-col items-center">
                        <img
                          src={imgUrl!}
                          alt="sent media"
                          className="max-w-[220px] max-h-[220px] rounded-xl my-2 border border-gray-700 bg-black"
                          style={{ display: 'block', margin: '0.5rem auto' }}
                          loading="lazy"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div className="absolute top-2 right-2 z-10">
                          <MessageMenu
                            message={message}
                            isOwnMessage={message.sender_id === currentUserId}
                            onReply={onReply}
                            onReact={(emoji) => onReact(message.id, emoji)}
                            onDelete={onDelete}
                            onEdit={onEdit}
                          />
                        </div>
                      </div>
                    );
                  } else if (message.type === 'audio' || message.audio_url) {
                    // Render audio message
                    return (
                      <div className={`px-3 py-2 rounded-2xl ${
                        message.sender_id === currentUserId
                          ? 'bg-black/70 text-white'
                          : 'bg-muted/70 text-white'
                      } flex flex-col items-center justify-center w-full max-w-[90vw] sm:max-w-xs`}>
                        <span className="text-xs text-gray-400 mb-1 w-full text-left">Voice Note</span>
                        <audio controls src={message.audio_url || ''} className="w-full h-12 my-2" style={{ minWidth: 120 }} />
                        <div className="flex items-center justify-end mt-1 w-full">
                          <MessageMenu
                            message={message}
                            isOwnMessage={message.sender_id === currentUserId}
                            onReply={onReply}
                            onReact={(emoji) => onReact(message.id, emoji)}
                            onDelete={onDelete}
                            onEdit={onEdit}
                          />
                        </div>
                      </div>
                    );
                  } else if (isEmojiOnly(message.content)) {
                    // Render emoji-only messages without bubble
                    return (
                      <div className="flex items-center justify-center text-4xl md:text-5xl py-2">
                        {renderMessageContent(message.content)}
                        <div className="flex items-center justify-end mt-1 ml-2">
                          <MessageMenu
                            message={message}
                            isOwnMessage={message.sender_id === currentUserId}
                            onReply={onReply}
                            onReact={(emoji) => onReact(message.id, emoji)}
                            onDelete={onDelete}
                            onEdit={onEdit}
                          />
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          message.sender_id === currentUserId
                            ? 'bg-white text-black'
                            : 'bg-muted text-white'
                        } flex items-center justify-center text-center`}
                      >
                        <div className="w-full text-left break-words overflow-x-hidden">{renderMessageContent(message.content)}</div>
                        <div className="flex items-center justify-end mt-1">
                          <div className="flex items-center gap-1">
                            <MessageMenu
                              message={message}
                              isOwnMessage={message.sender_id === currentUserId}
                              onReply={onReply}
                              onReact={(emoji) => onReact(message.id, emoji)}
                              onDelete={onDelete}
                              onEdit={onEdit}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }
                })()}
                {/* Tick and time below bubble for own messages */}
                {message.sender_id === currentUserId && (
                  <div className="flex items-center justify-between mt-1 px-2">
                    <div>
                      {message.is_read ? (
                        <CheckCheck className="w-3 h-3 text-white" />
                      ) : (
                        <Check className="w-3 h-3 opacity-50" />
                      )}
                    </div>
                    <div className="text-xs opacity-60 text-right ml-2">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </div>
                  </div>
                )}
                {/* Time below bubble for received messages */}
                {message.sender_id !== currentUserId && (
                  <div className="text-xs opacity-60 text-left mt-1 ml-2">
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                )}
                {/* Reactions */}
                <MessageReactionsList
                  reactions={message.reactions || []}
                  onReact={(emoji) => onReact(message.id, emoji)}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
