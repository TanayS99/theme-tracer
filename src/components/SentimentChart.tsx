
import React, { useMemo } from "react";
import { Card } from "./ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { PostData } from "./PostCard";

interface SentimentChartProps {
  data: PostData[];
  className?: string;
}

export const SentimentChart: React.FC<SentimentChartProps> = ({ data, className }) => {
  const chartData = useMemo(() => {
    // Count posts by sentiment
    const sentimentCounts = data.reduce((acc, post) => {
      acc[post.sentiment] = (acc[post.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array for chart
    return [
      { name: "Positive", value: sentimentCounts.positive || 0, color: "#10b981" },
      { name: "Neutral", value: sentimentCounts.neutral || 0, color: "#6366f1" },
      { name: "Negative", value: sentimentCounts.negative || 0, color: "#ef4444" },
    ];
  }, [data]);

  const totalPosts = useMemo(() => 
    chartData.reduce((sum, item) => sum + item.value, 0), 
  [chartData]);

  return (
    <Card className={`p-4 h-[240px] ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Sentiment Analysis</h3>
        <span className="text-xs text-muted-foreground">{totalPosts} posts</span>
      </div>

      {totalPosts > 0 ? (
        <ResponsiveContainer width="100%" height={170}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={({ name, value }) => 
                value > 0 ? `${name} (${Math.round((value / totalPosts) * 100)}%)` : ""}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                `${value} posts (${Math.round(Number(value) * 100 / totalPosts)}%)`,
                name
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[170px] flex items-center justify-center text-muted-foreground text-sm">
          No data available
        </div>
      )}
    </Card>
  );
};
