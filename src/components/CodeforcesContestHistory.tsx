import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, TrendingUp, TrendingDown, Target, ChevronLeft, ChevronRight } from 'lucide-react';

interface ContestHistoryEntry {
  title?: string;
  contestCode?: string;
  name?: string;
  date?: string;
  datetime?: string;
  rating?: number;
  rank?: number;
  ranking?: number;
  ratingChange?: number;
  problemsSolved?: number;
  problemsCount?: number;
  totalProblems?: number;
  attended?: boolean;
}

interface CodeforcesContestHistoryProps {
  contestHistory?: ContestHistoryEntry[];
  className?: string;
}

type SortOption = 'recent' | 'oldest' | 'rating-high' | 'rating-low';
type FilterOption = 'all' | 'attended' | 'rated';

const CodeforcesContestHistory: React.FC<CodeforcesContestHistoryProps> = ({
  contestHistory = [],
  className = ""
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Filter contests
  const filteredContests = useMemo(() => {
    let filtered = [...contestHistory];
    
    if (filterBy === 'attended') {
      filtered = filtered.filter(c => c.attended !== false);
    } else if (filterBy === 'rated') {
      filtered = filtered.filter(c => c.rating && c.rating > 0);
    }
    
    return filtered;
  }, [contestHistory, filterBy]);

  // Sort contests
  const sortedContests = useMemo(() => {
    const sorted = [...filteredContests];
    
    switch (sortBy) {
      case 'recent':
        return sorted.sort((a, b) => {
          const dateA = a.datetime || a.date ? new Date(a.datetime || a.date || '').getTime() : 0;
          const dateB = b.datetime || b.date ? new Date(b.datetime || b.date || '').getTime() : 0;
          return dateB - dateA; // Most recent first
        });
      case 'oldest':
        return sorted.sort((a, b) => {
          const dateA = a.datetime || a.date ? new Date(a.datetime || a.date || '').getTime() : 0;
          const dateB = b.datetime || b.date ? new Date(b.datetime || b.date || '').getTime() : 0;
          return dateA - dateB; // Oldest first
        });
      case 'rating-high':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'rating-low':
        return sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
      default:
        return sorted;
    }
  }, [filteredContests, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedContests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContests = sortedContests.slice(startIndex, endIndex);

  // Reset to page 1 when filters/sort change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, filterBy, itemsPerPage]);

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

  const getRatingChangeColor = (change?: number) => {
    if (!change || change === 0) return 'text-slate-600';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getRatingChangeIcon = (change?: number) => {
    if (!change || change === 0) return null;
    return change > 0 ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  if (contestHistory.length === 0) {
    return (
      <Card className={`bg-white border border-slate-200 shadow-sm rounded-lg ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-600" />
            Contest History
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8 text-slate-600">
            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No contest history available</p>
            <p className="text-sm mt-1">Participate in contests to see your history!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white border border-slate-200 shadow-sm rounded-lg ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-600" />
            <CardTitle className="text-lg font-semibold text-slate-900">Contest History</CardTitle>
            <Badge variant="secondary" className="text-sm">
              {filteredContests.length} {filteredContests.length === 1 ? 'Contest' : 'Contests'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contests</SelectItem>
                <SelectItem value="attended">Attended Only</SelectItem>
                <SelectItem value="rated">Rated Only</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="rating-high">Rating High</SelectItem>
                <SelectItem value="rating-low">Rating Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
              <SelectTrigger className="w-20 h-8 text-xs">
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
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {paginatedContests.map((contest, index) => (
            <div
              key={`${contest.contestCode || contest.title || contest.name || index}-${index}`}
              className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Trophy className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <h4 className="font-semibold text-slate-900 truncate">
                      {contest.title || contest.name || contest.contestCode || 'Unknown Contest'}
                    </h4>
                    {contest.contestCode && (
                      <Badge variant="outline" className="text-xs">
                        {contest.contestCode}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(contest.datetime || contest.date)}
                    </div>
                    {contest.attended !== false && contest.rating && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-indigo-600">{contest.rating}</span>
                        <span className="text-slate-600">rating</span>
                      </div>
                    )}
                    {(contest.rank || contest.ranking) && (
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        <span className="font-medium text-indigo-600">#{(contest.rank || contest.ranking)?.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  {contest.problemsSolved !== undefined && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                        {contest.problemsSolved} problem{contest.problemsSolved !== 1 ? 's' : ''} solved
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  {contest.ratingChange !== undefined && contest.ratingChange !== null && (
                    <div className={`flex items-center gap-1 ${getRatingChangeColor(contest.ratingChange)}`}>
                      {getRatingChangeIcon(contest.ratingChange)}
                      <span className="font-semibold text-sm">
                        {contest.ratingChange > 0 ? '+' : ''}{contest.ratingChange}
                      </span>
                    </div>
                  )}
                  {contest.problemsCount !== undefined && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-indigo-600">{contest.problemsCount}</div>
                      <div className="text-xs text-slate-600">Problems</div>
                    </div>
                  )}
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

export default CodeforcesContestHistory;
