import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HeatmapCalendarProps {
  data: { date: string; count: number }[];
  title?: string;
  colorScheme?: 'primary' | 'custom';
  customColor?: string; // Hex color like '#2DD4BF'
}

const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({ 
  data, 
  title = 'Activity Heatmap',
  colorScheme = 'primary',
  customColor = '#2DD4BF'
}) => {
  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
        <div className="p-8 text-center bg-secondary/20 rounded-lg border border-border/50">
          <p className="text-sm text-muted-foreground">No activity data available yet</p>
          <p className="text-xs text-muted-foreground mt-1">Start solving problems to see your heatmap!</p>
        </div>
      </div>
    );
  }

  const getColor = (count: number) => {
    if (count === 0) return 'bg-secondary/50';
    if (colorScheme === 'custom') {
      // For custom colors, we'll use inline styles
      return '';
    } else {
      if (count <= 2) return 'bg-primary/30';
      if (count <= 4) return 'bg-primary/50';
      if (count <= 6) return 'bg-primary/70';
      return 'bg-primary';
    }
  };

  const getCustomColorStyle = (count: number) => {
    if (colorScheme === 'custom' && count > 0) {
      const opacity = count <= 2 ? 0.3 : count <= 4 ? 0.5 : count <= 6 ? 0.7 : 1.0;
      // Convert hex color to rgba
      const hex = customColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return {
        backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacity})`,
      };
    }
    return {};
  };

  // Group data by weeks
  const weeks: { date: string; count: number }[][] = [];
  let currentWeek: { date: string; count: number }[] = [];

  data.forEach((day, index) => {
    const date = new Date(day.date);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentWeek.push(day);

    if (index === data.length - 1 && currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground">{title}</h4>
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1">
          {/* Day labels */}
          <div className="flex gap-1 mb-1">
            <div className="w-8" />
            {[1, 3, 5].map((dayIndex) => (
              <div key={dayIndex} className="text-[10px] text-muted-foreground h-3">
                {days[dayIndex]}
              </div>
            ))}
          </div>
          
          <div className="flex gap-[3px]">
            {weeks.slice(-13).map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.map((day) => {
                  const date = new Date(day.date);
                  const colorClass = getColor(day.count);
                  const customStyle = getCustomColorStyle(day.count);
                  const hasCustomStyle = Object.keys(customStyle).length > 0;
                  return (
                    <TooltipProvider key={day.date}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-3 h-3 rounded-sm ${hasCustomStyle ? '' : colorClass} cursor-pointer transition-all hover:ring-2 ${colorScheme === 'custom' ? 'hover:ring-[#2DD4BF]/50' : 'hover:ring-primary/50'}`}
                            style={hasCustomStyle ? customStyle : undefined}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            {day.count} submissions on {date.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-secondary/50" />
          {colorScheme === 'custom' ? (
            <>
              <div className="w-3 h-3 rounded-sm opacity-30" style={{ backgroundColor: customColor }} />
              <div className="w-3 h-3 rounded-sm opacity-50" style={{ backgroundColor: customColor }} />
              <div className="w-3 h-3 rounded-sm opacity-70" style={{ backgroundColor: customColor }} />
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: customColor }} />
            </>
          ) : (
            <>
              <div className="w-3 h-3 rounded-sm bg-primary/30" />
              <div className="w-3 h-3 rounded-sm bg-primary/50" />
              <div className="w-3 h-3 rounded-sm bg-primary/70" />
              <div className="w-3 h-3 rounded-sm bg-primary" />
            </>
          )}
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default HeatmapCalendar;
