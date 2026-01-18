import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, Flame } from 'lucide-react';

interface LeetCodeActivityHeatmapProps {
  submissionCalendar: string; // JSON string with timestamp: count pairs
  streak?: number;
  totalActiveDays?: number;
}

const LeetCodeActivityHeatmap: React.FC<LeetCodeActivityHeatmapProps> = ({
  submissionCalendar,
  streak = 0,
  totalActiveDays = 0
}) => {
  const calendarData = useMemo(() => {
    if (!submissionCalendar || submissionCalendar.trim() === '' || submissionCalendar === '{}') {
      return [];
    }
    
    try {
      const parsed = typeof submissionCalendar === 'string' 
        ? JSON.parse(submissionCalendar) 
        : submissionCalendar;
      
      // Check if parsed is empty object
      if (!parsed || typeof parsed !== 'object' || Object.keys(parsed).length === 0) {
        return [];
      }
      
      // Convert to array of { date, count } format
      const data = Object.entries(parsed).map(([timestamp, count]) => ({
        date: new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0],
        count: count as number
      }));
      
      // Sort by date
      return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (e) {
      console.error('Error parsing submission calendar:', e, 'Raw data:', submissionCalendar?.substring(0, 100));
      return [];
    }
  }, [submissionCalendar]);

  if (calendarData.length === 0) {
    return (
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-xl font-heading flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Activity Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No activity data available yet</p>
            <p className="text-sm mt-1">Start solving problems to see your heatmap!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getColor = (count: number, maxCount: number) => {
    if (count === 0) return 'bg-[#FAFAFA] dark:bg-secondary/30 border border-[#A7F3D0]/30';
    const intensity = Math.min(count / maxCount, 1);
    if (intensity < 0.25) return 'bg-[#E6FFFA] dark:bg-cyan-500/20 border border-[#A7F3D0]';
    if (intensity < 0.5) return 'bg-[#B2F5EA] dark:bg-cyan-500/40 border border-[#2DD4BF]';
    if (intensity < 0.75) return 'bg-[#2DD4BF] dark:bg-cyan-500/60 border border-[#14B8A6]';
    return 'bg-[#0F766E] dark:bg-teal-600 border border-[#0D9488]';
  };

  const maxCount = Math.max(...calendarData.map(d => d.count), 1);

  // Generate last 365 days
  const today = new Date();
  const days: { date: string; count: number }[] = [];
  
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const existing = calendarData.find(d => d.date === dateStr);
    days.push({
      date: dateStr,
      count: existing?.count || 0
    });
  }

  // Group into weeks (Sunday to Saturday)
  const weeks: { date: string; count: number }[][] = [];
  let currentWeek: { date: string; count: number }[] = [];
  
  // Find the first Sunday before or on the first day
  const firstDate = new Date(days[0].date);
  const firstDayOfWeek = firstDate.getDay();
  const daysToSunday = firstDayOfWeek;
  
  // Add padding days if needed
  for (let i = daysToSunday - 1; i >= 0; i--) {
    const date = new Date(firstDate);
    date.setDate(date.getDate() - (i + 1));
    currentWeek.push({
      date: date.toISOString().split('T')[0],
      count: 0
    });
  }
  
  days.forEach((day) => {
    const date = new Date(day.date);
    const dayOfWeek = date.getDay();
    
    currentWeek.push(day);
    
    if (dayOfWeek === 6) { // Saturday
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  
  // Add remaining days to last week
  if (currentWeek.length > 0) {
    // Pad to Saturday
    while (currentWeek.length < 7) {
      const lastDate = new Date(currentWeek[currentWeek.length - 1].date);
      lastDate.setDate(lastDate.getDate() + 1);
      currentWeek.push({
        date: lastDate.toISOString().split('T')[0],
        count: 0
      });
    }
    weeks.push(currentWeek);
  }

  // Get month labels
  const monthLabels: { week: number; label: string }[] = [];
  weeks.forEach((week, weekIndex) => {
    if (week.length > 0) {
      const firstDay = new Date(week[0].date);
      if (firstDay.getDate() <= 7) {
        monthLabels.push({
          week: weekIndex,
          label: firstDay.toLocaleDateString('en-US', { month: 'short' })
        });
      }
    }
  });

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-heading flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Activity Heatmap
          </CardTitle>
          {(streak > 0 || totalActiveDays > 0) && (
            <div className="flex items-center gap-4">
              {streak > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-bold text-foreground">{streak} day streak</span>
                </div>
              )}
              {totalActiveDays > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span>{totalActiveDays} active days</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Month labels */}
          <div className="flex gap-[3px] ml-8">
            {monthLabels.map(({ week, label }) => (
              <div
                key={`${week}-${label}`}
                className="text-[10px] text-muted-foreground"
                style={{ gridColumnStart: week + 1 }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Heatmap */}
          <div className="overflow-x-auto">
            <div className="inline-flex gap-[3px]">
              {/* Day labels */}
              <div className="flex flex-col gap-[3px] pt-1">
                {['Mon', 'Wed', 'Fri'].map((day) => (
                  <div key={day} className="text-[10px] text-muted-foreground h-3 flex items-center">
                    {day}
                  </div>
                ))}
              </div>

              {/* Weeks */}
              <div className="flex gap-[3px]">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[3px]">
                    {week.map((day, dayIndex) => {
                      const date = new Date(day.date);
                      return (
                        <TooltipProvider key={`${weekIndex}-${dayIndex}`}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`w-3 h-3 rounded-sm ${getColor(day.count, maxCount)} cursor-pointer transition-all hover:ring-2 hover:ring-orange-500/50 hover:scale-110`}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                <p className="font-semibold">{day.count} {day.count === 1 ? 'submission' : 'submissions'}</p>
                                <p className="text-muted-foreground">
                                  {date.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
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
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-secondary/50 dark:bg-secondary/30" />
                <div className="w-3 h-3 rounded-sm bg-orange-400/40 dark:bg-orange-500/30" />
                <div className="w-3 h-3 rounded-sm bg-orange-500/60 dark:bg-orange-500/50" />
                <div className="w-3 h-3 rounded-sm bg-orange-600" />
                <div className="w-3 h-3 rounded-sm bg-orange-700" />
              </div>
              <span>More</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Last 365 days of activity
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeetCodeActivityHeatmap;

