import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ExternalLink, TrendingUp, Trophy, Target, Award, Flame, Medal, Calendar, BarChart3, Zap, ArrowUp, ArrowDown, Minus, Code } from 'lucide-react';

interface PlatformStatsCardProps {
  platform: string;
  stats: {
    problemsSolved: number;
    rating: number;
    maxRating: number;
    contestsAttended: number;
    easySolved?: number;
    mediumSolved?: number;
    hardSolved?: number;
    ranking?: number;
    reputation?: number;
    acceptanceRate?: number;
    streak?: number;
    totalActiveDays?: number;
    rank?: string;
    maxRank?: string;
    totalSolved?: number;
    totalSubmissions?: number;
    acceptedSubmissions?: number;
    ratingChangeLastContest?: number;
    avgProblemRating?: number;
    recentSolved?: number;
    currentStreak?: number;
    maxStreak?: number;
    totalContests?: number;
    contests?: number;
    lastWeekRating?: number;
    globalRanking?: number;
    globalRank?: number;
    countryRank?: number;
    stars?: number;
    league?: string;
    division?: string;
    badges?: Array<{ id: string; displayName: string; icon: string; creationDate: string }>;
    activeBadge?: string;
    contestHistory?: Array<{
      title?: string;
      contestCode?: string;
      name?: string;
      date?: string;
      startTime?: number;
      attended: boolean;
      rating?: number;
      ranking?: number;
      rank?: number;
      problemsSolved?: number;
      problemsCount?: number;
      totalProblems?: number;
      trendDirection?: string;
    }>;
    recentContests?: number;
    topPercentage?: number;
    totalParticipants?: number;
  };
  link?: string;
  color: string;
  enhanced?: boolean;
}

const PlatformStatsCard: React.FC<PlatformStatsCardProps> = ({ platform, stats, link, color, enhanced = false }) => {
  // Enhanced LeetCode card with all new data
  if (enhanced && platform === 'LeetCode') {
    const contestHistory = stats.contestHistory || [];
    const attendedContests = contestHistory.filter(c => c.attended);
    const recentAttendedContests = attendedContests.slice(0, 3);
    const badges = stats.badges || [];
    const totalSolved = stats.totalSolved || stats.problemsSolved || 0;
    const currentRating = Math.round(stats.rating || 0);
    const maxRating = Math.round(stats.maxRating || 0);
    const lastWeekRating = Math.round(stats.lastWeekRating || 0);
    const ratingChange = currentRating - lastWeekRating;
    
    return (
      <Card className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
        <div className={`h-1.5 ${color} bg-gradient-to-r from-indigo-600 to-indigo-600`} />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Code className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{platform}</h3>
            </div>
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-indigo-600 transition-colors p-1.5 rounded-lg hover:bg-indigo-50"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0">
          {/* Main Problems Solved - Large Display */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-sm font-medium text-slate-600">Total Problems Solved</span>
              <span className="text-3xl font-bold text-indigo-600">{totalSolved}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-lg font-bold text-green-600">{stats.easySolved || 0}</p>
                <p className="text-[10px] font-medium text-slate-600 mt-0.5">Easy</p>
              </div>
              <div className="text-center p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-lg font-bold text-amber-600">{stats.mediumSolved || 0}</p>
                <p className="text-[10px] font-medium text-slate-600 mt-0.5">Medium</p>
              </div>
              <div className="text-center p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-lg font-bold text-red-600">{stats.hardSolved || 0}</p>
                <p className="text-[10px] font-medium text-slate-600 mt-0.5">Hard</p>
              </div>
            </div>
          </div>

          {/* Rating Section - Enhanced */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span className="text-[10px] font-medium text-slate-600">Current Rating</span>
              </div>
              <p className="text-2xl font-bold text-indigo-600">{currentRating}</p>
              {ratingChange !== 0 && (
                <div className={`flex items-center gap-1 mt-1 text-[10px] font-semibold ${
                  ratingChange > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {ratingChange > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {Math.abs(ratingChange)} vs last week
                </div>
              )}
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-indigo-600" />
                <span className="text-[10px] font-medium text-slate-600">Max Rating</span>
              </div>
              <p className="text-2xl font-bold text-indigo-600">{maxRating}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
              <Award className="w-4 h-4 text-indigo-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">{stats.contestsAttended || 0}</p>
                <p className="text-[9px] text-slate-600 truncate">Contests</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
              <Target className="w-4 h-4 text-indigo-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">
                  {stats.globalRanking ? `#${stats.globalRanking.toLocaleString()}` : 
                   stats.ranking ? `#${stats.ranking.toLocaleString()}` : 'N/A'}
                </p>
                <p className="text-[9px] text-slate-600 truncate">Ranking</p>
              </div>
            </div>
            {stats.acceptanceRate !== undefined && stats.acceptanceRate > 0 && (
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-indigo-600">{stats.acceptanceRate.toFixed(1)}%</p>
                  <p className="text-[9px] text-slate-600 truncate">Acceptance</p>
                </div>
              </div>
            )}
            {stats.submissionStats && stats.submissionStats.daysWithSubmissions > 0 && (
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <Activity className="w-4 h-4 text-indigo-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-indigo-600">{stats.submissionStats.daysWithSubmissions}</p>
                  <p className="text-[9px] text-slate-600 truncate">Active Days</p>
                </div>
              </div>
            )}
            {stats.totalSubmissions !== undefined && (
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <Zap className="w-4 h-4 text-indigo-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900">{stats.totalSubmissions.toLocaleString()}</p>
                  <p className="text-[9px] text-slate-600 truncate">Submissions</p>
                </div>
              </div>
            )}
          </div>

          {/* Activity & Streak */}
          {(stats.streak || stats.totalActiveDays) && (
            <div className="pt-2 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-2">
                {stats.streak !== undefined && stats.streak > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{stats.streak}</p>
                      <p className="text-[9px] text-slate-600">Day Streak</p>
                    </div>
                  </div>
                )}
                {stats.totalActiveDays !== undefined && stats.totalActiveDays > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{stats.totalActiveDays}</p>
                      <p className="text-[9px] text-slate-600">Active Days</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Badges Preview */}
          {stats.badges && stats.badges.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <Award className="w-4 h-4 text-indigo-600" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-900">Badges</p>
                  <p className="text-[9px] text-slate-600">{stats.badges.length} badge{stats.badges.length > 1 ? 's' : ''} earned</p>
                </div>
                <div className="flex gap-1">
                  {stats.badges.slice(0, 3).map((badge: any, idx: number) => (
                    <div key={idx} className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                      <Award className="w-3 h-3 text-indigo-600" />
                    </div>
                  ))}
                  {stats.badges.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-indigo-600">+{stats.badges.length - 3}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Badges Section */}
          {badges.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Medal className="w-4 h-4 text-indigo-600" />
                <p className="text-xs font-semibold text-slate-900">Badges</p>
                <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-bold">
                  {badges.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {badges.slice(0, 4).map((badge, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-700 rounded-md border border-slate-200 text-[10px] font-medium"
                    title={badge.displayName}
                  >
                    <Medal className="w-3 h-3" />
                    {badge.displayName}
                  </span>
                ))}
                {badges.length > 4 && (
                  <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium">
                    +{badges.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Recent Contest Performance */}
          {recentAttendedContests.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <p className="text-xs font-semibold text-slate-900">Recent Contests</p>
                </div>
                {stats.recentContests !== undefined && (
                  <span className="text-[10px] text-slate-600">{stats.recentContests} in last 7 days</span>
                )}
              </div>
              <div className="space-y-1.5">
                {recentAttendedContests.map((contest, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-slate-900 truncate">{contest.title}</p>
                      <p className="text-[9px] text-slate-600">
                        {contest.problemsSolved}/{contest.totalProblems || 4} solved
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs font-bold text-slate-900">{Math.round(contest.rating)}</span>
                      {contest.trendDirection === 'UP' && (
                        <ArrowUp className="w-3 h-3 text-green-600" />
                      )}
                      {contest.trendDirection === 'DOWN' && (
                        <ArrowDown className="w-3 h-3 text-red-600" />
                      )}
                      {contest.trendDirection === 'NONE' && (
                        <Minus className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Stats */}
          {(stats.reputation || stats.topPercentage) && (
            <div className="pt-2 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-2">
                {stats.reputation !== undefined && stats.reputation > 0 && (
                  <div className="text-center p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm font-bold text-indigo-600">{stats.reputation}</p>
                    <p className="text-[9px] text-slate-600">Reputation</p>
                  </div>
                )}
                {stats.topPercentage !== undefined && stats.topPercentage > 0 && (
                  <div className="text-center p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm font-bold text-green-600">Top {stats.topPercentage.toFixed(1)}%</p>
                    <p className="text-[9px] text-slate-600">Percentile</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Enhanced Codeforces card - Updated to match provided HTML structure
  if (enhanced && platform === 'Codeforces') {
    const currentRating = stats.rating || 0;
    const maxRating = stats.maxRating || 0;
    const rank = stats.rank || 'unrated';
    const problemsSolved = stats.totalSolved || stats.problemsSolved || 0;
    const contestsAttended = stats.contestsAttended || 0;
    const totalSubmissions = stats.totalSubmissions || 0;
    const avgProblemRating = stats.avgProblemRating || 0;
    const ratingChangeLastContest = stats.ratingChangeLastContest || 0;

    return (
      <Card className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
        <div className="h-1 bg-indigo-600"></div>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 capitalize">Codeforces</h3>
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-indigo-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">Current Rank</span>
              <span className="text-sm font-bold text-indigo-600 capitalize">{rank}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <div>
                <p className="text-lg font-bold text-slate-900">{currentRating}</p>
                <p className="text-[10px] text-slate-600">Current Rating</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-indigo-600" />
              <div>
                <p className="text-lg font-bold text-slate-900">{maxRating}</p>
                <p className="text-[10px] text-slate-600">Max Rating</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" />
              <div>
                <p className="text-lg font-bold text-slate-900">{problemsSolved}</p>
                <p className="text-[10px] text-slate-600">Problems</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <div>
                <p className="text-lg font-bold text-slate-900">{contestsAttended}</p>
                <p className="text-[10px] text-slate-600">Contests</p>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <p className="font-bold text-slate-900">{totalSubmissions}</p>
                <p className="text-[9px] text-slate-600">Submissions</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-900">{avgProblemRating}</p>
                <p className="text-[9px] text-slate-600">Avg Rating</p>
              </div>
            </div>
            {ratingChangeLastContest !== 0 && (
              <div className="text-center mt-2">
                <p className={`font-bold ${ratingChangeLastContest > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {ratingChangeLastContest > 0 ? '+' : ''}{ratingChangeLastContest}
                </p>
                <p className="text-[9px] text-slate-600">Last Contest</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Enhanced Codolio card for INBATAMIZHAN P
  if (enhanced && platform === 'Codolio') {
    return (
      <Card className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
        <div className={`h-1 ${color}`} />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 capitalize">{platform}</h3>
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-indigo-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" />
              <div>
                <p className="text-lg font-bold text-slate-900">{stats.totalSubmissions || 0}</p>
                <p className="text-[10px] text-slate-600">Submissions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <div>
                <p className="text-lg font-bold text-slate-900">{stats.totalContests || stats.contestsAttended || 0}</p>
                <p className="text-[10px] text-slate-600">Contests</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <div>
                <p className="text-lg font-bold text-slate-900">{stats.currentStreak || 0}</p>
                <p className="text-[10px] text-slate-600">Current Streak</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-indigo-600" />
              <div>
                <p className="text-lg font-bold text-slate-900">{stats.maxStreak || 0}</p>
                <p className="text-[10px] text-slate-600">Max Streak</p>
              </div>
            </div>
          </div>

          {/* Active Days if available */}
          {stats.totalActiveDays !== undefined && stats.totalActiveDays > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <div className="text-center">
                <p className="font-bold text-slate-900">{stats.totalActiveDays}</p>
                <p className="text-[9px] text-slate-600">Active Days</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Enhanced CodeChef card with all collected data (for users with complete data)
  if (platform === 'CodeChef' && (enhanced || stats.totalContests > 0 || stats.globalRank > 0 || (stats as any).contestHistory?.length > 0)) {
    const problemsSolved = stats.problemsSolved || stats.totalSolved || 0;
    const rating = stats.rating || 0;
    const maxRating = stats.maxRating || 0;
    const totalContests = stats.totalContests || stats.contestsAttended || stats.contests || 0;
    const globalRank = stats.globalRank || 0;
    const countryRank = (stats as any).countryRank || 0;
    const stars = (stats as any).stars || 0;
    const league = (stats as any).league || '';
    const division = (stats as any).division || '';
    const contestHistory = (stats as any).contestHistory || [];
    const totalSubmissions = stats.totalSubmissions || 0;
    const submissionStats = (stats as any).submissionStats || {};
    const fullySolved = (stats as any).fullySolved || 0;
    const partiallySolved = (stats as any).partiallySolved || 0;
    
    return (
      <Card className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
        <div className={`h-1 ${color} bg-gradient-to-r from-indigo-600 to-indigo-600`} />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 capitalize">{platform}</h3>
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-indigo-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {/* Main Stats Grid - 4 items */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" />
              <div>
                <p className="text-lg font-bold text-slate-900">{problemsSolved}</p>
                <p className="text-[10px] text-slate-600">Problems</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <div>
                <p className="text-lg font-bold text-indigo-600">{rating}</p>
                <p className="text-[10px] text-slate-600">Rating</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <div>
                <p className="text-lg font-bold text-slate-900">{totalContests}</p>
                <p className="text-[10px] text-slate-600">Contests</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-indigo-600" />
              <div>
                <p className="text-lg font-bold text-indigo-600">{maxRating}</p>
                <p className="text-[10px] text-slate-600">Max Rating</p>
              </div>
            </div>
          </div>

          {/* Submission Stats */}
          {submissionStats && (submissionStats.daysWithSubmissions > 0 || submissionStats.maxDailySubmissions > 0) && (
            <div className="pt-2 border-t border-slate-200">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm font-bold text-indigo-600">{submissionStats.daysWithSubmissions || 0}</p>
                  <p className="text-[9px] text-slate-600">Active Days</p>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm font-bold text-indigo-600">{submissionStats.maxDailySubmissions || 0}</p>
                  <p className="text-[9px] text-slate-600">Max Daily</p>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm font-bold text-indigo-600">{(submissionStats.avgDailySubmissions || 0).toFixed(1)}</p>
                  <p className="text-[9px] text-slate-600">Avg Daily</p>
                </div>
              </div>
            </div>
          )}

          {/* Fully/Partially Solved */}
          {(fullySolved > 0 || partiallySolved > 0) && (
            <div className="pt-2 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm font-bold text-green-600">{fullySolved}</p>
                  <p className="text-[9px] text-slate-600">Fully Solved</p>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm font-bold text-amber-600">{partiallySolved}</p>
                  <p className="text-[9px] text-slate-600">Partially Solved</p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Stats - Rank, Stars, League */}
          {(globalRank > 0 || stars > 0 || league || division || totalSubmissions > 0) && (
            <div className="pt-2 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-2">
                {globalRank > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <Medal className="w-3.5 h-3.5 text-indigo-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-indigo-600">#{globalRank.toLocaleString()}</p>
                      <p className="text-[9px] text-slate-600 truncate">Global Rank</p>
                    </div>
                  </div>
                )}
                {countryRank > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <Medal className="w-3.5 h-3.5 text-indigo-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-indigo-600">#{countryRank.toLocaleString()}</p>
                      <p className="text-[9px] text-slate-600 truncate">Country Rank</p>
                    </div>
                  </div>
                )}
                {stars > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-indigo-600">{stars}★</p>
                      <p className="text-[9px] text-slate-600 truncate">Stars</p>
                    </div>
                  </div>
                )}
                {league && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <Trophy className="w-3.5 h-3.5 text-indigo-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-indigo-600 capitalize">{league}</p>
                      <p className="text-[9px] text-slate-600 truncate">League</p>
                    </div>
                  </div>
                )}
                {division && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-indigo-600">{division}</p>
                      <p className="text-[9px] text-slate-600 truncate">Division</p>
                    </div>
                  </div>
                )}
                {totalSubmissions > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <Zap className="w-3.5 h-3.5 text-indigo-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-indigo-600">{totalSubmissions.toLocaleString()}</p>
                      <p className="text-[9px] text-slate-600 truncate">Submissions</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contest History Indicator */}
          {contestHistory.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg border border-indigo-200">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-900">Recent Contest History</p>
                  <p className="text-[9px] text-slate-600">
                    {contestHistory.length} contests with problems solved
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-indigo-600">
                    {contestHistory.reduce((sum: number, c: any) => sum + (c.problemsCount || 0), 0)}
                  </p>
                  <p className="text-[9px] text-slate-600">Problems</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Standard card for other platforms
  return (
    <Card className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
      <div className={`h-1 ${color}`} />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 capitalize">{platform}</h3>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <div>
              <p className="text-lg font-bold text-slate-900">{stats.problemsSolved}</p>
              <p className="text-[10px] text-slate-600">Problems</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <div>
              <p className="text-lg font-bold text-slate-900">{stats.rating}</p>
              <p className="text-[10px] text-slate-600">Current Rating</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-indigo-600" />
            <div>
              <p className="text-lg font-bold text-slate-900">{stats.maxRating}</p>
              <p className="text-[10px] text-slate-600">Max Rating</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <div>
              <p className="text-lg font-bold text-slate-900">{stats.contestsAttended}</p>
              <p className="text-[10px] text-slate-600">Contests</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformStatsCard;
