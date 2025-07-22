import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ChatView } from '@/components/messages/ChatView';
import Header from '@/components/layout/Header';
import { useIsMobile } from '@/hooks/use-mobile';

const MessagesPage = () => {
  return (
    <>
      <div className="min-h-screen h-screen">
        <ChatView />
      </div>
    </>
  );
};

export default MessagesPage;
