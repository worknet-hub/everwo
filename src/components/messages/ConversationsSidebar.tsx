import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ConversationsList } from './ConversationsList';
import { Conversation } from '@/types/messages';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCcw } from 'lucide-react';

interface ConversationsSidebarProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSelectConversation: (id: string) => void;
  onReload: () => void;
}

export const ConversationsSidebar = ({
  conversations,
  selectedConversation,
  searchTerm,
  onSearchChange,
  onSelectConversation,
  onReload
}: ConversationsSidebarProps) => {
  const navigate = useNavigate();
  const filteredConversations = conversations.filter(conv =>
    conv.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full md:w-1/3 border-r bg-[rgba(0,0,0,0.7)] border-white/10">
      {/* Go Back and Reload buttons */}
      <div className="p-4 pb-0 flex items-center">
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center rounded-full hover:bg-white/10 transition p-2 mr-2"
          aria-label="Go back home"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <span className="text-white font-medium text-base">Conversations</span>
        <button
          onClick={onReload}
          className="flex items-center justify-center rounded-full hover:bg-white/10 transition p-2 ml-2"
          aria-label="Reload conversations"
        >
          <RefreshCcw className="w-5 h-5 text-white" />
        </button>
      </div>
      <div className="p-4 pt-2 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-300 bg-transparent" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder-gray-300"
          />
        </div>
      </div>
      <ConversationsList
        conversations={filteredConversations}
        selectedConversation={selectedConversation}
        onSelectConversation={onSelectConversation}
      />
    </div>
  );
};
