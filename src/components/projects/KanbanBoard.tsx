import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Calendar, MessageSquare } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { CreateTaskModal } from './CreateTaskModal';

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

interface KanbanBoardProps {
  projectId: string;
}

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-gray-700' },
  { id: 'review', title: 'Review', color: 'bg-yellow-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' },
];

export const KanbanBoard = ({ projectId }: KanbanBoardProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTaskColumn, setCreateTaskColumn] = useState<string>('todo');

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    // Mock tasks data
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Setup Authentication',
        description: 'Implement user authentication with Supabase',
        status: 'done',
        priority: 'high',
        assignee: {
          id: '1',
          full_name: 'Sarah Chen',
          avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=64&h=64&fit=crop&crop=face'
        },
        due_date: '2024-01-20',
        comments_count: 3
      },
      {
        id: '2',
        title: 'Design Database Schema',
        description: 'Create the database schema for the application',
        status: 'in_progress',
        priority: 'medium',
        assignee: {
          id: '2',
          full_name: 'Alex Rodriguez',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face'
        },
        due_date: '2024-01-25',
        comments_count: 1
      },
      {
        id: '3',
        title: 'Create Landing Page',
        description: 'Design and implement the landing page',
        status: 'todo',
        priority: 'medium',
        comments_count: 0
      },
      {
        id: '4',
        title: 'Setup CI/CD Pipeline',
        description: 'Configure continuous integration and deployment',
        status: 'review',
        priority: 'low',
        assignee: {
          id: '1',
          full_name: 'Sarah Chen',
          avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=64&h=64&fit=crop&crop=face'
        },
        comments_count: 2
      }
    ];
    setTasks(mockTasks);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTask = tasks.find(task => task.id === active.id);
    if (!activeTask) return;

    const newStatus = over.id as Task['status'];
    if (activeTask.status !== newStatus) {
      setTasks(prev => prev.map(task =>
        task.id === active.id ? { ...task, status: newStatus } : task
      ));
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const activeTask = tasks.find(task => task.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <h3 className="font-semibold">{column.title}</h3>
                <Badge variant="secondary">
                  {getTasksByStatus(column.id).length}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setCreateTaskColumn(column.id);
                  setShowCreateModal(true);
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <SortableContext
              items={getTasksByStatus(column.id).map(task => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3 min-h-[200px]">
                {getTasksByStatus(column.id).map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>

      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        projectId={projectId}
        initialStatus={createTaskColumn as Task['status']}
        onTaskCreated={fetchTasks}
      />
    </DndContext>
  );
};
