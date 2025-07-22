import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PartyPopper, Rocket, Users, Gift } from 'lucide-react';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const ReferralModal = ({ isOpen, onClose, userId }: ReferralModalProps) => {
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasReferredBy, setHasReferredBy] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      checkIfAlreadyReferred();
    }
  }, [isOpen, userId]);

  const checkIfAlreadyReferred = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('referred_by')
        .eq('id', userId)
        .single();

      if (profile?.referred_by) {
        setHasReferredBy(true);
      }
    } catch (error) {
      console.error('Error checking referral status:', error);
    }
  };

  const handleReferralCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase automatically
    setReferralCode(e.target.value.toUpperCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralCode.trim()) {
      toast.error('Please enter a referral code! 🎯');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('validate_and_assign_referral_code', {
        user_id: userId,
        referral_code_input: referralCode.trim()
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message);
        setHasReferredBy(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        toast.error(data.error);
      }
    } catch (error: any) {
      console.error('Error validating referral code:', error);
      toast.error('Something went wrong! Please try again! 😅');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    toast.info('You can always add a referral code later in your profile! 📝');
    onClose();
  };

  if (hasReferredBy) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md" aria-describedby="referral-modal-description">
          <DialogTitle className="sr-only">Referral</DialogTitle>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-green-500" />
              Welcome aboard! 🚀
            </DialogTitle>
          </DialogHeader>
          <DialogDescription id="referral-modal-description">
            Your referral code has been applied successfully! 
            You're all set to explore the amazing world of Everwo! ✨
          </DialogDescription>
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-full">
                <Rocket className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your referral code has been applied successfully! 
              You're all set to explore the amazing world of Everwo! ✨
            </p>
            <Button onClick={onClose} className="w-full">
              Let's Go! 🎉
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="referral-modal-description">
        <DialogTitle className="sr-only">Referral</DialogTitle>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-500" />
            Almost there! 🎁
          </DialogTitle>
        </DialogHeader>
        <DialogDescription id="referral-modal-description">
          Enter your referral code or invite a friend.
        </DialogDescription>
        
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="bg-purple-100 dark:bg-purple-900/20 p-4 rounded-full">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold">Enter Your Referral Code!</h3>
            <p className="text-sm text-muted-foreground">
              Someone awesome invited you here! 🥳<br />
              Enter their referral code to unlock the full experience!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="referralCode" className="text-sm font-medium">
                Referral Code
              </Label>
              <Input
                id="referralCode"
                value={referralCode}
                onChange={handleReferralCodeChange}
                placeholder="Enter 6-character code (e.g., ABC123)"
                className="h-11 rounded-xl text-center font-mono text-lg tracking-wider uppercase"
                maxLength={6}
                required
              />
              <p className="text-xs text-muted-foreground text-center">
                Don't worry, it's automatically converted to uppercase! 🔤
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full h-11 text-base rounded-xl font-medium" 
                disabled={loading || !referralCode.trim()}
              >
                {loading ? 'Validating...' : 'Apply Referral Code! 🚀'}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={handleSkip}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                Skip for now (I'll add it later) 😅
              </Button>
            </div>
          </form>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Pro tip:</strong> Ask your friend who invited you for their referral code! 
              It's usually 6 characters like "ABC123" or "FRIEND"!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 