
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Globe, Users, GraduationCap } from 'lucide-react';
import { MentionInput } from './MentionInput';

interface CommunityThoughtComposerProps {
  userInterests: string[];
  onThoughtPosted: () => void;
  fixedCommunity?: string; // NEW: if set, always use this as the community tag
}

export const CommunityThoughtComposer = ({ userInterests, onThoughtPosted, fixedCommunity }: CommunityThoughtComposerProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'connections' | 'university'>('public');
  const [selectedCommunity, setSelectedCommunity] = useState<string>('');
  const [isPosting, setIsPosting] = useState(false);
  const [mentions, setMentions] = useState<any[]>([]);

  // If fixedCommunity is set, always use it as the community tag
  const effectiveCommunity = fixedCommunity || selectedCommunity;

  const handlePost = async () => {
    if (!content.trim() || !user) return;

    // Validate community tag requirements (skip if fixedCommunity is set)
    if (!fixedCommunity && visibility === 'public' && selectedCommunity && !userInterests.includes(selectedCommunity)) {
      toast.error('You can only tag with your selected interests');
      return;
    }
    if (!fixedCommunity && visibility === 'connections' && selectedCommunity) {
      toast.error('Community tags are only allowed for public thoughts');
      return;
    }

    // Ensure only the current selected community is submitted
    const cleanCommunity = fixedCommunity || (selectedCommunity && userInterests.includes(selectedCommunity) ? selectedCommunity : '');

    setIsPosting(true);
    try {
      const thoughtData: any = {
        content,
        visibility,
        user_id: user.id,
        tags: cleanCommunity ? [cleanCommunity] : [],
        mentions: mentions,
      };
      if (visibility === 'public' && cleanCommunity) {
        thoughtData.community_tag = cleanCommunity;
      }
      const { error } = await supabase
        .from('thoughts')
        .insert(thoughtData);
      if (error) {
        toast.error('Failed to post thought: ' + error.message);
        return;
      }
      setContent('');
      if (!fixedCommunity) setSelectedCommunity('');
      setVisibility('public');
      toast.success('Thought posted successfully!');
      onThoughtPosted();
    } catch (error) {
      toast.error('Failed to post thought');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardContent className="p-4 space-y-4">
        <MentionInput
          value={content}
          onChange={(val, newMentions) => { setContent(val); setMentions(newMentions); }}
          placeholder={fixedCommunity ? `Share your thoughts with the @${fixedCommunity} community...` : 'Share your thoughts with the community...'}
          className="min-h-[100px] resize-none"
        />
        {/* Visibility Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Visibility</Label>
          <RadioGroup
            value={visibility}
            onValueChange={(value: 'public' | 'connections' | 'university') => {
              setVisibility(value);
              if ((value === 'connections' || value === 'university') && !fixedCommunity) {
                setSelectedCommunity(''); // Clear community tag for connections-only or university posts
              }
            }}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="public" id="public" />
              <Label htmlFor="public" className="flex items-center space-x-2 cursor-pointer">
                <Globe className="w-4 h-4" />
                <span>Public</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="connections" id="connections" />
              <Label htmlFor="connections" className="flex items-center space-x-2 cursor-pointer">
                <Users className="w-4 h-4" />
                <span>Connections Only</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="university" id="university" />
              <Label htmlFor="university" className="flex items-center space-x-2 cursor-pointer">
                <GraduationCap className="w-4 h-4" />
                <span>University</span>
              </Label>
            </div>
          </RadioGroup>
        </div>
        {/* Community Tag Selection - Only for public posts and if not fixed */}
        {visibility === 'public' && !fixedCommunity && userInterests.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Community Tag (Optional)</Label>
            <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
              <SelectTrigger>
                <SelectValue placeholder="Select a community to tag..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No community tag</SelectItem>
                {userInterests.map((interest) => (
                  <SelectItem key={interest} value={interest}>
                    {interest}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCommunity && (
              <Badge variant="secondary" className="mt-2">
                @{selectedCommunity}
              </Badge>
            )}
          </div>
        )}
        {/* Fixed community tag display */}
        {visibility === 'public' && fixedCommunity && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Community</Label>
            <Badge variant="secondary" className="mt-2">
              @{fixedCommunity}
            </Badge>
          </div>
        )}
        {visibility === 'connections' && (
          <p className="text-xs text-muted-foreground">
            This thought will only be visible to your connections. Community tagging is not available for connection-only posts.
          </p>
        )}
        {visibility === 'university' && (
          <p className="text-xs text-blue-400">
            This thought will only be visible to users from your university.
          </p>
        )}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {content.length}/500 characters
          </span>
          <Button 
            onClick={handlePost} 
            disabled={!content.trim() || isPosting}
            className="gradient-bg"
          >
            {isPosting ? 'Posting...' : 'Share Thought'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
