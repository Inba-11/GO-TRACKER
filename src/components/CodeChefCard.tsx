import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Trophy, Target, TrendingUp, Calendar, Star } from 'lucide-react';

interface CodeChefData {
  username: string;
  rating: number;
  division: string;
  globalRank: number;
  countryRank: number;
  contestsParticipated: number;
  totalSolved: number;
  stars: number;
  league: string;
  recentActivity: {
    lastSubmission: string;
    problemsSolvedRecently: number;
  };
  profileUrl: string;
}

interface CodeChefCardProps {
  data: CodeChefData;
  className?: string;
}

const CodeChefCard: React.FC<CodeChefCardProps> = ({ data, className = "" }) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 2500) return 'text-red-500';
    if (rating >= 2000) return 'text-orange-500';
    if (rating >= 1800) return 'text-purple-500';
    if (rating >= 1600) return 'text-blue-500';
    if (rating >= 1400) return 'text-green-500';
    return 'text-amber-600';
  };

  const getLeagueColor = (league: string) => {
    switch (league.toLowerCase()) {
      case 'bronze': return 'text-amber-600';
      case 'silver': return 'text-gray-400';
      case 'gold': return 'text-yellow-500';
      case 'platinum': return 'text-blue-400';
      default: return 'text-amber-600';
    }
  };

  return (
    <Card className={`bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border-amber-200 hover:shadow-xl transition-all duration-300 ${className}`}>
      {/* Header with CodeChef branding */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">CC</span>
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-800">CodeChef</CardTitle>
              <p className="text-sm text-gray-600">@{data.username}</p>
            </div>
          </div>
          <a
            href={data.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 hover:text-amber-700 transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Rating Section */}
        <div className="bg-white/60 rounded-lg p-4 border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-gray-700">Rating</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(data.stars)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${getLeagueColor(data.league)} fill-current`} />
              ))}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${getRatingColor(data.rating)}`}>
              {data.rating}
            </span>
            <span className="text-sm text-gray-600">({data.division})</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className={`text-xs px-2 py-1 rounded-full bg-amber-100 ${getLeagueColor(data.league)}`}>
              {data.league} League
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Problems Solved */}
          <div className="bg-white/60 rounded-lg p-3 border border-amber-200">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-gray-600">Problems</span>
            </div>
            <div className="text-xl font-bold text-green-600">{data.totalSolved}</div>
            <div className="text-xs text-gray-500">Solved</div>
          </div>

          {/* Contests */}
          <div className="bg-white/60 rounded-lg p-3 border border-amber-200">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-gray-600">Contests</span>
            </div>
            <div className="text-xl font-bold text-blue-600">{data.contestsParticipated}</div>
            <div className="text-xs text-gray-500">Participated</div>
          </div>
        </div>

        {/* Rankings */}
        <div className="bg-white/60 rounded-lg p-3 border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Rankings</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-lg font-bold text-purple-600">#{data.globalRank.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Global Rank</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">#{data.countryRank.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Country Rank</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/60 rounded-lg p-3 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700">Recent Activity</div>
              <div className="text-xs text-gray-500">{data.recentActivity.lastSubmission}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-amber-600">
                {data.recentActivity.problemsSolvedRecently}
              </div>
              <div className="text-xs text-gray-500">Recent Solves</div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-1 rounded-full">
          <div 
            className="bg-gradient-to-r from-amber-600 to-orange-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min((data.rating / 2000) * 100, 100)}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CodeChefCard;