import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useSavedThoughts() {
  const { user } = useAuth();

  // Check if a thought is saved
  const isThoughtSaved = async (thoughtId: string) => {
    if (!user) return false;
    const { data } = await supabase
      .from('saved_thoughts')
      .select('id')
      .eq('user_id', user.id)
      .eq('thought_id', thoughtId)
      .single();
    return !!data;
  };

  // Save a thought
  const saveThought = async (thoughtId: string) => {
    if (!user) return;
    return supabase.from('saved_thoughts').insert([
      { user_id: user.id, thought_id: thoughtId }
    ]);
  };

  // Unsave a thought
  const unsaveThought = async (thoughtId: string) => {
    if (!user) return;
    return supabase
      .from('saved_thoughts')
      .delete()
      .eq('user_id', user.id)
      .eq('thought_id', thoughtId);
  };

  return { isThoughtSaved, saveThought, unsaveThought };
}
