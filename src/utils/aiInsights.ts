
import { PostData } from '@/components/PostCard';

// Generates AI insights based on the provided posts
export function generateInsights(posts: PostData[]): string {
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
    insight += `Most posts come from ${topSubreddits.join(', ')}.\n\n`;
  }

  // Content insight based on keywords
  if (topWords.length > 0) {
    insight += `Key topics include: ${topWords.join(', ')}.\n\n`;
  }

  // General observation
  const highEngagementPosts = posts.filter(post => post.upvotes > 1000).length;
  const percentHighEngagement = Math.round((highEngagementPosts / total) * 100);
  
  if (percentHighEngagement > 30) {
    insight += `This topic shows high user engagement with ${percentHighEngagement}% of posts having significant upvotes.`;
  } else if (percentHighEngagement > 10) {
    insight += `This topic shows moderate user engagement with some highly upvoted content.`;
  } else {
    insight += `Most posts on this topic have relatively low engagement based on upvote patterns.`;
  }

  return insight;
}
