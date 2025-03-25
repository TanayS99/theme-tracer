import { PostData } from '@/components/PostCard';
import { fetchRealRedditPosts, getUseRealAPI, DEFAULT_LIMIT } from './realRedditAPI';

// Since we don't have a real backend, this simulates fetching data with random sentiments
export async function fetchRedditPosts(
  query: string, 
  isSubreddit: boolean,
  limit: number = DEFAULT_LIMIT,
  after?: string
): Promise<{ posts: PostData[], after?: string }> {
  // Check if we should use the real API
  if (getUseRealAPI()) {
    return fetchRealRedditPosts(query, isSubreddit, limit, after);
  }
  
  // Otherwise use mock implementation
  console.log(`Fetching mock ${isSubreddit ? 'subreddit' : 'search'}: ${query}, limit: ${limit}, after: ${after || 'none'}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate mock data based on the query
  const count = Math.floor(Math.random() * 8) + 3; // 3-10 posts
  const sentiments = ['positive', 'neutral', 'negative'] as const;
  const subreddits = ['technology', 'programming', 'design', 'apple', 'askreddit', query.toLowerCase()];
  
  const mockPosts: PostData[] = Array.from({ length: count }, (_, i) => {
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    const subreddit = isSubreddit ? query.replace(/^r\//, '') : subreddits[Math.floor(Math.random() * subreddits.length)];
    
    return {
      id: `post-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
      title: generateTitle(query, sentiment),
      content: generateContent(query, sentiment),
      subreddit,
      author: generateAuthor(),
      upvotes: Math.floor(Math.random() * 10000),
      commentCount: Math.floor(Math.random() * 500),
      sentiment,
      created: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      url: `https://reddit.com/r/${subreddit}/comments/${Math.random().toString(36).substring(2, 8)}`
    };
  });
  
  // Generate a fake "after" token for pagination
  const hasMore = Math.random() > 0.3; // 70% chance of having more pages
  const mockAfter = hasMore ? `t3_${Math.random().toString(36).substring(2, 10)}` : undefined;
  
  return { posts: mockPosts, after: mockAfter };
}

// Helper functions to generate mock content
function generateTitle(query: string, sentiment: string): string {
  const positiveAdjectives = ['Amazing', 'Incredible', 'Awesome', 'Great', 'Excellent'];
  const neutralAdjectives = ['Interesting', 'Noteworthy', 'Considerable', 'Standard', 'Average'];
  const negativeAdjectives = ['Terrible', 'Awful', 'Disappointing', 'Frustrating', 'Poor'];
  
  let adjectives: string[];
  switch (sentiment) {
    case 'positive': adjectives = positiveAdjectives; break;
    case 'negative': adjectives = negativeAdjectives; break;
    default: adjectives = neutralAdjectives;
  }
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const templates = [
    `${adjective} experiences with ${query}`,
    `What does everyone think about ${query}? It's ${adjective.toLowerCase()}!`,
    `${query} - ${adjective} new developments`,
    `${adjective} discussion about ${query}`,
    `${query} updates - ${adjective.toLowerCase()} news`,
    `Is ${query} really as ${adjective.toLowerCase()} as they say?`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateContent(query: string, sentiment: string): string {
  const positiveFragments = [
    `I've had a fantastic experience with ${query}.`,
    `${query} has improved so much recently.`,
    `The advancements in ${query} are truly impressive.`,
    `I'm really optimistic about where ${query} is headed.`,
    `${query} has exceeded my expectations in every way.`
  ];
  
  const neutralFragments = [
    `${query} has some pros and cons.`,
    `I've been following ${query} for a while now.`,
    `${query} seems to be developing at a steady pace.`,
    `There are mixed opinions about ${query} in the community.`,
    `${query} is neither amazing nor terrible, just okay.`
  ];
  
  const negativeFragments = [
    `I've been really disappointed with ${query} lately.`,
    `${query} has so many issues that need to be fixed.`,
    `The direction ${query} is taking concerns me.`,
    `${query} hasn't lived up to the hype at all.`,
    `I expected much more from ${query}.`
  ];
  
  let fragments: string[];
  switch (sentiment) {
    case 'positive': fragments = positiveFragments; break;
    case 'negative': fragments = negativeFragments; break;
    default: fragments = neutralFragments;
  }
  
  // Pick 2-3 fragments and join them
  const count = Math.floor(Math.random() * 2) + 2;
  const selectedFragments = Array.from({ length: count }, () => 
    fragments[Math.floor(Math.random() * fragments.length)]
  );
  
  return selectedFragments.join(' ') + ` What do you all think about ${query}? I'd love to hear your experiences.`;
}

function generateAuthor(): string {
  const prefixes = ['cool', 'super', 'tech', 'code', 'reddit', 'random', 'mega'];
  const suffixes = ['user', 'coder', 'dev', 'fan', 'guru', 'pro', 'enthusiast'];
  const numbers = () => Math.floor(Math.random() * 1000);
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${prefix}_${suffix}${numbers()}`;
}
