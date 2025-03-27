
import { PostData } from '@/components/PostCard';

// Generates AI insights based on the provided posts and idea
export function generateInsights(posts: PostData[], idea?: string): string {
  // If no posts but have an idea, generate initial idea analysis
  if (!posts.length && idea) {
    return generateIdeaInsights(idea);
  }
  
  // If no posts and no idea, return empty
  if (!posts.length) return '';

  // Get sentiment distribution
  const sentiments = posts.reduce((acc, post) => {
    acc[post.sentiment] = (acc[post.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = posts.length;
  const positivePercentage = Math.round((sentiments.positive || 0) / total * 100);
  const negativePercentage = Math.round((sentiments.negative || 0) / total * 100);
  const neutralPercentage = Math.round((sentiments.neutral || 0) / total * 100);

  // Get most active subreddits
  const subredditCounts = posts.reduce((acc, post) => {
    acc[post.subreddit] = (acc[post.subreddit] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSubreddits = Object.entries(subredditCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => `r/${name} (${count} posts)`);

  // Extract prominent words (simplified version)
  const words = posts
    .flatMap(post => post.title.toLowerCase().split(/\W+/))
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'what', 'with', 'from', 'have', 'about'].includes(word));
  
  const wordCounts: Record<string, number> = {};
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });

  const topWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word]) => word);

  // Generate the insight text
  let insight = '';

  // If we have an idea, add idea-specific context first
  if (idea) {
    insight += `For your idea about "${idea}", here's what I found on Reddit:\n\n`;
  }

  // Sentiment analysis insight
  insight += `Based on the analysis of ${total} posts, the overall sentiment is `;
  if (positivePercentage > negativePercentage && positivePercentage > neutralPercentage) {
    insight += `predominantly positive (${positivePercentage}%), `;
  } else if (negativePercentage > positivePercentage && negativePercentage > neutralPercentage) {
    insight += `predominantly negative (${negativePercentage}%), `;
  } else {
    insight += `mostly neutral (${neutralPercentage}%), `;
  }

  insight += `with ${positivePercentage}% positive, ${neutralPercentage}% neutral, and ${negativePercentage}% negative posts.\n\n`;

  // Subreddit distribution insight
  if (topSubreddits.length > 0) {
    insight += `Most discussions come from ${topSubreddits.join(', ')}`;
    
    // If we have an idea, add relevance assessment
    if (idea) {
      insight += `. These communities are likely the best places to engage with your target audience for "${idea}".`;
    }
    
    insight += `\n\n`;
  }

  // Content insight based on keywords
  if (topWords.length > 0) {
    insight += `Key topics include: ${topWords.join(', ')}`;
    
    // If we have an idea, add relevance to the idea
    if (idea) {
      insight += `. Consider incorporating these themes into your idea to better resonate with the audience.`;
    }
    
    insight += `\n\n`;
  }

  // General observation
  const highEngagementPosts = posts.filter(post => post.upvotes > 1000).length;
  const percentHighEngagement = Math.round((highEngagementPosts / total) * 100);
  
  if (percentHighEngagement > 30) {
    insight += `This topic shows high user engagement with ${percentHighEngagement}% of posts having significant upvotes.`;
    if (idea) {
      insight += ` This suggests strong interest in "${idea}" or similar topics, which is promising for your idea.`;
    }
  } else if (percentHighEngagement > 10) {
    insight += `This topic shows moderate user engagement with some highly upvoted content.`;
    if (idea) {
      insight += ` Your idea may need strong differentiation to stand out in this moderately engaged space.`;
    }
  } else {
    insight += `Most posts on this topic have relatively low engagement based on upvote patterns.`;
    if (idea) {
      insight += ` Your idea might need to address an unmet need or pain point to generate more interest than current discussions.`;
    }
  }

  return insight;
}

// Generate insights specifically about an idea before any Reddit data is fetched
function generateIdeaInsights(idea: string): string {
  // Split the idea into keywords for potential subreddit suggestions
  const keywords = idea
    .toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'what', 'with', 'from', 'have', 'about'].includes(word));
  
  // Suggest potential subreddits based on the idea keywords
  const potentialSubreddits = generateSubredditSuggestions(keywords, idea);
  
  let insights = `I'll help you explore your idea about "${idea}".\n\n`;
  
  insights += `I'll be analyzing Reddit content to find relevant discussions and insights. Based on your idea, these communities might be relevant: ${potentialSubreddits.join(', ')}.\n\n`;
  
  insights += `Once I gather data from these communities, I'll provide you with sentiment analysis, key topics, and engagement metrics to help you understand how your idea resonates with potential audiences.`;
  
  return insights;
}

// Generate subreddit suggestions based on keywords from the idea
function generateSubredditSuggestions(keywords: string[], idea: string): string[] {
  // Map of common keywords to relevant subreddits
  const keywordToSubreddit: Record<string, string[]> = {
    'tech': ['technology', 'gadgets', 'futurology'],
    'game': ['gaming', 'gamedev', 'games'],
    'food': ['food', 'cooking', 'recipes'],
    'health': ['health', 'fitness', 'nutrition'],
    'business': ['entrepreneur', 'smallbusiness', 'startups'],
    'education': ['education', 'teachers', 'college'],
    'crypto': ['cryptocurrency', 'bitcoin', 'cryptomarkets'],
    'travel': ['travel', 'backpacking', 'solotravel'],
    'music': ['music', 'wearethemusicmakers', 'listentothis'],
    'art': ['art', 'design', 'illustration'],
    'software': ['programming', 'webdev', 'software'],
    'app': ['apps', 'androidapps', 'apphookup'],
    'web': ['webdev', 'web_design', 'programming'],
    'mobile': ['androidapps', 'iphone', 'mobileweb'],
    'design': ['design', 'web_design', 'graphic_design'],
    'marketing': ['marketing', 'advertising', 'socialmedia'],
    'social': ['socialmedia', 'instagram', 'twitter'],
  };
  
  // General popular subreddits for fallback
  const generalSubreddits = ['AskReddit', 'technology', 'business', 'ideas'];
  
  // Find matching subreddits based on keywords
  let matchedSubreddits: string[] = [];
  
  // First try direct keyword matches
  keywords.forEach(keyword => {
    const matches = keywordToSubreddit[keyword];
    if (matches) {
      matchedSubreddits.push(...matches);
    }
  });
  
  // If we have too few matches, check if any keyword is a substring of our mapping keys
  if (matchedSubreddits.length < 3) {
    keywords.forEach(keyword => {
      Object.entries(keywordToSubreddit).forEach(([key, subreddits]) => {
        if (key.includes(keyword) || keyword.includes(key)) {
          matchedSubreddits.push(...subreddits);
        }
      });
    });
  }
  
  // Add 'r/' prefix
  let suggestions = [...new Set(matchedSubreddits)]
    .slice(0, 5)
    .map(sub => `r/${sub}`);
  
  // If we still have too few, add some general ones
  if (suggestions.length < 3) {
    suggestions = [
      ...suggestions,
      ...generalSubreddits.map(sub => `r/${sub}`)
    ];
    suggestions = [...new Set(suggestions)].slice(0, 5);
  }
  
  return suggestions;
}
