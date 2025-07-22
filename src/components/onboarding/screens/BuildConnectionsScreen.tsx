
import { Button } from '@/components/ui/button';
import { Users, School, MapPin, ArrowRight } from 'lucide-react';

interface BuildConnectionsScreenProps {
  onNext: () => void;
  onPrevious: () => void;
}

export const BuildConnectionsScreen = ({ onNext, onPrevious }: BuildConnectionsScreenProps) => {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        {/* Illustration */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-white/20 to-gray-200/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/10">
            <Users className="w-16 h-16 text-white" />
          </div>
          
          {/* Floating connection cards */}
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-white/30 to-gray-200/30 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10 animate-float">
            <School className="w-8 h-8 text-white" />
          </div>
          
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-gray-200/30 to-white/30 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10 animate-float" style={{ animationDelay: '1s' }}>
            <MapPin className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white">
            Build Connections
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Connect with students and alumni from your institution or based on shared interests and skills.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 text-left">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-gray-300">Find students from your college</span>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <span className="text-gray-300">Connect through shared interests</span>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-gray-300">Build your professional network</span>
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
            className="flex-1 h-12 bg-gradient-to-r from-white to-gray-200 text-black rounded-xl hover:shadow-lg transition-all duration-300"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
