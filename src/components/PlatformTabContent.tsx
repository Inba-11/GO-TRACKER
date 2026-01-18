import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  RefreshCw, ExternalLink, Trophy, Target, TrendingUp, Award, 
  Flame, Calendar, Star, User, Hash, Globe, Medal, Activity,
  GitBranch, GitCommit, Code, BarChart3, FolderGit2, MapPin, Building, Link as LinkIcon
} from 'lucide-react';
import JsonViewer from './JsonViewer';
import LeetCodeContestHistory from './LeetCodeContestHistory';
import LeetCodeActivityHeatmap from './LeetCodeActivityHeatmap';
import LeetCodeBadgesSection from './LeetCodeBadgesSection';
import LeetCodeProfileSection from './LeetCodeProfileSection';
import CodeChefContestHistory from './CodeChefContestHistory';
import CodeChefSubmissionHeatmap from './CodeChefSubmissionHeatmap';
import CodeforcesContestHistory from './CodeforcesContestHistory';
import GitHubPinnedRepos from './GitHubPinnedRepos';
import HeatmapCalendar from './HeatmapCalendar';

interface PlatformTabContentProps {
  platform: 'leetcode' | 'codechef' | 'codeforces' | 'github' | 'codolio';
  data: any;
  link?: string;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  isStudentView: boolean;
}

const PlatformTabContent: React.FC<PlatformTabContentProps> = ({
  platform,
  data,
  link,
  onRefresh,
  isRefreshing,
  isStudentView
}) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600 mb-4">No {platform} data available</p>
        {link && (
          <Button 
            onClick={onRefresh} 
            disabled={isRefreshing} 
            className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </Button>
        )}
      </div>
    );
  }

  const platformConfig = {
    leetcode: {
      name: 'LeetCode',
      color: 'bg-indigo-600',
      icon: Code,
    },
    codechef: {
      name: 'CodeChef',
      color: 'bg-indigo-600',
      icon: Trophy,
    },
    codeforces: {
      name: 'Codeforces',
      color: 'bg-indigo-600',
      icon: Target,
    },
    github: {
      name: 'GitHub',
      color: 'bg-slate-700',
      icon: GitBranch,
    },
    codolio: {
      name: 'Codolio',
      color: 'bg-indigo-600',
      icon: Medal,
    },
  }[platform];

  const renderLeetCode = () => (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-semibold text-slate-900">{platformConfig.name}</h2>
          {(data.totalSolved || data.problemsSolved) && (
            <Badge variant="secondary" className="text-sm font-semibold">
              {data.totalSolved || data.problemsSolved} Problems Solved
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          {link && (
            <Button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white"
              title={`Refresh ${platformConfig.name}`}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-2"
            >
              View Profile
              <ExternalLink className="w-4 h-4 text-slate-400 hover:text-indigo-600" />
            </a>
          )}
        </div>
      </div>

      {/* Profile Info */}
      {(data.username || data.realName || data.userAvatar || data.globalRanking || data.topPercentage) && (
        <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <LeetCodeProfileSection
              username={data.username || ''}
              realName={data.realName}
              userAvatar={data.userAvatar}
              ranking={data.ranking}
              reputation={data.reputation}
              globalRanking={data.globalRanking}
              topPercentage={data.topPercentage}
            />
          </CardContent>
        </Card>
      )}

      {/* Problem Solving Stats */}
      {(data.easySolved !== undefined || data.mediumSolved !== undefined || data.hardSolved !== undefined || data.totalSolved || data.acceptanceRate) && (
        <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Problem Solving Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-3xl font-bold text-green-600">{data.easySolved || 0}</p>
                <p className="text-sm text-slate-600 mt-1">Easy</p>
              </div>
              <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-3xl font-bold text-amber-600">{data.mediumSolved || 0}</p>
                <p className="text-sm text-slate-600 mt-1">Medium</p>
              </div>
              <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-3xl font-bold text-red-600">{data.hardSolved || 0}</p>
                <p className="text-sm text-slate-600 mt-1">Hard</p>
              </div>
              <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-3xl font-bold text-indigo-600">{data.totalSolved || data.problemsSolved || 0}</p>
                <p className="text-sm text-slate-600 mt-1">Total</p>
              </div>
            </div>
            {data.acceptanceRate !== undefined && (
              <div className="mt-6 p-6 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-700">Acceptance Rate</span>
                  <Badge variant="default" className="text-lg font-bold">
                    {data.acceptanceRate.toFixed(1)}%
                  </Badge>
                </div>
                <Progress value={data.acceptanceRate} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Activity */}
      {(data.streak !== undefined || data.totalActiveDays !== undefined || data.submissionCalendar) && (
        <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-6">
            {(data.streak !== undefined || data.totalActiveDays !== undefined) && (
              <div className="grid md:grid-cols-2 gap-6">
                {data.streak !== undefined && (
                  <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-lg border border-slate-200">
                    <Flame className="w-8 h-8 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{data.streak}</p>
                      <p className="text-sm text-slate-600">Current Streak</p>
                    </div>
                  </div>
                )}
                {data.totalActiveDays !== undefined && (
                  <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-lg border border-slate-200">
                    <Calendar className="w-8 h-8 text-indigo-600" />
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{data.totalActiveDays}</p>
                      <p className="text-sm text-slate-600">Active Days</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            {data.submissionCalendar && (
              <LeetCodeActivityHeatmap
                submissionCalendar={data.submissionCalendar || data.userCalendar?.submissionCalendar || ''}
                streak={data.streak}
                totalActiveDays={data.totalActiveDays}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Contest History */}
      {data.contestHistory && data.contestHistory.length > 0 && (
        <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-indigo-600" />
              Contest History
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <LeetCodeContestHistory contestHistory={data.contestHistory} />
          </CardContent>
        </Card>
      )}

      {/* Badges */}
      {(data.badges || data.activeBadge) && (
        <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Medal className="w-5 h-5 text-indigo-600" />
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <LeetCodeBadgesSection
              badges={data.badges || []}
              activeBadge={data.activeBadge}
            />
          </CardContent>
        </Card>
      )}

      {/* Raw Data */}
      <JsonViewer data={data} title="Complete LeetCode Data" />
    </div>
  );

  const renderCodeChef = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-semibold text-orange-600">{platformConfig.name}</h2>
        <div className="flex items-center gap-3">
          {link && (
            <Button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-9 px-4 bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-orange-600 transition-colors flex items-center gap-2">
              View Profile
              <ExternalLink className="w-4 h-4 text-slate-400 hover:text-orange-600" />
            </a>
          )}
        </div>
      </div>

      {/* CodeChef Stats Grid Table */}
      {(data.rating !== undefined || data.division !== undefined || data.country || 
        data.totalSolved !== undefined || data.contestsAttended !== undefined || 
        data.totalSubmissions !== undefined) && (
        <Card className="bg-white border border-orange-200 shadow-lg shadow-orange-100/50 rounded-xl overflow-hidden">
          <CardHeader className="pb-4 bg-orange-50">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-600" />
              CodeChef Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Stats Grid Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-orange-500 hover:bg-orange-600">
                    <TableHead className="text-left py-3 px-4 text-sm font-semibold text-white">Platform</TableHead>
                    <TableHead className="text-left py-3 px-4 text-sm font-semibold text-white">Rating</TableHead>
                    <TableHead className="text-left py-3 px-4 text-sm font-semibold text-white">Division</TableHead>
                    <TableHead className="text-left py-3 px-4 text-sm font-semibold text-white">Country</TableHead>
                    <TableHead className="text-left py-3 px-4 text-sm font-semibold text-white">Problems Solved</TableHead>
                    <TableHead className="text-left py-3 px-4 text-sm font-semibold text-white">Contests</TableHead>
                    <TableHead className="text-left py-3 px-4 text-sm font-semibold text-white">Submissions</TableHead>
                    <TableHead className="text-left py-3 px-4 text-sm font-semibold text-white">Avg/Sub/day</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-b border-orange-100 hover:bg-orange-50/50 transition-colors">
                    <TableCell className="py-3 px-4 text-sm font-medium text-slate-900">CodeChef</TableCell>
                    <TableCell className="py-3 px-4 text-sm text-slate-900 font-semibold">
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        {data.rating || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-slate-900">{data.division || 'N/A'}</TableCell>
                    <TableCell className="py-3 px-4 text-sm text-slate-900">{data.country || 'N/A'}</TableCell>
                    <TableCell className="py-3 px-4 text-sm text-slate-900 font-semibold">
                      <Badge variant="secondary">{data.totalSolved || data.problemsSolved || 0}</Badge>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-slate-900 font-semibold">
                      <Badge variant="secondary">{data.contestsAttended || data.contests || 0}</Badge>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-slate-900 font-semibold">
                      <Badge variant="secondary">{data.totalSubmissions || 0}</Badge>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-slate-900 font-semibold">
                      {data.submissionStats?.avgDailySubmissions 
                        ? data.submissionStats.avgDailySubmissions.toFixed(2) 
                        : (data.totalSubmissions && data.submissionStats?.daysWithSubmissions
                            ? (data.totalSubmissions / data.submissionStats.daysWithSubmissions).toFixed(2)
                            : '0.00')}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Stats Cards Below Table */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="p-5 bg-orange-500 rounded-xl shadow-lg shadow-orange-200/50 text-white hover:shadow-xl hover:shadow-orange-300/50 transition-all duration-200">
                <p className="text-xs text-orange-100 mb-1 font-medium">Rating</p>
                <p className="text-2xl font-bold text-white">{data.rating || 0}</p>
                <p className="text-xs text-orange-100 mt-1">Max: {data.maxRating || data.rating || 0}</p>
              </div>
              <div className="p-5 bg-purple-600 rounded-xl shadow-lg shadow-purple-200/50 text-white hover:shadow-xl hover:shadow-purple-300/50 transition-all duration-200">
                <p className="text-xs text-purple-100 mb-1 font-medium">Contests</p>
                <p className="text-2xl font-bold text-white">{data.contestsAttended || data.contests || 0}</p>
                <p className="text-xs text-purple-100 mt-1">Problems: {data.totalSolved || data.problemsSolved || 0}</p>
              </div>
              <div className="p-5 bg-white rounded-xl shadow-md border border-orange-200 hover:shadow-lg transition-all duration-200">
                <p className="text-xs text-slate-600 mb-1 font-medium">Avg Submissions/Day</p>
                <p className="text-2xl font-bold text-orange-600">
                  {data.submissionStats?.avgDailySubmissions 
                    ? data.submissionStats.avgDailySubmissions.toFixed(2) 
                    : '0.00'}
                </p>
                <p className="text-xs text-slate-500 mt-1">Max in a day: {data.submissionStats?.maxDailySubmissions || 0}</p>
              </div>
              <div className="p-5 bg-white rounded-xl shadow-md border border-purple-200 hover:shadow-lg transition-all duration-200">
                <p className="text-xs text-slate-600 mb-1 font-medium">Division</p>
                <p className="text-2xl font-bold text-purple-600">{data.division || 'N/A'}</p>
                <p className="text-xs text-slate-500 mt-1">{data.league || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Info */}
      {(data.username || data.realName || data.globalRank || data.countryRank || data.country) && (
        <Card className="bg-white border border-orange-200 shadow-md rounded-xl">
          <CardHeader className="pb-3 bg-orange-50">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-600" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid md:grid-cols-2 gap-4">
              {data.username && (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <p className="text-sm text-slate-600 font-medium">Username</p>
                  <p className="text-lg font-bold text-slate-900">{data.username}</p>
                </div>
              )}
              {data.realName && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-sm text-slate-600 font-medium">Name</p>
                  <p className="text-lg font-bold text-slate-900">{data.realName}</p>
                </div>
              )}
              {data.globalRank !== undefined && (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <p className="text-sm text-slate-600 font-medium">Global Rank</p>
                  <p className="text-lg font-bold text-orange-600">#{data.globalRank}</p>
                </div>
              )}
              {data.countryRank !== undefined && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-sm text-slate-600 font-medium">Country Rank</p>
                  <p className="text-lg font-bold text-purple-600">#{data.countryRank}</p>
                </div>
              )}
              {data.country && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-sm text-slate-600 font-medium">Country</p>
                  <p className="text-lg font-bold text-slate-900">{data.country}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rating & Ranking */}
      {((data.currentRating !== undefined || data.rating !== undefined) || 
        (data.highestRating !== undefined || data.maxRating !== undefined) || 
        data.ratingDiv || data.division || data.stars) && (
        <Card className="bg-white border border-orange-200 shadow-md rounded-xl">
          <CardHeader className="pb-3 bg-orange-50">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-600" />
              Rating & Ranking
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid md:grid-cols-4 gap-6">
              {(data.currentRating !== undefined || data.rating !== undefined) && (
                <div className="text-center p-6 bg-orange-50 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-3xl font-bold text-orange-600">{data.currentRating || data.rating || 0}</p>
                  <p className="text-sm text-slate-600 font-medium">Current Rating</p>
                </div>
              )}
              {(data.highestRating !== undefined || data.maxRating !== undefined) && (
                <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-3xl font-bold text-purple-600">{data.highestRating || data.maxRating || 0}</p>
                  <p className="text-sm text-slate-600 font-medium">Highest Rating</p>
                </div>
              )}
              {(data.ratingDiv || data.division) && (
                <div className="text-center p-6 bg-orange-50 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-3xl font-bold text-orange-600">{data.ratingDiv || data.division || 'N/A'}</p>
                  <p className="text-sm text-slate-600 font-medium">Division</p>
                </div>
              )}
              {data.stars !== undefined && (
                <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-3xl font-bold text-purple-600">{data.stars} ⭐</p>
                  <p className="text-sm text-slate-600 font-medium">Stars</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Problem Solving */}
      {data.problemsSolved !== undefined && (
        <Card className="bg-white border border-orange-200 shadow-md rounded-xl">
          <CardHeader className="pb-3 bg-orange-50">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600" />
              Problems Solved
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center p-8 bg-white rounded-xl border border-orange-200 shadow-sm">
              <p className="text-5xl font-bold text-orange-600">{data.problemsSolved}</p>
              <p className="text-lg text-slate-600 mt-2 font-medium">Total Problems</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contest History */}
      {data.contestHistory && data.contestHistory.length > 0 && (
        <Card className="bg-white border border-orange-200 shadow-md rounded-xl">
          <CardHeader className="pb-3 bg-orange-50">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              Contest History
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CodeChefContestHistory contestHistory={data.contestHistory} />
          </CardContent>
        </Card>
      )}

      {/* Submission Heatmap */}
      {data.submissionHeatmap && data.submissionHeatmap.length > 0 && (
        <Card className="bg-white border border-orange-200 shadow-md rounded-xl">
          <CardHeader className="pb-3 bg-orange-50">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-600" />
              Submission Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CodeChefSubmissionHeatmap 
              submissionHeatmap={data.submissionHeatmap}
              submissionStats={data.submissionStats}
            />
          </CardContent>
        </Card>
      )}

      {/* Recent Contests */}
      {data.recentContests && data.recentContests.length > 0 ? (
        <Card className="bg-white border border-orange-200 shadow-md rounded-xl">
          <CardHeader className="pb-3 bg-orange-50">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-600" />
              Recent Contests
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {data.recentContests.slice(0, 5).map((contest: any, index: number) => (
                <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-all duration-200">
                  <p className="font-medium text-slate-900">{contest.name || contest.contestCode || 'Unknown Contest'}</p>
                  {contest.date && (
                    <p className="text-xs text-slate-600 mt-1">
                      {new Date(contest.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {contest.rating !== undefined && contest.rating > 0 && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                        Rating: {contest.rating}
                      </Badge>
                    )}
                    {contest.rank !== undefined && contest.rank > 0 && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                        Rank: #{contest.rank}
                      </Badge>
                    )}
                    {contest.ratingChange !== undefined && contest.ratingChange !== 0 && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          contest.ratingChange > 0 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {contest.ratingChange > 0 ? '+' : ''}{contest.ratingChange}
                      </Badge>
                    )}
                    {contest.problemsCount !== undefined && contest.problemsCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {contest.problemsCount} Problem{contest.problemsCount !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white border border-orange-200 shadow-md rounded-xl">
          <CardHeader className="pb-3 bg-orange-50">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-600" />
              Recent Contests
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center py-6 text-slate-600">
              <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50 text-orange-400" />
              <p>No recent contests available</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw Data */}
      <JsonViewer data={data} title="Complete CodeChef Data" />
    </div>
  );

  const renderCodeforces = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-semibold text-slate-900">{platformConfig.name}</h2>
          {(data.totalSolved || data.problemsSolved) && (
            <Badge variant="secondary" className="text-sm font-semibold">
              {data.totalSolved || data.problemsSolved} Problems Solved
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          {link && (
            <Button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-2">
              View Profile
              <ExternalLink className="w-4 h-4 text-slate-400 hover:text-indigo-600" />
            </a>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      {(data.rating !== undefined || data.contestsAttended !== undefined || 
        data.totalSolved !== undefined || data.totalSubmissions !== undefined) && (
        <Card className="bg-white border border-indigo-200 shadow-lg shadow-indigo-100/50 rounded-xl overflow-hidden">
          <CardHeader className="pb-4 bg-indigo-50">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Codeforces Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.rating !== undefined && (
                <div className="p-5 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-200/50 text-white hover:shadow-xl hover:shadow-indigo-300/50 transition-all duration-200">
                  <p className="text-xs text-indigo-100 mb-1 font-medium">Rating</p>
                  <p className="text-2xl font-bold text-white">{data.rating || 0}</p>
                  <p className="text-xs text-indigo-100 mt-1">Max: {data.maxRating || data.rating || 0}</p>
                </div>
              )}
              {(data.contestsAttended !== undefined || data.contests !== undefined) && (
                <div className="p-5 bg-blue-600 rounded-xl shadow-lg shadow-blue-200/50 text-white hover:shadow-xl hover:shadow-blue-300/50 transition-all duration-200">
                  <p className="text-xs text-blue-100 mb-1 font-medium">Contests</p>
                  <p className="text-2xl font-bold text-white">{data.contestsAttended || data.contests || 0}</p>
                  <p className="text-xs text-blue-100 mt-1">Problems: {data.totalSolved || data.problemsSolved || 0}</p>
                </div>
              )}
              {data.totalSubmissions !== undefined && (
                <div className="p-5 bg-white rounded-xl shadow-md border border-indigo-200 hover:shadow-lg transition-all duration-200">
                  <p className="text-xs text-slate-600 mb-1 font-medium">Total Submissions</p>
                  <p className="text-2xl font-bold text-indigo-600">{data.totalSubmissions || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Accepted: {data.acceptedSubmissions || 0}</p>
                </div>
              )}
              {data.rank && (
                <div className="p-5 bg-white rounded-xl shadow-md border border-blue-200 hover:shadow-lg transition-all duration-200">
                  <p className="text-xs text-slate-600 mb-1 font-medium">Rank</p>
                  <p className="text-2xl font-bold text-blue-600 capitalize">{data.rank}</p>
                  <p className="text-xs text-slate-500 mt-1">Max: {data.maxRank || data.rank || 'N/A'}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rating & Ranking */}
      {(data.rating !== undefined || data.maxRating !== undefined || data.rank) && (
        <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-indigo-600" />
              Rating & Ranking
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid md:grid-cols-3 gap-6">
              {data.rating !== undefined && (
                <div className="text-center p-6 bg-indigo-50 rounded-xl border border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-3xl font-bold text-indigo-600">{data.rating}</p>
                  <p className="text-sm text-slate-600 font-medium">Current Rating</p>
                </div>
              )}
              {data.maxRating !== undefined && (
                <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-3xl font-bold text-blue-600">{data.maxRating}</p>
                  <p className="text-sm text-slate-600 font-medium">Max Rating</p>
                </div>
              )}
              {data.rank && (
                <div className="text-center p-6 bg-indigo-50 rounded-xl border border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
                  <Badge variant="default" className="text-xl font-bold bg-indigo-600 capitalize mb-2">
                    {data.rank}
                  </Badge>
                  <p className="text-sm text-slate-600 font-medium">Current Rank</p>
                  {data.maxRank && data.maxRank !== data.rank && (
                    <p className="text-xs text-slate-500 mt-1">Best: {data.maxRank}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Problem Solving Stats */}
      {(data.totalSolved !== undefined || data.problemsSolved !== undefined || data.totalSubmissions !== undefined) && (
        <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Problem Solving Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-5xl font-bold text-indigo-600">{data.totalSolved || data.problemsSolved || 0}</p>
                <p className="text-lg text-slate-600 mt-2 font-medium">Problems Solved</p>
              </div>
              {data.totalSubmissions !== undefined && (
                <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-5xl font-bold text-indigo-600">{data.totalSubmissions}</p>
                  <p className="text-lg text-slate-600 mt-2 font-medium">Total Submissions</p>
                  {data.acceptedSubmissions !== undefined && (
                    <Badge variant="secondary" className="mt-2">
                      {data.acceptedSubmissions} Accepted
                    </Badge>
                  )}
                </div>
              )}
              {data.avgProblemRating !== undefined && data.avgProblemRating > 0 && (
                <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-5xl font-bold text-indigo-600">{data.avgProblemRating}</p>
                  <p className="text-lg text-slate-600 mt-2 font-medium">Avg Problem Rating</p>
                </div>
              )}
            </div>
            {data.acceptanceRate !== undefined && data.acceptanceRate > 0 && (
              <div className="mt-6 p-6 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-700">Acceptance Rate</span>
                  <Badge variant="default" className="text-lg font-bold">
                    {data.acceptanceRate.toFixed(1)}%
                  </Badge>
                </div>
                <Progress value={data.acceptanceRate} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Contests */}
      {data.recentContests && data.recentContests.length > 0 ? (
        <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-indigo-600" />
              Recent Contests
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {data.recentContests.slice(0, 5).map((contest: any, index: number) => (
                <div key={index} className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-all duration-200">
                  <p className="font-medium text-slate-900">{contest.name || contest.contestCode || 'Unknown Contest'}</p>
                  {contest.date && (
                    <p className="text-xs text-slate-600 mt-1">
                      {new Date(contest.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {contest.rating !== undefined && contest.rating > 0 && (
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">
                        Rating: {contest.rating}
                      </Badge>
                    )}
                    {contest.rank !== undefined && contest.rank > 0 && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                        Rank: #{contest.rank}
                      </Badge>
                    )}
                    {contest.ratingChange !== undefined && contest.ratingChange !== 0 && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          contest.ratingChange > 0 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {contest.ratingChange > 0 ? '+' : ''}{contest.ratingChange}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : data.contestsAttended > 0 && (
        <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-indigo-600" />
              Recent Contests
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center py-6 text-slate-600">
              <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50 text-indigo-400" />
              <p>No recent contests available</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contest History */}
      {data.contestHistory && data.contestHistory.length > 0 && (
        <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Contest History
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CodeforcesContestHistory contestHistory={data.contestHistory} />
          </CardContent>
        </Card>
      )}

      {/* Raw Data */}
      <JsonViewer data={data} title="Complete Codeforces Data" />
    </div>
  );

  const renderGitHub = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-semibold text-slate-900">{platformConfig.name}</h2>
          {(data.contributions !== undefined || data.totalContributions !== undefined) && (
            <Badge variant="secondary" className="text-sm font-semibold">
              {(data.totalContributions || data.contributions || 0).toLocaleString()} Contributions
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          {link && (
            <Button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-9 px-4 bg-slate-700 hover:bg-slate-800 text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-2">
              View Profile
              <ExternalLink className="w-4 h-4 text-slate-400 hover:text-slate-900" />
            </a>
          )}
        </div>
      </div>

      {/* Profile Information */}
      {(data.username || data.name || data.bio || data.location || data.company || data.blog) && (
        <Card className="bg-white border border-slate-200 shadow-md rounded-xl">
          <CardHeader className="pb-4 bg-slate-50">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-slate-700" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid md:grid-cols-2 gap-4">
              {data.username && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600 font-medium mb-1">Username</p>
                  <p className="text-lg font-bold text-slate-900">{data.username}</p>
                </div>
              )}
              {data.name && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600 font-medium mb-1">Name</p>
                  <p className="text-lg font-bold text-slate-900">{data.name}</p>
                </div>
              )}
              {data.bio && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 md:col-span-2">
                  <p className="text-sm text-slate-600 font-medium mb-1">Bio</p>
                  <p className="text-sm text-slate-900 leading-relaxed">{data.bio}</p>
                </div>
              )}
              {data.location && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600 font-medium mb-1">Location</p>
                  <p className="text-lg font-bold text-slate-900">{data.location}</p>
                </div>
              )}
              {data.company && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600 font-medium mb-1">Company</p>
                  <p className="text-lg font-bold text-slate-900">{data.company}</p>
                </div>
              )}
              {data.blog && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 md:col-span-2">
                  <p className="text-sm text-slate-600 font-medium mb-1">Website</p>
                  <a href={data.blog} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    {data.blog}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      {(data.contributions !== undefined || data.repositories !== undefined || data.followers !== undefined || data.following !== undefined) && (
        <Card className="bg-white border border-slate-200 shadow-lg shadow-slate-100/50 rounded-xl overflow-hidden">
          <CardHeader className="pb-4 bg-slate-50">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-700" />
              GitHub Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(data.totalContributions !== undefined || data.contributions !== undefined) && (
                <div className="p-5 bg-slate-700 rounded-xl shadow-lg shadow-slate-200/50 text-white hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-200">
                  <p className="text-xs text-slate-200 mb-1 font-medium">Total Contributions</p>
                  <p className="text-2xl font-bold text-white">{(data.totalContributions || data.contributions || 0).toLocaleString()}</p>
                  {data.recentContributions !== undefined && (
                    <p className="text-xs text-slate-200 mt-1">Recent: {data.recentContributions}</p>
                  )}
                </div>
              )}
              {(data.repositories !== undefined || data.totalRepos !== undefined || data.publicRepos !== undefined) && (
                <div className="p-5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200/50 text-white hover:shadow-xl hover:shadow-indigo-300/50 transition-all duration-200">
                  <p className="text-xs text-indigo-100 mb-1 font-medium">Repositories</p>
                  <p className="text-2xl font-bold text-white">{data.totalRepos || data.publicRepos || data.repositories || 0}</p>
                  {data.totalStars !== undefined && (
                    <p className="text-xs text-indigo-100 mt-1">Stars: {data.totalStars || data.stars || 0}</p>
                  )}
                </div>
              )}
              {data.followers !== undefined && (
                <div className="p-5 bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-lg transition-all duration-200">
                  <p className="text-xs text-slate-600 mb-1 font-medium">Followers</p>
                  <p className="text-2xl font-bold text-slate-700">{data.followers}</p>
                  {data.following !== undefined && (
                    <p className="text-xs text-slate-500 mt-1">Following: {data.following}</p>
                  )}
                </div>
              )}
              {(data.totalStars !== undefined || data.stars !== undefined) && (
                <div className="p-5 bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-lg transition-all duration-200">
                  <p className="text-xs text-slate-600 mb-1 font-medium">Stars</p>
                  <p className="text-2xl font-bold text-slate-700">{data.totalStars || data.stars || 0}</p>
                  {data.totalForks !== undefined && (
                    <p className="text-xs text-slate-500 mt-1">Forks: {data.totalForks || 0}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Stats */}
      <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-slate-700" />
            Activity Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid md:grid-cols-4 gap-6">
            {(data.totalContributions !== undefined || data.contributions !== undefined) && (
              <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-slate-700">{(data.totalContributions || data.contributions || 0).toLocaleString()}</p>
                <p className="text-sm text-slate-600 font-medium mt-1">Contributions</p>
                {data.lastWeekContributions !== undefined && (
                  <Badge variant="secondary" className="mt-2">
                    {data.lastWeekContributions} this week
                  </Badge>
                )}
              </div>
            )}
            {(data.repositories !== undefined || data.totalRepos !== undefined || data.publicRepos !== undefined) && (
              <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-slate-700">{data.totalRepos || data.publicRepos || data.repositories || 0}</p>
                <p className="text-sm text-slate-600 font-medium mt-1">Repositories</p>
              </div>
            )}
            {data.commits !== undefined && (
              <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-slate-700">{data.commits || 0}</p>
                <p className="text-sm text-slate-600 font-medium mt-1">Commits</p>
                {data.recentCommits !== undefined && (
                  <Badge variant="secondary" className="mt-2">
                    {data.recentCommits} recent
                  </Badge>
                )}
              </div>
            )}
            {(data.totalStars !== undefined || data.stars !== undefined) && (
              <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-slate-700">{data.totalStars || data.stars || 0}</p>
                <p className="text-sm text-slate-600 font-medium mt-1">Stars</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Languages */}
      {data.topLanguages && Object.keys(data.topLanguages).length > 0 && (
        <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Code className="w-5 h-5 text-slate-700" />
              Top Languages
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {Object.entries(data.topLanguages)
                .sort(([, a]: any, [, b]: any) => b - a)
                .map(([language, count]: [string, any]) => {
                  const total = Object.values(data.topLanguages).reduce((sum: number, val: any) => sum + val, 0);
                  const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                  return (
                    <div key={language} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-medium">{language}</Badge>
                          <span className="text-sm text-slate-600">{count} repos</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{percentage}%</span>
                      </div>
                      <Progress value={parseFloat(percentage)} className="h-2" />
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Streaks */}
      {(data.streak !== undefined || data.currentStreak !== undefined || data.longestStreak !== undefined || data.maxStreak !== undefined) && (
        <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Contribution Streaks
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid md:grid-cols-2 gap-6">
              {(data.streak !== undefined || data.currentStreak !== undefined) && (
                <div className="text-center p-6 bg-orange-50 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                  <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-4xl font-bold text-slate-900">{data.currentStreak || data.streak || 0}</p>
                  <p className="text-sm text-slate-600 mt-1 font-medium">Current Streak</p>
                </div>
              )}
              {(data.longestStreak !== undefined || data.maxStreak !== undefined) && (
                <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <Trophy className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <p className="text-4xl font-bold text-slate-900">{data.longestStreak || data.maxStreak || 0}</p>
                  <p className="text-sm text-slate-600 mt-1 font-medium">Longest Streak</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pinned Repositories */}
      {data.pinnedRepositories && data.pinnedRepositories.length > 0 ? (
        <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-slate-700" />
              Pinned Repositories
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <GitHubPinnedRepos pinnedRepositories={data.pinnedRepositories} />
          </CardContent>
        </Card>
      ) : (data.repositories > 0 || data.totalRepos > 0) && (
        <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-slate-700" />
              Pinned Repositories
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center py-6 text-slate-600">
              <FolderGit2 className="w-12 h-12 mx-auto mb-2 opacity-50 text-slate-400" />
              <p>No pinned repositories</p>
              <p className="text-sm mt-1">Pin repositories on GitHub to see them here!</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contribution Calendar */}
      {data.contributionCalendar && data.contributionCalendar.length > 0 ? (
        <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-700" />
              Contribution Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <HeatmapCalendar
              data={data.contributionCalendar}
              title="GitHub Contributions"
              colorScheme="custom"
              customColor="#1f883d"
            />
          </CardContent>
        </Card>
      ) : (data.contributions > 0 || data.totalContributions > 0) && (
        <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-700" />
              Contribution Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center py-6 text-slate-600">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50 text-slate-400" />
              <p>Contribution calendar data not available</p>
              <p className="text-sm mt-1">Keep contributing to see your activity heatmap!</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Stats */}
      {(data.recentPRs !== undefined || data.recentCommits !== undefined || data.recentContributions !== undefined) && (
        <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-700" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid md:grid-cols-3 gap-4">
              {data.recentContributions !== undefined && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-2xl font-bold text-slate-700">{data.recentContributions}</p>
                  <p className="text-sm text-slate-600 mt-1">Recent Contributions</p>
                </div>
              )}
              {data.recentCommits !== undefined && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-2xl font-bold text-slate-700">{data.recentCommits}</p>
                  <p className="text-sm text-slate-600 mt-1">Recent Commits</p>
                </div>
              )}
              {data.recentPRs !== undefined && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-2xl font-bold text-slate-700">{data.recentPRs}</p>
                  <p className="text-sm text-slate-600 mt-1">Recent Pull Requests</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw Data */}
      <JsonViewer data={data} title="Complete GitHub Data" />
    </div>
  );

  const renderCodolio = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-semibold text-slate-900">{platformConfig.name}</h2>
        <div className="flex items-center gap-3">
          {link && (
            <Button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-2">
              View Profile
              <ExternalLink className="w-4 h-4 text-slate-400 hover:text-indigo-600" />
            </a>
          )}
        </div>
      </div>

      {/* Activity Stats */}
      <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-900">Activity Statistics</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid md:grid-cols-2 gap-6">
            {data.totalSubmissions !== undefined && (
              <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-5xl font-bold text-indigo-600">{data.totalSubmissions}</p>
                <p className="text-lg text-slate-600 mt-2">Total Submissions</p>
              </div>
            )}
            {data.totalContests !== undefined && (
              <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-5xl font-bold text-indigo-600">{data.totalContests}</p>
                <p className="text-lg text-slate-600 mt-2">Total Contests</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Streaks */}
      {(data.currentStreak !== undefined || data.maxStreak !== undefined) && (
        <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900">Streaks</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid md:grid-cols-2 gap-6">
              {data.currentStreak !== undefined && (
                <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-4xl font-bold text-slate-900">{data.currentStreak}</p>
                  <p className="text-sm text-slate-600">Current Streak</p>
                </div>
              )}
              {data.maxStreak !== undefined && (
                <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <Trophy className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <p className="text-4xl font-bold text-slate-900">{data.maxStreak}</p>
                  <p className="text-sm text-slate-600">Max Streak</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Badges */}
      {data.badges && data.badges.length > 0 && (
        <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900">Badges</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {data.badges.map((badge: any, index: number) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {badge.name || badge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw Data */}
      <JsonViewer data={data} title="Complete Codolio Data" />
    </div>
  );

  switch (platform) {
    case 'leetcode':
      return renderLeetCode();
    case 'codechef':
      return renderCodeChef();
    case 'codeforces':
      return renderCodeforces();
    case 'github':
      return renderGitHub();
    case 'codolio':
      return renderCodolio();
    default:
      return null;
  }
};

export default PlatformTabContent;
