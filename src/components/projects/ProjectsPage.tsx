
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Calendar, Users, MoreHorizontal } from 'lucide-react';
import { KanbanBoard } from './KanbanBoard';
import { CreateProjectModal } from './CreateProjectModal';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  members: Array<{
    id: string;
    full_name: string;
    avatar_url: string;
    role: string;
  }>;
  tasks_count: number;
}

export const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    // Mock projects data
    const mockProjects: Project[] = [
      {
        id: '1',
        title: 'E-commerce Platform',
        description: 'Building a modern e-commerce platform with React and Node.js',
        status: 'active',
        created_at: '2024-01-15',
        members: [
          {
            id: '1',
            full_name: 'Sarah Chen',
            avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=64&h=64&fit=crop&crop=face',
            role: 'owner'
          },
          {
            id: '2',
            full_name: 'Alex Rodriguez',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
            role: 'member'
          }
        ],
        tasks_count: 12
      },
      {
        id: '2',
        title: 'Mobile App Design',
        description: 'UI/UX design for a fitness tracking mobile application',
        status: 'active',
        created_at: '2024-01-10',
        members: [
          {
            id: '3',
            full_name: 'Maya Patel',
            avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
            role: 'owner'
          }
        ],
        tasks_count: 8
      }
    ];
    setProjects(mockProjects);
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedProject) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => setSelectedProject(null)}
          >
            ← Back to Projects
          </Button>
          <h1 className="text-2xl font-bold">Project Dashboard</h1>
        </div>
        <KanbanBoard projectId={selectedProject} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card
            key={project.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedProject(project.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              <Badge
                variant={project.status === 'active' ? 'default' : 'secondary'}
                className="w-fit"
              >
                {project.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {project.description}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{project.members.length} members</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{project.tasks_count} tasks</span>
                </div>
              </div>

              <div className="flex -space-x-2">
                {project.members.slice(0, 3).map((member) => (
                  <Avatar key={member.id} className="w-8 h-8 border-2 border-background">
                    <AvatarImage src={member.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {member.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {project.members.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs">+{project.members.length - 3}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProjectCreated={fetchProjects}
      />
    </div>
  );
};
