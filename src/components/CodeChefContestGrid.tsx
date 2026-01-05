import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Trophy, Target, CheckCircle, XCircle, Calendar, Clock, Star } from 'lucide-react';
import CodeChefContestService, { ContestData } from '@/services/codechefContestService';

interface CodeChefContestGridProps {
  username: string;
  totalContests: number;
  className?: string;
}

const CodeChefContestGrid: React.FC<CodeChefContestGridProps> = ({ 
  username, 
  totalContests, 
  className = "" 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const contestsPerPage = 10;
  const contestService = CodeChefContestService.getInstance();
  
  // Get real contest data
  const contestData = contestService.getContestPage(currentPage, contestsPerPage);
  const stats = contestService.getContestStats();

  const getStatusIcon = (contest: ContestData) => {
    if (!contest.attended) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (contest.success_rate === 100) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <Target className="w-4 h-4 text-amber-500" />;
  };

  const getStatusText = (contest: ContestData) => {
    if (!contest.attended) return "Not Attended";
    if (contest.success_rate === 100) return "All Solved";
    return "Partial";
  };

  const getRatingChangeColor = (change?: number) => {
    if (!change) return "text-gray-500";
    return change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-gray-500";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className={`bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border-amber-200 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-800">Recent Contest History</CardTitle>
              <p className="text-sm text-gray-600">@{username} • Last {stats.totalContests} contests</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Page {contestData.currentPage} of {contestData.totalPages}</div>
            <div className="text-xs text-gray-500">{stats.totalContests} total contests</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contest Grid */}
        <div className="space-y-3">
          {contestData.contests.map((contest) => (
            <div
              key={contest.id}
              className="bg-white/70 rounded-lg p-4 border border-amber-200 hover:bg-white/90 transition-all duration-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                {/* Contest Number & Status */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {contest.id}
                  </div>
                  {getStatusIcon(contest)}
                </div>

                {/* Contest Name */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800 text-sm">{contest.name}</h4>
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full border border-amber-200 font-medium">
                      {contest.division_participated}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(contest.date)}
                  </div>
                </div>

                {/* Problems Stats */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{contest.problems_given}</div>
                    <div className="text-xs text-gray-500">Available ({contest.division_participated})</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{contest.total_problems_in_contest}</div>
                    <div className="text-xs text-gray-500">Total Contest</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{contest.problems_count}</div>
                    <div className="text-xs text-gray-500">Solved</div>
                  </div>
                </div>

                {/* Rank & Rating */}
                <div className="text-center">
                  {contest.attended && contest.rank ? (
                    <>
                      <div className="text-sm font-bold text-purple-600">#{contest.rank.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Rank</div>
                    </>
                  ) : (
                    <div className="text-xs text-gray-400">No Rank</div>
                  )}
                </div>

                {/* Status & Rating Change */}
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700">{getStatusText(contest)}</div>
                  {contest.rating_change !== undefined && contest.rating_change !== null && (
                    <div className={`text-xs font-medium ${getRatingChangeColor(contest.rating_change)}`}>
                      {contest.rating_change > 0 ? '+' : ''}{contest.rating_change}
                    </div>
                  )}
                </div>
              </div>

              {/* Problems Solved Details */}
              {contest.problems_solved.length > 0 && (
                <div className="mt-3 p-3 bg-white/50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-2">Problems Solved:</div>
                  <div className="flex flex-wrap gap-2">
                    {contest.problems_solved.map((problem, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full border border-green-200"
                      >
                        {problem}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Bars - Division and Contest Wide */}
              <div className="mt-3 space-y-2">
                {/* Division Success Rate */}
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{contest.division_participated} Success Rate</span>
                    <span>{contest.division_success_rate.toFixed(0)}% ({contest.problems_count}/{contest.problems_given})</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${contest.division_success_rate}%`
                      }}
                    />
                  </div>
                </div>
                
                {/* Contest Wide Success Rate */}
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Contest Wide Success Rate</span>
                    <span>{contest.contest_wide_success_rate.toFixed(0)}% ({contest.problems_count}/{contest.total_problems_in_contest})</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${contest.contest_wide_success_rate}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4 border-t border-amber-200">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, contestData.totalPages) }, (_, i) => {
              let pageNum;
              if (contestData.totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= contestData.totalPages - 2) {
                pageNum = contestData.totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, contestData.totalPages))}
            disabled={currentPage === contestData.totalPages}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="bg-white/60 rounded-lg p-4 border border-amber-200 mt-4">
          <div className="text-center mb-3">
            <h4 className="text-sm font-semibold text-gray-700">Contest Statistics</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalContests}</div>
              <div className="text-xs text-gray-600">Total Contests</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.attended}</div>
              <div className="text-xs text-gray-600">Recent Attended</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{stats.totalProblemsSolved}</div>
              <div className="text-xs text-gray-600">Recent Problems</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{Math.round(stats.attendanceRate)}%</div>
              <div className="text-xs text-gray-600">Recent Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">#{stats.bestRank.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Best Rank</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CodeChefContestGrid;