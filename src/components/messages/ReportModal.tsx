
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Message } from '@/types/messages';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message;
}

const reportReasons = [
  'Spam',
  'Harassment or bullying',
  'Hate speech',
  'Violence or dangerous content',
  'Misinformation',
  'Inappropriate content',
  'Impersonation',
  'Other'
];

export const ReportModal = ({ isOpen, onClose, message }: ReportModalProps) => {
  const { user } = useAuth();
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to report messages');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const reportData = {
        messageId: message.id,
        messageContent: message.content,
        senderId: message.sender_id,
        senderName: message.sender?.full_name || 'Unknown User',
        reason: selectedReason,
        additionalInfo,
        reportedBy: user.id,
        reporterName: user.user_metadata?.full_name || user.email || 'Unknown Reporter'
      };

      console.log('Submitting report:', reportData);

      const { data, error } = await supabase.functions.invoke('send-report', {
        body: reportData
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Report response:', data);
      
      if (data?.success) {
        toast.success('Report submitted successfully');
        onClose();
        setSelectedReason('');
        setAdditionalInfo('');
      } else {
        throw new Error(data?.error || 'Failed to submit report');
      }
    } catch (error: any) {
      console.error('Error submitting report:', error);
      toast.error(`Failed to submit report: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="report-modal-description">
        <DialogTitle className="sr-only">Report Message</DialogTitle>
        <DialogHeader>
          <DialogTitle>Report Message</DialogTitle>
        </DialogHeader>
        <DialogDescription id="report-modal-description">
          Please provide a reason for reporting this message.
        </DialogDescription>
        
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600 mb-1">Reported message:</p>
            <p className="text-sm">{message.content}</p>
          </div>

          <div>
            <Label className="text-sm font-medium">Why are you reporting this message?</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="mt-2">
              {reportReasons.map((reason) => (
                <div key={reason} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason} id={reason} />
                  <Label htmlFor={reason} className="text-sm">{reason}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="additional-info" className="text-sm font-medium">
              Additional information (optional)
            </Label>
            <Textarea
              id="additional-info"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Provide any additional context..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedReason || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
