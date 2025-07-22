import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, MessageSquare, Hash, User, Heart, ArrowRight, CheckCircle, Zap } from 'lucide-react';

interface FeaturesStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export const FeaturesStep = ({ onNext, onPrevious }: FeaturesStepProps) => {
  return (
    <div className="space-y-12 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-white to-gray-200 rounded-3xl mx-auto flex items-center justify-center mb-6 animate-scale-in">
          <Zap className="w-10 h-10 text-black" />
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
          Powerful Features Await
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover how Everwo will accelerate your academic journey and career growth
        </p>
      </div>

      {/* Main Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {[
          {
            icon: MessageSquare,
            title: "Thoughts Feed",
            description: "Share achievements, ask questions, and engage with your community. Build your personal brand and stay connected.",
            color: "from-white to-gray-200",
            delay: "100ms",
            features: ["Post updates & achievements", "Engage with community", "Build personal brand"]
          },
          {
            icon: Briefcase,
            title: "Job House",
            description: "Access exclusive student opportunities, internships, and freelance gigs. Get hired by fellow students and alumni.",
            color: "from-emerald-500 to-teal-500",
            delay: "200ms",
            features: ["Exclusive job opportunities", "Direct applications", "Student-focused roles"]
          },
          {
            icon: Users,
            title: "Smart Networking",
            description: "Find students from your college and beyond. Build meaningful connections that last beyond graduation.",
            color: "from-gray-200 to-white",
            delay: "300ms",
            features: ["Find college peers", "Interest-based matching", "Professional connections"]
          },
          {
            icon: Hash,
            title: "Secure Messaging",
            description: "Chat privately with connections, collaborate on projects, and discuss opportunities securely.",
            color: "from-orange-500 to-red-500",
            delay: "400ms",
            features: ["Private conversations", "Project collaboration", "Secure environment"]
          }
        ].map((feature, index) => (
          <Card 
            key={index}
            className="group relative overflow-hidden border-2 border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 animate-fade-in rounded-2xl"
            style={{ animationDelay: feature.delay }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            <CardHeader className="relative z-10">
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                {feature.title}
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-3">
                {feature.features.map((item, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="border-2 border-gray-200 hover:border-gray-300 transition-colors animate-fade-in" style={{ animationDelay: "500ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <User className="w-6 h-6 mr-3 text-gray-400" />
              Professional Profile
            </CardTitle>
            <CardDescription className="text-base">
              Create a compelling profile that showcases your skills, projects, and achievements to attract opportunities.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-2 border-gray-200 hover:border-gray-300 transition-colors animate-fade-in" style={{ animationDelay: "600ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Heart className="w-6 h-6 mr-3 text-gray-400" />
              Community Support
            </CardTitle>
            <CardDescription className="text-base">
              Join study groups, interest communities, and get support from peers who understand your journey.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Success Tip */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-100 text-center animate-fade-in" style={{ animationDelay: "700ms" }}>
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-emerald-900 mb-3">Pro Success Tip</h3>
        <p className="text-emerald-800 text-lg max-w-2xl mx-auto">
          The more complete your profile and active you are in the community, 
          the better opportunities and connections you'll discover. Start building your network today!
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-8">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          className="px-8 py-3 rounded-2xl border-2 hover:scale-105 transition-transform duration-200"
        >
          Previous
        </Button>
                  <Button 
            onClick={onNext} 
            className="bg-gradient-to-r from-white to-gray-200 hover:from-gray-100 hover:to-gray-300 px-8 py-3 rounded-2xl hover:scale-105 transition-transform duration-200 text-lg font-semibold text-black"
          >
            Almost There!
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
      </div>
    </div>
  );
};
