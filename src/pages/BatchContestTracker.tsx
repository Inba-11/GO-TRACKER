import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { students, getStudentsByBatch } from '@/data/mockData';
import { ArrowLeft, Users, Trophy, TrendingUp, Code, Clock, Target, Award, RefreshCw } from 'lucide-react';

interface ContestData {
  id: string;
  name: string;
  platform: 'leetcode' | 'codechef' | 'codeforces';
  totalQuestions: number;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'live' | 'completed';
}

interface StudentContestProgress {
  studentId: string;
  contestId: string;
  questionsSolved: number;
  ratingBefore: number;
  ratingAfter: number | null;
  lastUpdated: string;
}

// Mock contest data
const mockContests: ContestData[] = [
  {
    id: 'lc-weekly-378',
    name: 'LeetCode Weekly Contest 378',
    platform: 'leetcode',
    totalQuestions: 4,
    startTime: '2024-01-07T14:30:00Z',
    endTime: '2024-01-07T16:00:00Z',
    status: 'completed'
  },
  {
    id: 'cc-starters-115',
    name: 'CodeChef Starters 115',
    platform: 'codechef',
    totalQuestions: 8,
    startTime: '2024-01-10T14:30:00Z',
    endTime: '2024-01-10T17:00:00Z',
    status: 'live'
  },
  {
    id: 'cf-round-918',
    name: 'Codeforces Round 918',
    platform: 'codeforces',
    totalQuestions: 6,
    startTime: '2024-01-12T14:35:00Z',
    endTime: '2024-01-12T16:35:00Z',
    status: 'upcoming'
  }
];

// Mock student progress data
const generateMockProgress = (): StudentContestProgress[] => {
  const progress: StudentContestProgress[] = [];
  
  students.forEach(student => {
    mockContests.forEach(contest => {
      if (contest.status !== 'upcoming') {
        const questionsSolved = Math.floor(Math.random() * (contest.totalQuestions + 1));
        const ratingBefore = student.platforms[contest.platform].rating - Math.floor(Math.random() * 100);
        const ratingAfter = contest.status === 'completed' ? 
          ratingBefore + Math.floor(Math.random() * 200) - 50 : null;
        
        progress.push({
          studentId: student.id,
          contestId: contest.id,
          questionsSolved,
          ratingBefore,
          ratingAfter,
          lastUpdated: new Date().toISOString()
        });
      }
    });
  });
  
  return progress;
};

type BatchFilter = 'ALL' | 'A' | 'B' | 'C' | 'D' | 'NON-CRT';

const BatchContestTracker = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedBatch, setSelectedBatch] = useState<BatchFilter>('ALL');
  const [selectedContest, setSelectedContest] = useState<string>(mockContests[0]?.id || '');
  const [studentProgress, setStudentProgress] = useState<StudentContestProgress[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    // Initialize mock data
    setStudentProgress(generateMockProgress());
  }, []);

  const refreshData = () => {
    setStudentProgress(generateMockProgress());
    setLastRefresh(new Date());
  };

  const filteredStudents = getStudentsByBatch(selectedBatch);
  const selectedContestData = mockContests.find(c => c.id === selectedContest);
  
  const getStudentProgress = (studentId: string, contestId: string) => {
    return studentProgress.find(p => p.studentId === studentId && p.contestId === contestId);
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'leetcode': return 'bg-orange-500';
      case 'codechef': return 'bg-amber-600';
      case 'codeforces': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'upcoming': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const batches: { value: BatchFilter; label: string }[] = [
    { value: 'ALL', label: 'All Batches' },
    { value: 'A', label: 'Batch A' },
    { value: 'B', label: 'Batch B' },
    { value: 'C', label: 'Batch C' },
    { value: 'D', label: 'Batch D' },
    { value: 'NON-CRT', label: 'Non-CRT' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-effect border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/staff/dashboard')} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-heading font-bold text-foreground">Contest Tracker</h1>
                <p className="text-sm text-muted-foreground">Monitor student performance in live contests</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={refreshData} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Badge variant="secondary">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Contest Selection */}
        <section className="mb-8">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Select Contest</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {mockContests.map((contest) => (
              <Card 
                key={contest.id} 
                className={`cursor-pointer transition-all ${
                  selectedContest === contest.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-secondary/50'
                }`}
                onClick={() => setSelectedContest(contest.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{contest.name}</CardTitle>
                    <Badge className={getStatusColor(contest.status)}>
                      {contest.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getPlatformColor(contest.platform)}`} />
                      <span className="text-sm capitalize">{contest.platform}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{contest.totalQuestions} Questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(contest.startTime).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Batch Filter */}
        <section className="mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-heading font-semibold text-foreground">Filter by Batch:</h3>
            <div className="flex gap-2">
              {batches.map((batch) => (
                <Button
                  key={batch.value}
                  variant={selectedBatch === batch.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedBatch(batch.value)}
                >
                  {batch.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Student Progress Table */}
        {selectedContestData && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-heading font-bold text-foreground">
                {selectedContestData.name} - Student Progress
              </h3>
              <div className="flex items-center gap-4">
                <Badge variant="outline">
                  {filteredStudents.length} Students
                </Badge>
                <Badge className={getStatusColor(selectedContestData.status)}>
                  {selectedContestData.status}
                </Badge>
              </div>
            </div>

            <Card className="bg-card border-border/50">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr className="bg-secondary/50">
                        <th className="text-left p-4 font-semibold">Student</th>
                        <th className="text-left p-4 font-semibold">Batch</th>
                        <th className="text-center p-4 font-semibold">Questions Solved</th>
                        <th className="text-center p-4 font-semibold">Rating Before</th>
                        <th className="text-center p-4 font-semibold">Rating After</th>
                        <th className="text-center p-4 font-semibold">Change</th>
                        <th className="text-center p-4 font-semibold">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => {
                        const progress = getStudentProgress(student.id, selectedContest);
                        const ratingChange = progress?.ratingAfter && progress?.ratingBefore 
                          ? progress.ratingAfter - progress.ratingBefore 
                          : null;
                        const progressPercentage = progress 
                          ? (progress.questionsSolved / selectedContestData.totalQuestions) * 100 
                          : 0;

                        return (
                          <tr key={student.id} className="border-b border-border hover:bg-secondary/30">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={student.avatar} 
                                  alt={student.name}
                                  className="w-8 h-8 rounded-full"
                                />
                                <div>
                                  <p className="font-medium text-foreground">{student.name}</p>
                                  <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline">{student.batch}</Badge>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-lg font-bold text-foreground">
                                  {progress?.questionsSolved || 0}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  / {selectedContestData.totalQuestions}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className="font-medium text-foreground">
                                {progress?.ratingBefore || student.platforms[selectedContestData.platform].rating}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {progress?.ratingAfter ? (
                                <span className="font-medium text-foreground">
                                  {progress.ratingAfter}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              {ratingChange !== null ? (
                                <Badge 
                                  variant={ratingChange >= 0 ? 'default' : 'destructive'}
                                  className={ratingChange >= 0 ? 'bg-green-500' : ''}
                                >
                                  {ratingChange >= 0 ? '+' : ''}{ratingChange}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-secondary rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{ width: `${progressPercentage}%` }}
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground min-w-[3rem]">
                                  {Math.round(progressPercentage)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
};

export default BatchContestTracker;