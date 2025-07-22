import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MajorCombobox } from '../onboarding/screens/PersonalizeScreen';
import { OnboardingLayout } from './OnboardingLayout';
import { User, School, MapPin } from 'lucide-react';

interface ProfileSetupStepProps {
  data: {
    college_name: string;
    bio: string;
    location: string;
    year_of_study: string;
    major: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

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

const MAJORS = [
  'Biology', 'Chemistry', 'Physics', 'Mathematics', 'Statistics', 'Environmental Science', 'Geology', 'Astronomy', 'Computer Science', 'Information Technology', 'Data Science', 'Artificial Intelligence', 'Biotechnology', 'Microbiology', 'Marine Biology', 'Zoology', 'Botany', 'Biomedical Science', 'Nanotechnology', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Computer Engineering', 'Electronics and Communication Engineering', 'Aerospace Engineering', 'Chemical Engineering', 'Environmental Engineering', 'Mechatronics Engineering', 'Software Engineering', 'Robotics Engineering', 'Petroleum Engineering', 'Structural Engineering', 'Agricultural Engineering', 'Industrial Engineering', 'Marine Engineering', 'Metallurgical Engineering', 'Mining Engineering', 'Automotive Engineering', 'Medicine', 'Dentistry', 'Pharmacy', 'Nursing', 'Physiotherapy', 'Veterinary Science', 'Occupational Therapy', 'Public Health', 'Law', 'Business Administration', 'Economics', 'Accounting', 'Finance', 'Marketing', 'Human Resource Management', 'International Business', 'Entrepreneurship', 'Operations Management', 'Supply Chain Management', 'Architecture', 'Urban Planning', 'Interior Design', 'Graphic Design', 'Fashion Design', 'Fine Arts', 'Performing Arts', 'Music', 'Film Studies', 'Theatre', 'English Literature', 'Linguistics',
];

export const ProfileSetupStep = ({ data, onUpdate, onNext, onPrevious }: ProfileSetupStepProps) => {
  const [formData, setFormData] = useState(data);

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  const isFormValid = formData.college_name && formData.major && formData.year_of_study;

  return (
    <OnboardingLayout
      currentStep={5}
      totalSteps={6}
      title="Tell us about yourself"
      subtitle="Help other students find and connect with you"
    >
      <div className="space-y-6">
        <div className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="college_name" className="flex items-center space-x-2">
              <School className="w-4 h-4" />
              <span>College/University *</span>
            </Label>
            <Select
              value={formData.college_name}
              onValueChange={(value) => handleInputChange('college_name', value)}
              disabled={!!data.college_name}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select your college" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {COLLEGES.map((college) => (
                  <SelectItem key={college} value={college}>{college}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!!data.college_name && (
              <div className="text-green-400 text-xs mt-1">College selection is locked after submission.</div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="major">Major/Field of Study *</Label>
              <MajorCombobox value={formData.major} onChange={major => handleInputChange('major', major)} disabled={!!data.major} />
              {!!data.major && (
                <div className="text-green-400 text-xs mt-1">Major selection is locked after submission.</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year_of_study">Year of Study *</Label>
              <Select value={formData.year_of_study} onValueChange={(value) => handleInputChange('year_of_study', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select your year" />
                </SelectTrigger>
                <SelectContent>
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
            <Label htmlFor="location" className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Location</span>
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Boston, MA"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Bio</span>
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us a bit about yourself, your interests, and what you're studying..."
              className="min-h-[100px] resize-none"
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onPrevious} className="h-12 px-8">
            Previous
          </Button>
          <Button onClick={onNext} disabled={!isFormValid} className="h-12 px-8">
            Continue
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
};
