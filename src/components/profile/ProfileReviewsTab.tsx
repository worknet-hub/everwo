
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

export const ProfileReviewsTab = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((review) => (
        <Card key={review}>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={`https://images.unsplash.com/photo-150${review}003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face`} />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold">John Doe</h4>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Excellent work! Sarah delivered exactly what we needed and was very professional throughout the project.
                </p>
                <p className="text-xs text-muted-foreground mt-2">2 weeks ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
