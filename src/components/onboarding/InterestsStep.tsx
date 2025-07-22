
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InterestsStepProps {
  data: {
    skills: string[];
    interests: string[];
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const InterestsStep = ({ data, onUpdate, onNext, onPrevious }: InterestsStepProps) => {
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  const suggestedSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++', 'SQL', 'HTML/CSS',
    'Data Analysis', 'Machine Learning', 'Design', 'Marketing', 'Writing', 'Research'
  ];

  const suggestedInterests = [
    'Technology', 'Sports', 'Music', 'Art', 'Photography', 'Travel', 'Gaming',
    'Reading', 'Fitness', 'Cooking', 'Movies', 'Entrepreneurship', 'Volunteering'
  ];

  const addSkill = (skill: string) => {
    if (skill && !data.skills.includes(skill)) {
      const newSkills = [...data.skills, skill];
      onUpdate({ skills: newSkills });
    }
    setSkillInput('');
  };

  const addInterest = (interest: string) => {
    if (interest && !data.interests.includes(interest)) {
      const newInterests = [...data.interests, interest];
      onUpdate({ interests: newInterests });
    }
    setInterestInput('');
  };

  const removeSkill = (skill: string) => {
    const newSkills = data.skills.filter(s => s !== skill);
    onUpdate({ skills: newSkills });
  };

  const removeInterest = (interest: string) => {
    const newInterests = data.interests.filter(i => i !== interest);
    onUpdate({ interests: newInterests });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What are your skills and interests?
        </h2>
        <p className="text-gray-600">
          This helps us connect you with relevant opportunities and like-minded peers
        </p>
      </div>

      {/* Skills Section */}
      <div className="space-y-4">
        <div>
          <Label>Skills</Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Add a skill..."
              onKeyPress={(e) => e.key === 'Enter' && addSkill(skillInput)}
            />
            <Button onClick={() => addSkill(skillInput)} disabled={!skillInput}>
              Add
            </Button>
          </div>
        </div>

        {/* Selected Skills */}
        {data.skills.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-2">Your skills:</p>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                  {skill} ×
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Skills */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Suggested skills:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedSkills.filter(skill => !data.skills.includes(skill)).map((skill, index) => (
              <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => addSkill(skill)}>
                + {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Interests Section */}
      <div className="space-y-4">
        <div>
          <Label>Interests</Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              placeholder="Add an interest..."
              onKeyPress={(e) => e.key === 'Enter' && addInterest(interestInput)}
            />
            <Button onClick={() => addInterest(interestInput)} disabled={!interestInput}>
              Add
            </Button>
          </div>
        </div>

        {/* Selected Interests */}
        {data.interests.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-2">Your interests:</p>
            <div className="flex flex-wrap gap-2">
              {data.interests.map((interest, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer text-xs px-2 py-0.5 md:text-base md:px-3 md:py-1" onClick={() => removeInterest(interest)}>
                  {interest} ×
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Interests */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Suggested interests:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedInterests.filter(interest => !data.interests.includes(interest)).map((interest, index) => (
              <Badge key={index} variant="outline" className="cursor-pointer text-xs px-2 py-0.5 md:text-base md:px-3 md:py-1" onClick={() => addInterest(interest)}>
                + {interest}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
};
