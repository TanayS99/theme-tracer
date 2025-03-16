
import React, { useState } from 'react';
import { ArrowUp, ArrowDown, MessageSquare, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PostData {
  id: string;
  title: string;
  content: string;
  subreddit: string;
  author: string;
  upvotes: number;
  commentCount: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  created: string;
  url: string;
}

interface PostCardProps {
  post: PostData;
  className?: string;
}

export const PostCard: React.FC<PostCardProps> = ({ post, className }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Format the date string
  const formattedDate = new Date(post.created).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  return (
    <div 
      className={cn(
        "w-full rounded-xl p-5 glass-card hover-lift transition-all duration-300",
        expanded ? "shadow-medium" : "shadow-soft",
        className
      )}
    >
      {/* Header and title */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-xs font-medium text-primary">r/{post.subreddit}</span>
            <span className="text-2xs text-muted-foreground">• {formattedDate}</span>
            <span className={cn(
              "sentiment-tag",
              {
                "sentiment-positive": post.sentiment === "positive",
                "sentiment-neutral": post.sentiment === "neutral",
                "sentiment-negative": post.sentiment === "negative"
              }
            )}>
              {post.sentiment}
            </span>
          </div>
          <h3 className="text-base font-medium leading-snug">{post.title}</h3>
        </div>
        
        <a 
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-muted-foreground hover:text-foreground focus-ring rounded-lg transition-colors" 
          aria-label="Open original post"
        >
          <ExternalLink size={16} />
        </a>
      </div>
      
      {/* Content */}
      <div 
        className={cn(
          "relative text-sm text-muted-foreground overflow-hidden transition-all duration-300",
          expanded ? "max-h-[500px]" : "max-h-20"
        )}
      >
        <p>{post.content}</p>
        
        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent" />
        )}
      </div>
      
      {/* Expand button */}
      {post.content.length > 120 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs font-medium text-primary hover:text-primary/80 focus-ring"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
      
      {/* Footer metrics */}
      <div className="flex items-center mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center mr-4">
          <ArrowUp size={14} className="mr-1" />
          <span>{post.upvotes}</span>
        </div>
        <div className="flex items-center">
          <MessageSquare size={14} className="mr-1" />
          <span>{post.commentCount} comments</span>
        </div>
        <div className="ml-auto text-2xs">
          <span>by u/{post.author}</span>
        </div>
      </div>
    </div>
  );
};
