
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ConnectionWarning = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 border-b">
      <Alert>
        <UserPlus className="h-4 w-4" />
        <AlertDescription>
          You are not connected with this user. You need to be connected to send messages.
          <Button 
            onClick={() => navigate('/connections')}
            variant="link" 
            className="p-0 h-auto ml-2"
          >
            Manage connections
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};
