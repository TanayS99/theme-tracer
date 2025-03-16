
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
  onSearch?: (searchTerm: string, isSubreddit: boolean) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  className,
  onSearch = () => {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubreddit, setIsSubreddit] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm, isSubreddit);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <form 
      onSubmit={handleSearch}
      className={cn(
        "relative w-full group",
        className
      )}
    >
      <div className={cn(
        "flex items-center w-full h-12 px-4 rounded-xl bg-secondary transition-all duration-300 border",
        isFocused 
          ? "border-primary shadow-highlight" 
          : "border-transparent hover:border-border shadow-soft"
      )}>
        <Search 
          size={18} 
          className={cn(
            "text-muted-foreground transition-colors duration-300",
            isFocused && "text-primary"
          )} 
        />
        
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isSubreddit ? "Enter a subreddit..." : "Search for keywords or topics..."}
          className="flex-1 ml-3 bg-transparent outline-none text-sm placeholder:text-muted-foreground/70"
        />
        
        {searchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground focus-ring"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      <div className="absolute -bottom-8 left-0 flex items-center gap-2 text-xs">
        <label className="flex items-center gap-1.5 text-muted-foreground">
          <input
            type="checkbox"
            checked={isSubreddit}
            onChange={() => setIsSubreddit(!isSubreddit)}
            className="form-checkbox h-3 w-3 rounded border-muted-foreground/30 text-primary focus-ring"
          />
          Search by subreddit
        </label>
      </div>
    </form>
  );
};
