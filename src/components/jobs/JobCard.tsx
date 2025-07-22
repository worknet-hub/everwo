
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, MapPin, Clock, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Job } from '@/hooks/useJobs';

export const JobCard = ({ job }: { job: Job }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const navigate = useNavigate();

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    console.log(`${isBookmarked ? 'Removed bookmark for' : 'Bookmarked'} ${job.type}: ${job.title}`);
  };

  const handleApply = () => {
    console.log(`Applying to ${job.type}: ${job.title}`);
    alert(`Application process for ${job.title} would start here.`);
  };

  const handleViewDetails = () => {
    console.log(`Viewing details for ${job.type}: ${job.title}`);
    navigate(`/${job.type}/${job.id}`);
  };

  const formatBudget = () => {
    if (!job.budget_min && !job.budget_max) return null;
    
    const min = job.budget_min ? `$${job.budget_min}` : '';
    const max = job.budget_max ? `$${job.budget_max}` : '';
    const type = job.budget_type === 'hourly' ? '/hr' : '';
    
    if (min && max) {
      return `${min} - ${max}${type}`;
    }
    return `${min || max}${type}`;
  };

  const formatDeadline = () => {
    if (!job.deadline) return null;
    return new Date(job.deadline).toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={job.type === 'job' ? 'default' : 'secondary'} className="text-xs">
                {job.type === 'job' ? 'Job' : 'Service'}
              </Badge>
              {job.experience_level && (
                <Badge variant="outline" className="text-xs">
                  {job.experience_level}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
            <CardDescription>
              {job.profiles?.full_name || 'Anonymous User'}
              {job.profiles?.rating && (
                <span className="ml-2 text-yellow-500">★ {job.profiles.rating.toFixed(1)}</span>
              )}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="flex-shrink-0"
            onClick={handleBookmark}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 fill-current" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {formatBudget() && (
          <div className="flex items-center gap-1 mt-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <p className="text-sm font-medium text-green-600">{formatBudget()}</p>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{job.description}</p>
        
        <div className="space-y-2">
          {(job.location || job.location_type) && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>
                {job.location || job.location_type}
                {job.location && job.location_type && ` (${job.location_type})`}
              </span>
            </div>
          )}
          
          {formatDeadline() && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Due: {formatDeadline()}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex-col items-start gap-3 pt-0">
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 3).map(skill => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{job.skills.length - 3}
              </Badge>
            )}
          </div>
        )}
        <div className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            className="flex-1 text-sm"
            onClick={handleViewDetails}
          >
            Details
          </Button>
          <Button 
            className="flex-1 text-sm"
            onClick={handleApply}
          >
            {job.type === 'job' ? 'Apply' : 'Contact'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
