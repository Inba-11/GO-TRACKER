import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, TrendingUp } from 'lucide-react';
import PlatformBadge from './PlatformBadge';
import { Student } from '@/data/mockData';

interface TopPerformerCardProps {
  platform: 'codechef' | 'hackerrank' | 'leetcode' | 'atcoder' | 'github' | 'codeforces';
  student: Student;
  onClick: () => void;
}

const TopPerformerCard: React.FC<TopPerformerCardProps> = ({ platform, student, onClick }) => {
  const stats = student.platforms[platform];
  const isGithub = platform === 'github';
  
  const getValue = () => {
    if (isGithub) {
      return (stats as any).contributions;
    }
    return (stats as any).rating;
  };

  const getChange = () => {
    if (isGithub) {
      const current = (stats as any).contributions;
      const lastWeek = (stats as any).lastWeekContributions;
      return lastWeek;
    }
    const current = (stats as any).rating;
    const lastWeek = (stats as any).lastWeekRating;
    return current - lastWeek;
  };

  return (
    <Card 
      className="card-hover cursor-pointer bg-card border-border/50"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <PlatformBadge platform={platform} />
          <Trophy className="w-5 h-5 text-amber-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14 border-2 border-primary/20">
            <AvatarImage src={student.avatar} alt={student.name} />
            <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate">{student.name}</h4>
            <p className="text-sm text-muted-foreground truncate">{student.department}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground">{getValue().toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              {isGithub ? 'Contributions' : 'Rating'}
            </p>
          </div>
          <div className="flex items-center gap-1 text-primary">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">
              +{getChange()}{isGithub ? ' this week' : ''}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopPerformerCard;
