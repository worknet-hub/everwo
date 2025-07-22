import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ReportModal } from './ReportModal';

interface ChatHeaderProps {
  userName: string;
  userAvatar: string;
  isConnected: boolean;
  userId: string;
}

export const ChatHeader = ({ userName, userAvatar, isConnected, userId }: ChatHeaderProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [readReceipt, setReadReceipt] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const navigate = useNavigate();

  // Dummy user object for ReportModal (since it expects a message, but we want to report a user)
  const dummyMessage = {
    id: 'user',
    content: `Report user: ${userName}`,
    sender_id: 'user',
    sender: { full_name: userName, avatar_url: userAvatar },
  };

  // Assume userAvatar is a URL and userName is unique enough for profile route
  // If you have a userId, use that instead

  return (
    <div className="h-20 min-h-[64px] flex items-center px-4 border-b-2 border-white/20 bg-black/80 sticky top-0 z-20 shadow-md">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center space-x-3 cursor-pointer">
            <Avatar>
              <AvatarImage src={userAvatar} />
              <AvatarFallback>
                <User className="w-6 h-6 text-gray-300" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-white text-lg">{userName || 'unknown-user'}</h3>
              <p className="text-xs text-gray-400">
                {isConnected ? 'Connected' : 'Not connected'}
              </p>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => navigate(`/profile/${userId}`)}>
            View Profile
          </DropdownMenuItem>
          <DropdownMenuCheckboxItem
            checked={isMuted}
            onCheckedChange={setIsMuted}
          >
            {isMuted ? 'Unmute' : 'Mute'}
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setReportOpen(true)} className="text-red-600 focus:bg-red-100 focus:text-red-800">
            Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        message={dummyMessage as any}
      />
    </div>
  );
};
