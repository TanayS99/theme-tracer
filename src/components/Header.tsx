
import React from 'react';
import { SearchBar } from './SearchBar';
import { cn } from '@/lib/utils';
import { SettingsDialog } from './SettingsDialog';

interface HeaderProps {
  className?: string;
  onSearch?: (searchTerm: string, isSubreddit: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ className, onSearch }) => {
  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300",
      className
    )}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center animate-fade-in">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 mr-3 flex items-center justify-center shadow-md">
            <span className="text-white font-semibold text-sm">RT</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            <span className="font-light text-muted-foreground">theme</span>
            <span>tracer</span>
          </h1>
        </div>
        
        <div className="w-full md:w-auto md:max-w-lg lg:max-w-xl xl:max-w-2xl animate-slide-down flex-grow">
          <SearchBar onSearch={onSearch} />
        </div>
        
        <div className="ml-2 flex items-center">
          <SettingsDialog />
        </div>
      </div>
    </header>
  );
};
