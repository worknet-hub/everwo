import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface ConnectionResponseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  loading?: boolean;
}

export const ConnectionResponseDialog = ({ 
  isOpen, 
  onClose, 
  onAccept, 
  onReject, 
  loading = false 
}: ConnectionResponseDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Connection Request
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-gray-300 text-center">
            Do you want to accept the connection request?
          </p>
        </div>
        
        <DialogFooter className="flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onReject}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <X className="w-4 h-4 mr-2" />
            No
          </Button>
          <Button
            onClick={onAccept}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 