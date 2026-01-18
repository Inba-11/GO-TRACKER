import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Trophy, Calendar, Target, Activity, User,
  ChevronRight
} from 'lucide-react';
import CodeChefContestHistory from './CodeChefContestHistory';
import CodeChefSubmissionHeatmap from './CodeChefSubmissionHeatmap';

interface ContestHistoryEntry {
  contestCode: string;
  name: string;
  date: string;
  rating: number;
  rank: number;
  ratingChange: number;
  problemsSolved: string[];
  problemsCount: number;
  attended: boolean;
}

interface SubmissionHeatmapEntry {
  date: string;
  count: number;
  category?: number;
}

interface SubmissionStats {
  daysWithSubmissions: number;
  maxDailySubmissions: number;
  avgDailySubmissions: number;
}

interface CodeChefUnifiedDashboardProps {
  contestHistory?: ContestHistoryEntry[];
  submissionHeatmap?: SubmissionHeatmapEntry[];
  submissionStats?: SubmissionStats;
  fullySolved?: number;
  partiallySolved?: number;
  institution?: string;
  country?: string;
  className?: string;
}

enum CodeChefSection {
  CONTEST_HISTORY = 'contest-history',
  HEATMAP = 'heatmap',
  PROBLEM_STATS = 'problem-stats',
  SUBMISSION_STATS = 'submission-stats',
  PROFILE = 'profile'
}

const CodeChefUnifiedDashboard: React.FC<CodeChefUnifiedDashboardProps> = ({
  contestHistory = [],
  submissionHeatmap = [],
  submissionStats,
  fullySolved = 0,
  partiallySolved = 0,
  institution = '',
  country = '',
  className = ""
}) => {
  const [activeSection, setActiveSection] = useState<CodeChefSection>(CodeChefSection.CONTEST_HISTORY);

  const sections = [
    {
      id: CodeChefSection.CONTEST_HISTORY,
      label: 'Contest History',
      icon: Trophy,
      color: 'text-indigo-600',
      available: contestHistory && contestHistory.length > 0
    },
    {
      id: CodeChefSection.HEATMAP,
      label: 'Submission Heatmap',
      icon: Calendar,
      color: 'text-indigo-600',
      available: submissionHeatmap && submissionHeatmap.length > 0
    },
    {
      id: CodeChefSection.PROBLEM_STATS,
      label: 'Problem Breakdown',
      icon: Target,
      color: 'text-indigo-600',
      available: true // Always available, shows empty state if no data
    },
    {
      id: CodeChefSection.SUBMISSION_STATS,
      label: 'Submission Stats',
      icon: Activity,
      color: 'text-indigo-600',
      available: !!submissionStats
    },
    {
      id: CodeChefSection.PROFILE,
      label: 'Profile Info',
      icon: User,
      color: 'text-indigo-600',
      available: !!(institution || country)
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case CodeChefSection.CONTEST_HISTORY:
        return (
          <CodeChefContestHistory 
            contestHistory={contestHistory}
            className="w-full"
          />
        );
      
      case CodeChefSection.HEATMAP:
        return (
          <CodeChefSubmissionHeatmap 
            submissionHeatmap={submissionHeatmap}
            submissionStats={submissionStats}
            className="w-full"
          />
        );
      
      case CodeChefSection.PROBLEM_STATS:
        return (
          <Card className="bg-white border border-slate-200 shadow-sm rounded-lg w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Problem Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-indigo-600 mb-2">{fullySolved}</div>
                    <div className="text-sm text-slate-600">Fully Solved</div>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-indigo-600 mb-2">{partiallySolved}</div>
                    <div className="text-sm text-slate-600">Partially Solved</div>
                  </div>
                </div>
              </div>
              {fullySolved + partiallySolved > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-slate-600 mb-2">
                    <span>Total Problems Solved</span>
                    <span className="font-semibold text-indigo-600">{fullySolved + partiallySolved}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-indigo-600 h-3 rounded-full transition-all"
                      style={{ width: `${((fullySolved + partiallySolved) / Math.max(fullySolved + partiallySolved, 1)) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      
      case CodeChefSection.SUBMISSION_STATS:
        return (
          <Card className="bg-white border border-slate-200 shadow-sm rounded-lg w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Submission Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {submissionStats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-600 mb-1">{submissionStats.daysWithSubmissions}</div>
                      <div className="text-sm text-slate-600">Days with Submissions</div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-600 mb-1">{submissionStats.maxDailySubmissions}</div>
                      <div className="text-sm text-slate-600">Max Daily Submissions</div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-600 mb-1">{submissionStats.avgDailySubmissions.toFixed(2)}</div>
                      <div className="text-sm text-slate-600">Avg Daily Submissions</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-600">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No submission statistics available</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      
      case CodeChefSection.PROFILE:
        return (
          <Card className="bg-white border border-slate-200 shadow-sm rounded-lg w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {institution && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-medium text-slate-600">Institution</span>
                    </div>
                    <p className="text-slate-900">{institution}</p>
                  </div>
                )}
                {country && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-medium text-slate-600">Country</span>
                    </div>
                    <p className="text-slate-900">{country}</p>
                  </div>
                )}
                {!institution && !country && (
                  <div className="text-center py-8 text-slate-600">
                    <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No profile information available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className={`bg-white border border-slate-200 shadow-sm rounded-lg ${className}`}>
      <div className="flex flex-col lg:flex-row gap-0 min-h-[600px]">
        {/* Main Content Area - Left Side (80%) */}
        <div className="flex-1 lg:w-4/5 p-4 lg:p-6">
          <div className="transition-all duration-300 min-h-[500px]">
            {renderContent()}
          </div>
        </div>

        {/* Right Sidebar Navigation - Right Side (20%) */}
        <div className="lg:w-1/5 border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50">
          <div className="sticky top-4 p-3 lg:p-4 space-y-2">
            <h3 className="text-xs lg:text-sm font-semibold text-slate-600 mb-3 lg:mb-4 px-2 hidden lg:block">
              Navigation
            </h3>
            {/* Mobile: Horizontal scrollable tabs */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 lg:space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    disabled={!section.available}
                    className={`
                      flex-shrink-0 lg:w-full flex items-center gap-2 lg:gap-3 px-3 py-2 lg:py-2.5 rounded-lg
                      transition-all duration-200 whitespace-nowrap
                    ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : section.available
                        ? 'bg-white hover:bg-slate-100 text-slate-900 hover:shadow-sm border border-slate-200'
                        : 'bg-slate-50 text-slate-400 opacity-50 cursor-not-allowed border border-slate-200'
                    }
                    `}
                  >
                  <Icon 
                    className={`w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0 ${
                      isActive ? 'text-white' : section.color
                    }`}
                    />
                    <span className="text-xs lg:text-sm font-medium flex-1 text-left">
                      {section.label}
                    </span>
                    {isActive && (
                      <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0 hidden lg:block" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CodeChefUnifiedDashboard;

