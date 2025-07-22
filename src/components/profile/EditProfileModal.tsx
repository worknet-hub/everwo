
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useProfileUpdater } from '@/hooks/useProfileUpdater';
import { AvatarUpload } from './AvatarUpload';

interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  bio: string;
  college_name: string;
  skills: string[];
  portfolio: string[];
  location: string;
  availability_status: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  onProfileUpdated: () => void;
}

export const EditProfileModal = ({ isOpen, onClose, profile, onProfileUpdated }: EditProfileModalProps) => {
  if (!profile) return null;
  const [formData, setFormData] = useState({
    full_name: profile.full_name,
    username: profile.username,
    bio: profile.bio,
    college_name: profile.college_name,
    location: profile.location,
    availability_status: profile.availability_status,
    skills: [...profile.skills],
    portfolio: [...profile.portfolio]
  });
  const [newSkill, setNewSkill] = useState('');
  const [newPortfolioLink, setNewPortfolioLink] = useState('');
  const [loading, setLoading] = useState(false);
  const { saveImmediately } = useProfileUpdater();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await saveImmediately({
        full_name: formData.full_name,
        username: formData.username,
        bio: formData.bio,
        college_name: formData.college_name,
        location: formData.location,
        availability_status: formData.availability_status,
        skills: formData.skills,
        portfolio: formData.portfolio
      });
      toast.success('Profile updated successfully!');
      onProfileUpdated();
      onClose();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addPortfolioLink = () => {
    if (newPortfolioLink.trim() && !formData.portfolio.includes(newPortfolioLink.trim())) {
      setFormData(prev => ({
        ...prev,
        portfolio: [...prev.portfolio, newPortfolioLink.trim()]
      }));
      setNewPortfolioLink('');
    }
  };

  const removePortfolioLink = (linkToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter(link => link !== linkToRemove)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="edit-profile-modal-description">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <DialogDescription id="edit-profile-modal-description">
          Update your profile information below.
        </DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex justify-center mb-4">
            <AvatarUpload
              currentAvatar={profile.avatar_url}
              userName={profile.full_name || profile.username}
              onAvatarChange={() => { window.location.reload(); }}
              size="lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                disabled
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
                className="focus:outline-none focus:ring-0 focus:border-transparent shadow-none"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="college_name">College</Label>
              <Input
                id="college_name"
                value={formData.college_name}
                disabled
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, State"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="availability_status">Availability</Label>
            <Select 
              value={formData.availability_status} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, availability_status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Skills */}
          <div>
            <Label>Skills</Label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center space-x-1">
                  <span>{skill}</span>
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeSkill(skill)} 
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Portfolio */}
          <div>
            <Label>Portfolio Links</Label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={newPortfolioLink}
                onChange={(e) => setNewPortfolioLink(e.target.value)}
                placeholder="Add portfolio link"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPortfolioLink())}
              />
              <Button type="button" onClick={addPortfolioLink}>Add</Button>
            </div>
            <div className="space-y-2">
              {formData.portfolio.map((link) => (
                <div key={link} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm truncate">{link}</span>
                  <X 
                    className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-foreground" 
                    onClick={() => removePortfolioLink(link)} 
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
