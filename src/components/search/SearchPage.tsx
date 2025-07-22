
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, MapPin, Users, Verified, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtime } from '@/hooks/useRealtime';

// Dynamically import Fuse.js only when needed
let Fuse: any = null;
const loadFuse = async () => {
  if (!Fuse) {
    const fuseModule = await import('fuse.js');
    Fuse = fuseModule.default;
  }
  return Fuse;
};

interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  bio: string;
  college_name: string;
  college_verified: boolean;
  skills: string[];
  rating: number;
  location: string;
  availability_status: string;
  badges: string[];
}

interface Gig {
  id: string;
  title: string;
  description: string;
  price_amount: number;
  price_type: string;
  skills: string[];
  location_type: string;
  user: {
    full_name: string;
    avatar_url: string;
  };
}

export const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [filteredGigs, setFilteredGigs] = useState<Gig[]>([]);
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  const fetchData = async () => {
    // Fetch real profiles from Supabase
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*');

    // Fetch real gigs with user data from Supabase
    const { data: gigsData } = await supabase
      .from('gigs')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `);

    if (profilesData) {
      const formattedProfiles = profilesData.map(profile => ({
        id: profile.id,
        full_name: profile.full_name || '',
        username: profile.username || '',
        avatar_url: profile.avatar_url || '',
        bio: profile.bio || '',
        college_name: profile.college_name || '',
        college_verified: profile.college_verified || false,
        skills: profile.skills || [],
        rating: profile.rating || 0,
        location: profile.location || '',
        availability_status: profile.availability_status || 'available',
        badges: profile.badges || []
      }));
      setProfiles(formattedProfiles);
    }

    if (gigsData) {
      const formattedGigs = gigsData.map(gig => ({
        id: gig.id,
        title: gig.title,
        description: gig.description,
        price_amount: gig.price_amount,
        price_type: gig.price_type,
        skills: gig.skills || [],
        location_type: gig.location_type,
        user: {
          full_name: gig.profiles?.full_name || '',
          avatar_url: gig.profiles?.avatar_url || ''
        }
      }));
      setGigs(formattedGigs);
    }
  };

  // Add real-time updates for profiles and gigs
  // Removed useRealtime subscriptions for 'profiles' and 'gigs'

  useEffect(() => {
    fetchData();
  }, []);

  const filterResults = async () => {
    const Fuse = await loadFuse();
    let filtered = profiles;

    if (searchTerm) {
      const fuse = new Fuse(profiles, {
        keys: ['full_name', 'username', 'bio', 'skills', 'college_name'],
        threshold: 0.3,
        includeScore: true
      });
      filtered = fuse.search(searchTerm).map(result => result.item);
    }

    if (skillFilter) {
      filtered = filtered.filter(profile => 
        profile.skills?.some(skill => 
          skill.toLowerCase().includes(skillFilter.toLowerCase())
        )
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(profile => 
        profile.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (ratingFilter) {
      filtered = filtered.filter(profile => profile.rating >= ratingFilter);
    }

    setFilteredProfiles(filtered);
  };

  useEffect(() => {
    filterResults();
  }, [searchTerm, skillFilter, locationFilter, ratingFilter, profiles, gigs]);

  const allSkills = Array.from(new Set(profiles.flatMap(p => p.skills)));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Discover Talent & Opportunities</h1>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for people, skills, or opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-lg py-6"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Select value={skillFilter} onValueChange={setSkillFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by skill" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Skills</SelectItem>
              {allSkills.map(skill => (
                <SelectItem key={skill} value={skill}>{skill}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-[200px]"
          />

          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Minimum rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Rating</SelectItem>
              <SelectItem value="4.5">4.5+ Stars</SelectItem>
              <SelectItem value="4.0">4.0+ Stars</SelectItem>
              <SelectItem value="3.5">3.5+ Stars</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSkillFilter('all');
              setLocationFilter('');
              setRatingFilter('all');
              setSearchTerm('');
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      <Tabs defaultValue="people" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="people">People ({filteredProfiles.length})</TabsTrigger>
          <TabsTrigger value="gigs">Gigs ({filteredGigs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="people" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback>
                        <User className="w-8 h-8 text-gray-300" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold truncate">{profile.username || 'unknown-user'}</h3>
                        {profile.college_verified && (
                          <Verified className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{profile.username}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{profile.rating}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {profile.bio}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.location}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {profile.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {profile.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.skills.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {profile.badges.map((badge) => (
                        <Badge key={badge} className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        profile.availability_status === 'available' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm capitalize">{profile.availability_status}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Button className="w-full">Connect</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gigs" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGigs.map((gig) => (
              <Card key={gig.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg">{gig.title}</h3>
                      <Badge variant="outline" className="capitalize">
                        {gig.location_type}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {gig.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {gig.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold">
                        ${gig.price_amount}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{gig.price_type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={gig.user.avatar_url} />
                          <AvatarFallback className="text-xs">
                            <User className="w-4 h-4 text-gray-300" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          {gig.user.full_name}
                        </span>
                      </div>
                    </div>

                    <Button className="w-full">Apply Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
