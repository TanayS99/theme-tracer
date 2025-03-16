
import { PostData } from '@/components/PostCard';
import { analyzeSentiment } from '@/utils/sentimentAnalysis';

// Reddit API base URLs
const OAUTH_URL = 'https://oauth.reddit.com';
const API_URL = 'https://www.reddit.com';

// Client credentials (these are public keys meant for the frontend)
const CLIENT_ID = 'sFsWQcjiT10AT8fnJfLQ';
const REDIRECT_URI = window.location.origin;
const USER_AGENT = 'ThemeTracer/1.0 (by ApprehensiveWin4012)';

// For frontend-only apps, we use the "implicit grant flow" which doesn't require the client secret
// We only include user agent in requests

/**
 * Fetch posts from Reddit (real API implementation)
 */
export async function fetchRealRedditPosts(query: string, isSubreddit: boolean): Promise<PostData[]> {
  try {
    console.log(`Fetching real Reddit ${isSubreddit ? 'subreddit' : 'search'}: ${query}`);
    
    // Construct the appropriate URL based on whether we're searching or browsing a subreddit
    let url: string;
    if (isSubreddit) {
      // Remove r/ prefix if present
      const subredditName = query.replace(/^r\//, '');
      url = `${API_URL}/r/${subredditName}/hot.json?limit=10`;
    } else {
      url = `${API_URL}/search.json?q=${encodeURIComponent(query)}&limit=10`;
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
    
    return posts;
  } catch (error) {
    console.error('Error fetching from Reddit API:', error);
    throw error;
  }
}

/**
 * Toggle between mock and real API implementation
 */
let useRealAPI = false;

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
