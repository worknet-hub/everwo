import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { User, School, MapPin, Sun, Moon, CheckCircle, X } from 'lucide-react';
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';
import { Combobox } from '@/components/ui/combobox';

const MAJORS = [
  'Biology', 'Chemistry', 'Physics', 'Mathematics', 'Statistics', 'Environmental Science', 'Geology', 'Astronomy', 'Computer Science', 'Information Technology', 'Data Science', 'Artificial Intelligence', 'Biotechnology', 'Microbiology', 'Marine Biology', 'Zoology', 'Botany', 'Biomedical Science', 'Nanotechnology', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Computer Engineering', 'Electronics and Communication Engineering', 'Aerospace Engineering', 'Chemical Engineering', 'Environmental Engineering', 'Mechatronics Engineering', 'Software Engineering', 'Robotics Engineering', 'Petroleum Engineering', 'Structural Engineering', 'Agricultural Engineering', 'Industrial Engineering', 'Marine Engineering', 'Metallurgical Engineering', 'Mining Engineering', 'Automotive Engineering', 'Medicine', 'Dentistry', 'Pharmacy', 'Nursing', 'Physiotherapy', 'Veterinary Science', 'Occupational Therapy', 'Public Health', 'Law', 'Business Administration', 'Economics', 'Accounting', 'Finance', 'Marketing', 'Human Resource Management', 'International Business', 'Entrepreneurship', 'Operations Management', 'Supply Chain Management', 'Architecture', 'Urban Planning', 'Interior Design', 'Graphic Design', 'Fashion Design', 'Fine Arts', 'Performing Arts', 'Music', 'Film Studies', 'Theatre', 'English Literature', 'Linguistics', 'History', 'Philosophy', 'Psychology', 'Sociology', 'Political Science', 'Anthropology', 'Education', 'Journalism', 'Mass Communication', 'Media Studies', 'Public Relations', 'Hospitality Management', 'Tourism', 'Culinary Arts', 'Criminology', 'Social Work', 'Library Science', 'Theology', 'Religious Studies', 'Gender Studies', 'Cognitive Science', 'Cultural Studies', 'Development Studies', 'International Relations', 'Sports Science', 'Event Management', 'Game Design', 'Animation', 'Agriculture', 'Forestry', 'Horticulture', 'Food Technology', 'Renewable Energy', 'Aviation', 'Defense Studies', 'Ethics', 'Logistics', 'Digital Media', 'Actuarial Science'
];

const COLLEGES = [
  'GITAM-HYD',
  'MAHINDRA-HYD',
  'WOXSEN-HYD',
  'CHRIST',
  'SNIST',
  'KLU-HYD',
  'MANIPAL-BLR',
  'MANIPAL',
  'AMITY-DEL',
  'AMITY-HYD',
  'LPU-PUJ',
];

interface PersonalizeScreenProps {
  data: {
    college_name: string;
    bio: string;
    location: string;
    year_of_study: string;
    major: string;
    theme: 'dark' | 'light';
  };
  onUpdate: (data: any) => void;
  onComplete: () => void;
  onPrevious: () => void;
  isCompleting: boolean;
  locked?: boolean;
}

export const PersonalizeScreen = ({ data, onUpdate, onComplete, onPrevious, isCompleting, locked }: PersonalizeScreenProps) => {
  const [formData, setFormData] = useState(data);

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  const handleThemeToggle = (isDark: boolean) => {
    const theme: 'dark' | 'light' = isDark ? 'dark' : 'light';
    const newData = { ...formData, theme };
    setFormData(newData);
    onUpdate(newData);
  };

  const isFormValid = formData.college_name && formData.major && formData.year_of_study;

  // Remove the lock logic for major selection in onboarding
  // const majorLocked = Boolean(data.major); // <-- remove or comment out

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-white/20 to-gray-200/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/10">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Personalize</h2>
            <p className="text-gray-400">Make Everwo truly yours</p>
          </div>
        </div>

        {/* Theme toggle */}

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="college_name" className="flex items-center space-x-2 text-gray-300">
              <School className="w-4 h-4" />
              <span>College/University *</span>
            </Label>
            <Select
              value={formData.college_name}
              onValueChange={(value) => handleInputChange('college_name', value)}
              disabled={locked}
            >
              <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white rounded-xl">
                <SelectValue placeholder="Select your college" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700 max-h-60 overflow-y-auto">
                {COLLEGES.map((college) => (
                  <SelectItem key={college} value={college}>{college}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {locked && !!data.college_name && (
              <div className="text-green-400 text-xs mt-1">College selection is locked after submission.</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="major" className="text-gray-300">Major *</Label>
              <div className="relative">
                <MajorCombobox value={formData.major} onChange={major => handleInputChange('major', major)} disabled={locked} />
                {locked && !!data.major && (
                  <div className="text-green-400 text-xs mt-1">Major selection is locked after submission.</div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year_of_study" className="text-gray-300">Year *</Label>
              <Select value={formData.year_of_study} onValueChange={(value) => handleInputChange('year_of_study', value)}>
                <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white rounded-xl">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="first">First Year</SelectItem>
                  <SelectItem value="second">Second Year</SelectItem>
                  <SelectItem value="third">Third Year</SelectItem>
                  <SelectItem value="fourth">Fourth Year</SelectItem>
                  <SelectItem value="fifth">Fifth Year</SelectItem>
                  <SelectItem value="alumni">Alumni</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center space-x-2 text-gray-300">
              <MapPin className="w-4 h-4" />
              <span>Location</span>
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Boston, MA"
              className="h-12 bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-gray-300">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              className="min-h-[80px] bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-xl resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-4 pt-4">
          <Button 
            onClick={onPrevious}
            variant="outline"
            className="flex-1 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
            disabled={isCompleting}
          >
            Back
          </Button>
          <Button 
            onClick={onComplete}
            disabled={!isFormValid || isCompleting}
            className="flex-1 h-12 bg-gradient-to-r from-white to-gray-200 text-black rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {isCompleting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Setting up...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Complete Setup</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

function MajorCombobox({ value, onChange, disabled }: { value: string, onChange: (major: string) => void, disabled?: boolean }) {
  const [search, setSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const filtered = MAJORS.filter(major => major.toLowerCase().includes(search.toLowerCase()));

  // Show dropdown when focused or typing
  const showDropdown = isFocused && search.length > 0 && filtered.length > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    // Do not clear the value automatically
  };

  const handleSelect = (major: string) => {
    onChange(major);
    setSearch('');
    setIsFocused(false);
    if (inputRef.current) inputRef.current.blur();
  };

  const handleClear = () => {
    onChange('');
    setSearch('');
    setIsFocused(true);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div>
      {value && !disabled ? (
        <span className="inline-flex items-center bg-white/10 text-white rounded-full px-3 py-1 text-sm cursor-pointer select-none" onClick={handleClear}>
          {value} <span className="ml-2 text-xs">(change)</span>
        </span>
      ) : value && disabled ? (
        <span className="inline-flex items-center bg-white/10 text-white rounded-full px-3 py-1 text-sm cursor-not-allowed select-none">
          {value}
        </span>
      ) : (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 100)}
            placeholder="Search and select your major..."
            className="h-12 w-full bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-xl px-3"
            autoComplete="off"
            disabled={disabled}
          />
          {showDropdown && !disabled && (
            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl mt-1 max-h-60 overflow-y-auto shadow-lg">
              {filtered.map(major => (
                <div
                  key={major}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-black"
                  onMouseDown={() => handleSelect(major)}
                >
                  {major}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
