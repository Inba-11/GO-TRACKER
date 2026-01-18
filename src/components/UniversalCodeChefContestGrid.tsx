import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Trophy, Target, CheckCircle, XCircle, Calendar } from 'lucide-react';

interface ContestEntry {
  contestCode?: string;
  name?: string;
  date?: string;
  rating?: number;
  rank?: number;
  ratingChange?: number;
  problemsSolved?: string[];
  problemsCount?: number;
  attended?: boolean;
}

interface UniversalCodeChefContestGridProps {
  studentData: any;
  className?: string;
}

const UniversalCodeChefContestGrid: React.FC<UniversalCodeChefContestGridProps> = ({ 
  studentData, 
  className = "" 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Get contest history from student data
  const contestHistory = studentData?.platforms?.codechef?.contestHistory || [];
  
  // Calculate pagination
  const totalPages = Math.ceil(contestHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContests = contestHistory.slice(startIndex, endIndex);
  
  // Calculate stats
  const stats = useMemo(() => {
    const attended = contestHistory.filter((c: ContestEntry) => c.attended !== false).length;
    const totalProblemsSolved = contestHistory.reduce((sum: number, c: ContestEntry) => sum + (c.problemsCount || 0), 0);
    const ratings = contestHistory.filter((c: ContestEntry) => c.rating && c.rating > 0).map((c: ContestEntry) => c.rating || 0);
    const currentRating = ratings.length > 0 ? ratings[ratings.length - 1] : 0;
    const ranks = contestHistory.filter((c: ContestEntry) => c.rank && c.rank > 0).map((c: ContestEntry) => c.rank || 0);
    const bestRank = ranks.length > 0 ? Math.min(...ranks) : 0;
    
    return {
      totalContests: contestHistory.length,
      attended,
      totalProblemsSolved,
      currentRating,
      bestRank
    };
  }, [contestHistory]);
  
  // Reset to page 1 when items per page changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  if (contestHistory.length === 0) {
    return (
      <Card className={`bg-card border-border/50 ${className}`}>
        <CardContent className="p-8 text-center">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Contest Data Available</h3>
          <p className="text-sm text-muted-foreground">CodeChef contest history not found for this student.</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (contest: ContestEntry) => {
    if (!contest.attended) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (contest.success_rate === 100) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <Target className="w-4 h-4 text-amber-500" />;
  };

  const getStatusText = (contest: ContestEntry) => {
    if (contest.attended === false) return "Not Attended";
    if (contest.problemsCount && contest.problemsCount > 0) return "Attended";
    return "No Problems Solved";
  };

  const getRatingChangeColor = (change?: number) => {
    if (!change) return "text-gray-500";
    return change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-gray-500";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className={`bg-card border-border/50 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2DD4BF] rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-foreground">
                Contest History
              </CardTitle>
              <p className="text-sm text-muted-foreground">{stats.totalContests} total contests</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">8/page</SelectItem>
                <SelectItem value="10">10/page</SelectItem>
                <SelectItem value="15">15/page</SelectItem>
                <SelectItem value="20">20/page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contest Grid */}
        <div className="space-y-3">
          {paginatedContests.map((contest: ContestEntry, index: number) => (
            <div
              key={`${contest.contestCode || contest.name || index}-${index}`}
              className="bg-[#FAFAFA] dark:bg-secondary/30 rounded-lg p-4 border border-[#A7F3D0]/50 hover:bg-[#E6FFFA] dark:hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Trophy className="w-4 h-4 text-[#2DD4BF] flex-shrink-0" />
                    <h4 className="font-semibold text-foreground truncate">
                      {contest.name || contest.contestCode || 'Unknown Contest'}
                    </h4>
                    {contest.contestCode && (
                      <span className="px-2 py-1 bg-[#E6FFFA] dark:bg-cyan-500/20 text-[#0F766E] text-xs rounded-full border border-[#A7F3D0]">
                        {contest.contestCode}
                      </span>
                    )}
                    {getStatusIcon(contest)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(contest.date)}
                    </div>
                    {contest.attended !== false && contest.rating && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-[#0F766E]">{contest.rating}</span>
                        <span className="text-muted-foreground">rating</span>
                      </div>
                    )}
                    {contest.rank && (
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        <span className="font-medium text-[#0F766E]">#{contest.rank.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  {contest.problemsSolved && contest.problemsSolved.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {contest.problemsSolved.slice(0, 5).map((problem, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-[#E6FFFA] dark:bg-cyan-500/20 text-[#0F766E] text-xs rounded-full border border-[#A7F3D0]"
                        >
                          {problem}
                        </span>
                      ))}
                      {contest.problemsSolved.length > 5 && (
                        <span className="px-2 py-1 bg-secondary text-muted-foreground text-xs rounded-full">
                          +{contest.problemsSolved.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  {contest.ratingChange !== undefined && contest.ratingChange !== null && (
                    <div className={`flex items-center gap-1 ${getRatingChangeColor(contest.ratingChange)}`}>
                      {contest.ratingChange > 0 ? (
                        <span className="text-green-600 dark:text-green-400">↑</span>
                      ) : contest.ratingChange < 0 ? (
                        <span className="text-red-600 dark:text-red-400">↓</span>
                      ) : null}
                      <span className="font-semibold text-sm">
                        {contest.ratingChange > 0 ? '+' : ''}{contest.ratingChange}
                      </span>
                    </div>
                  )}
                  {contest.problemsCount !== undefined && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#0F766E]">{contest.problemsCount}</div>
                      <div className="text-xs text-muted-foreground">Problems</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
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
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
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
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Summary Stats */}
        <div className="bg-[#E6FFFA] dark:bg-cyan-500/20 rounded-lg p-4 border border-[#A7F3D0] mt-4">
          <div className="text-center mb-3">
            <h4 className="text-sm font-semibold text-foreground">Contest Statistics</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[#0F766E]">{stats.totalContests}</div>
              <div className="text-xs text-muted-foreground">Total Contests</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0F766E]">{stats.attended}</div>
              <div className="text-xs text-muted-foreground">Attended</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0F766E]">{stats.totalProblemsSolved}</div>
              <div className="text-xs text-muted-foreground">Problems Solved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0F766E]">{stats.currentRating}</div>
              <div className="text-xs text-muted-foreground">Current Rating</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0F766E]">#{stats.bestRank.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Best Rank</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UniversalCodeChefContestGrid;
