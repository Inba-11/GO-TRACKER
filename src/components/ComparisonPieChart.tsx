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
      <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-900">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[200px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-slate-600">No data yet</p>
              <p className="text-xs text-slate-600 mt-1">Start solving!</p>
            </div>
          </div>
          <div className="text-center mt-2">
            <p className="text-lg font-semibold text-slate-600">0 (0%)</p>
            <p className="text-xs text-slate-600">Week over week change</p>
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
    <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
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
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="text-center mt-2">
          <p className={`text-lg font-semibold ${improvement >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
            {improvement >= 0 ? '+' : ''}{improvement} ({improvement >= 0 ? '+' : ''}{improvementPercent}%)
          </p>
          <p className="text-xs text-slate-600">Week over week change</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonPieChart;
