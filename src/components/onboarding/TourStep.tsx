
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface TourStepProps {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  targetElement?: string;
  targetPage: string;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
}

export const TourStep = ({ 
  step, 
  totalSteps, 
  title, 
  description, 
  targetElement, 
  targetPage,
  onNext, 
  onPrevious, 
  onSkip 
}: TourStepProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    const setupTour = async () => {
      console.log('TourStep: Current path:', location.pathname, 'Target path:', targetPage);
      
      // Check if we need to navigate
      if (location.pathname !== targetPage && !hasNavigated) {
        console.log('TourStep: Navigating to', targetPage);
        setHasNavigated(true);
        
        // Store tour state in sessionStorage before navigation
        sessionStorage.setItem('tourActive', 'true');
        sessionStorage.setItem('tourStep', step.toString());
        
        navigate(targetPage);
        return;
      }

      // If we're on the right page, setup the highlight
      if (location.pathname === targetPage) {
        // Wait a bit for the page to fully render
        const timeout = setTimeout(() => {
          console.log('TourStep: Setting up highlighting for', targetElement);
          
          // Clean up any existing highlights
          document.querySelectorAll('.tour-highlight').forEach(el => {
            el.classList.remove('tour-highlight', 'ring-4', 'ring-white', 'ring-opacity-75', 'relative', 'z-50');
          });

          // Add highlight to target element if it exists
          if (targetElement) {
            const element = document.querySelector(targetElement);
            console.log('TourStep: Found element:', element);
            
            if (element) {
              element.classList.add('tour-highlight', 'ring-4', 'ring-white', 'ring-opacity-75', 'relative', 'z-50');
              
              // Scroll to element smoothly
              element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'center'
              });
            }
          }
          
          setIsReady(true);
        }, 500); // Increased timeout for better reliability

        return () => clearTimeout(timeout);
      }
    };

    setupTour();
  }, [location.pathname, targetPage, targetElement, navigate, step, hasNavigated]);

      // Cleanup highlights when component unmounts
    useEffect(() => {
      return () => {
        document.querySelectorAll('.tour-highlight').forEach(el => {
          el.classList.remove('tour-highlight', 'ring-4', 'ring-white', 'ring-opacity-75', 'relative', 'z-50');
        });
      // Clean up session storage when tour step unmounts
      if (step === totalSteps) {
        sessionStorage.removeItem('tourActive');
        sessionStorage.removeItem('tourStep');
      }
    };
  }, [step, totalSteps]);

  // Calculate position for the tour modal
  const getModalPosition = () => {
    if (!targetElement || !isReady) {
      return { 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)' 
      };
    }
    
    const element = document.querySelector(targetElement);
    if (!element) {
      return { 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)' 
      };
    }
    
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    
    // Position modal to avoid covering the highlighted element
    if (rect.right + 400 < windowWidth) {
      // Position to the right
      return {
        top: `${rect.top + rect.height / 2}px`,
        left: `${rect.right + 20}px`,
        transform: 'translateY(-50%)'
      };
    } else if (rect.left - 400 > 0) {
      // Position to the left
      return {
        top: `${rect.top + rect.height / 2}px`,
        right: `${windowWidth - rect.left + 20}px`,
        transform: 'translateY(-50%)'
      };
    } else if (rect.bottom + 250 < windowHeight) {
      // Position below
      return {
        top: `${rect.bottom + 20}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translateX(-50%)'
      };
    } else {
      // Position above
      return {
        bottom: `${windowHeight - rect.top + 20}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translateX(-50%)'
      };
    }
  };

  const modalStyle = getModalPosition();

  // Don't render if we're not on the target page yet
  if (location.pathname !== targetPage) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
      {/* Tour Modal */}
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-scale-in absolute z-50"
        style={modalStyle}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-white to-gray-200 rounded-full flex items-center justify-center text-black font-bold text-sm">
                {step}
              </div>
              <span className="text-sm text-gray-500">Step {step} of {totalSteps}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onSkip}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={onPrevious}
              disabled={step === 1}
              className="px-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button 
              onClick={onNext}
              className="bg-gradient-to-r from-white to-gray-200 hover:from-gray-100 hover:to-gray-300 text-black px-6"
            >
              {step === totalSteps ? 'Finish Tour' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="bg-gray-100 h-2">
          <div 
            className="bg-gradient-to-r from-white to-gray-200 h-full transition-all duration-500"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
