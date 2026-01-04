import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ComparisonPieChartProps {
  lastWeek: number;
  thisWeek: number;
  title: string;
  platform: string;
}

const ComparisonPieChart: React.FC<ComparisonPieChartProps> = ({ lastWeek, thisWeek, title, platform }) => {
  // Handle case where both values are 0
  const hasData = lastWeek > 0 || thisWeek > 0;
  
  if (!hasData) {
    return (
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">No data yet</p>
              <p className="text-xs text-muted-foreground mt-1">Start solving!</p>
            </div>
          </div>
          <div className="text-center mt-2">
            <p className="text-lg font-semibold text-muted-foreground">0 (0%)</p>
            <p className="text-xs text-muted-foreground">Week over week change</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = [
    { name: 'Last Week', value: lastWeek || 0 },
    { name: 'This Week', value: thisWeek || 0 },
  ];

  const COLORS = ['hsl(var(--muted-foreground))', 'hsl(var(--primary))'];

  const improvement = thisWeek - lastWeek;
  const improvementPercent = lastWeek > 0 ? ((improvement / lastWeek) * 100).toFixed(1) : '0.0';

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-heading">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="text-center mt-2">
          <p className={`text-lg font-semibold ${improvement >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {improvement >= 0 ? '+' : ''}{improvement} ({improvement >= 0 ? '+' : ''}{improvementPercent}%)
          </p>
          <p className="text-xs text-muted-foreground">Week over week change</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonPieChart;
