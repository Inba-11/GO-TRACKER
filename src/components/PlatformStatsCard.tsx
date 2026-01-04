import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ExternalLink, TrendingUp, Trophy, Target, Award } from 'lucide-react';

interface PlatformStatsCardProps {
  platform: string;
  stats: {
    problemsSolved: number;
    rating: number;
    maxRating: number;
    contestsAttended: number;
  };
  link?: string;
  color: string;
}

const PlatformStatsCard: React.FC<PlatformStatsCardProps> = ({ platform, stats, link, color }) => {
  return (
    <Card className="bg-card border-border/50 card-hover overflow-hidden">
      <div className={`h-1 ${color}`} />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-foreground capitalize">{platform}</h3>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-500" />
            <div>
              <p className="text-lg font-bold text-foreground">{stats.problemsSolved}</p>
              <p className="text-[10px] text-muted-foreground">Problems</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <div>
              <p className="text-lg font-bold text-foreground">{stats.rating}</p>
              <p className="text-[10px] text-muted-foreground">Current Rating</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <div>
              <p className="text-lg font-bold text-foreground">{stats.maxRating}</p>
              <p className="text-[10px] text-muted-foreground">Max Rating</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-500" />
            <div>
              <p className="text-lg font-bold text-foreground">{stats.contestsAttended}</p>
              <p className="text-[10px] text-muted-foreground">Contests</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformStatsCard;
