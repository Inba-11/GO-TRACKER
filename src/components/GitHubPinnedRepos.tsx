import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FolderGit2, Star, GitBranch, ExternalLink, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface PinnedRepository {
  name: string;
  description?: string;
  url: string;
  stars?: number;
  forks?: number;
  language?: string;
  languageColor?: string;
  updatedAt?: string;
  isPrivate?: boolean;
}

interface GitHubPinnedReposProps {
  pinnedRepositories?: PinnedRepository[];
  className?: string;
}

type SortOption = 'stars' | 'updated' | 'name';
type ItemsPerPage = 6 | 9 | 12 | 0; // 0 means "All"

const GitHubPinnedRepos: React.FC<GitHubPinnedReposProps> = ({
  pinnedRepositories = [],
  className = ""
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPage>(6);
  const [sortBy, setSortBy] = useState<SortOption>('stars');

  // Sort repositories
  const sortedRepos = useMemo(() => {
    const sorted = [...pinnedRepositories];
    
    switch (sortBy) {
      case 'stars':
        return sorted.sort((a, b) => (b.stars || 0) - (a.stars || 0));
      case 'updated':
        return sorted.sort((a, b) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return dateB - dateA; // Most recent first
        });
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }, [pinnedRepositories, sortBy]);

  // Pagination
  const totalItems = sortedRepos.length;
  const displayItems = itemsPerPage === 0 ? sortedRepos : sortedRepos;
  const totalPages = itemsPerPage === 0 ? 1 : Math.ceil(totalItems / itemsPerPage);
  const startIndex = itemsPerPage === 0 ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = itemsPerPage === 0 ? totalItems : startIndex + itemsPerPage;
  const paginatedRepos = displayItems.slice(startIndex, endIndex);

  // Reset to page 1 when sort/items per page change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, itemsPerPage]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
      return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
    } catch {
      return dateString;
    }
  };

  const getLanguageColor = (color?: string) => {
    if (!color) return '#64748B';
    return color;
  };

  if (pinnedRepositories.length === 0) {
    return (
      <Card className={`bg-white border border-slate-200 shadow-sm rounded-lg ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-600" />
            Pinned Repositories
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8 text-slate-600">
            <FolderGit2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No pinned repositories available</p>
            <p className="text-sm mt-1">Pin repositories on GitHub to see them here!</p>
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
            <FolderGit2 className="w-5 h-5 text-indigo-600" />
            <CardTitle className="text-lg font-semibold text-slate-900">Pinned Repositories</CardTitle>
            <Badge variant="secondary" className="text-sm">
              {totalItems} {totalItems === 1 ? 'Repository' : 'Repositories'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stars">Most Stars</SelectItem>
                <SelectItem value="updated">Recently Updated</SelectItem>
                <SelectItem value="name">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={itemsPerPage === 0 ? 'all' : itemsPerPage.toString()} 
              onValueChange={(value) => setItemsPerPage(value === 'all' ? 0 : parseInt(value) as ItemsPerPage)}
            >
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6/page</SelectItem>
                <SelectItem value="9">9/page</SelectItem>
                <SelectItem value="12">12/page</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedRepos.map((repo, index) => (
            <Card
              key={`${repo.name}-${index}`}
              className="bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group rounded-lg"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FolderGit2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors truncate flex items-center gap-1"
                      >
                        {repo.name}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                      {repo.isPrivate && (
                        <Badge variant="outline" className="text-xs">
                          Private
                        </Badge>
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                        {repo.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-3">
                {repo.language && (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getLanguageColor(repo.languageColor) }}
                    />
                    <span className="text-sm text-slate-600">{repo.language}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-sm">
                  {repo.stars !== undefined && (
                    <div className="flex items-center gap-1 text-slate-600">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-indigo-600">{repo.stars}</span>
                    </div>
                  )}
                  {repo.forks !== undefined && (
                    <div className="flex items-center gap-1 text-slate-600">
                      <GitBranch className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium text-indigo-600">{repo.forks}</span>
                    </div>
                  )}
                  {repo.updatedAt && (
                    <div className="flex items-center gap-1 text-slate-600">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs">{formatDate(repo.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Pagination */}
        {itemsPerPage > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200">
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

export default GitHubPinnedRepos;
