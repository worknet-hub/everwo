import { Button } from '@/components/ui/button';
import { Sparkles, Users, Briefcase } from 'lucide-react';

interface WelcomeScreenProps {
  onNext: () => void;
  onSkip: () => void;
  isSkipping: boolean;
}

export const WelcomeScreen = ({ onNext, onSkip, isSkipping }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        {/* Skip button */}
        <div className="absolute top-8 right-8">
          <Button 
            variant="ghost" 
            onClick={onSkip}
            disabled={isSkipping}
            className="text-gray-400 hover:text-white"
          >
            {isSkipping ? 'Skipping...' : 'Skip'}
          </Button>
        </div>

        {/* Logo and branding */}
        <div className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-white to-gray-700 rounded-2xl flex items-center justify-center shadow-2xl">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {/* <img src="/logo.png" alt="Everwo Logo" className="h-10 w-auto mx-auto" /> */}
            </h1>
            <p className="text-lg text-gray-400 font-medium">
              Your campus, your network, your freelance journey.
            </p>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">Connect with Students</p>
              <p className="text-gray-400 text-sm">Build your campus network</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-left">
            <div className="w-10 h-10 bg-gray-700/20 rounded-full flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">Find Opportunities</p>
              <p className="text-gray-400 text-sm">Discover freelance work</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-8">
          <Button 
            onClick={onNext}
            className="w-full h-14 bg-gradient-to-r from-white to-gray-700 hover:from-gray-200 hover:to-gray-800 text-black font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Get Started
          </Button>
        </div>

        <p className="text-gray-500 text-sm">
          Join thousands of students already on Everwo
        </p>
      </div>
    </div>
  );
};
