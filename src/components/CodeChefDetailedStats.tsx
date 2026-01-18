import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { 
  CheckCircle, XCircle, Activity, Calendar, 
  TrendingUp, School, MapPin, Target, Zap 
} from 'lucide-react';

interface SubmissionStats {
  daysWithSubmissions: number;
  maxDailySubmissions: number;
  avgDailySubmissions: number;
}

interface CodeChefDetailedStatsProps {
  fullySolved: number;
  partiallySolved: number;
  submissionStats?: SubmissionStats;
  institution?: string;
  country?: string;
  className?: string;
}

const CodeChefDetailedStats: React.FC<CodeChefDetailedStatsProps> = ({
  fullySolved = 0,
  partiallySolved = 0,
  submissionStats,
  institution = '',
  country = '',
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
    <div className={`space-y-6 ${className}`}>
      {/* Problem Breakdown Section */}
      <Card className="bg-card border-border/50">
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

                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">Total Problems</span>
                  </div>
                  <div className="text-3xl font-bold text-primary">{totalProblems}</div>
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

      {/* Submission Statistics Section */}
      {submissionStats && (
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-heading flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-600" />
              Submission Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-foreground">Active Days</span>
                </div>
                <div className="text-2xl font-bold text-blue-500">
                  {submissionStats.daysWithSubmissions}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Days with submissions</div>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  <span className="font-semibold text-foreground">Max Daily</span>
                </div>
                <div className="text-2xl font-bold text-purple-500">
                  {submissionStats.maxDailySubmissions}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Highest submissions in a day</div>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold text-foreground">Avg Daily</span>
                </div>
                <div className="text-2xl font-bold text-orange-500">
                  {submissionStats.avgDailySubmissions.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Average submissions per day</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Information Section */}
      {(institution || country) && (
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-heading flex items-center gap-2">
              <School className="w-5 h-5 text-amber-600" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {institution && (
                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                  <School className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Institution</div>
                    <div className="font-semibold text-foreground">{institution}</div>
                  </div>
                </div>
              )}

              {country && (
                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                  <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Country</div>
                    <div className="font-semibold text-foreground">{country}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CodeChefDetailedStats;

