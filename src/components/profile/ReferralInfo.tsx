import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReferral } from '@/hooks/useReferral';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Copy, Users, Gift, Trophy, UserPlus } from 'lucide-react';

interface ReferralInfoProps {
  userId: string;
  compact?: boolean;
}

export const ReferralInfo = ({ userId, compact }: ReferralInfoProps) => {
  const { getUserReferralCode, getReferralStats } = useReferral();
  const [referralStats, setReferralStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [referredBy, setReferredBy] = useState<any>(null);

  useEffect(() => {
    loadReferralData();
    // Real-time subscription for referrals
    const channel = supabase
      .channel('referral-realtime-' + userId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referrals',
          filter: `referrer_id=eq.${userId}`,
        },
        (payload) => {
          loadReferralData();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      
      // Get referral stats
      const stats = await getReferralStats();
      setReferralStats(stats);

      // Get who referred this user
      const { data: profile } = await supabase
        .from('profiles')
        .select('referred_by')
        .eq('id', userId)
        .single();

      if (profile?.referred_by) {
        const { data: referrer } = await supabase
          .from('profiles')
          .select('id, full_name, username')
          .eq('id', profile.referred_by)
          .single();
        
        setReferredBy(referrer);
      }
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    const code = getUserReferralCode();
    if (code) {
      try {
        await navigator.clipboard.writeText(code);
        toast.success('Referral code copied to clipboard! 📋');
      } catch (error) {
        toast.error('Failed to copy referral code');
      }
    }
  };

  if (loading) {
    return (
      <Card className={compact ? 'p-2 max-w-full' : ''}>
        <CardHeader>
          <CardTitle className={compact ? 'flex items-center gap-2 text-base' : 'flex items-center gap-2'}>
            <Gift className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
            Referral Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={compact ? 'animate-pulse space-y-2' : 'animate-pulse space-y-4'}>
            <div className={compact ? 'h-3 bg-gray-200 rounded w-2/3' : 'h-4 bg-gray-200 rounded w-3/4'}></div>
            <div className={compact ? 'h-3 bg-gray-200 rounded w-1/3' : 'h-4 bg-gray-200 rounded w-1/2'}></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {/* Heading for referral code in full mode */}
      {!compact && (
        <div className="text-xl font-bold mb-2 text-left ml-4 md:ml-8">
          Your Referral Code
        </div>
      )}
      {/* Only show referral code ONCE at the top in full mode, or in compact mode */}
      <Card className={compact ? 'p-2 max-w-full' : ''}>
        {/* Removed CardHeader and CardTitle for referral code */}
        <CardContent>
          <div className={compact ? 'flex items-center gap-2' : 'flex items-center gap-3 justify-center'}>
            <div className={compact ? 'bg-purple-100 dark:bg-purple-900/20 px-2 py-1 rounded-lg' : 'bg-purple-100 dark:bg-purple-900/20 px-4 py-2 rounded-lg'}>
              <code className={compact ? 'text-base font-mono font-bold text-purple-700 dark:text-purple-300' : 'text-lg font-mono font-bold text-purple-700 dark:text-purple-300'}>
                {getUserReferralCode() || 'Loading...'}
              </code>
            </div>
            <Button
              size={compact ? 'sm' : 'sm'}
              variant="outline"
              onClick={copyReferralCode}
              className={compact ? 'flex items-center gap-1 px-2 py-1 text-xs' : 'flex items-center gap-2'}
            >
              <Copy className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Do not render referral code again at the bottom */}
      {!compact && (
        <>
          {/* Referral Stats */}
          <div className="text-xl font-bold mt-6 mb-2 text-left ml-4 md:ml-8">
            Referral Stats
          </div>
          <Card>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 justify-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {referralStats?.referralCount || 0}
                    </span>
                    <span className="text-sm text-muted-foreground">people referred</span>
                  </div>
                </div>
                {referralStats?.referrals && referralStats.referrals.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Recent Referrals:</h4>
                    <div className="space-y-2">
                      {referralStats.referrals.slice(0, 5).map((referral: any) => (
                        <div key={referral.id} className="flex items-center gap-2 text-sm">
                          <span>{referral.referred_user.full_name || referral.referred_user.username}</span>
                          <Badge variant="secondary" className="text-xs">
                            {new Date(referral.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Who Referred You */}
          {referredBy && (
            <>
              <div className="text-xl font-bold mt-6 mb-2 text-left ml-4 md:ml-8">
                Referred By
              </div>
              <Card>
                <CardContent>
                  <div className="flex items-center gap-3 justify-center">
                    <div className="bg-green-100 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                      <span className="font-medium text-green-700 dark:text-green-300">
                        {referredBy.username || 'unknown-user'}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Your Inviter
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}; 