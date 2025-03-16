
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { PostData } from './PostCard';

interface SentimentChartProps {
  data: PostData[];
  className?: string;
}

export const SentimentChart: React.FC<SentimentChartProps> = ({ data, className }) => {
  const sentimentCounts = useMemo(() => {
    const counts = {
      positive: 0,
      neutral: 0,
      negative: 0
    };
    
    data.forEach(post => {
      counts[post.sentiment]++;
    });
    
    return [
      { name: 'Positive', value: counts.positive, color: 'hsl(var(--sentiment-positive))' },
      { name: 'Neutral', value: counts.neutral, color: 'hsl(var(--sentiment-neutral))' },
      { name: 'Negative', value: counts.negative, color: 'hsl(var(--sentiment-negative))' }
    ].filter(item => item.value > 0);
  }, [data]);
  
  // If no data, show empty state
  if (data.length === 0) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center p-6 rounded-xl glass-card shadow-soft min-h-[200px]",
        className
      )}>
        <p className="text-muted-foreground text-sm">No data available</p>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "p-5 rounded-xl glass-card shadow-soft",
      className
    )}>
      <h3 className="text-base font-medium mb-4">Sentiment Distribution</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sentimentCounts}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              animationDuration={800}
              animationBegin={200}
            >
              {sentimentCounts.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background p-2 border border-border rounded-md shadow-md text-sm">
                      <p>{`${payload[0].name}: ${payload[0].value} (${Math.round((payload[0].value / data.length) * 100)}%)`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-center items-center gap-6 mt-2">
        {sentimentCounts.map((entry, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-muted-foreground">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
