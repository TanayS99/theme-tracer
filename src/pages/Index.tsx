
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { ResultsPanel } from '@/components/ResultsPanel';
import { SentimentChart } from '@/components/SentimentChart';
import { WordCloud } from '@/components/WordCloud';
import { AIInsights } from '@/components/AIInsights';
import { PostData } from '@/components/PostCard';
import { fetchRedditPosts } from '@/api/redditAPI';
import { useToast } from '@/hooks/use-toast';
import { getUseRealAPI } from '@/api/realRedditAPI';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [results, setResults] = useState<PostData[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isUsingRealAPI, setIsUsingRealAPI] = useState(getUseRealAPI());
  const [currentSearch, setCurrentSearch] = useState({ term: '', isSubreddit: false });
  const [paginationToken, setPaginationToken] = useState<string | undefined>(undefined);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [totalPostCount, setTotalPostCount] = useState(0);
  const [userIdea, setUserIdea] = useState('');
  const { toast } = useToast();
  
  useEffect(() => {
    const checkAPIMode = () => {
      const currentAPIMode = getUseRealAPI();
      setIsUsingRealAPI(currentAPIMode);
    };
    
    checkAPIMode();
    const intervalId = setInterval(checkAPIMode, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleSearch = async (searchTerm: string, isSubreddit: boolean) => {
    try {
      console.log("Index: Search triggered", { searchTerm, isSubreddit, usingRealAPI: isUsingRealAPI });
      setLoading(true);
      setSearchPerformed(true);
      setCurrentSearch({ term: searchTerm, isSubreddit });
      setPaginationToken(undefined);
      
      const response = await fetchRedditPosts(searchTerm, isSubreddit);
      setResults(response.posts);
      setPaginationToken(response.after);
      setHasMorePages(!!response.after);
      
      setTotalPostCount(response.totalPostCount || response.posts.length);
      
      toast({
        title: "Search completed",
        description: `Found ${response.totalPostCount || response.posts.length} posts about "${searchTerm}"`,
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
      setHasMorePages(false);
      setTotalPostCount(0);
    } finally {
      setLoading(false);
    }
  };
  
  const handleIdeaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userIdea.trim()) return;
    
    // Start searching with the user's idea
    handleSearch(userIdea, false);
  };
  
  const handleLoadMore = async () => {
    if (!paginationToken || !currentSearch.term) return;
    
    try {
      setLoadingMore(true);
      console.log("Loading more posts", { 
        searchTerm: currentSearch.term, 
        isSubreddit: currentSearch.isSubreddit, 
        after: paginationToken 
      });
      
      const response = await fetchRedditPosts(
        currentSearch.term, 
        currentSearch.isSubreddit,
        10,
        paginationToken
      );
      
      setResults(prevResults => [...prevResults, ...response.posts]);
      setPaginationToken(response.after);
      setHasMorePages(!!response.after);
      
      if (response.totalPostCount && response.totalPostCount !== totalPostCount) {
        setTotalPostCount(response.totalPostCount);
      }
      
      toast({
        title: "More posts loaded",
        description: `Loaded ${response.posts.length} more posts`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error loading more posts:', error);
      toast({
        title: "Error",
        description: "Couldn't load more posts. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoadingMore(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header className="md:hidden" onSearch={handleSearch} />
      
      <div className="pt-24 md:pt-0 min-h-screen flex flex-col md:flex-row">
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
          
          <div className="grow overflow-auto">
            {(results.length > 0 || (loading && userIdea)) && (
              <div className="space-y-4 animate-fade-in">
                <SentimentChart data={results} />
                <WordCloud data={results} />
                <AIInsights 
                  data={results} 
                  idea={userIdea}
                  isLoading={loading && results.length === 0} 
                />
              </div>
            )}
          </div>
          
          <div className="mt-auto pt-4 text-xs text-muted-foreground border-t border-border">
            <p>© {new Date().getFullYear()} ThemeTracer</p>
            <p>Data sourced from {isUsingRealAPI ? 'Reddit API' : 'mock data'}</p>
          </div>
        </div>
        
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
                Share your idea or business concept, and I'll analyze Reddit to find relevant communities, 
                sentiment, and trending discussions.
              </p>
              
              <form onSubmit={handleIdeaSubmit} className="w-full max-w-md space-y-4">
                <Textarea
                  placeholder="Describe your idea, product, or niche..."
                  value={userIdea}
                  onChange={(e) => setUserIdea(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                <Button 
                  type="submit" 
                  className="w-full flex items-center justify-center gap-2"
                  disabled={!userIdea.trim()}
                >
                  <Search className="h-4 w-4" />
                  <span>Analyze My Idea</span>
                </Button>
              </form>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              {results.length > 0 && (
                <div className="md:hidden mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SentimentChart data={results} />
                  <WordCloud data={results} />
                  <AIInsights 
                    data={results} 
                    idea={userIdea}
                    className="sm:col-span-2" 
                    isLoading={loading && results.length === 0}
                  />
                </div>
              )}
              
              <ResultsPanel
                loading={loading}
                results={results}
                totalPosts={totalPostCount}
                className="mb-6"
              />
              
              {results.length > 0 && !loading && (
                <div className="flex justify-center mt-6 mb-10">
                  <Pagination>
                    <PaginationContent>
                      {hasMorePages && (
                        <PaginationItem>
                          <Button 
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className={`gap-1 pr-2.5 ${loadingMore ? "opacity-50" : ""}`}
                          >
                            <span>Next</span>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                  {loadingMore && (
                    <div className="text-center text-sm text-muted-foreground mt-2">
                      Loading more posts...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
