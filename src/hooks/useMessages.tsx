
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Message } from '@/types/messages';

export const useMessages = (userId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [oldestMessageId, setOldestMessageId] = useState<string | null>(null);

  const fetchMessages = useCallback(async (partnerId: string, loadOlder = false) => {
    if (!userId) return;
    
    console.log('Fetching messages between:', userId, 'and', partnerId, loadOlder ? '(older)' : '');
    
    try {
      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
        `)
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: false })
        .limit(50);

      // If loading older messages, add filter for messages older than the oldest one
      if (loadOlder && oldestMessageId) {
        query = query.lt('id', oldestMessageId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Fetch messages error:', error);
        if (!userId.includes('admin')) {
          toast.error('Failed to fetch messages');
        }
        return;
      }

      const messagesWithSender = data.map((msg: any) => ({
        ...msg,
        reactions: []
      })) as Message[];

      const messagesWithReplies = await Promise.all(
        messagesWithSender.map(async (msg) => {
          if (msg.reply_to_id) {
            const { data: replyData } = await supabase
              .from('messages')
              .select(`
                *,
                sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
              `)
              .eq('id', msg.reply_to_id)
              .single();
            
            return {
              ...msg,
              reply_to_message: replyData ? {
                ...replyData,
                reactions: []
              } as Message : undefined
            };
          }
          return msg;
        })
      );

      // Sort messages by created_at (oldest first for display)
      const sortedMessages = messagesWithReplies.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      if (loadOlder) {
        // Prepend older messages to existing ones
        setMessages(prev => [...sortedMessages, ...prev]);
        setHasMoreMessages(sortedMessages.length === 50);
      } else {
        // Replace all messages (initial load)
        setMessages(sortedMessages);
        setHasMoreMessages(sortedMessages.length === 50);
      }

      // Update oldest message ID for pagination
      if (sortedMessages.length > 0) {
        const oldestId = sortedMessages[0].id;
        if (!oldestMessageId || oldestId < oldestMessageId) {
          setOldestMessageId(oldestId);
        }
      }

      console.log('Fetched messages:', sortedMessages.length, 'messages');
    } catch (err) {
      console.error('Error fetching messages:', err);
      if (!userId.includes('admin')) {
        toast.error('Failed to fetch messages');
      }
    }
  }, [userId, oldestMessageId]);

  const loadOlderMessages = useCallback(async (partnerId: string) => {
    if (!hasMoreMessages || isLoadingOlder) return;
    
    setIsLoadingOlder(true);
    await fetchMessages(partnerId, true);
    setIsLoadingOlder(false);
  }, [hasMoreMessages, isLoadingOlder, fetchMessages]);

  const sendMessage = async (content: string, receiverId: string, replyToId?: string) => {
    if (!content.trim() || !userId) return;

    console.log('Sending message:', { content, receiverId, replyToId, senderId: userId });

    const messageData: any = {
      content,
      sender_id: userId,
      receiver_id: receiverId,
    };

    if (replyToId) {
      messageData.reply_to_id = replyToId;
    }

    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      content,
      sender_id: userId,
      receiver_id: receiverId,
      created_at: new Date().toISOString(),
      is_read: false,
      reactions: [],
      sender: { full_name: 'You', avatar_url: '' },
      ...(replyToId ? { reply_to_id: replyToId } : {}),
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const { data, error } = await supabase.from('messages').insert(messageData).select(`
        *,
        sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
      `).single();

      if (error) {
        console.error('Error sending message:', error);
        setMessages(prev => prev.filter(msg => msg.id !== tempId)); // Remove optimistic message
        if (error.message.includes('row-level security')) {
          toast.error('You can only message people you are connected with. Please send a connection request first.');
        } else {
          toast.error('Failed to send message');
        }
        return false;
      }
      // Replace optimistic message with real one
      setMessages(prev => prev.map(msg => msg.id === tempId ? { ...data, reactions: [] } : msg));
      console.log('Message sent successfully, real-time will update UI');
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => prev.filter(msg => msg.id !== tempId)); // Remove optimistic message
      toast.error('Failed to send message');
      return false;
    }
  };

  // Send an audio message
  const sendAudioMessage = async (audioBlob: Blob, receiverId: string, replyToId?: string) => {
    if (!userId) return;
    try {
      // 1. Upload audio to Supabase Storage
      const fileName = `audio_${userId}_${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-audio')
        .upload(fileName, audioBlob, { contentType: 'audio/webm' });
      if (uploadError) {
        toast.error('Failed to upload audio');
        return false;
      }
      // 2. Get public URL
      const { data: publicUrlData } = supabase.storage.from('chat-audio').getPublicUrl(fileName);
      const audioUrl = publicUrlData?.publicUrl;
      if (!audioUrl) {
        toast.error('Failed to get audio URL');
        return false;
      }
      // 3. Send message with audio_url and type: 'audio'
      const messageData: any = {
        content: '[Voice Note]',
        sender_id: userId,
        receiver_id: receiverId,
        audio_url: audioUrl,
        type: 'audio',
      };
      if (replyToId) messageData.reply_to_id = replyToId;
      // Optimistic UI update
      const tempId = `temp-audio-${Date.now()}`;
      const optimisticMessage: Message = {
        id: tempId,
        content: '[Voice Note]',
        sender_id: userId,
        receiver_id: receiverId,
        created_at: new Date().toISOString(),
        is_read: false,
        reactions: [],
        sender: { full_name: 'You', avatar_url: '' },
        audio_url: audioUrl,
        type: 'audio',
        ...(replyToId ? { reply_to_id: replyToId } : {}),
      };
      setMessages(prev => [...prev, optimisticMessage]);
      const { data, error } = await supabase.from('messages').insert(messageData).select(`*, sender:profiles!messages_sender_id_fkey(full_name, avatar_url)`).single();
      if (error) {
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
        toast.error('Failed to send audio message');
        return false;
      }
      setMessages(prev => prev.map(msg => msg.id === tempId ? { ...data, reactions: [] } : msg));
      return true;
    } catch (err) {
      toast.error('Failed to send audio message');
      return false;
    }
  };

  // Add this function to handle reactions
  const reactToMessage = async (messageId: string, emoji: string, userId: string) => {
    try {
      // Check if the reaction already exists
      const { data: existing, error: fetchError } = await supabase
        .from('reply_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', userId)
        .eq('emoji', emoji)
        .single();
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: No rows found
        console.error('Error checking existing reaction:', fetchError);
        toast.error('Failed to add reaction');
        return false;
      }
      if (existing) {
        // Reaction exists, so remove it (toggle off)
        const { error: deleteError } = await supabase
          .from('reply_reactions')
          .delete()
          .eq('id', existing.id);
        if (deleteError) {
          console.error('Error removing reaction:', deleteError);
          toast.error('Failed to remove reaction');
          return false;
        }
        // Update UI: remove the reaction with matching user_id and emoji
        setMessages(prev => prev.map(msg =>
          msg.id === messageId
            ? { ...msg, reactions: (msg.reactions || []).filter(r => !(r.emoji === emoji && r.user_id === userId)) }
            : msg
        ));
        return true;
      } else {
        // Reaction does not exist, so insert it
        const { data, error } = await supabase.from('reply_reactions').insert({
          message_id: messageId,
          emoji,
          user_id: userId,
        }).select('*').single();
        if (error) {
          console.error('Error inserting reaction:', JSON.stringify(error, null, 2));
          toast.error('Failed to add reaction');
          return false;
        }
        // Update UI: add the full MessageReaction object
        setMessages(prev => prev.map(msg =>
          msg.id === messageId
            ? { ...msg, reactions: [...(msg.reactions || []), data] }
            : msg
        ));
        return true;
      }
    } catch (err) {
      console.error('Error reacting to message:', err);
      toast.error('Failed to add reaction');
      return false;
    }
  };

  return {
    messages,
    setMessages,
    fetchMessages,
    sendMessage,
    sendAudioMessage,
    loadOlderMessages,
    hasMoreMessages,
    isLoadingOlder,
    reactToMessage, // Export the new function
  };
};
