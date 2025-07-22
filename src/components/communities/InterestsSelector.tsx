
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

export const INTERESTS = [
  'Reading', 'Writing', 'Drawing', 'Painting', 'Sketching', 'Photography', 'Filmmaking', 'Video editing',
  'Acting', 'Singing', 'Dancing', 'Playing instruments', 'Cooking', 'Baking', 'Gardening', 'Traveling',
  'Hiking', 'Camping', 'Cycling', 'Swimming', 'Running', 'Jogging', 'Yoga', 'Meditation', 'Gym workouts',
  'Bodybuilding', 'Calligraphy', 'Crafting', 'Knitting', 'Crocheting', 'Sewing', 'Woodworking', 'Origami',
  'Gaming', 'Board games', 'Card games', 'Collecting (stamps, coins, etc.)', 'Bird watching', 'Fishing',
  'Scuba diving', 'Surfing', 'Rock climbing', 'Martial arts', 'Skateboarding', 'Roller skating',
  'Playing chess', 'Solving puzzles', 'Watching movies', 'Watching TV shows', 'Watching anime',
  'Listening to music', 'DJ-ing', 'Podcasting', 'Blogging', 'Vlogging', 'Coding', 'Web development',
  'App development', 'Game development', 'UI/UX design', '3D modeling', 'Animation', 'Robotics',
  'Learning languages', 'Debating', 'Public speaking', 'Studying history', 'Astronomy', 'Astrology',
  'Makeup artistry', 'Fashion styling', 'Interior decorating', 'Shopping', 'Volunteering', 'Social activism',
  'Animal care', 'Pet training', 'Car restoration', 'Home improvement', 'Mixology', 'Tea tasting',
  'Coffee brewing', 'Investing', 'Crypto trading', 'Stock trading', 'Digital marketing', 'Content creation',
  'Freelancing', 'Networking', 'Event planning', 'Journaling', 'Minimalism', 'Self-improvement',
  'Mindfulness', 'Tattoo art', 'Cosplaying', 'Meme-making', 'Thrifting', 'Urban exploring',
  'Watching sports', 'Fantasy sports', 'Writing poetry', 'Writing short stories', 'Sculpting', 'Nail art',
  'Soap making', 'Perfume making', 'Beatboxing', 'Magic tricks', 'Speedcubing', 'Geocaching',
  // Comprehensive sports list
  'Soccer', 'Football', 'Basketball', 'Baseball', 'Cricket', 'Tennis', 'Table tennis', 'Badminton',
  'Volleyball', 'Rugby', 'Golf', 'Hockey', 'Ice hockey', 'Field hockey', 'Boxing', 'MMA', 'Wrestling',
  'Judo', 'Karate', 'Taekwondo', 'Fencing', 'Archery', 'Shooting', 'Skiing', 'Snowboarding', 'Skating',
  'Figure skating', 'Speed skating', 'Cycling', 'Mountain biking', 'BMX', 'Motorsport', 'Formula 1',
  'NASCAR', 'Rally', 'Horse riding', 'Equestrian', 'Rowing', 'Canoeing', 'Kayaking', 'Sailing',
  'Surfing', 'Diving', 'Water polo', 'Synchronised swimming', 'Triathlon', 'Pentathlon', 'Decathlon',
  'Weightlifting', 'Powerlifting', 'Bodybuilding', 'CrossFit', 'Parkour', 'Handball', 'Lacrosse',
  'Softball', 'Squash', 'Racquetball', 'Polo', 'Ultimate frisbee', 'Disc golf', 'Darts', 'Bowling',
  'Billiards', 'Snooker', 'Curling', 'Sumo', 'Gymnastics', 'Trampoline', 'Cheerleading', 'Dance sport',
  'Orienteering', 'Climbing', 'Bouldering', 'Trail running', 'Obstacle racing', 'Kickboxing', 'Muay Thai',
  'Capoeira', 'Sambo', 'Aikido', 'Kendo', 'Kung fu', 'Base jumping', 'Paragliding', 'Hang gliding',
  'Skydiving', 'Windsurfing', 'Kitesurfing', 'Bodyboarding', 'Paddleboarding', 'Spearfishing',
  'Underwater hockey', 'Underwater rugby', 'Caving', 'Speleology', 'Dog sports', 'Agility', 'Flyball',
  'Disc dog', 'Sled dog racing', 'Drone racing', 'Esports', 'Fantasy sports', 'Other sports'
];

interface InterestsSelectorProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  minInterests?: number;
  maxInterests?: number;
}

export const InterestsSelector = ({
  selectedInterests,
  onInterestsChange,
  minInterests = 3,
  maxInterests = 7
}: InterestsSelectorProps) => {
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredInterests = INTERESTS.filter(
    (interest) =>
      interest.toLowerCase().includes(search.toLowerCase()) &&
      !selectedInterests.includes(interest)
  );

  const addInterest = (interest: string) => {
    if (
      !selectedInterests.includes(interest) &&
      selectedInterests.length < maxInterests
    ) {
      onInterestsChange([...selectedInterests, interest]);
      setSearch('');
      setShowDropdown(false);
    }
  };

  const removeInterest = (interest: string) => {
    onInterestsChange(selectedInterests.filter((i) => i !== interest));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Your Interests</CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose {minInterests}-{maxInterests} interests to join communities and tag your thoughts
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search and add interests..."
            className="w-full px-3 py-2 border border-transparent rounded-md outline-none focus:outline-none bg-gray-700 bg-opacity-60 text-white placeholder-white"
          />
          {showDropdown && search && filteredInterests.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
              {filteredInterests.map((interest) => (
                <div
                  key={interest}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center text-black"
                  onClick={() => addInterest(interest)}
                >
                  <Check className="w-4 h-4 text-primary mr-2" />
                  {interest}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Selected interests as chips */}
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedInterests.map((interest) => (
            <Badge key={interest} variant="secondary" className="flex items-center gap-1 text-xs px-2 py-0.5 md:text-base md:px-3 md:py-1">
              {interest}
              <button
                type="button"
                className="ml-1 text-gray-500 hover:text-red-500 focus:outline-none"
                onClick={() => removeInterest(interest)}
                aria-label={`Remove ${interest}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          Selected: {selectedInterests.length}/{maxInterests} interests
          {selectedInterests.length < minInterests && (
            <span className="text-red-500 ml-2">
              (Minimum {minInterests} required)
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
