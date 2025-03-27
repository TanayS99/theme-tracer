
import React from 'react';
import { Card } from './ui/card';
import { Lightbulb } from 'lucide-react';
import { PostData } from './PostCard';
import { generateInsights } from '@/utils/aiInsights';

interface AIInsightsProps {
  data: PostData[];
  className?: string;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ data, className }) => {
  const insights = generateInsights(data);

  if (!data.length) {
    return null;
  }

  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="text-base font-medium">AI Insights</h3>
      </div>
      
      <div className="text-sm text-muted-foreground space-y-3">
        {insights.split('\n\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </Card>
  );
};
