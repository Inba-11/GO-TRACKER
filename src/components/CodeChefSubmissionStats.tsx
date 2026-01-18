import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Calendar, TrendingUp, Zap } from 'lucide-react';

interface SubmissionStats {
  daysWithSubmissions: number;
  maxDailySubmissions: number;
  avgDailySubmissions: number;
}

interface CodeChefSubmissionStatsProps {
  submissionStats?: SubmissionStats;
  className?: string;
}

const CodeChefSubmissionStats: React.FC<CodeChefSubmissionStatsProps> = ({
  submissionStats,
  className = ""
}) => {
  if (!submissionStats) {
    return (
      <Card className={`bg-card border-border/50 ${className}`}>
        <CardHeader>
          <CardTitle className="text-xl font-heading flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-600" />
            Submission Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No submission statistics available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-card border-border/50 ${className}`}>
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
  );
};

export default CodeChefSubmissionStats;

