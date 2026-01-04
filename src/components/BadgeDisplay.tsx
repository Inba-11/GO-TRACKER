import React from 'react';
import { Badge } from '@/data/mockData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BadgeDisplayProps {
  badges: Badge[];
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badges }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-muted-foreground">Awards</h4>
        <span className="text-sm font-bold text-muted-foreground">{badges.length}</span>
      </div>
      <div className="flex justify-center w-full gap-4 flex-wrap">
        {badges.map((badge, index) => (
          <TooltipProvider key={badge.id || index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative cursor-pointer hover:scale-105 transition-transform">
                  {badge.icon && badge.icon.startsWith('http') ? (
                    <img 
                      src={badge.icon} 
                      alt={badge.name}
                      className="w-20 h-20 mx-auto object-contain"
                    />
                  ) : (
                    <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full border-2 border-amber-500/20">
                      <span className="text-3xl">{badge.icon || '🏅'}</span>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-medium">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                  {badge.earnedAt && (
                    <p className="text-xs text-primary mt-1">
                      Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        {badges.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">No badges earned yet. Keep coding!</p>
        )}
      </div>
    </div>
  );
};

export default BadgeDisplay;
