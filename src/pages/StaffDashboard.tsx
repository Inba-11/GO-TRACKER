import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { studentsAPI, statsAPI, Student, TopPerformers } from '@/services/api';
import TopPerformerCard from '@/components/TopPerformerCard';
import StudentCard from '@/components/StudentCard';
import { LogOut, Users, Trophy, TrendingUp, Code, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type BatchFilter = 'ALL' | 'A' | 'B' | 'C' | 'D' | 'NON-CRT';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformers | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<BatchFilter>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch students and top performers in parallel
        const [studentsResponse, topPerformersResponse] = await Promise.all([
          studentsAPI.getAll({ batch: selectedBatch === 'ALL' ? undefined : selectedBatch }),
          statsAPI.getTopPerformers()
        ]);

        if (studentsResponse.success && studentsResponse.data) {
          setStudents(studentsResponse.data);
        }

        if (topPerformersResponse.success && topPerformersResponse.data) {
          setTopPerformers(topPerformersResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedBatch, toast]);

  // Fetch students when batch filter changes
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await studentsAPI.getAll({ 
          batch: selectedBatch === 'ALL' ? undefined : selectedBatch 
        });
        
        if (response.success && response.data) {
          setStudents(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch students:', error);
      }
    };

    if (selectedBatch !== 'ALL') {
      fetchStudents();
    }
  }, [selectedBatch]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const totalProblems = students.reduce((acc, s) => 
    acc + (s.platforms.codechef?.problemsSolved || 0) + 
    (s.platforms.hackerrank?.problemsSolved || 0) + 
    (s.platforms.leetcode?.problemsSolved || 0) + 
    (s.platforms.atcoder?.problemsSolved || 0), 0
  );

  const totalContributions = students.reduce((acc, s) => 
    acc + (s.platforms.github?.contributions || 0), 0
  );

  const batches: { value: BatchFilter; label: string }[] = [
    { value: 'ALL', label: 'All Students' },
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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Staff Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: 'Total Students', value: students.length, color: 'text-primary' },
            { icon: Code, label: 'Problems Solved', value: totalProblems.toLocaleString(), color: 'text-orange-500' },
            { icon: Trophy, label: 'Active Platforms', value: '6', color: 'text-amber-500' },
            { icon: TrendingUp, label: 'GitHub Contributions', value: totalContributions.toLocaleString(), color: 'text-emerald-500' },
          ].map((stat) => (
            <Card key={stat.label} className="bg-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-card border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer" 
                  onClick={() => navigate('/staff/contest-tracker')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">Contest Tracker</h3>
                    <p className="text-sm text-muted-foreground">Monitor live contest performance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => navigate('/staff/analytics')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-emerald-500/10">
                    <TrendingUp className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">Analytics</h3>
                    <p className="text-sm text-muted-foreground">View detailed performance analytics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Top Performers Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Top Performers</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {topPerformers?.codechef && (
              <TopPerformerCard 
                platform="codechef" 
                student={{ ...topPerformers.codechef, id: topPerformers.codechef._id }} 
                onClick={() => navigate(`/staff/student/${topPerformers.codechef._id}`)}
              />
            )}
            {topPerformers?.hackerrank && (
              <TopPerformerCard 
                platform="hackerrank" 
                student={{ ...topPerformers.hackerrank, id: topPerformers.hackerrank._id }} 
                onClick={() => navigate(`/staff/student/${topPerformers.hackerrank._id}`)}
              />
            )}
            {topPerformers?.leetcode && (
              <TopPerformerCard 
                platform="leetcode" 
                student={{ ...topPerformers.leetcode, id: topPerformers.leetcode._id }} 
                onClick={() => navigate(`/staff/student/${topPerformers.leetcode._id}`)}
              />
            )}
            {topPerformers?.atcoder && (
              <TopPerformerCard 
                platform="atcoder" 
                student={{ ...topPerformers.atcoder, id: topPerformers.atcoder._id }} 
                onClick={() => navigate(`/staff/student/${topPerformers.atcoder._id}`)}
              />
            )}
            {topPerformers?.codeforces && (
              <TopPerformerCard 
                platform="codeforces" 
                student={{ ...topPerformers.codeforces, id: topPerformers.codeforces._id }} 
                onClick={() => navigate(`/staff/student/${topPerformers.codeforces._id}`)}
              />
            )}
            {topPerformers?.github && (
              <TopPerformerCard 
                platform="github" 
                student={{ ...topPerformers.github, id: topPerformers.github._id }} 
                onClick={() => navigate(`/staff/student/${topPerformers.github._id}`)}
              />
            )}
          </div>
        </section>

        {/* All Students Section with Batch Filter */}
        <section>
          <Card className="bg-card border-border/50">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="font-heading">
                  Students - Sorted by Roll Number
                  {selectedBatch !== 'ALL' && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({students.length} students)
                    </span>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value as BatchFilter)}
                    className="px-3 py-1 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {batches.map((batch) => (
                      <option key={batch.value} value={batch.value}>
                        {batch.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading students...</p>
                </div>
              ) : students.length > 0 ? (
                <div className="grid gap-4 max-h-96 overflow-y-auto">
                  {students.map((student, index) => (
                    <StudentCard
                      key={student._id}
                      student={{ ...student, id: student._id }}
                      rank={index + 1}
                      onClick={() => navigate(`/staff/student/${student._id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No students found for this batch.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default StaffDashboard;
