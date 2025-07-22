import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Search, Briefcase, UserPlus, ArrowLeft } from 'lucide-react';
import { JobCard } from './JobCard';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useJobs } from '@/hooks/useJobs';

const JobHouse = () => {
  const [view, setView] = useState<'selection' | 'jobs' | 'services'>('selection');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const navigate = useNavigate();

  const jobType = view === 'jobs' ? 'job' : view === 'services' ? 'service' : 'all';
  const { jobs, isLoading, error } = useJobs({
    type: jobType,
    searchTerm,
    location: locationFilter,
  });

  console.log('JobHouse: Current state:', { view, jobType, jobsCount: jobs.length, isLoading, error });

  const handlePostJob = () => {
    navigate('/post-job');
  };

  const handleSearch = () => {
    console.log(`Searching for: ${searchTerm}`);
  };

  if (view === 'selection') {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="text-center space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-foreground mb-4">Job House</h2>
            <p className="text-lg text-muted-foreground">Find work or hire talent</p>
          </div>
          
          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Post opportunities</h3>
            <Button onClick={handlePostJob} size="lg" variant="outline">
              Post a Job or Service
            </Button>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-6 text-foreground">Find opportunities</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setView('jobs')}
              >
                <CardHeader className="text-center">
                  <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <CardTitle className="text-xl">Browse Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Find employment opportunities</p>
                </CardContent>
              </Card>
              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setView('services')}
              >
                <CardHeader className="text-center">
                  <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <CardTitle className="text-xl">Browse Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Discover freelance services</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error display
  if (error) {
    console.error('JobHouse: Error state:', error);
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Error loading {view}: {error.message}</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setView('selection')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {view === 'jobs' ? 'Jobs' : 'Services'}
            </h2>
            <p className="text-muted-foreground">
              {view === 'jobs' 
                ? 'Find your next opportunity' 
                : 'Discover freelance services'
              }
            </p>
          </div>
        </div>
        <Button onClick={handlePostJob} variant="outline">
          Post {view === 'jobs' ? 'Job' : 'Service'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${view}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="on-site">On-site</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Job/Service Cards */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading {view}...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {!isLoading && jobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No {view === 'jobs' ? 'jobs' : 'services'} found.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Try posting one or adjusting your filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default JobHouse;
