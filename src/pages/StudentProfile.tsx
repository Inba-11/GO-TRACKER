import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { students } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, Building, Hash, ExternalLink, FileText, Download, Edit, Eye, Upload } from 'lucide-react';
import PlatformBadge from '@/components/PlatformBadge';
import PerformanceChart from '@/components/PerformanceChart';
import ComparisonPieChart from '@/components/ComparisonPieChart';
import { useToast } from '@/hooks/use-toast';
const StudentProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [isEditingResume, setIsEditingResume] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  
  const student = students.find(s => s.id === id);

  if (!student) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-foreground mb-4">Student Not Found</h1>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const platforms = ['codechef', 'hackerrank', 'leetcode', 'atcoder'] as const;

  const handleResumeUpload = () => {
    if (!resumeUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid Google Drive link',
        variant: 'destructive',
      });
      return;
    }

    // Update student resume (in a real app, this would be an API call)
    student.resume = resumeUrl;
    setIsEditingResume(false);
    toast({
      title: 'Success',
      description: 'Resume link updated successfully!',
    });
  };

  const handleResumePreview = () => {
    if (student.resume) {
      // Convert Google Drive share link to preview link
      const driveId = student.resume.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (driveId) {
        const previewUrl = `https://drive.google.com/file/d/${driveId}/preview`;
        window.open(previewUrl, '_blank', 'width=800,height=600');
      } else {
        window.open(student.resume, '_blank');
      }
    }
  };

  const handleResumeDownload = () => {
    if (student.resume) {
      // Convert Google Drive share link to download link
      const driveId = student.resume.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (driveId) {
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${driveId}`;
        window.open(downloadUrl, '_blank');
      } else {
        window.open(student.resume, '_blank');
      }
    }
  };

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
            <div className="h-32 gradient-bg-primary" />
            <CardContent className="relative pt-0">
              <div className="flex flex-col md:flex-row gap-6 -mt-16">
                <Avatar className="w-32 h-32 border-4 border-card shadow-xl">
                  <AvatarImage src={student.avatar} alt={student.name} />
                  <AvatarFallback className="text-3xl font-bold">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 pt-4 md:pt-8">
                  <h1 className="text-3xl font-heading font-bold text-foreground mb-2">{student.name}</h1>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {student.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      {student.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <Hash className="w-4 h-4" />
                      {student.rollNumber}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Links */}
        <section className="mb-8">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Platform Profiles</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { name: 'LeetCode', url: student.platformLinks.leetcode, color: 'bg-orange-500' },
              { name: 'CodeChef', url: student.platformLinks.codechef, color: 'bg-amber-600' },
              { name: 'Codeforces', url: student.platformLinks.codeforces, color: 'bg-blue-500' },
              { name: 'GitHub', url: student.platformLinks.github, color: 'bg-gray-800' },
              { name: 'Codolio', url: student.platformLinks.codolio, color: 'bg-purple-500' },
            ].map((platform) => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
              >
                <div className={`w-8 h-8 ${platform.color} rounded-lg flex items-center justify-center`}>
                  <ExternalLink className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">{platform.name}</span>
              </a>
            ))}
          </div>
        </section>

        {/* Resume Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Resume</h2>
          <Card className="bg-card border-border/50">
            <CardContent className="p-6">
              {student.resume ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                    <FileText className="w-8 h-8 text-primary" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Resume Available</h3>
                      <p className="text-sm text-muted-foreground">Google Drive link uploaded</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={handleResumePreview}
                      variant="outline" 
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>
                    <Button 
                      onClick={handleResumeDownload}
                      variant="outline" 
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    <Button 
                      onClick={() => {
                        setResumeUrl(student.resume || '');
                        setIsEditingResume(true);
                      }}
                      variant="outline" 
                      className="gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Link
                    </Button>
                  </div>

                  {isEditingResume && (
                    <div className="space-y-3 p-4 bg-secondary/30 rounded-lg">
                      <Label htmlFor="resume-url">Google Drive Link</Label>
                      <Input
                        id="resume-url"
                        type="url"
                        placeholder="https://drive.google.com/file/d/..."
                        value={resumeUrl}
                        onChange={(e) => setResumeUrl(e.target.value)}
                        className="bg-background"
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleResumeUpload} size="sm">
                          Update Link
                        </Button>
                        <Button 
                          onClick={() => setIsEditingResume(false)} 
                          variant="outline" 
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No Resume Uploaded</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload your resume by providing a Google Drive link
                  </p>
                  
                  {!isEditingResume ? (
                    <Button 
                      onClick={() => setIsEditingResume(true)}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Add Resume Link
                    </Button>
                  ) : (
                    <div className="max-w-md mx-auto space-y-3">
                      <Label htmlFor="resume-url">Google Drive Link</Label>
                      <Input
                        id="resume-url"
                        type="url"
                        placeholder="https://drive.google.com/file/d/..."
                        value={resumeUrl}
                        onChange={(e) => setResumeUrl(e.target.value)}
                        className="bg-background"
                      />
                      <div className="flex gap-2 justify-center">
                        <Button onClick={handleResumeUpload} size="sm">
                          Save Link
                        </Button>
                        <Button 
                          onClick={() => setIsEditingResume(false)} 
                          variant="outline" 
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Platform Stats */}
        <section className="mb-8">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Platform Statistics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {platforms.map((platform) => {
              const stats = student.platforms[platform];
              return (
                <Card key={platform} className="bg-card border-border/50">
                  <CardHeader className="pb-2">
                    <PlatformBadge platform={platform} />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Rating</span>
                        <span className="font-semibold text-foreground">{stats.rating}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Problems</span>
                        <span className="font-semibold text-foreground">{stats.problemsSolved}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Contests</span>
                        <span className="font-semibold text-foreground">{stats.contests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Rank</span>
                        <span className="font-semibold text-primary">#{stats.rank}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {/* GitHub Card */}
            <Card className="bg-card border-border/50">
              <CardHeader className="pb-2">
                <PlatformBadge platform="github" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Contributions</span>
                    <span className="font-semibold text-foreground">{student.platforms.github.contributions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Repositories</span>
                    <span className="font-semibold text-foreground">{student.platforms.github.repositories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Followers</span>
                    <span className="font-semibold text-foreground">{student.platforms.github.followers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Streak</span>
                    <span className="font-semibold text-primary">{student.platforms.github.streak} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Performance Chart */}
        <section className="mb-8">
          <PerformanceChart data={student.weeklyProgress} title="Weekly Rating Progress" />
        </section>

        {/* Week Comparison */}
        <section>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Last Week vs This Week</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {platforms.map((platform) => {
              const stats = student.platforms[platform];
              const lastWeekData = student.weeklyProgress[student.weeklyProgress.length - 2];
              const thisWeekData = student.weeklyProgress[student.weeklyProgress.length - 1];
              return (
                <ComparisonPieChart
                  key={platform}
                  platform={platform}
                  title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                  lastWeek={lastWeekData[platform]}
                  thisWeek={thisWeekData[platform]}
                />
              );
            })}
            <ComparisonPieChart
              platform="github"
              title="GitHub"
              lastWeek={student.weeklyProgress[student.weeklyProgress.length - 2].github}
              thisWeek={student.weeklyProgress[student.weeklyProgress.length - 1].github}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentProfile;
