import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Medal, ChevronDown, ChevronUp, Award } from 'lucide-react';

interface BadgeEntry {
  id: string;
  displayName: string;
  icon: string;
  creationDate: string;
}

interface LeetCodeBadgesSectionProps {
  badges: BadgeEntry[];
  activeBadge?: string;
}

const LeetCodeBadgesSection: React.FC<LeetCodeBadgesSectionProps> = ({ badges, activeBadge }) => {
  const [showAll, setShowAll] = useState(false);
  const [expandedBadge, setExpandedBadge] = useState<string | null>(null);

  if (!badges || badges.length === 0) {
    return (
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-xl font-heading flex items-center gap-2">
            <Medal className="w-5 h-5" />
            Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No badges earned yet</p>
            <p className="text-sm mt-1">Keep solving problems to earn badges!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayedBadges = showAll ? badges : badges.slice(0, 8);
  const hasMore = badges.length > 8;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-heading flex items-center gap-2">
            <Medal className="w-5 h-5" />
            Badges
            <Badge variant="secondary" className="ml-2">
              {badges.length}
            </Badge>
          </CardTitle>
          {activeBadge && (
            <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30">
              <Award className="w-3 h-3 mr-1" />
              Active: {activeBadge}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {displayedBadges.map((badge, index) => {
            const isActive = activeBadge && badge.displayName.toLowerCase().includes(activeBadge.toLowerCase());
            const isExpanded = expandedBadge === badge.id;

            return (
              <div
                key={badge.id || index}
                className={`p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/10 border-amber-500/30 ring-2 ring-amber-500/20'
                    : 'bg-secondary/30 border-border/50 hover:bg-secondary/50'
                }`}
                onClick={() => setExpandedBadge(isExpanded ? null : badge.id)}
              >
                {badge.icon && (
                  <div className="mb-3 flex justify-center">
                    <img
                      src={badge.icon}
                      alt={badge.displayName}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="text-center">
                  <h4 className="font-semibold text-sm text-foreground mb-1 flex items-center justify-center gap-1">
                    {badge.displayName}
                    {isActive && <Award className="w-3 h-3 text-amber-500" />}
                  </h4>
                  {isExpanded && badge.creationDate && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Earned: {formatDate(badge.creationDate)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {hasMore && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show All ({badges.length} badges)
                </>
              )}
            </Button>
          </div>
        )}

        {!hasMore && badges.length > 0 && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Showing all {badges.length} badges
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeetCodeBadgesSection;

