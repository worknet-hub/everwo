
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/messages';
import { User } from '@supabase/supabase-js';

interface UseMessageRealtimeProps {
  user: User | null;
  selectedConversation: string | null;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  fetchConversations: () => void;
}

export const useMessageRealtime = ({
  user,
  selectedConversation,
  setMessages,
  fetchConversations
}: UseMessageRealtimeProps) => {
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!user?.id) {
      // Clean up channel when no user
      if (channelRef.current) {
        console.log('Cleaning up message realtime subscription - no user');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    console.log('Setting up real-time subscription for user:', user.id);

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Create new channel with unique name
    const channelName = `messages_${user.id}_${Date.now()}`;
    const messagesChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          if (!payload || !payload.new) return;
          console.log('Realtime payload received:', payload);
          const newMessage = payload.new as any;

          // Always refresh conversations to update last message
          fetchConversations();

          // Debug logs for filtering
          console.log('selectedConversation:', selectedConversation);
          console.log('user.id:', user.id);
          console.log('newMessage.sender_id:', newMessage.sender_id);
          console.log('newMessage.receiver_id:', newMessage.receiver_id);

          const isRelevantToCurrentConversation = selectedConversation && 
            ((newMessage.sender_id === user.id && newMessage.receiver_id === selectedConversation) ||
             (newMessage.sender_id === selectedConversation && newMessage.receiver_id === user.id));

          console.log('isRelevantToCurrentConversation:', isRelevantToCurrentConversation);

          if (!isRelevantToCurrentConversation) return;

          try {
            // Fetch the complete message with sender info
            const { data: completeMessage } = await supabase
              .from('messages')
              .select(`
                *,
                sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
              `)
              .eq('id', newMessage.id)
              .single();

            if (completeMessage) {
              let transformedMessage: Message = {
                ...completeMessage,
                reactions: []
              };

              // If this message is a reply, fetch the reply data
              if (completeMessage.reply_to_id) {
                const { data: replyData } = await supabase
                  .from('messages')
                  .select(`
                    *,
                    sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
                  `)
                  .eq('id', completeMessage.reply_to_id)
                  .single();
                
                if (replyData) {
                  transformedMessage.reply_to_message = {
                    ...replyData,
                    reactions: []
                  } as Message;
                }
              }

              // Add message to state, avoiding duplicates
              setMessages(prev => {
                const exists = prev.some(msg => msg.id === transformedMessage.id);
                if (!exists) {
                  const updatedMessages = [...prev, transformedMessage].sort((a, b) => 
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                  );
                  console.log('setMessages: adding new message', transformedMessage);
                  return updatedMessages;
                }
                console.log('setMessages: message already exists, skipping');
                return prev;
              });
            }
          } catch (error) {
            console.error('Error processing new message:', error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          if (!payload || !payload.new) return;
          console.log('Message updated via realtime:', payload);
          const updatedMessage = payload.new as Message;

          // Filter for relevant conversation
          const isRelevantToCurrentConversation = selectedConversation && 
            ((updatedMessage.sender_id === user.id && updatedMessage.receiver_id === selectedConversation) ||
             (updatedMessage.sender_id === selectedConversation && updatedMessage.receiver_id === user.id));

          if (!isRelevantToCurrentConversation) return;

          // Fetch the complete updated message with sender info
          try {
            const { data: completeMessage } = await supabase
              .from('messages')
              .select(`*, sender:profiles!messages_sender_id_fkey(full_name, avatar_url)`)
              .eq('id', updatedMessage.id)
              .single();

            if (completeMessage) {
              let transformedMessage: Message = {
                ...completeMessage,
                reactions: []
              };

              // If this message is a reply, fetch the reply data
              if (completeMessage.reply_to_id) {
                const { data: replyData } = await supabase
                  .from('messages')
                  .select(`*, sender:profiles!messages_sender_id_fkey(full_name, avatar_url)`)
                  .eq('id', completeMessage.reply_to_id)
                  .single();
                if (replyData) {
                  transformedMessage.reply_to_message = {
                    ...replyData,
                    reactions: []
                  } as Message;
                }
              }

              setMessages(prev => prev.map(msg =>
                msg.id === transformedMessage.id ? transformedMessage : msg
              ));
            }
          } catch (error) {
            console.error('Error fetching updated message:', error);
          }

          // Also refresh conversations when message read status changes
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          if (!payload || !payload.old) return;
          const deletedMessage = payload.old as Message;

          // Filter for relevant conversation
          const isRelevantToCurrentConversation = selectedConversation && 
            ((deletedMessage.sender_id === user.id && deletedMessage.receiver_id === selectedConversation) ||
             (deletedMessage.sender_id === selectedConversation && deletedMessage.receiver_id === user.id));

          if (!isRelevantToCurrentConversation) return;

          // Remove the deleted message from the UI
          setMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id));
          
          // Refresh conversations to update last message if needed
          fetchConversations();
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    channelRef.current = messagesChannel;

    return () => {
      console.log('Cleaning up real-time subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id, selectedConversation, fetchConversations, setMessages]);
};
