
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['job', 'service']),
  category: z.string().optional(),
  location: z.string().optional(),
  location_type: z.enum(['remote', 'on-site', 'hybrid']),
  budget_min: z.number().min(0).optional(),
  budget_max: z.number().min(0).optional(),
  budget_type: z.enum(['fixed', 'hourly']),
  experience_level: z.enum(['beginner', 'intermediate', 'expert']),
  deadline: z.string().optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

interface PostJobFormProps {
  type: 'job' | 'service';
  onSuccess?: () => void;
}

export const PostJobForm = ({ type, onSuccess }: PostJobFormProps) => {
  const { user } = useAuth();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      type,
      location_type: 'remote',
      budget_type: 'fixed',
      experience_level: 'intermediate',
    },
  });

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const onSubmit = async (data: JobFormData) => {
    if (!user) {
      toast.error('You must be logged in to post');
      return;
    }

    setIsSubmitting(true);
    try {
      const jobData = {
        user_id: user.id,
        title: data.title,
        description: data.description,
        type: data.type,
        category: data.category || null,
        location: data.location || null,
        location_type: data.location_type,
        budget_min: data.budget_min || null,
        budget_max: data.budget_max || null,
        budget_type: data.budget_type,
        experience_level: data.experience_level,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
        skills,
        status: 'open' as const,
      };

      const { error } = await supabase
        .from('jobs')
        .insert([jobData]);

      if (error) throw error;

      toast.success(`${type === 'job' ? 'Job' : 'Service'} posted successfully!`);
      form.reset();
      setSkills([]);
      onSuccess?.();
    } catch (error) {
      console.error('Error posting:', error);
      toast.error('Failed to post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          Post a {type === 'job' ? 'Job' : 'Service'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder={`Enter ${type} title`}
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder={`Describe your ${type} requirements`}
              rows={4}
              {...form.register('description')}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Location Type</Label>
              <Select onValueChange={(value) => form.setValue('location_type', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="on-site">On-site</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, Country"
                {...form.register('location')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Budget Type</Label>
              <Select onValueChange={(value) => form.setValue('budget_type', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Budget type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="budget_min">Min Budget ($)</Label>
              <Input
                id="budget_min"
                type="number"
                placeholder="0"
                {...form.register('budget_min', { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label htmlFor="budget_max">Max Budget ($)</Label>
              <Input
                id="budget_max"
                type="number"
                placeholder="0"
                {...form.register('budget_max', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Experience Level</Label>
              <Select onValueChange={(value) => form.setValue('experience_level', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="deadline">Deadline (optional)</Label>
              <Input
                id="deadline"
                type="date"
                {...form.register('deadline')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="e.g., Web Development, Design, Marketing"
              {...form.register('category')}
            />
          </div>

          <div>
            <Label>Skills Required</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add a skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : `Post ${type === 'job' ? 'Job' : 'Service'}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
