import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MentionInput } from './MentionInput';
import { X, Image as GalleryIcon } from 'lucide-react';
import ReactDOM from 'react-dom';
import { Select } from '@/components/ui/select';

interface ModalThoughtComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onThoughtPosted: () => void;
  parentId?: string;
  placeholder?: string;
  initialContent?: string;
}

export const ModalThoughtComposer = ({ 
  isOpen, 
  onClose, 
  onThoughtPosted, 
  parentId, 
  placeholder = "What's on your mind?",
  initialContent = ''
}: ModalThoughtComposerProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [mentions, setMentions] = useState<any[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'connections' | 'university'>('public');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    if (isOpen && !initialContent) {
      const draft = localStorage.getItem('thoughtDraft');
      if (draft) {
        setContent(draft);
      }
    }
  }, [isOpen, initialContent]);

  // Save draft to localStorage whenever content changes
  useEffect(() => {
    if (content && content !== initialContent) {
      localStorage.setItem('thoughtDraft', content);
    }
  }, [content, initialContent]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setUploadingImage(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `thoughts/${user.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('thought-media').upload(filePath, file, { upsert: true });
      if (uploadError) {
        toast.error('Failed to upload image');
        setUploadingImage(false);
        return;
      }
      const { data } = supabase.storage.from('thought-media').getPublicUrl(filePath);
      setImageUrl(data.publicUrl);
      toast.success('Image uploaded!');
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePost = async () => {
    if (!content.trim() || !user || content.length > 500) return;

    setIsPosting(true);
    try {
      // Find community mentions
      const communityMentions = mentions.filter(m => m.type === 'community');
      let communityId = null;

      if (communityMentions.length > 0) {
        // Use the first community mention
        const communityMention = communityMentions[0];
        // If it's a new community (starts with create-), create it
        if (communityMention.id.startsWith('create-')) {
          const { data: newCommunityId, error } = await supabase.rpc('create_community_if_not_exists', {
            community_name: communityMention.name,
            creator_id: user.id
          });
          if (!error && newCommunityId) {
            communityId = newCommunityId;
          }
        } else {
          // Use existing community ID
          communityId = communityMention.id;
        }
      }

      if (parentId) {
        // Post as a comment
        const { error } = await supabase
          .from('thought_comments')
          .insert({
            content,
            user_id: user.id,
            thought_id: parentId,
            mentions: mentions
          });
        if (error) {
          toast.error('Failed to post comment: ' + error.message);
          return;
        }
        toast.success('Reply posted successfully!');
      } else {
        // Post as a new thought
      const thoughtData: any = {
        content,
        user_id: user.id,
        mentions: mentions,
        community_id: communityId,
        visibility,
        image_url: imageUrl || null,
      };
      const { data: inserted, error } = await supabase
        .from('thoughts')
        .insert(thoughtData)
        .select('*')
        .single();
      if (error) {
        toast.error('Failed to post thought: ' + error.message);
        return;
      }
        toast.success('Thought posted successfully!');
      }

      setContent('');
      setMentions([]);
      localStorage.removeItem('thoughtDraft'); // Clear draft after successful post
      onThoughtPosted();
      onClose();
    } catch (error) {
      toast.error('Failed to post thought');
      console.error('Error posting thought:', error);
    } finally {
      setIsPosting(false);
      setImageFile(null);
      setImagePreview(null);
      setImageUrl(null);
    }
  };

  const handleContentChange = (newContent: string, newMentions: any[]) => {
    setContent(newContent);
    setMentions(newMentions);
  };

  const handleClose = () => {
    // Save draft before closing if there's content
    if (content.trim()) {
      localStorage.setItem('thoughtDraft', content);
    }
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const modal = (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content max-w-md w-full mx-auto">
        <Card className="glass-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {parentId ? 'Write a reply' : 'Share your thoughts'}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="mb-2 flex items-center gap-2">
              <label htmlFor="visibility" className="text-sm font-medium text-white">Visibility:</label>
              <select
                id="visibility"
                value={visibility}
                onChange={e => setVisibility(e.target.value as 'public' | 'connections' | 'university')}
                className="custom-select rounded-full px-3 py-1 border border-white/20 focus:outline-none backdrop-blur-sm"
              >
                <option value="public">Everyone</option>
                <option value="connections">Connections only</option>
                <option value="university">University only</option>
              </select>
            </div>

            <div className="relative">
              <MentionInput
                value={content}
                onChange={handleContentChange}
                placeholder={placeholder}
                className="min-h-[120px] resize-none w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white/5 text-white placeholder-gray-400 pr-14" // Add right padding for button
              />
              {/* Circular media button inside the typing box at the right bottom */}
              <button
                type="button"
                className="absolute bottom-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 transition-colors border border-white/10 shadow-lg focus:outline-none"
                title="Add media"
                style={{ zIndex: 10 }}
                onClick={handleGalleryClick}
                disabled={uploadingImage}
              >
                <GalleryIcon className="w-6 h-6 text-gray-300" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploadingImage}
              />
              {imagePreview && (
                <div className="mt-4 flex flex-col items-center">
                  <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg border border-white/10 mb-2" />
                  <button onClick={handleRemoveImage} className="text-xs text-red-400 underline">Remove</button>
                </div>
              )}
              {uploadingImage && (
                <div className="mt-4 flex justify-center items-center">
                  <span className="text-xs text-gray-300 bg-black/80 px-2 py-1 rounded">Uploading...</span>
                </div>
              )}
            </div>

            <div className="flex items-center mt-2">
              <span className="text-xs text-gray-400 flex-1">
                {content.length}/500 characters
                {mentions.length > 0 && ` • ${mentions.length > 1 ? 's' : ''}`}
                {content.length > 500 && (
                  <span className="text-red-400 ml-2">Too long! Max 500 characters.</span>
                )}
              </span>
              <div className="flex gap-2 items-center">
                <Button 
                  variant="outline"
                  onClick={handleClose}
                  className="border-white/20 text-gray-300 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePost} 
                  disabled={!content.trim() || isPosting || content.length > 500}
                  className="gradient-bg"
                >
                  {isPosting ? 'Posting...' : (parentId ? 'Reply' : 'Post')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};
