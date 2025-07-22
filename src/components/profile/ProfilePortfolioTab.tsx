
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProfilePortfolioTabProps {
  portfolio: string[];
}

export const ProfilePortfolioTab = ({ portfolio }: ProfilePortfolioTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio & Links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {portfolio.map((link, index) => (
            <div key={index} className="p-4 border rounded-lg hover:bg-muted/50">
                              <a href={link} target="_blank" rel="noopener noreferrer" className="text-white hover:underline">
                {link}
              </a>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
