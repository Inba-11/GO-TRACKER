import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronRight, Code, GitBranch, Sparkles, Zap, Trophy } from 'lucide-react';
import { Student } from '@/data/mockData';

interface StudentCardProps {
  student: Student;
  rank: number;
  onClick: () => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, rank, onClick }) => {
  const totalProblems = 
    student.platforms.codechef.problemsSolved +
    student.platforms.hackerrank.problemsSolved +
    student.platforms.leetcode.problemsSolved +
    student.platforms.atcoder.problemsSolved;

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-amber-500';
    if (rank === 2) return 'from-gray-300 to-gray-400';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-blue-500 to-cyan-500';
  };

  const getRankBgColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
    if (rank === 2) return 'bg-gradient-to-br from-gray-400/20 to-gray-500/20 border-gray-500/30';
    if (rank === 3) return 'bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30';
    return 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30';
  };

  return (
    <Card 
      className="card-hover cursor-pointer bg-card border-border/50 overflow-hidden group transition-all duration-300 hover:shadow-lg hover:border-primary/50"
      onClick={onClick}
    >
      {/* Gradient accent top */}
      <div className={`h-1 bg-gradient-to-r ${getRankColor(rank)}`} />
      
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          {/* Rank Badge */}
          <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-transform group-hover:scale-110 ${getRankBgColor(rank)} border`}>
            {rank === 1 && <Trophy className="w-6 h-6 text-yellow-500" />}
            {rank === 2 && <Trophy className="w-6 h-6 text-gray-400" />}
            {rank === 3 && <Trophy className="w-6 h-6 text-orange-600" />}
            {rank > 3 && <span className="text-foreground font-bold">#{rank}</span>}
          </div>

          {/* Avatar with gradient border */}
          <div className="relative">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getRankColor(rank)} p-[2px]`}>
              <Avatar className="w-full h-full border-0">
                <AvatarImage src={student.avatar} alt={student.name} className="rounded-[10px]" />
                <AvatarFallback className="rounded-[10px]">{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground truncate">{student.name}</h4>
              {rank <= 3 && <Sparkles className="w-3 h-3 text-accent flex-shrink-0 animate-pulse" />}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {student.department}
            </p>
          </div>

          {/* Stats Section */}
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-secondary/50 rounded-lg">
              <Code className="w-3.5 h-3.5 text-orange-500" />
              <span className="font-medium text-foreground">{totalProblems}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-secondary/50 rounded-lg">
              <GitBranch className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-medium text-foreground">{student.platforms.github.contributions}</span>
            </div>
          </div>

          {/* Chevron */}
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentCard;
