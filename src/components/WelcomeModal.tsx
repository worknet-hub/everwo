import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export const WelcomeModal = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      // Check if user has seen the welcome message for this session
      const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        setIsOpen(true);
        // Mark as seen for this session
        sessionStorage.setItem('hasSeenWelcome', 'true');
      }
    }
  }, [user]);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-black border border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Hey {user.user_metadata?.full_name || user.user_metadata?.username || 'Tester'} Welcome!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-center">
          <p className="text-gray-300 leading-relaxed">
            We’re currently experiencing temporary issues with media uploads in chat thoughts and profile pictures, and we are actively working to resolve them as soon as possible.<br /><br />
            In the meantime, we’re excited to introduce a new feature — <b>Referral</b> — now available on your Profile page. Check it out and start sharing!
          </p>
          
          <div className="flex justify-center pt-4">
            <Button 
              onClick={handleClose}
              className="bg-white text-black hover:bg-gray-100 font-semibold px-8 py-2 rounded-lg"
            >
              Okay
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 