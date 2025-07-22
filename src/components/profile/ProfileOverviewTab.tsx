import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, School, Users, Briefcase, Award, Plus, X, Save } from 'lucide-react';
import { InterestsSelector } from '@/components/communities/InterestsSelector';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProfileUpdater } from '@/hooks/useProfileUpdater';

interface ProfileOverviewTabProps {
  profile: any;
  isOwnProfile: boolean;
}

export const ProfileOverviewTab = ({ profile, isOwnProfile }: ProfileOverviewTabProps) => {
  if (!profile) return null;
  const { user } = useAuth();
  const { updateProfile, saveImmediately } = useProfileUpdater();
  const [userInterests, setUserInterests] = useState<string[]>(profile?.interests || []);
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [portfolio, setPortfolio] = useState<string[]>(profile?.portfolio || []);
  const [newSkill, setNewSkill] = useState('');
  const [newPortfolioLink, setNewPortfolioLink] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editableFields, setEditableFields] = useState({
    bio: profile?.bio || '',
    location: profile?.location || '',
    university: profile?.college_name || '',
    major: profile?.major || '',
  });
  const [canEditInterests, setCanEditInterests] = useState(true);
  const [lastInterestsUpdate, setLastInterestsUpdate] = useState<Date | null>(null);

  const majorLocked = Boolean(profile?.major);

  useEffect(() => {
    setUserInterests(profile?.interests || []);
    setSkills(profile?.skills || []);
    setPortfolio(profile?.portfolio || []);
    setEditableFields({
      bio: profile?.bio || '',
      location: profile?.location || '',
      university: profile?.college_name || '',
      major: profile?.major || '',
    });
    setHasUnsavedChanges(false);
  }, [profile]);

  useEffect(() => {
    if (profile?.last_interests_update) {
      const lastUpdate = new Date(profile.last_interests_update);
      setLastInterestsUpdate(lastUpdate);
      setCanEditInterests((Date.now() - lastUpdate.getTime()) > 14 * 24 * 60 * 60 * 1000);
    } else {
      setCanEditInterests(true);
      setLastInterestsUpdate(null);
    }
  }, [profile?.last_interests_update]);

  const saveAllChanges = async () => {
    if (!user?.id) return;

    try {
      const updateData = {
        bio: editableFields.bio,
        location: editableFields.location,
        college_name: editableFields.university,
        major: editableFields.major,
        interests: userInterests,
        skills: skills,
        portfolio: portfolio
      };

      await saveImmediately(updateData);
      toast.success('Profile saved successfully!');
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile changes');
    }
  };

  const handleInterestsUpdate = (newInterests: string[]) => {
    setUserInterests(newInterests);
    setHasUnsavedChanges(true);
    // Auto-save interests with debounce
    updateProfile({ interests: newInterests });
  };

  const handleFieldChange = (field: string, value: string) => {
    setEditableFields(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    
    // Auto-save field changes with debounce
    const updateData: any = {};
    if (field === 'bio') updateData.bio = value;
    if (field === 'location') updateData.location = value;
    if (field === 'university') updateData.college_name = value;
    if (field === 'major') updateData.major = value;
    
    updateProfile(updateData);
  };

  const addSkill = () => {
    if (!newSkill.trim() || skills.includes(newSkill)) return;
    const updatedSkills = [...skills, newSkill.trim()];
    setSkills(updatedSkills);
    setNewSkill('');
    setHasUnsavedChanges(true);
    updateProfile({ skills: updatedSkills });
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(updatedSkills);
    setHasUnsavedChanges(true);
    updateProfile({ skills: updatedSkills });
  };

  const addPortfolioLink = () => {
    if (!newPortfolioLink.trim() || portfolio.includes(newPortfolioLink)) return;
    const updatedPortfolio = [...portfolio, newPortfolioLink.trim()];
    setPortfolio(updatedPortfolio);
    setNewPortfolioLink('');
    setHasUnsavedChanges(true);
    updateProfile({ portfolio: updatedPortfolio });
  };

  const removePortfolioLink = (linkToRemove: string) => {
    const updatedPortfolio = portfolio.filter(link => link !== linkToRemove);
    setPortfolio(updatedPortfolio);
    setHasUnsavedChanges(true);
    updateProfile({ portfolio: updatedPortfolio });
  };

  return (
    <div className="space-y-6">
      {/* Save Button */}
      {isOwnProfile && hasUnsavedChanges && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-black dark:text-white">You have unsaved changes</p>
              <Button onClick={saveAllChanges} className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Basic Info */}
      <Card className="bg-[#000000] border-0 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>About</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Always show bio as plain text, even for own profile */}
          {profile?.bio && <p className="text-muted-foreground whitespace-pre-line">{profile.bio}</p>}
          {/* Remove textarea and editing logic for bio here */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isOwnProfile ? (
              <>
                <div className="flex items-center space-x-2">
                  <School className="w-4 h-4 text-muted-foreground" />
                  <Input
                    value={editableFields.university}
                    onChange={(e) => handleFieldChange('university', e.target.value)}
                    placeholder="University"
                    className="flex-1 profile-input"
                    disabled={!!editableFields.university}
                  />
                </div>
                {editableFields.university && (
                  <div className="text-xs text-red-400 mb-1 ml-8">Your college is locked and cannot be changed.</div>
                )}
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <Input
                    value={editableFields.major}
                    onChange={(e) => handleFieldChange('major', e.target.value)}
                    placeholder="Major"
                    className="flex-1 profile-input"
                    disabled={majorLocked}
                  />
                </div>
                {majorLocked && (
                  <div className="text-xs text-red-400 mb-1 ml-8">Your major is locked and cannot be changed.</div>
                )}
              </>
            ) : (
              <>
                {editableFields.university && (
                  <div className="flex items-center space-x-2">
                    <School className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{editableFields.university}</span>
                  </div>
                )}
                {editableFields.major && (
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{editableFields.major}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interests Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Interests</CardTitle>
        </CardHeader>
        <CardContent>
          {isOwnProfile ? (
            <>
              <InterestsSelector
                selectedInterests={userInterests}
                onInterestsChange={canEditInterests ? handleInterestsUpdate : () => {}}
                minInterests={3}
                maxInterests={7}
              />
              {!canEditInterests && (
                <div className="text-red-500 mt-2">You can only change your interests once every 14 days.</div>
              )}
            </>
          ) : (
            <div className="flex flex-wrap gap-2">
              {userInterests?.length > 0 ? (
                userInterests.map((interest: string) => (
                  <Badge key={interest} className="bg-blue-600/80 text-white border-none shadow-md px-2 py-0.5 text-xs md:px-3 md:py-1 md:text-base font-semibold">
                    {interest}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No interests selected</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5" />
            <span>Skills</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="outline" className="flex items-center space-x-1">
                  <span>{skill}</span>
                  {isOwnProfile && (
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeSkill(skill)}
                    />
                  )}
                </Badge>
              ))}
              {skills.length === 0 && (
                <p className="text-muted-foreground text-sm">No skills listed</p>
              )}
            </div>
            
            {isOwnProfile && (
              <div className="flex space-x-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  className="profile-input"
                />
                <Button onClick={addSkill} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Portfolio */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Portfolio Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="space-y-2">
              {portfolio.map((link) => (
                <div key={link} className="flex items-center justify-between p-2 rounded profile-input">
                  <a 
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:underline truncate flex-1"
                  >
                    {link}
                  </a>
                  {isOwnProfile && (
                    <X 
                      className="w-4 h-4 cursor-pointer hover:text-red-500 ml-2" 
                      onClick={() => removePortfolioLink(link)}
                    />
                  )}
                </div>
              ))}
              {portfolio.length === 0 && (
                <p className="text-muted-foreground text-sm">No portfolio links added</p>
              )}
            </div>
            
            {isOwnProfile && (
              <div className="flex space-x-2">
                <Input
                  value={newPortfolioLink}
                  onChange={(e) => setNewPortfolioLink(e.target.value)}
                  placeholder="Add a portfolio link"
                  onKeyPress={(e) => e.key === 'Enter' && addPortfolioLink()}
                  className="profile-input"
                />
                <Button onClick={addPortfolioLink} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
