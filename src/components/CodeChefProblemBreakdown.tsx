import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CheckCircle, XCircle, Target } from 'lucide-react';

interface CodeChefProblemBreakdownProps {
  fullySolved: number;
  partiallySolved: number;
  className?: string;
}

const CodeChefProblemBreakdown: React.FC<CodeChefProblemBreakdownProps> = ({
  fullySolved = 0,
  partiallySolved = 0,
  className = ""
}) => {
  const totalProblems = fullySolved + partiallySolved;
  const fullyPercentage = totalProblems > 0 ? ((fullySolved / totalProblems) * 100).toFixed(1) : '0';
  const partiallyPercentage = totalProblems > 0 ? ((partiallySolved / totalProblems) * 100).toFixed(1) : '0';

  const pieData = [
    { name: 'Fully Solved', value: fullySolved, color: '#10b981' }, // green-500
    { name: 'Partially Solved', value: partiallySolved, color: '#f59e0b' }, // amber-500
  ];

  const COLORS = ['#10b981', '#f59e0b'];

  return (
    <Card className={`bg-card border-border/50 ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-heading flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-600" />
          Problem Solving Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        {totalProblems > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value} problems`, '']}
                  />
                  <Legend 
                    formatter={(value) => {
                      const data = pieData.find(d => d.name === value);
                      const percentage = data ? (data.value / totalProblems * 100).toFixed(1) : '0';
                      return `${value} (${percentage}%)`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Statistics */}
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-foreground">Fully Solved</span>
                </div>
                <div className="text-3xl font-bold text-green-500 mb-1">{fullySolved}</div>
                <div className="text-sm text-muted-foreground">{fullyPercentage}% of total</div>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-amber-500" />
                  <span className="font-semibold text-foreground">Partially Solved</span>
                </div>
                <div className="text-3xl font-bold text-amber-500 mb-1">{partiallySolved}</div>
                <div className="text-sm text-muted-foreground">{partiallyPercentage}% of total</div>
              </div>

                <div className="bg-[#02EED9]/10 rounded-lg p-4 border border-[#02EED9]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-[#02EED9]" />
                    <span className="font-semibold text-foreground">Total Problems</span>
                  </div>
                  <div className="text-3xl font-bold text-[#02EED9]">{totalProblems}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No problem solving data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CodeChefProblemBreakdown;

