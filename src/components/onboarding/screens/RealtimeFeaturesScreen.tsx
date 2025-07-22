import { Button } from '@/components/ui/button';
import { MessageCircle, Bell, Zap, ArrowRight } from 'lucide-react';

interface RealtimeFeaturesScreenProps {
  onNext: () => void;
  onPrevious: () => void;
}

export const RealtimeFeaturesScreen = ({ onNext, onPrevious }: RealtimeFeaturesScreenProps) => {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        {/* Illustration */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/10">
            <Zap className="w-16 h-16 text-yellow-400" />
          </div>
          
          {/* Floating notification indicators */}
          <div className="absolute -top-4 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white text-xs font-bold">3</span>
          </div>
          
          <div className="absolute -bottom-4 -left-2 w-10 h-10 bg-gradient-to-br from-gray-700/40 to-gray-900/40 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 animate-bounce">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white">
            Stay Connected
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Real-time notifications, instant messaging, and live updates keep you in the loop.
          </p>
        </div>

        {/* Real-time features */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium">Instant Messaging</p>
              <p className="text-gray-400 text-sm">Chat with connections in real-time</p>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>

          <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-red-400" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium">Live Notifications</p>
              <p className="text-gray-400 text-sm">Never miss important updates</p>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-4 pt-8">
          <Button 
            onClick={onPrevious}
            variant="outline"
            className="flex-1 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
          >
            Back
          </Button>
          <Button 
            onClick={onNext}
            className="flex-1 h-12 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
