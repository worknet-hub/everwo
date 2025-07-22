
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { PostJobForm } from '@/components/jobs/PostJobForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, UserPlus, ArrowLeft } from 'lucide-react';

const PostJobPage = () => {
  const [selectedType, setSelectedType] = useState<'job' | 'service' | null>(null);
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/job-house');
  };

  if (!selectedType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center animate-fade-in space-y-8 py-16">
            <div className="flex items-center justify-center gap-4 mb-8">
              <Button variant="ghost" size="icon" onClick={() => navigate('/job-house')} className="hover:bg-white/10">
                <ArrowLeft />
              </Button>
              <h2 className="text-5xl font-bold tracking-tight">What would you like to post?</h2>
            </div>
            <p className="text-xl text-muted-foreground">Choose the type of posting you want to create.</p>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-8">
              <Card
                className="bg-background/20 backdrop-blur-sm border-white/10 hover:bg-background/30 transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedType('job')}
              >
                <CardHeader>
                  <Briefcase className="w-12 h-12 mx-auto text-primary group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-2xl font-semibold">Post a Job</CardTitle>
                  <p className="text-muted-foreground mt-2">Hire freelancers for your project needs.</p>
                </CardContent>
              </Card>
              <Card
                className="bg-background/20 backdrop-blur-sm border-white/10 hover:bg-background/30 transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedType('service')}
              >
                <CardHeader>
                  <UserPlus className="w-12 h-12 mx-auto text-primary group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-2xl font-semibold">Post a Service</CardTitle>
                  <p className="text-muted-foreground mt-2">Offer your services to potential clients.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setSelectedType(null)} className="hover:bg-white/10">
            <ArrowLeft />
          </Button>
          <h2 className="text-2xl font-bold">Post a {selectedType === 'job' ? 'Job' : 'Service'}</h2>
        </div>
        <PostJobForm type={selectedType} onSuccess={handleSuccess} />
      </main>
    </div>
  );
};

export default PostJobPage;
