
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Briefcase, Calendar, Award, LogOut, Heart, Star, MessageCircle, TrendingUp, UserPlus, FileText } from 'lucide-react';
import { toast } from 'sonner';

const AlumniPortalPage = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [alumniProfile, setAlumniProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mentorshipData, setMentorshipData] = useState({
    type: 'request',
    message: ''
  });
  const [jobPostData, setJobPostData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    salary_range: '',
    job_type: 'full-time',
    experience_level: 'entry'
  });

  useEffect(() => {
    const checkAlumniAccess = async () => {
      if (!user) {
        navigate('/alumni-auth');
        return;
      }

      console.log('Checking alumni access for user:', user.email, 'Is admin:', isAdmin);

      if (isAdmin) {
        console.log('Admin access granted');
        setAlumniProfile({
          full_name: 'Admin User',
          verification_status: 'approved',
          graduation_year: new Date().getFullYear(),
          degree: 'Administration',
          major: 'System Administration',
          created_at: new Date().toISOString()
        });
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('alumni_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        console.log('Alumni profile query result:', profile, error);

        if (error || !profile) {
          toast.error('Alumni access not found. Please sign up for alumni portal.');
          navigate('/alumni-auth');
          return;
        }

        setAlumniProfile(profile);
      } catch (error) {
        console.error('Error checking alumni access:', error);
        navigate('/alumni-auth');
      } finally {
        setLoading(false);
      }
    };

    checkAlumniAccess();
  }, [user, navigate, isAdmin]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/alumni-auth');
  };

  const handleMentorshipRequest = async () => {
    if (!alumniProfile) return;

    try {
      const { error } = await supabase
        .from('alumni_mentorship')
        .insert({
          mentor_id: alumniProfile.id,
          mentee_id: alumniProfile.id,
          status: 'pending'
        });

      if (error) throw error;
      toast.success('Mentorship request submitted!');
    } catch (error: any) {
      console.error('Error submitting mentorship request:', error);
      toast.error('Failed to submit mentorship request');
    }
  };

  const handleJobPost = async () => {
    if (!alumniProfile) return;

    try {
      const { error } = await supabase
        .from('alumni_job_posts')
        .insert({
          posted_by: alumniProfile.id,
          ...jobPostData
        });

      if (error) throw error;
      toast.success('Job posted successfully!');
      setJobPostData({
        title: '',
        company: '',
        description: '',
        location: '',
        salary_range: '',
        job_type: 'full-time',
        experience_level: 'entry'
      });
    } catch (error: any) {
      console.error('Error posting job:', error);
      toast.error('Failed to post job');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <img src="/logo.webp" alt="Loading..." className="w-48 h-48 object-contain animate-pulse mb-6" style={{ maxWidth: '80vw', maxHeight: '40vh' }} />
        <span className="text-white text-lg mt-2">Loading alumni portal...</span>
      </div>
    );
  }

  if (!alumniProfile) {
    return null;
  }

  const getVerificationBadge = () => {
    if (isAdmin) {
      return <Badge className="bg-purple-100 text-purple-800 animate-pulse">Admin Access</Badge>;
    }
    
    switch (alumniProfile.verification_status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 animate-fade-in">Verified Alumni</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700 animate-pulse">Verification Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="animate-fade-in">Verification Rejected</Badge>;
      default:
        return <Badge variant="outline" className="animate-fade-in">Unverified</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 animate-fade-in">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 animate-slide-in-right">
              <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-200 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <span className="text-black font-bold text-xl">🎓</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Everwo Alumni Portal</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {alumniProfile.full_name}{isAdmin ? ' (Admin)' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {getVerificationBadge()}
              <Button variant="outline" onClick={handleSignOut} className="hover:scale-105 transition-transform">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Verification Notice */}
        {!isAdmin && alumniProfile.verification_status === 'pending' && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6 animate-fade-in">
            <h3 className="font-medium text-yellow-800 mb-2 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Document Verification Required
            </h3>
            <p className="text-yellow-700 text-sm mb-4">
              Your alumni status is pending verification. Please upload your graduation documents to access all features.
            </p>
            <Button 
              size="sm" 
              className="bg-yellow-600 hover:bg-yellow-700 transform hover:scale-105 transition-all"
              onClick={() => navigate('/alumni-portal/verification')}
            >
              Upload Documents
            </Button>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
            Welcome to the Alumni Network
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl">
            Connect with fellow alumni, explore exclusive opportunities, and continue your professional journey 
            with the support of our vibrant community.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: Users, value: '5,240', label: 'Verified Alumni', color: 'indigo' },
            { icon: Briefcase, value: '324', label: 'Job Opportunities', color: 'green' },
            { icon: Calendar, value: '18', label: 'Upcoming Events', color: 'blue' },
            { icon: Award, value: '892', label: 'Mentorships', color: 'purple' }
          ].map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in border-0 bg-white/60 backdrop-blur-sm" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-6 text-center">
                <stat.icon className={`w-8 h-8 text-${stat.color}-600 mx-auto mb-3`} />
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Alumni Directory */}
          <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer animate-fade-in border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-indigo-600" />
                Alumni Directory
              </CardTitle>
              <CardDescription>
                Search and connect with alumni from your college and beyond
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-white to-gray-200 hover:from-gray-100 hover:to-gray-300 text-black transform hover:scale-105 transition-all">
                Browse Alumni
              </Button>
            </CardContent>
          </Card>

          {/* Exclusive Jobs */}
          <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer animate-fade-in border-0 bg-white/70 backdrop-blur-sm" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-green-600" />
                Exclusive Jobs
              </CardTitle>
              <CardDescription>
                Access job postings shared exclusively by fellow alumni
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  View Jobs
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">Post a Job</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogTitle className="sr-only">Post a Job</DialogTitle>
                    <DialogHeader>
                      <DialogTitle>Post a Job</DialogTitle>
                      <DialogDescription>Share an exclusive opportunity with fellow alumni</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="job-title">Job Title</Label>
                        <Input
                          id="job-title"
                          value={jobPostData.title}
                          onChange={(e) => setJobPostData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Senior Software Engineer"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={jobPostData.company}
                          onChange={(e) => setJobPostData(prev => ({ ...prev, company: e.target.value }))}
                          placeholder="e.g., Tech Corp"
                        />
                      </div>
                      <div>
                        <Label htmlFor="job-description">Description</Label>
                        <Textarea
                          id="job-description"
                          value={jobPostData.description}
                          onChange={(e) => setJobPostData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Job requirements and responsibilities..."
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Job Type</Label>
                          <Select value={jobPostData.job_type} onValueChange={(value) => setJobPostData(prev => ({ ...prev, job_type: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full-time">Full-time</SelectItem>
                              <SelectItem value="part-time">Part-time</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="internship">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Experience Level</Label>
                          <Select value={jobPostData.experience_level} onValueChange={(value) => setJobPostData(prev => ({ ...prev, experience_level: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="entry">Entry</SelectItem>
                              <SelectItem value="mid">Mid</SelectItem>
                              <SelectItem value="senior">Senior</SelectItem>
                              <SelectItem value="executive">Executive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={jobPostData.location}
                          onChange={(e) => setJobPostData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="e.g., San Francisco, CA or Remote"
                        />
                      </div>
                      <div>
                        <Label htmlFor="salary">Salary Range</Label>
                        <Input
                          id="salary"
                          value={jobPostData.salary_range}
                          onChange={(e) => setJobPostData(prev => ({ ...prev, salary_range: e.target.value }))}
                          placeholder="e.g., $80k - $120k"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleJobPost} className="w-full">Post Job</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Mentorship */}
          <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer animate-fade-in border-0 bg-white/70 backdrop-blur-sm" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                Mentorship Hub
              </CardTitle>
              <CardDescription>
                Find mentors or become one to guide fellow professionals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600">
                  Find Mentors
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Request Mentorship
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle className="sr-only">Request Mentorship</DialogTitle>
                    <DialogHeader>
                      <DialogTitle>Request Mentorship</DialogTitle>
                      <DialogDescription>Connect with experienced alumni for guidance</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Request Type</Label>
                        <Select value={mentorshipData.type} onValueChange={(value) => setMentorshipData(prev => ({ ...prev, type: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="request">Seeking Mentor</SelectItem>
                            <SelectItem value="offer">Offer to Mentor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="mentorship-message">Message</Label>
                        <Textarea
                          id="mentorship-message"
                          value={mentorshipData.message}
                          onChange={(e) => setMentorshipData(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Tell us about your goals or what you can offer..."
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleMentorshipRequest}>Submit Request</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Events & Reunions */}
          <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer animate-fade-in border-0 bg-white/70 backdrop-blur-sm" style={{ animationDelay: '300ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Events & Reunions
              </CardTitle>
              <CardDescription>
                Join exclusive alumni events, workshops, and reunions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                View Events
              </Button>
            </CardContent>
          </Card>

          {/* Success Stories */}
          <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer animate-fade-in border-0 bg-white/70 backdrop-blur-sm" style={{ animationDelay: '400ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Success Stories
              </CardTitle>
              <CardDescription>
                Read inspiring stories and share your own journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                  Read Stories
                </Button>
                <Button variant="outline" className="w-full">Share Your Story</Button>
              </div>
            </CardContent>
          </Card>

          {/* Community Forum */}
          <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer animate-fade-in border-0 bg-white/70 backdrop-blur-sm" style={{ animationDelay: '500ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-emerald-600" />
                Community Forum
              </CardTitle>
              <CardDescription>
                Engage in discussions and share knowledge with peers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                Join Discussions
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Profile Summary */}
        <Card className="animate-fade-in bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
              Your Alumni Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50">
                <p className="text-sm text-gray-600 mb-1">Graduation Year</p>
                <p className="text-2xl font-bold text-indigo-600">{alumniProfile.graduation_year}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <p className="text-sm text-gray-600 mb-1">Degree</p>
                <p className="font-medium text-green-700">{alumniProfile.degree}</p>
              </div>
              {alumniProfile.major && (
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50">
                  <p className="text-sm text-gray-600 mb-1">Major</p>
                  <p className="font-medium text-blue-700">{alumniProfile.major}</p>
                </div>
              )}
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50">
                <p className="text-sm text-gray-600 mb-1">Member Since</p>
                <p className="font-medium text-purple-700">
                  {new Date(alumniProfile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AlumniPortalPage;
