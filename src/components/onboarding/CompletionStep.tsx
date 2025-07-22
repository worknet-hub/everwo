import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Sparkles, Target, Users, Briefcase, UserMinus } from 'lucide-react';
import React, { useState } from 'react';

interface UserConnection {
  id: string;
  name: string;
}

interface CompletionStepProps {
  onComplete: () => void;
  onPrevious: () => void;
  isCompleting: boolean;
}

export const CompletionStep = ({ onComplete, onPrevious, isCompleting }: CompletionStepProps) => {
  // Example connections (replace with real data/fetch in production)
  const [connections, setConnections] = useState<UserConnection[]>([
    { id: '1', name: 'Alice Johnson' },
    { id: '2', name: 'Bob Smith' },
    { id: '3', name: 'Charlie Lee' },
  ]);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const handleRemoveConnection = (id: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
  };

  return (
    <div className="text-center space-y-12 animate-fade-in">
      {/* Success Animation */}
      <div className="space-y-8">
        <div className="relative">
          <div className="w-28 h-28 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-scale-in">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
          <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
            <Sparkles className="w-5 h-5 text-yellow-800" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
            You're All Set! 🎉
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Welcome to the Everwo community! You're now ready to connect with peers, 
            discover opportunities, and accelerate your career journey.
          </p>
        </div>
      </div>

      {/* Next Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {[
          {
            icon: Target,
            title: "Complete Your Profile",
            description: "Add a photo, skills, and portfolio to stand out and attract opportunities",
            color: "from-blue-500 to-cyan-500",
            delay: "100ms"
          },
          {
            icon: Sparkles,
            title: "Share Your First Thought",
            description: "Introduce yourself to the community and start building your network",
            color: "from-emerald-500 to-teal-500",
            delay: "200ms"
          },
          {
            icon: Users,
            title: "Connect with Peers",
            description: "Find students from your college and with similar interests",
            color: "from-purple-500 to-pink-500",
            delay: "300ms"
          },
          {
            icon: Briefcase,
            title: "Explore Job House",
            description: "Browse opportunities tailored specifically for students like you",
            color: "from-orange-500 to-red-500",
            delay: "400ms"
          },
          {
            icon: UserMinus,
            title: "Remove Connections",
            description: "Manage and remove your existing connections in real time.",
            color: "from-red-500 to-pink-500",
            delay: "500ms",
            action: () => setShowRemoveModal(true)
          }
        ].map((step, index) => (
          <div
            key={index}
            className="group relative p-8 bg-white rounded-3xl border-2 border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 animate-fade-in"
            style={{ animationDelay: step.delay }}
          >
            <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
              <step.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center justify-center">
              <span className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm mr-3 group-hover:bg-gray-700 transition-colors">
                {index + 1}
              </span>
              {step.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">{step.description}</p>
            {/* Show button for Remove Connections */}
            {step.action && (
              <Button
                variant="destructive"
                className="mt-4"
                onClick={step.action}
              >
                Remove Connections
              </Button>
            )}
            <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`}></div>
          </div>
        ))}
      </div>

      {/* Remove Connections Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl relative">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <UserMinus className="w-6 h-6 mr-2 text-red-500" />
              Remove Connections
            </h2>
            {connections.length === 0 ? (
              <p className="text-gray-600 mb-4">You have no connections.</p>
            ) : (
              <ul className="mb-4">
                {connections.map(conn => (
                  <li key={conn.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <span>{conn.name}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveConnection(conn.id)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => setShowRemoveModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Success Message */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-10 text-white animate-fade-in" style={{ animationDelay: "500ms" }}>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Ready to Start Your Journey?</h2>
          <p className="text-indigo-100 text-lg max-w-2xl mx-auto leading-relaxed">
            Join thousands of students who are already building their networks, discovering opportunities, 
            and accelerating their careers on Everwo. Your future starts now!
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto py-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">10K+</div>
              <div className="text-indigo-200 text-sm">Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-indigo-200 text-sm">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">95%</div>
              <div className="text-indigo-200 text-sm">Success</div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4 pt-4">
            <Button 
              variant="outline" 
              onClick={onPrevious}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-4 rounded-2xl font-semibold"
              disabled={isCompleting}
            >
              Previous
            </Button>
            <Button 
              onClick={onComplete}
              disabled={isCompleting}
              size="lg"
              className="bg-white text-indigo-600 hover:bg-gray-100 font-bold text-lg px-10 py-4 rounded-2xl hover:scale-105 transition-transform duration-200"
            >
              {isCompleting ? (
                <span className="flex items-center">
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Setting up...
                </span>
              ) : (
                <span className="flex items-center">
                  Enter Everwo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
    );
  };