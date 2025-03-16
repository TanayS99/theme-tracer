
import React from "react";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { PostCard, PostData } from "./PostCard";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

interface ResultsPanelProps {
  loading: boolean;
  results: PostData[];
  className?: string;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  loading,
  results,
  className,
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">Results</h2>
        {results.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? 'post' : 'posts'} found
          </span>
        )}
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className="w-full h-48 rounded-xl bg-muted/50 animate-pulse-gentle"
            />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4 staggered-fade-in">
          {results.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
            <MessageSquare size={24} className="text-muted-foreground/50" />
          </div>
          <h3 className="text-base font-medium mb-1">No results found</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Try adjusting your search terms or searching for a different topic or subreddit.
          </p>
        </div>
      )}
    </div>
  );
};
