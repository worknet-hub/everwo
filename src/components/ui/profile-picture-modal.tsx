import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  username?: string;
}

export const ProfilePictureModal = ({ 
  isOpen, 
  onClose, 
  imageUrl, 
  username 
}: ProfilePictureModalProps) => {
  const hasImage = imageUrl && imageUrl.trim() !== '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-full h-full md:max-w-2xl md:h-auto p-0 bg-transparent border-none shadow-none">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </Button>
          
          {/* Profile picture container */}
          <div className="relative w-full h-full md:w-auto md:h-auto flex items-center justify-center">
            {/* Background blur overlay */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />
            
            {/* Profile picture or placeholder */}
            <div className="relative z-10 w-full h-full md:w-auto md:h-auto flex items-center justify-center p-4">
              <div className="relative">
                {hasImage ? (
                  <img
                    src={imageUrl}
                    alt={`${username || 'User'}'s profile picture`}
                    className="w-full h-full md:w-96 md:h-96 object-cover rounded-2xl shadow-2xl"
                    style={{
                      maxWidth: '90vw',
                      maxHeight: '90vh',
                    }}
                  />
                ) : (
                  <div 
                    className="w-full h-full md:w-96 md:h-96 flex flex-col items-center justify-center text-white"
                    style={{
                      maxWidth: '90vw',
                      maxHeight: '90vh',
                    }}
                  >
                    <User className="w-24 h-24 md:w-32 md:h-32 text-gray-400 mb-4" />
                    <p className="text-lg md:text-xl font-semibold text-gray-300">No Profile Picture</p>
                    <p className="text-sm md:text-base text-gray-400 mt-2">
                      {username ? `${username} hasn't set a profile picture yet` : 'No profile picture available'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 