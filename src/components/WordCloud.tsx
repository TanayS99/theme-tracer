
import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { PostData } from './PostCard';

interface WordCloudProps {
  data: PostData[];
  className?: string;
}

interface WordFrequency {
  text: string;
  value: number;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export const WordCloud: React.FC<WordCloudProps> = ({ data, className }) => {
  // This is a simplified version - in a real implementation we would use more advanced NLP
  const wordFrequencies = useMemo(() => {
    // Skip if no data
    if (data.length === 0) return [];
    
    // Common words to filter out
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'to', 'from', 'in',
      'out', 'on', 'off', 'over', 'under', 'of', 'for', 'with', 'by', 'at',
      'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them'
    ]);
    
    // Collect all words from titles and content
    const words: Record<string, { count: number, sentiments: Record<string, number> }> = {};
    
    data.forEach(post => {
      const text = `${post.title} ${post.content}`.toLowerCase();
      const matches = text.match(/\b\w{3,15}\b/g) || [];
      
      matches.forEach(word => {
        if (!stopWords.has(word)) {
          if (!words[word]) {
            words[word] = { count: 0, sentiments: { positive: 0, neutral: 0, negative: 0 } };
          }
          words[word].count += 1;
          words[word].sentiments[post.sentiment] += 1;
        }
      });
    });
    
    // Convert to array and sort by frequency
    return Object.entries(words)
      .map(([text, data]) => ({
        text,
        value: data.count,
        // Determine dominant sentiment
        sentiment: (Object.entries(data.sentiments).sort((a, b) => b[1] - a[1])[0][0]) as 'positive' | 'neutral' | 'negative'
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 30); // Take top 30 words
  }, [data]);
  
  const getWordSize = (frequency: number) => {
    const max = wordFrequencies.length > 0 ? wordFrequencies[0].value : 1;
    const min = 0.7; // Minimum size factor
    const factor = min + ((1 - min) * (frequency / max));
    return {
      fontSize: `${0.7 + factor}rem`,
      opacity: 0.3 + 0.7 * factor
    };
  };
  
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-sentiment-positive';
      case 'negative': return 'text-sentiment-negative';
      default: return 'text-sentiment-neutral';
    }
  };
  
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
      <h3 className="text-base font-medium mb-4">Popular Topics & Themes</h3>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 p-2 min-h-[200px]">
        {wordFrequencies.map((word, index) => (
          <span 
            key={index}
            className={cn(
              "inline-block transition-all duration-300 hover:opacity-100 animate-float",
              getSentimentColor(word.sentiment)
            )}
            style={{
              ...getWordSize(word.value),
              animationDelay: `${index * 0.05}s`
            }}
          >
            {word.text}
          </span>
        ))}
      </div>
    </div>
  );
};
