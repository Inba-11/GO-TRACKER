import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { studentsAPI, Student } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, Building, Hash, ExternalLink, FileText, Download, Edit, Eye, Upload, Target, GitBranch, Trophy, Award, Flame, TrendingUp } from 'lucide-react';
import PlatformStatsCard from '@/components/PlatformStatsCard';
import PerformanceChart from '@/components/PerformanceChart';
import ComparisonPieChart from '@/components/ComparisonPieChart';
import HeatmapCalendar from '@/components/HeatmapCalendar';
import BadgeDisplay from '@/components/BadgeDisplay';
import { useToast } from '@/hooks/use-toast';

const StudentProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Fetch student data on component mount
  useEffect(() => {
    const fetchStudent = async () => {
      if (!id) {
        setError('No student ID provided');
        setIsLoading(false);
        return;
      }
      
      console.log('=== STUDENT PROFILE DEBUG ===');
      console.log('Student ID:', id);
      console.log('Frontend URL:', window.location.origin);
      console.log('API Base URL:', import.meta.env.VITE_API_URL);
      
      try {
        setIsLoading(true);
        setError('');
        
        // Direct fetch test
        const apiUrl = `http://localhost:5000/api/students/${id}`;
        console.log('Fetching from:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success && data.data) {
          console.log('✅ Student data loaded successfully');
          setStudent(data.data);
        } else {
          console.error('❌ API returned error:', data.error);
          setError(data.error || 'Failed to load student data');
        }
      } catch (error: any) {
        console.error('❌ Fetch error:', error);
        setError(`Network error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading student profile...</p>
          <p className="mt-1 text-xs text-muted-foreground">Student ID: {id}</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
            {error ? 'Error Loading Student' : 'Student Not Found'}
          </h1>
          <p className="text-muted-foreground mb-2">Student ID: {id}</p>
          {error && (
            <p className="text-red-500 mb-4 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}
          <p className="text-muted-foreground mb-4 text-sm">
            Check the browser console (F12) for detailed error information.
          </p>
          <div className="space-y-2">
            <Button onClick={() => navigate(-1)} className="mr-2">Go Back</Button>
            <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  const totalProblems = 
    (student.platforms?.codechef?.problemsSolved || 0) +
    (student.platforms?.leetcode?.problemsSolved || 0) +
    (student.platforms?.codeforces?.problemsSolved || 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-effect border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="bg-card border-border/50 overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-500 opacity-90" />
            <CardContent className="relative pt-0">
              <div className="flex flex-col md:flex-row gap-6 -mt-16">
                <Avatar className="w-32 h-32 border-4 border-card shadow-xl">
                  <AvatarImage 
                    src={student.avatar} 
                    alt={student.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${student.name}&background=dc143c&color=ffffff&size=128&font-size=0.4&bold=true&format=png`;
                    }}
                  />
                  <AvatarFallback className="text-3xl font-bold">
                    {student.name?.split(' ').map((n: string) => n[0]).join('') || 'N/A'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 pt-4 md:pt-8">
                  <h1 className="text-3xl font-heading font-bold text-foreground mb-2">{student.name || 'Unknown Student'}</h1>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {student.email || 'No email'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      {student.department || 'No department'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Hash className="w-4 h-4" />
                      {student.rollNumber || 'No roll number'} • {student.batch || 'No batch'} Batch
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Target, label: 'Total Problems', value: totalProblems, color: 'text-orange-500' },
            { icon: GitBranch, label: 'GitHub Commits', value: student.platforms?.github?.commits || 0, color: 'text-emerald-500' },
            { icon: Flame, label: 'Current Streak', value: `${student.platforms?.github?.streak || 0} days`, color: 'text-red-500' },
            { icon: Trophy, label: 'Max Streak', value: `${student.platforms?.github?.longestStreak || 0} days`, color: 'text-amber-500' },
          ].map((stat) => (
            <Card key={stat.label} className="bg-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Platform Links */}
        <section className="mb-8">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Platform Profiles</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { name: 'LeetCode', url: student.platformLinks?.leetcode, color: 'bg-orange-500' },
              { name: 'CodeChef', url: student.platformLinks?.codechef, color: 'bg-amber-600' },
              { name: 'Codeforces', url: student.platformLinks?.codeforces, color: 'bg-blue-500' },
              { name: 'GitHub', url: student.platformLinks?.github, color: 'bg-gray-800' },
              { name: 'Codolio', url: student.platformLinks?.codolio, color: 'bg-purple-500' },
            ].map((platform) => (
              <a
                key={platform.name}
                href={platform.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 p-3 bg-card rounded-lg border border-border/50 transition-colors ${
                  platform.url ? 'hover:border-primary/50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className={`w-8 h-8 ${platform.color} rounded-lg flex items-center justify-center`}>
                  <ExternalLink className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">{platform.name}</span>
              </a>
            ))}
          </div>
        </section>

        {/* Platform Stats Cards */}
        <section className="mb-8">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Platform Performance</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <PlatformStatsCard
              platform="LeetCode"
              stats={student.platforms?.leetcode || {}}
              link={student.platformLinks?.leetcode || ''}
              color="bg-orange-500"
            />
            <PlatformStatsCard
              platform="CodeChef"
              stats={student.platforms?.codechef || {}}
              link={student.platformLinks?.codechef || ''}
              color="bg-amber-600"
            />
            <PlatformStatsCard
              platform="Codeforces"
              stats={student.platforms?.codeforces || {}}
              link={student.platformLinks?.codeforces || ''}
              color="bg-blue-500"
            />
            
            {/* GitHub Card */}
            <Card className="bg-card border-border/50 card-hover overflow-hidden">
              <div className="h-1 bg-gray-800" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-semibold text-foreground">GitHub</h3>
                  {student.platformLinks?.github && (
                    <a
                      href={student.platformLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-lg font-bold text-foreground">{student.platforms?.github?.contributions || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Contributions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-lg font-bold text-foreground">{student.platforms?.github?.repositories || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Repositories</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="text-lg font-bold text-foreground">{student.platforms?.github?.commits || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Commits</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-lg font-bold text-foreground">{student.platforms?.github?.streak || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Streak</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Codolio Card */}
            <Card className="bg-card border-border/50 card-hover overflow-hidden">
              <div className="h-1 bg-purple-600" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-semibold text-foreground">Codolio</h3>
                  {student.platformLinks?.codolio && (
                    <a
                      href={student.platformLinks.codolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-lg font-bold text-foreground">{student.platforms?.codolio?.totalSubmissions || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Submissions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="text-lg font-bold text-foreground">{student.platforms?.github?.streak || 0}</p>
                      <p className="text-[10px] text-muted-foreground">GitHub Streak</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="text-lg font-bold text-foreground">{student.platforms?.github?.longestStreak || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Max Streak</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-lg font-bold text-foreground">{student.platforms?.codolio?.badges?.length || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Badges</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Debug Information */}
        <section className="mb-8">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="font-heading">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Student ID:</strong> {id}</p>
                  <p><strong>Name:</strong> {student.name || 'N/A'}</p>
                  <p><strong>Roll Number:</strong> {student.rollNumber || 'N/A'}</p>
                  <p><strong>Department:</strong> {student.department || 'N/A'}</p>
                </div>
                <div>
                  <p><strong>LeetCode Problems:</strong> {student.platforms?.leetcode?.problemsSolved || 0}</p>
                  <p><strong>CodeChef Problems:</strong> {student.platforms?.codechef?.problemsSolved || 0}</p>
                  <p><strong>GitHub Contributions:</strong> {student.platforms?.github?.contributions || 0}</p>
                  <p><strong>Data Last Updated:</strong> {student.lastUpdated ? new Date(student.lastUpdated).toLocaleString() : 'Never'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default StudentProfile;