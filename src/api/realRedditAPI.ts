
import { PostData } from '@/components/PostCard';
import { analyzeSentiment } from '@/utils/sentimentAnalysis';

// Reddit API base URLs
const OAUTH_URL = 'https://oauth.reddit.com';
const API_URL = 'https://www.reddit.com';

// Client credentials (these are public keys meant for the frontend)
const CLIENT_ID = 'sFsWQcjiT10AT8fnJfLQ';
const REDIRECT_URI = window.location.origin;
const USER_AGENT = 'ThemeTracer/1.0 (by ApprehensiveWin4012)';

// Default results per page
export const DEFAULT_LIMIT = 10;

/**
 * Fetch posts from Reddit (real API implementation)
 */
export async function fetchRealRedditPosts(
  query: string, 
  isSubreddit: boolean, 
  limit: number = DEFAULT_LIMIT,
  after?: string
): Promise<{ posts: PostData[], after?: string }> {
  try {
    console.log(`Fetching real Reddit ${isSubreddit ? 'subreddit' : 'search'}: ${query}, limit: ${limit}, after: ${after || 'none'}`);
    
    // Construct the appropriate URL based on whether we're searching or browsing a subreddit
    let url: string;
    if (isSubreddit) {
      // Remove r/ prefix if present
      const subredditName = query.replace(/^r\//, '');
      url = `${API_URL}/r/${subredditName}/hot.json?limit=${limit}${after ? `&after=${after}` : ''}`;
    } else {
      url = `${API_URL}/search.json?q=${encodeURIComponent(query)}&limit=${limit}${after ? `&after=${after}` : ''}`;
    }
    
    // Make the request
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      }
    });
    
    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process the response into our PostData format
    const posts: PostData[] = await Promise.all(
      data.data.children.map(async (child: any) => {
        const post = child.data;
        
        // Use our sentiment analysis function on the title and selftext
        const textToAnalyze = post.title + ' ' + (post.selftext || '');
        const sentiment = await analyzeSentiment(textToAnalyze);
        
        return {
          id: post.id,
          title: post.title,
          content: post.selftext || '[No content]',
          subreddit: post.subreddit,
          author: post.author,
          upvotes: post.ups,
          commentCount: post.num_comments,
          sentiment,
          created: new Date(post.created_utc * 1000).toISOString(),
          url: `https://reddit.com${post.permalink}`
        };
      })
    );
    
    // Return the posts and the "after" token for pagination
    return {
      posts,
      after: data.data.after
    };
  } catch (error) {
    console.error('Error fetching from Reddit API:', error);
    throw error;
  }
}

/**
 * Toggle between mock and real API implementation
 */
let useRealAPI = true; // Changed default from false to true

/**
 * Set whether to use the real Reddit API
 */
export function setUseRealAPI(value: boolean): void {
  useRealAPI = value;
}

/**
 * Get whether the real Reddit API is being used
 */
export function getUseRealAPI(): boolean {
  return useRealAPI;
}
