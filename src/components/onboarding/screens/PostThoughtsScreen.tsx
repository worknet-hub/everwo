import { Button } from '@/components/ui/button';
import { MessageCircle, Hash, Heart, ArrowRight } from 'lucide-react';

interface PostThoughtsScreenProps {
  onNext: () => void;
  onPrevious: () => void;
}

export const PostThoughtsScreen = ({ onNext, onPrevious }: PostThoughtsScreenProps) => {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        {/* Illustration */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-700/20 to-gray-900/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/10">
            <MessageCircle className="w-16 h-16 text-green-400" />
          </div>
          
          {/* Floating interaction icons */}
          <div className="absolute -top-2 -right-6 w-12 h-12 bg-gradient-to-br from-gray-500/30 to-gray-700/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 animate-float">
            <Heart className="w-6 h-6 text-red-400" />
          </div>
          
          <div className="absolute -bottom-2 -left-6 w-12 h-12 bg-gradient-to-br from-gray-700/30 to-gray-900/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 animate-float" style={{ animationDelay: '1.5s' }}>
            <Hash className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white">
            Share & Engage
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Post your thoughts, join communities, and engage with content that matters to you.
          </p>
        </div>

        {/* Mock post preview */}
        <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-left space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-white to-gray-700 rounded-full"></div>
            <div>
              <p className="text-white text-sm font-medium">Sarah Chen</p>
              <p className="text-gray-400 text-xs">Computer Science • MIT</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm">
            Just finished my first React project! Looking for feedback from fellow developers 🚀
          </p>
          <div className="flex space-x-4 text-xs text-gray-400">
            <span className="flex items-center space-x-1">
              <Heart className="w-3 h-3" />
              <span>12</span>
            </span>
            <span className="flex items-center space-x-1">
              <MessageCircle className="w-3 h-3" />
              <span>3</span>
            </span>
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
            className="flex-1 h-12 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl hover:shadow-lg transition-all duration-300"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
