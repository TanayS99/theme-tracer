
import React from 'react';
import { Card } from './ui/card';
import { Lightbulb } from 'lucide-react';
import { PostData } from './PostCard';
import { generateInsights } from '@/utils/aiInsights';

interface AIInsightsProps {
  data: PostData[];
  idea?: string;
  className?: string;
  isLoading?: boolean;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ 
  data, 
  idea, 
  className,
  isLoading = false
}) => {
  const insights = generateInsights(data, idea);

  if (isLoading) {
    return (
      <Card className={`p-5 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h3 className="text-base font-medium">AI Insights</h3>
        </div>
        <div className="text-sm text-muted-foreground space-y-3">
          <p className="animate-pulse">Analyzing your idea...</p>
        </div>
      </Card>
    );
  }

  if (!data.length && !idea) {
    return null;
  }

  // Handle the markdown-like format
  const formatInsights = (text: string) => {
    // Split by line breaks to process each line
    const lines = text.split('\n');
    let formattedContent: JSX.Element[] = [];
    let currentSection: JSX.Element[] = [];
    
    lines.forEach((line, index) => {
      // Handle headers
      if (line.startsWith('## ')) {
        // If we have accumulated content, add it to the formatted content
        if (currentSection.length > 0) {
          formattedContent.push(
            <div key={`section-${index}`} className="mb-4">
              {currentSection}
            </div>
          );
          currentSection = [];
        }
        
        formattedContent.push(
          <h4 key={`header-${index}`} className="text-sm font-semibold text-foreground mt-4 mb-2">
            {line.substring(3)}
          </h4>
        );
      } 
      // Handle bold text
      else if (line.includes('**')) {
        const parts = line.split('**');
        const elements: JSX.Element[] = [];
        
        parts.forEach((part, partIndex) => {
          if (partIndex % 2 === 0) {
            // Not bold
            if (part) elements.push(<span key={`text-${index}-${partIndex}`}>{part}</span>);
          } else {
            // Bold
            elements.push(<span key={`bold-${index}-${partIndex}`} className="font-semibold">{part}</span>);
          }
        });
        
        currentSection.push(
          <p key={`line-${index}`} className="mb-1">
            {elements}
          </p>
        );
      }
      // Handle bullet points
      else if (line.startsWith('- ')) {
        currentSection.push(
          <li key={`bullet-${index}`} className="ml-4 list-disc">
            {line.substring(2)}
          </li>
        );
      }
      // Handle empty lines as paragraph breaks
      else if (line.trim() === '') {
        if (currentSection.length > 0 && currentSection[currentSection.length - 1].type !== 'br') {
          currentSection.push(<br key={`br-${index}`} />);
        }
      }
      // Regular paragraph text
      else if (line.trim()) {
        currentSection.push(
          <p key={`para-${index}`} className="mb-1">
            {line}
          </p>
        );
      }
    });
    
    // Add any remaining content
    if (currentSection.length > 0) {
      formattedContent.push(
        <div key="final-section" className="mb-2">
          {currentSection}
        </div>
      );
    }
    
    return formattedContent;
  };

  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="text-base font-medium">AI Insights</h3>
      </div>
      
      <div className="text-sm text-muted-foreground">
        {formatInsights(insights)}
      </div>
    </Card>
  );
};
