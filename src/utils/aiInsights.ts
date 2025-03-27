
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

  // Calculate high engagement posts percentage
  const highEngagementPosts = posts.filter(post => post.upvotes > 1000).length;
  const percentHighEngagement = Math.round((highEngagementPosts / total) * 100);

  // Generate the insight text
  let insight = '';

  // Always include idea-specific analysis first if we have an idea
  if (idea) {
    insight += `## Product Idea Analysis\n\n`;
    insight += `Your idea: "${idea}"\n\n`;
    insight += `Based on Reddit discussions, your product idea targets an audience that is `;
    
    if (positivePercentage > 60) {
      insight += `predominantly optimistic and enthusiastic about similar concepts. This suggests a receptive market for your offering.\n\n`;
    } else if (negativePercentage > 60) {
      insight += `showing significant concerns or criticisms about similar concepts. This suggests you may need to address these pain points in your approach.\n\n`;
    } else {
      insight += `showing mixed or neutral sentiments about similar concepts. This presents both challenges and opportunities for differentiation.\n\n`;
    }
    
    // Market landscape section
    insight += `## Market Landscape\n\n`;
    
    // Audience analysis based on subreddits
    if (topSubreddits.length > 0) {
      insight += `**Target Communities:** The most relevant audiences for your idea are concentrated in ${topSubreddits.join(', ')}. `;
      insight += `These communities represent your primary market segments.\n\n`;
    }
    
    // Engagement and interest level
    insight += `**Market Interest:** `;
    if (percentHighEngagement > 30) {
      insight += `There's strong interest in this space with ${percentHighEngagement}% of related discussions receiving high engagement. This indicates significant market demand.\n\n`;
    } else if (percentHighEngagement > 10) {
      insight += `There's moderate interest in this space with some highly-engaged discussions. The market exists but may require strong positioning.\n\n`;
    } else {
      insight += `The current interest level appears modest based on engagement metrics. This could indicate either an untapped opportunity or limited market size.\n\n`;
    }
    
    // User needs based on common topics
    if (topWords.length > 0) {
      insight += `**Key Topics & User Needs:** The most discussed aspects include: ${topWords.join(', ')}. `;
      insight += `Your product should address these themes to resonate with potential users.\n\n`;
    }
    
    // Competitive landscape section
    insight += `## Competitive Landscape\n\n`;
    
    // Extract potential competitors or similar products mentioned
    const competitiveInsight = analyzeCompetitiveSpace(posts);
    insight += competitiveInsight;
    
    // Recommendations
    insight += `## Recommendations\n\n`;
    
    // Provide actionable recommendations based on the analysis
    if (positivePercentage > negativePercentage) {
      insight += `- **Leverage positive sentiment** by highlighting aspects that users already appreciate about similar offerings\n`;
      insight += `- **Target the identified communities** for initial marketing and feedback\n`;
    } else {
      insight += `- **Address common pain points** identified in negative discussions\n`;
      insight += `- **Focus on differentiation** from existing solutions\n`;
    }
    
    insight += `- **Incorporate popular topics** like ${topWords.slice(0, 3).join(', ')} in your messaging\n`;
    insight += `- **Continue monitoring** these communities for ongoing feedback and trends\n`;
  } else {
    // Original behavior for when there's no specific idea provided
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
      insight += `Most discussions come from ${topSubreddits.join(', ')}.\n\n`;
    }

    // Content insight based on keywords
    if (topWords.length > 0) {
      insight += `Key topics include: ${topWords.join(', ')}.\n\n`;
    }

    // General observation
    insight += `This topic shows ${percentHighEngagement > 30 ? 'high' : percentHighEngagement > 10 ? 'moderate' : 'low'} user engagement based on upvote patterns.`;
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
  
  let insights = `## Initial Product Analysis\n\n`;
  insights += `I'll analyze your idea: "${idea}"\n\n`;
  
  insights += `Before gathering data, here's my initial assessment:\n\n`;
  
  // Add some initial product analysis based on keywords
  const productType = determineProductType(idea, keywords);
  if (productType) {
    insights += `Your idea appears to be in the **${productType}** category. `;
    
    // Add industry-specific insights
    switch (productType) {
      case 'tech/software':
        insights += `The tech industry is highly competitive but offers substantial opportunities for innovation. Key success factors include solving specific pain points and providing excellent user experience.\n\n`;
        break;
      case 'e-commerce/retail':
        insights += `Retail and e-commerce spaces have established giants but niche markets remain underserved. Differentiation through unique products, exceptional service, or specialized focus will be crucial.\n\n`;
        break;
      case 'service/platform':
        insights += `Service platforms succeed by creating strong network effects and reducing friction in transactions or information exchange. Focus on building both sides of your marketplace.\n\n`;
        break;
      default:
        insights += `This space may offer unique opportunities for innovation and customer-focused solutions.\n\n`;
    }
  }
  
  insights += `## Market Research Plan\n\n`;
  insights += `I'll be gathering data from communities like ${potentialSubreddits.join(', ')} to analyze:\n\n`;
  insights += `- Market sentiment and receptivity\n`;
  insights += `- Common pain points and user needs\n`;
  insights += `- Competitive landscape and existing solutions\n`;
  insights += `- Engagement levels and audience interest\n\n`;
  
  insights += `Once I collect this data, I'll provide a comprehensive analysis of your idea's market potential, competitive positioning, and strategic recommendations.`;
  
  return insights;
}

// Analyze posts to extract competitive landscape information
function analyzeCompetitiveSpace(posts: PostData[]): string {
  // In a real implementation, this would use NLP to extract product/company names
  // For now, use a simplified approach
  
  // Look for potential competitor mentions in titles and content
  const competitorMentions: Record<string, number> = {};
  const competitorWords = ['vs', 'versus', 'alternative to', 'better than', 'compared to', 'like', 'similar to'];
  
  posts.forEach(post => {
    const combinedText = `${post.title.toLowerCase()} ${post.content.toLowerCase()}`;
    
    // Check for comparison language
    competitorWords.forEach(word => {
      if (combinedText.includes(word)) {
        // Simple extraction - in real implementation would use more sophisticated NLP
        const nearbyWords = extractNearbyWords(combinedText, word);
        nearbyWords.forEach(potential => {
          if (potential.length > 3 && !['this', 'that', 'what', 'with', 'from', 'have', 'about'].includes(potential)) {
            competitorMentions[potential] = (competitorMentions[potential] || 0) + 1;
          }
        });
      }
    });
  });
  
  // Filter and sort potential competitors
  const potentialCompetitors = Object.entries(competitorMentions)
    .filter(([_, count]) => count > 1) // Only include mentions that appear multiple times
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => name);
  
  let competitiveInsight = '';
  
  if (potentialCompetitors.length > 0) {
    competitiveInsight += `**Market Players:** Discussions frequently mention ${potentialCompetitors.join(', ')}. `;
    competitiveInsight += `These could represent either direct competitors or complementary offerings in your space.\n\n`;
  } else {
    competitiveInsight += `**Market Players:** No specific competitors were clearly identified in the discussions. `;
    competitiveInsight += `This could indicate either an untapped market or that conversations use generic terms rather than specific brand names.\n\n`;
  }
  
  // Analyze sentiment around competitive mentions
  competitiveInsight += `**Competitive Positioning:** Based on sentiment analysis, users in these communities `;
  
  // Count posts by sentiment
  const positivePosts = posts.filter(post => post.sentiment === 'positive').length;
  const neutralPosts = posts.filter(post => post.sentiment === 'neutral').length;
  const negativePosts = posts.filter(post => post.sentiment === 'negative').length;
  const total = posts.length;
  
  if (negativePosts > positivePosts && negativePosts > neutralPosts) {
    competitiveInsight += `express significant dissatisfaction with existing solutions. This presents an opportunity to address unmet needs.\n\n`;
  } else if (positivePosts > negativePosts && positivePosts > neutralPosts) {
    competitiveInsight += `are generally satisfied with existing solutions. Your offering will need clear differentiation or significant improvements to gain traction.\n\n`;
  } else {
    competitiveInsight += `have mixed feelings about existing solutions, suggesting opportunities for improvement in specific areas while competing against established strengths.\n\n`;
  }
  
  return competitiveInsight;
}

// Helper function to extract words around a target word (simplified)
function extractNearbyWords(text: string, targetWord: string): string[] {
  const words = text.split(/\W+/);
  const index = words.findIndex(word => word === targetWord);
  
  if (index === -1) return [];
  
  // Get words before and after the target word
  const startIndex = Math.max(0, index - 3);
  const endIndex = Math.min(words.length, index + 4);
  
  return words.slice(startIndex, endIndex);
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

// Helper function to determine product type based on idea and keywords
function determineProductType(idea: string, keywords: string[]): string | null {
  const lowerIdea = idea.toLowerCase();
  
  // Check for tech indicators
  if (
    keywords.some(word => ['app', 'software', 'platform', 'tech', 'digital', 'online', 'web', 'mobile', 'code', 'programming'].includes(word)) ||
    lowerIdea.includes('app') ||
    lowerIdea.includes('software') ||
    lowerIdea.includes('platform') ||
    lowerIdea.includes('website') ||
    lowerIdea.includes('digital')
  ) {
    return 'tech/software';
  }
  
  // Check for e-commerce indicators
  if (
    keywords.some(word => ['shop', 'store', 'sell', 'product', 'retail', 'marketplace'].includes(word)) ||
    lowerIdea.includes('shop') ||
    lowerIdea.includes('store') ||
    lowerIdea.includes('sell') ||
    lowerIdea.includes('buy') ||
    lowerIdea.includes('product')
  ) {
    return 'e-commerce/retail';
  }
  
  // Check for service indicators
  if (
    keywords.some(word => ['service', 'subscription', 'membership', 'consultant', 'provide'].includes(word)) ||
    lowerIdea.includes('service') ||
    lowerIdea.includes('subscription') ||
    lowerIdea.includes('membership')
  ) {
    return 'service/platform';
  }
  
  return null;
}
