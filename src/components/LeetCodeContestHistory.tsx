import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Trophy, TrendingUp, TrendingDown, Users, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ContestHistoryEntry {
  title: string;
  startTime: number;
  attended: boolean;
  rating: number;
  ranking: number;
  problemsSolved: number;
  totalProblems: number;
  finishTimeInSeconds: number;
  trendDirection: string;
}

interface LeetCodeContestHistoryProps {
  contestHistory: ContestHistoryEntry[];
}

const LeetCodeContestHistory: React.FC<LeetCodeContestHistoryProps> = ({ contestHistory }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Filter attended contests and sort by startTime in descending order (most recent first)
  const attendedContests = useMemo(() => {
    return contestHistory
      .filter(c => c.attended)
      .sort((a, b) => (b.startTime || 0) - (a.startTime || 0));
  }, [contestHistory]);

  // Pagination
  const totalPages = Math.ceil(attendedContests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContests = attendedContests.slice(startIndex, endIndex);

  // Reset to page 1 when items per page changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  if (!contestHistory || contestHistory.length === 0) {
    return (
      <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-900">Contest History</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8 text-slate-600">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No contest history available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend?.toUpperCase()) {
      case 'UP':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'DOWN':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <span className="text-muted-foreground">—</span>;
    }
  };

  return (
    <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold text-slate-900">Contest History</CardTitle>
            <Badge variant="secondary" className="text-sm">
              {attendedContests.length} Contests Attended
            </Badge>
          </div>
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
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {paginatedContests.map((contest, index) => (
            <div
              key={index}
              className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-semibold text-slate-900">{contest.title}</h4>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(contest.startTime)}
                    </div>
                    {contest.finishTimeInSeconds > 0 && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(contest.finishTimeInSeconds)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(contest.trendDirection)}
                  <span className="text-lg font-bold text-slate-900">{Math.round(contest.rating)}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-200">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Problems Solved</p>
                  <p className="text-sm font-bold text-slate-900">
                    {contest.problemsSolved}/{contest.totalProblems || 4}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Ranking</p>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-600" />
                    <p className="text-sm font-bold text-slate-900">
                      #{contest.ranking?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Rating Change</p>
                  <p className={`text-sm font-bold ${
                    contest.trendDirection === 'UP' ? 'text-green-600' :
                    contest.trendDirection === 'DOWN' ? 'text-red-600' :
                    'text-slate-600'
                  }`}>
                    {contest.trendDirection === 'UP' ? '+' : ''}
                    {contest.trendDirection === 'DOWN' ? '-' : ''}
                    {contest.trendDirection === 'NONE' ? '—' : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200">
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
              <span className="text-sm text-slate-600">
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
      </CardContent>
    </Card>
  );
};

export default LeetCodeContestHistory;

