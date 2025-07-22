
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, DollarSign, Repeat, Users } from 'lucide-react';

const data = [
  { name: 'Jan', earnings: 1200, projects: 2 },
  { name: 'Feb', earnings: 2100, projects: 3 },
  { name: 'Mar', earnings: 800, projects: 1 },
  { name: 'Apr', earnings: 1600, projects: 4 },
  { name: 'May', earnings: 1900, projects: 2 },
  { name: 'Jun', earnings: 2500, projects: 3 },
];

const StatCard = ({ title, value, icon: Icon, description }: { title: string, value: string | number, icon: React.ElementType, description: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export const DashboardTab = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Earnings" value="$12,450" icon={DollarSign} description="+20.1% from last month" />
        <StatCard title="Projects Completed" value="23" icon={Briefcase} description="+180.1% from last month" />
        <StatCard title="Repeat Clients" value="12" icon={Repeat} description="+19% from last month" />
        <StatCard title="New Connections" value="57" icon={Users} description="+2 from last month" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="projects" fill="#8884d8" name="Projects" />
              <Bar dataKey="earnings" fill="#82ca9d" name="Earnings ($)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
