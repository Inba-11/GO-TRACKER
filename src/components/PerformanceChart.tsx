import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeeklyProgress } from '@/data/mockData';

interface PerformanceChartProps {
  data: WeeklyProgress[];
  title: string;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, title }) => {
  return (
    <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="week" 
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#0f172a' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="codechef" 
              name="CodeChef"
              stroke="#4f46e5" 
              strokeWidth={2}
              dot={{ fill: '#4f46e5', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="hackerrank" 
              name="HackerRank"
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="leetcode" 
              name="LeetCode"
              stroke="#4f46e5" 
              strokeWidth={2}
              dot={{ fill: '#4f46e5', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="atcoder" 
              name="AtCoder"
              stroke="#6366f1" 
              strokeWidth={2}
              dot={{ fill: '#6366f1', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
