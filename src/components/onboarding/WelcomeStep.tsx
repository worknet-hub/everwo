import { Button } from '@/components/ui/button';
import { Sparkles, Users, MessageCircle, Briefcase } from 'lucide-react';
import { OnboardingLayout } from './OnboardingLayout';

interface WelcomeStepProps {
  onNext: () => void;
  isFirst: boolean;
}

export const WelcomeStep = ({ onNext, isFirst }: WelcomeStepProps) => {
  const features = [
    {
      icon: Users,
      title: "Connect with Students",
      description: "Find and connect with students from your college and beyond"
    },
    {
      icon: MessageCircle,
      title: "Share Thoughts",
      description: "Share your ideas, projects, and experiences with the community"
    },
    {
      icon: Briefcase,
      title: "Find Opportunities",
      description: "Discover internships, jobs, and collaboration opportunities"
    }
  ];

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={6}
      title="Welcome to Everwo! 🎉"
      subtitle="Your student community platform"
    >
      <div className="space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-white dark:bg-gray-800 text-black dark:text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Let's get you started</span>
          </div>
        </div>

        <div className="grid gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-black dark:text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6">
          <Button onClick={onNext} className="w-full h-12 text-lg font-medium">
            Start Your Journey
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
};
