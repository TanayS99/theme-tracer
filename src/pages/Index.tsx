
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { ResultsPanel } from '@/components/ResultsPanel';
import { SentimentChart } from '@/components/SentimentChart';
import { WordCloud } from '@/components/WordCloud';
import { PostData } from '@/components/PostCard';
import { fetchRedditPosts } from '@/api/redditAPI';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PostData[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const { toast } = useToast();
  
  const handleSearch = async (searchTerm: string, isSubreddit: boolean) => {
    try {
      console.log("Index: Search triggered", { searchTerm, isSubreddit });
      setLoading(true);
      setSearchPerformed(true);
      
      // Fetch data
      const posts = await fetchRedditPosts(searchTerm, isSubreddit);
      setResults(posts);
      
      // Show success toast
      toast({
        title: "Search completed",
        description: `Found ${posts.length} posts about "${searchTerm}"`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: "Something went wrong with your search. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header (visible on mobile only) */}
      <Header className="md:hidden" onSearch={handleSearch} />
      
      <div className="pt-24 md:pt-0 min-h-screen flex flex-col md:flex-row">
        {/* Left sidebar with search (hidden on mobile) */}
        <div className="hidden md:flex md:w-72 lg:w-80 shrink-0 h-screen p-6 flex-col border-r border-border animate-fade-in">
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 mr-3 flex items-center justify-center shadow-md">
              <span className="text-white font-semibold">RT</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              <span className="font-light text-muted-foreground">theme</span>
              <span>tracer</span>
            </h1>
          </div>
          
          <div className="mb-8">
            <h2 className="text-sm font-medium mb-3">Search</h2>
            <SearchBar onSearch={handleSearch} />
          </div>
          
          <div className="grow">
            {results.length > 0 && (
              <div className="space-y-4 animate-fade-in">
                <SentimentChart data={results} />
                <WordCloud data={results} />
              </div>
            )}
          </div>
          
          <div className="mt-auto pt-4 text-xs text-muted-foreground border-t border-border">
            <p>© {new Date().getFullYear()} ThemeTracer</p>
            <p>Data sourced from Reddit API</p>
          </div>
        </div>
        
        {/* Main content */}
        <div className="w-full min-h-screen p-6 pb-20 md:p-8 lg:p-10">
          {!searchPerformed && !loading ? (
            <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[80vh] text-center animate-fade-in">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 mb-6 flex items-center justify-center shadow-medium">
                <span className="text-white text-2xl font-semibold">RT</span>
              </div>
              <h1 className="text-4xl font-semibold tracking-tight mb-3">
                <span className="font-light text-muted-foreground">theme</span>
                <span>tracer</span>
              </h1>
              <p className="text-muted-foreground mb-8 max-w-md">
                Analyze sentiment and extract themes from Reddit discussions. Enter a keyword, topic, or subreddit name to get started.
              </p>
              
              <div className="w-full max-w-md">
                <SearchBar onSearch={handleSearch} />
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              {/* Mobile-only charts */}
              {results.length > 0 && (
                <div className="md:hidden mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SentimentChart data={results} />
                  <WordCloud data={results} />
                </div>
              )}
              
              <ResultsPanel
                loading={loading}
                results={results}
                className="mb-10"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
