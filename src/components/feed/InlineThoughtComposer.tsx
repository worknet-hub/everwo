import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface InlineThoughtComposerProps {
  onOpenModal: () => void;
}

export const InlineThoughtComposer = ({ onOpenModal }: InlineThoughtComposerProps) => {
  const { user } = useAuth();

  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          
          <div 
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 cursor-pointer text-gray-400 hover:bg-white/10 transition-colors"
            onClick={() => { console.log('InlineThoughtComposer: Box clicked'); onOpenModal(); }}
          >
            What's on your mind?
          </div>
          
          <Button 
            onClick={() => { console.log('InlineThoughtComposer: Post button clicked'); onOpenModal(); }}
            className="gradient-bg"
          >
            Post
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
