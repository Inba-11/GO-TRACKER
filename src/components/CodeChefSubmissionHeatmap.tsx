import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface SubmissionHeatmapEntry {
  date: string;
  count: number;
  category?: number;
}

interface CodeChefSubmissionHeatmapProps {
  submissionHeatmap?: SubmissionHeatmapEntry[];
  submissionStats?: {
    daysWithSubmissions: number;
    maxDailySubmissions: number;
    avgDailySubmissions: number;
  };
  className?: string;
}

const CodeChefSubmissionHeatmap: React.FC<CodeChefSubmissionHeatmapProps> = ({
  submissionHeatmap = [],
  submissionStats,
  className = ""
}) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  // Convert submissionHeatmap array to date map
  const submissionMap = useMemo(() => {
    const map = new Map<string, number>();
    submissionHeatmap.forEach(entry => {
      if (entry.date && entry.count) {
        map.set(entry.date, entry.count);
      }
    });
    return map;
  }, [submissionHeatmap]);

  const getColor = (count: number, maxCount: number) => {
    if (count === 0) return 'bg-slate-100 border border-slate-200';
    const intensity = Math.min(count / maxCount, 1);
    if (intensity < 0.25) return 'bg-orange-600 border border-orange-700';
    if (intensity < 0.5) return 'bg-orange-700 border border-orange-800';
    if (intensity < 0.75) return 'bg-purple-700 border border-purple-800';
    return 'bg-purple-900 border border-purple-950';
  };

  const maxCount = submissionStats?.maxDailySubmissions || Math.max(...Array.from(submissionMap.values()), 1);

  // Generate days for selected month
  const days = useMemo(() => {
    const year = selectedYear;
    const month = selectedMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const daysArray: { date: string; count: number; dayOfWeek: number }[] = [];
    
    // Add padding days at the start (to align with Sunday)
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      daysArray.push({
        date: date.toISOString().split('T')[0],
        count: 0,
        dayOfWeek: date.getDay()
      });
    }
    
    // Add actual month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      daysArray.push({
        date: dateStr,
        count: submissionMap.get(dateStr) || 0,
        dayOfWeek: date.getDay()
      });
    }
    
    return daysArray;
  }, [selectedYear, selectedMonth, submissionMap]);

  // Group into weeks
  const weeks = useMemo(() => {
    const weeksArray: typeof days[] = [];
    let currentWeek: typeof days = [];
    
    days.forEach((day) => {
      currentWeek.push(day);
      if (day.dayOfWeek === 6) { // Saturday
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      // Pad to Saturday
      while (currentWeek.length < 7) {
        const lastDate = new Date(currentWeek[currentWeek.length - 1].date);
        lastDate.setDate(lastDate.getDate() + 1);
        currentWeek.push({
          date: lastDate.toISOString().split('T')[0],
          count: 0,
          dayOfWeek: lastDate.getDay()
        });
      }
      weeksArray.push(currentWeek);
    }
    
    return weeksArray;
  }, [days]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const yearOptions = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);
  const monthOptions = monthNames.map((name, index) => ({ value: index.toString(), label: name }));

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (submissionHeatmap.length === 0) {
    return (
      <Card className={`bg-white border border-orange-200 shadow-md rounded-xl ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            Submission Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8 text-slate-600">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50 text-orange-400" />
            <p>No submission data available yet</p>
            <p className="text-sm mt-1">Start solving problems to see your heatmap!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white border border-orange-200 shadow-md rounded-xl ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            Submission Heatmap
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Select
              value={monthOptions[selectedMonth].value}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger className="w-24 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
              className="h-8 w-8 p-0"
              disabled={selectedYear === new Date().getFullYear() && selectedMonth === new Date().getMonth()}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {submissionStats && (
          <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-4">
            <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
              <span className="text-slate-600 mr-1">Days with Submissions:</span>
              <span className="font-semibold">{submissionStats.daysWithSubmissions}</span>
            </Badge>
            <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
              <span className="text-slate-600 mr-1">Max Daily:</span>
              <span className="font-semibold">{submissionStats.maxDailySubmissions}</span>
            </Badge>
            <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
              <span className="text-slate-600 mr-1">Avg Daily:</span>
              <span className="font-semibold">{submissionStats.avgDailySubmissions.toFixed(2)}</span>
            </Badge>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-2">
              <div className="h-4"></div>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                <div key={idx} className="h-3 text-xs text-slate-600 text-center" style={{ width: '12px' }}>
                  {idx % 2 === 0 ? day : ''}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <TooltipProvider key={`${day.date}-${dayIndex}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-3 h-3 rounded-sm transition-all hover:ring-2 hover:ring-orange-400 cursor-pointer ${getColor(day.count, maxCount)}`}
                            style={{ minWidth: '12px', minHeight: '12px' }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <div className="font-semibold">{day.count} {day.count === 1 ? 'submission' : 'submissions'}</div>
                            <div className="text-slate-600">{formatDate(day.date)}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-end gap-4 mt-6 pt-4 border-t border-slate-200">
          <span className="text-xs text-slate-600">Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200" />
            <div className="w-3 h-3 rounded-sm bg-orange-600 border border-orange-700" />
            <div className="w-3 h-3 rounded-sm bg-orange-700 border border-orange-800" />
            <div className="w-3 h-3 rounded-sm bg-purple-700 border border-purple-800" />
            <div className="w-3 h-3 rounded-sm bg-purple-900 border border-purple-950" />
          </div>
          <span className="text-xs text-slate-600">More</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CodeChefSubmissionHeatmap;
