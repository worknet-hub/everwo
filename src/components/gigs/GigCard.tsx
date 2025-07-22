import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  DollarSign,
  MapPin,
  Star,
  Bookmark,
  User
} from 'lucide-react';

interface GigCardProps {
  title: string;
  description: string;
  price: {
    amount: number;
    type: 'fixed' | 'hourly';
  };
  duration: string;
  location: 'remote' | 'on-site' | 'hybrid';
  skills: string[];
  poster: {
    name: string;
    avatar: string;
    rating: number;
    verified: boolean;
  };
  applicants: number;
  postedTime: string;
}

const GigCard = ({
  title,
  description,
  price,
  duration,
  location,
  skills,
  poster,
  applicants,
  postedTime
}: GigCardProps) => {
  const getLocationColor = (loc: string) => {
    switch (loc) {
      case 'remote': return 'bg-green-500/10 text-green-600';
      case 'on-site': return 'bg-gray-700/10 text-white';
      case 'hybrid': return 'bg-gray-900/10 text-white';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  return (
    <Card className="w-full hover-lift glass-card group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price and Duration */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-everwo-green" />
            <span className="font-semibold text-lg">
              ${price.amount}
              <span className="text-sm text-muted-foreground ml-1">
                {price.type === 'hourly' ? '/hr' : 'fixed'}
              </span>
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <Badge className={getLocationColor(location)}>
            {location.charAt(0).toUpperCase() + location.slice(1)}
          </Badge>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-2">
          {skills.slice(0, 3).map((skill, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {skills.length > 3 && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              +{skills.length - 3} more
            </Badge>
          )}
        </div>

        {/* Poster Info */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={poster.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-900 text-white text-xs">
                <User className="w-5 h-5 text-gray-300" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{poster.name}</p>
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-muted-foreground">{poster.rating}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{applicants} applicants</p>
            <p className="text-xs text-muted-foreground">{postedTime}</p>
          </div>
        </div>

        {/* Apply Button */}
        <Button className="w-full gradient-bg text-white hover:opacity-90">
          Apply Now
        </Button>
      </CardContent>
    </Card>
  );
};

export default GigCard;
