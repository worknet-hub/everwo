
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MessageSquare, User } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  due_date?: string;
  comments_count: number;
}

interface TaskCardProps {
  task: Task;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

export const TaskCard = ({ task }: TaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
            <Badge
              variant="secondary"
              className={`text-xs ${priorityColors[task.priority]}`}
            >
              {task.priority}
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {task.assignee && (
                <Avatar className="w-6 h-6">
                  <AvatarImage src={task.assignee.avatar_url} />
                  <AvatarFallback className="text-xs">
                    <User className="w-4 h-4 text-gray-300" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              {task.comments_count > 0 && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <MessageSquare className="w-3 h-3" />
                  <span>{task.comments_count}</span>
                </div>
              )}
            </div>
            
            {task.due_date && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{new Date(task.due_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
