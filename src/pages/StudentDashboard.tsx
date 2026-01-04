import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { studentsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LogOut, Camera, ExternalLink, Upload, Trash2, Plus, FolderGit2, FileText, Flame, Target, Trophy, GitCommit, Eye, Download, Edit, TrendingUp, Award } from 'lucide-react';
import PerformanceChart from '@/components/PerformanceChart';
import ComparisonPieChart from '@/components/ComparisonPieChart';
import HeatmapCalendar from '@/components/HeatmapCalendar';
import BadgeDisplay from '@/components/BadgeDisplay';
import PlatformStatsCard from '@/components/PlatformStatsCard';
import { useToast } from '@/hooks/use-toast';
import { avatarCharacters, getAvatarById } from '@/data/avatars';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { toast } = useToast();
  
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string>('');
  const [isEditingResume, setIsEditingResume] = useState(false);
  const [isRepoDialogOpen, setIsRepoDialogOpen] = useState(false);
  const [newRepo, setNewRepo] = useState({ name: '', url: '', description: '' });
  const [repositories, setRepositories] = useState<{ id: string; name: string; url: string; description: string }[]>([]);

  // Fetch student data on component mount
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        const response = await studentsAPI.getMe();
        
        if (response.success && response.data) {
          setStudent(response.data);
          setResumeUrl(response.data.resume || '');
          setRepositories(response.data.projectRepositories || []);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to load student data',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Failed to fetch student data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load student data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [toast]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-foreground mb-4">No Student Data</h1>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  // Create a simple fallback avatar that will always work
  const createFallbackAvatar = (name: string) => {
    return `https://ui-avatars.com/api/?name=${name}&background=dc143c&color=ffffff&size=128&font-size=0.4&bold=true&format=png`;
  };

  const selectedAvatarCharacter = selectedAvatar ? getAvatarById(selectedAvatar) : null;
  const defaultAvatarCharacter = getAvatarById('spiderman') || avatarCharacters[0]; // Ensure we always have a fallback
  const currentAvatar = customAvatar || selectedAvatarCharacter?.imageUrl || student.avatar || defaultAvatarCharacter.imageUrl || createFallbackAvatar(student.name);

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    setCustomAvatar(null);
    setIsAvatarDialogOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomAvatar(reader.result as string);
        setSelectedAvatar('');
        setIsAvatarDialogOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

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
    if (student) {
      student.resume = resumeUrl;
    }
    setIsEditingResume(false);
    toast({
      title: 'Success',
      description: 'Resume link updated successfully!',
    });
  };

  const handleDeleteResume = () => {
    if (student) {
      student.resume = null;
    }
    setResumeUrl('');
    setIsEditingResume(false);
    toast({
      title: 'Resume Deleted',
      description: 'Your resume link has been removed.',
    });
  };

  const handleResumePreview = () => {
    const resumeLink = student?.resume || resumeUrl;
    if (resumeLink) {
      // Convert Google Drive share link to preview link
      const driveId = resumeLink.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (driveId) {
        const previewUrl = `https://drive.google.com/file/d/${driveId}/preview`;
        window.open(previewUrl, '_blank', 'width=800,height=600');
      } else {
        window.open(resumeLink, '_blank');
      }
    }
  };

  const handleResumeDownload = () => {
    const resumeLink = student?.resume || resumeUrl;
    if (resumeLink) {
      // Convert Google Drive share link to download link
      const driveId = resumeLink.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (driveId) {
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${driveId}`;
        window.open(downloadUrl, '_blank');
      } else {
        window.open(resumeLink, '_blank');
      }
    }
  };

  const handleAddRepo = () => {
    if (newRepo.name && newRepo.url) {
      setRepositories([...repositories, { ...newRepo, id: Date.now().toString() }]);
      setNewRepo({ name: '', url: '', description: '' });
      setIsRepoDialogOpen(false);
      toast({
        title: 'Repository Added',
        description: 'Your project repository has been added.',
      });
    }
  };

  const handleDeleteRepo = (id: string) => {
    setRepositories(repositories.filter(r => r.id !== id));
    toast({
      title: 'Repository Removed',
      description: 'The project repository has been removed.',
    });
  };

  const totalProblems = 
    (student.platforms?.codechef?.problemsSolved || 0) +
    (student.platforms?.leetcode?.problemsSolved || 0) +
    (student.platforms?.codeforces?.problemsSolved || 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Profile */}
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 border-2 border-primary/20">
                <AvatarImage 
                  src={currentAvatar}
                  alt={student.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${student.name}&background=dc143c&color=ffffff&size=128&font-size=0.4&bold=true&format=png`;
                  }}
                />
                <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{student.name}</h1>
                <p className="text-sm text-muted-foreground">{student.rollNumber} • Batch {student.batch}</p>
              </div>
            </div>
            {/* Logout */}
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Branding */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">GO Tracker</h2>
          <p className="text-muted-foreground">Student Performance Dashboard</p>
        </div>

        {/* Welcome Section with Avatar Editor */}
        <div className="mb-8">
          <Card className="bg-card border-border/50 overflow-hidden">
            <div className="h-32 gradient-bg-primary relative flex items-center px-8 py-6">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-500 opacity-90" />
              <div className="relative z-10">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Welcome back, {student.name.split(' ')[0]}! 👋
                </h1>
                <p className="text-gray-700">
                  Keep up the great work! Your coding journey is progressing well.
                </p>
              </div>
            </div>
            <CardContent className="relative -mt-12 flex flex-col md:flex-row items-start md:items-end gap-4 pb-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-card shadow-lg">
                  <AvatarImage 
                    src={currentAvatar} 
                    alt={student.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${student.name}&background=dc143c&color=ffffff&size=128&font-size=0.4&bold=true&format=png`;
                    }}
                  />
                  <AvatarFallback className="text-2xl font-bold">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                      <Camera className="w-4 h-4 text-primary-foreground" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-heading">Choose Your Avatar</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="all">All Heroes</TabsTrigger>
                          <TabsTrigger value="upload">Upload Photo</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="all" className="mt-4">
                          <div className="grid grid-cols-8 gap-3">
                            {avatarCharacters.map((character) => (
                              <button
                                key={character.id}
                                onClick={() => handleAvatarSelect(character.id)}
                                className={`group relative p-2 rounded-xl border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg ${
                                  selectedAvatar === character.id 
                                    ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/20' 
                                    : 'border-border hover:border-primary/50 bg-card'
                                }`}
                                title={character.name}
                              >
                                <div className="relative">
                                  <Avatar className="w-16 h-16 mx-auto border-2 border-border/50 group-hover:border-primary/50 transition-colors">
                                    <AvatarImage 
                                      src={character.imageUrl} 
                                      alt={character.name}
                                      className="object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${character.name}&background=dc143c&color=ffffff&size=128&font-size=0.4&bold=true&format=png`;
                                      }}
                                    />
                                    <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-primary/20 to-accent/20">
                                      {character.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  {selectedAvatar === character.id && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                      <span className="text-[10px] text-primary-foreground">✓</span>
                                    </div>
                                  )}
                                </div>
                                <p className="text-[10px] text-center mt-1 text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1 font-medium">
                                  {character.name}
                                </p>
                                <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                  character.category === 'Marvel' ? 'bg-red-500 text-white' :
                                  character.category === 'DC' ? 'bg-blue-500 text-white' :
                                  character.category === 'Anime' ? 'bg-pink-500 text-white' :
                                  'bg-yellow-500 text-black'
                                }`}>
                                  {character.category === 'Transformers' ? 'TF' : character.category[0]}
                                </div>
                              </button>
                            ))}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="upload" className="mt-4">
                          <div className="flex justify-center">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                              <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                                <Camera className="w-4 h-4" />
                                <span className="text-sm">Upload Photo</span>
                              </div>
                            </label>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-heading font-bold text-foreground">
                  {student.name}
                </h2>
                <p className="text-muted-foreground">
                  {student.rollNumber} • {student.batch} Batch • {student.department}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resume & Project Repositories Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Resume Card */}
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              {student?.resume ? (
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
                    <Button 
                      onClick={handleDeleteResume}
                      variant="destructive" 
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
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

          {/* Project Repositories Card */}
          <Card className="bg-card border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5" />
                  Project Repositories
                </CardTitle>
                <Dialog open={isRepoDialogOpen} onOpenChange={setIsRepoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Project Repository</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="repo-name">Project Name</Label>
                        <Input
                          id="repo-name"
                          value={newRepo.name}
                          onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })}
                          placeholder="My Awesome Project"
                        />
                      </div>
                      <div>
                        <Label htmlFor="repo-url">Repository URL</Label>
                        <Input
                          id="repo-url"
                          value={newRepo.url}
                          onChange={(e) => setNewRepo({ ...newRepo, url: e.target.value })}
                          placeholder="https://github.com/username/project"
                        />
                      </div>
                      <div>
                        <Label htmlFor="repo-desc">Description</Label>
                        <Textarea
                          id="repo-desc"
                          value={newRepo.description}
                          onChange={(e) => setNewRepo({ ...newRepo, description: e.target.value })}
                          placeholder="Brief description of the project"
                        />
                      </div>
                      <Button onClick={handleAddRepo} className="w-full">Add Repository</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {repositories.length > 0 ? (
                <div className="space-y-3">
                  {repositories.map((repo) => (
                    <div key={repo.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex-1">
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-foreground hover:text-primary flex items-center gap-2"
                        >
                          {repo.name}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <p className="text-xs text-muted-foreground">{repo.description}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteRepo(repo.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No repositories added yet. Click "Add" to share your projects!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Target, label: 'Total Problems', value: totalProblems, color: 'text-orange-500' },
            { icon: GitCommit, label: 'GitHub Commits', value: student.platforms?.github?.commits || 0, color: 'text-emerald-500' },
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
                  {student.platformLinks.github && (
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
                  {student.platformLinks.codolio && (
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

        {/* GitHub Stats */}
        <section className="mb-8">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="font-heading">GitHub Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6 mb-6">
                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <p className="text-3xl font-bold text-foreground">{student.platforms?.github?.contributions || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Contributions</p>
                </div>
                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <p className="text-3xl font-bold text-foreground">{student.platforms?.github?.commits || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Commits</p>
                </div>
                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <p className="text-3xl font-bold text-foreground">{student.platforms?.github?.repositories || 0}</p>
                  <p className="text-sm text-muted-foreground">Repositories</p>
                </div>
                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <p className="text-3xl font-bold text-foreground">{student.platforms?.github?.followers || 0}</p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
              </div>
              
              {/* GitHub Streaks */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="text-center p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg border border-red-500/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Flame className="w-5 h-5 text-red-500" />
                    <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                  </div>
                  <p className="text-4xl font-bold text-foreground">{student.platforms?.github?.streak || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">days</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-lg border border-amber-500/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <p className="text-sm font-medium text-muted-foreground">Longest Streak</p>
                  </div>
                  <p className="text-4xl font-bold text-foreground">{student.platforms?.github?.longestStreak || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">days</p>
                </div>
              </div>
              
              <div className="mt-6">
                <a
                  href={student.platformLinks?.github || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  View GitHub Profile <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Codolio Heatmap & Badges */}
        <section className="mb-8">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="font-heading">Codolio Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{student.platforms?.codolio?.totalSubmissions || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                </div>
                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{student.platforms?.codolio?.totalActiveDays || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Active Days</p>
                </div>
                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{student.platforms?.codolio?.totalContests || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Contests</p>
                </div>
                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{student.platforms?.codolio?.badges?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Badges</p>
                </div>
              </div>
              
              <HeatmapCalendar 
                data={student.platforms?.codolio?.dailySubmissions || []} 
                title="Daily Submission Heatmap"
              />
              
              <BadgeDisplay badges={student.platforms?.codolio?.badges || []} />
              
              <a
                href={student.platformLinks?.codolio || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                View Codolio Profile <ExternalLink className="w-4 h-4" />
              </a>
            </CardContent>
          </Card>
        </section>

        {/* Performance Chart */}
        <section className="mb-8">
          <PerformanceChart data={student.weeklyProgress || []} title="My Weekly Progress" />
        </section>

        {/* Week Comparison */}
        {student.weeklyProgress && student.weeklyProgress.length >= 2 && (
          <section>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">This Week vs Last Week</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {(['leetcode', 'codechef', 'codeforces', 'github', 'codolio'] as const).map((platform) => {
                const lastWeekData = student.weeklyProgress[student.weeklyProgress.length - 2];
                const thisWeekData = student.weeklyProgress[student.weeklyProgress.length - 1];
                return (
                  <ComparisonPieChart
                    key={platform}
                    platform={platform}
                    title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                    lastWeek={lastWeekData?.[platform] || 0}
                    thisWeek={thisWeekData?.[platform] || 0}
                  />
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
