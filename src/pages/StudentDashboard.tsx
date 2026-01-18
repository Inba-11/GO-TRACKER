import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { studentsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Trophy, Star, Target, Calendar, MapPin, GraduationCap, 
  RefreshCw, ExternalLink, Code, GitCommit, Flame, Award,
  TrendingUp, BookOpen, Clock, Users, Zap, Medal,
  Activity, BarChart3, PieChart, LineChart, Hash,
  Globe, School, User, CheckCircle, ArrowUp, ArrowDown,
  LogOut, Camera, Upload, Trash2, Plus, FolderGit2, FileText, Eye, Download, Edit,
  ChevronLeft, ChevronRight, TrendingDown, ArrowLeft, Building, GitBranch
} from 'lucide-react';
import PerformanceChart from '@/components/PerformanceChart';
import ComparisonPieChart from '@/components/ComparisonPieChart';
import HeatmapCalendar from '@/components/HeatmapCalendar';
import BadgeDisplay from '@/components/BadgeDisplay';
import PlatformStatsCard from '@/components/PlatformStatsCard';
import CodeChefCard from '@/components/CodeChefCard';
import CodeChefUnifiedDashboard from '@/components/CodeChefUnifiedDashboard';
import CodeChefSubmissionHeatmap from '@/components/CodeChefSubmissionHeatmap';
import CodeChefContestHistory from '@/components/CodeChefContestHistory';
import CodeforcesContestHistory from '@/components/CodeforcesContestHistory';
import GitHubPinnedRepos from '@/components/GitHubPinnedRepos';
import LeetCodeContestHistory from '@/components/LeetCodeContestHistory';
import LeetCodeActivityHeatmap from '@/components/LeetCodeActivityHeatmap';
import LeetCodeBadgesSection from '@/components/LeetCodeBadgesSection';
import LeetCodeProfileSection from '@/components/LeetCodeProfileSection';
import PlatformTabs from '@/components/PlatformTabs';
import PlatformTabContent from '@/components/PlatformTabContent';
import { useToast } from '@/hooks/use-toast';
import { avatarCharacters, getAvatarById } from '@/data/avatars';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const { id: studentId } = useParams<{ id?: string }>();
  
  // Determine if this is staff viewing or student viewing themselves
  // Staff view: /staff/student/:id
  // Student view: /student/dashboard/:id
  const currentPath = window.location.pathname;
  const isStaffView = currentPath.startsWith('/staff/student/');
  const isStudentView = currentPath.startsWith('/student/dashboard/');
  
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
  
  // Codeforces pagination state
  const [codeforcesPage, setCodeforcesPage] = useState(1);

  // LeetCode refresh state
  const [isRefreshingLeetCode, setIsRefreshingLeetCode] = useState(false);
  
  // Platform-specific refresh states
  const [isRefreshingCodechef, setIsRefreshingCodechef] = useState(false);
  const [isRefreshingCodeforces, setIsRefreshingCodeforces] = useState(false);
  const [isRefreshingGithub, setIsRefreshingGithub] = useState(false);
  const [isRefreshingCodolio, setIsRefreshingCodolio] = useState(false);
  
  // Refresh all data state
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  // Platform links editing state
  const [isEditingPlatformLinks, setIsEditingPlatformLinks] = useState(false);
  const [platformLinksForm, setPlatformLinksForm] = useState({
    leetcode: '',
    codechef: '',
    codeforces: '',
    github: '',
    codolio: ''
  });

  // Fetch student data on component mount
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        
        let response;
        if (isStaffView && studentId) {
          // Staff viewing a student - use getById
          response = await studentsAPI.getById(studentId);
        } else if (isStudentView && studentId) {
          // Student viewing themselves with ID in URL - verify ID matches their own
          const myData = await studentsAPI.getMe();
          if (myData.success && myData.data) {
            // Verify the ID in URL matches the logged-in user's ID
            if (myData.data._id === studentId || myData.data.id === studentId) {
              response = myData;
            } else {
              // ID mismatch - redirect to correct URL
              console.warn('URL ID mismatch, redirecting to correct URL');
              navigate(`/student/dashboard/${myData.data._id || myData.data.id}`, { replace: true });
              return;
            }
          } else {
            response = myData;
          }
        } else {
          // Fallback: use getMe (for backward compatibility)
          response = await studentsAPI.getMe();
          // If we got data and there's no ID in URL, redirect to include ID
          if (response.success && response.data && !studentId) {
            const userId = response.data._id || response.data.id;
            if (userId) {
              navigate(`/student/dashboard/${userId}`, { replace: true });
              return;
            }
          }
        }
        
        if (response.success && response.data) {
          setStudent(response.data);
          setResumeUrl(response.data.resume || '');
          setRepositories(response.data.projectRepositories || []);
          setPlatformLinksForm({
            leetcode: response.data.platformLinks?.leetcode || '',
            codechef: response.data.platformLinks?.codechef || '',
            codeforces: response.data.platformLinks?.codeforces || '',
            github: response.data.platformLinks?.github || '',
            codolio: response.data.platformLinks?.codolio || ''
          });
        } else {
          toast({
            title: 'Error',
            description: 'Failed to load student data',
            variant: 'destructive',
          });
        }
      } catch (error: any) {
        // Only show error if it's not a 401 (unauthorized) - user will be redirected by interceptor
        if (error.response?.status !== 401) {
          console.error('Failed to fetch student data:', error);
          toast({
            title: 'Error',
            description: error.response?.data?.error || 'Failed to load student data',
            variant: 'destructive',
          });
        }
        // For 401 errors, the API interceptor will handle redirect to login
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [toast, studentId, isStaffView, isStudentView, navigate]);

  // Reset Codeforces pagination when Codeforces data changes
  useEffect(() => {
    setCodeforcesPage(1);
  }, [
    student?.platforms?.codeforces?.contestHistory?.length,
    student?.platforms?.codeforces?.heatmap?.length
  ]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-slate-900 mb-4">No Student Data</h1>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  // Create a simple fallback avatar that will always work
  const createFallbackAvatar = (name: string) => {
    return `https://ui-avatars.com/api/?name=${name}&background=4F46E5&color=ffffff&size=128&font-size=0.4&bold=true&format=png`;
  };

  const selectedAvatarCharacter = selectedAvatar ? getAvatarById(selectedAvatar) : null;
  const defaultAvatarCharacter = getAvatarById('spiderman') || avatarCharacters[0]; // Ensure we always have a fallback
  const currentAvatar = customAvatar || selectedAvatarCharacter?.imageUrl || student?.avatar || defaultAvatarCharacter.imageUrl || createFallbackAvatar(student?.name || 'Student');

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

  const handleResumeUpload = async () => {
    if (!resumeUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid Google Drive link',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await studentsAPI.updateResume(resumeUrl);
      if (response.success && response.data) {
        setStudent(response.data);
        setIsEditingResume(false);
        toast({
          title: 'Success',
          description: 'Resume link updated successfully!',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update resume link',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePlatformLinks = async () => {
    try {
      const response = await studentsAPI.updatePlatformLinks(platformLinksForm);
      if (response.success && response.data) {
        setStudent(response.data);
        setIsEditingPlatformLinks(false);
        toast({
          title: 'Success',
          description: 'Platform links updated successfully! The scraper will pick up your usernames on the next cycle.',
        });
        // Refresh student data
        const refreshResponse = await studentsAPI.getMe();
        if (refreshResponse.success && refreshResponse.data) {
          setStudent(refreshResponse.data);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update platform links',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteResume = async () => {
    try {
      const response = await studentsAPI.deleteResume();
      if (response.success) {
        setResumeUrl('');
        setIsEditingResume(false);
        if (student) {
          setStudent({ ...student, resume: null });
        }
        toast({
          title: 'Resume Deleted',
          description: 'Your resume link has been removed.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete resume link',
        variant: 'destructive',
      });
    }
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

  // Generic platform refresh handler
  const handleRefreshPlatform = async (platform: 'leetcode' | 'codechef' | 'codeforces' | 'github' | 'codolio') => {
    const platformNames = {
      leetcode: 'LeetCode',
      codechef: 'CodeChef',
      codeforces: 'Codeforces',
      github: 'GitHub',
      codolio: 'Codolio'
    };
    
    const platformName = platformNames[platform];
    const setLoadingState = {
      leetcode: setIsRefreshingLeetCode,
      codechef: setIsRefreshingCodechef,
      codeforces: setIsRefreshingCodeforces,
      github: setIsRefreshingGithub,
      codolio: setIsRefreshingCodolio
    }[platform];
    
    setLoadingState(true);
    try {
      toast({
        title: `Refreshing ${platformName}`,
        description: `Fetching latest ${platformName} data...`,
      });

      const response = await studentsAPI.refreshPlatform(student._id, platform);
      
      // Check if response indicates failure (but not an HTTP error)
      if (response.status === 'failed' || (response.success === false && response.status === 'failed')) {
        // Handle structured error response gracefully
        const errorMessage = response.message || `Failed to refresh ${platformName} data`;
        const errorReason = response.reason || 'unknown_error';
        
        console.error(`\n${'='.repeat(60)}`);
        console.error(`❌ ${platformName.toUpperCase()} REFRESH FAILED`);
        console.error(`${'='.repeat(60)}`);
        console.error(`Reason: ${errorReason}`);
        console.error(`Message: ${errorMessage}`);
        if (response.lastUpdated) {
          console.error(`Last Updated: ${response.lastUpdated}`);
          console.error(`Note: Previous data still available`);
        }
        console.error(`${'='.repeat(60)}\n`);
        
        // Show user-friendly error message
        toast({
          title: `${platformName} Refresh Failed`,
          description: errorReason === 'selenium_driver_error' 
            ? 'CodeChef scraping is temporarily unavailable due to browser driver issues. Please try again later.'
            : errorMessage.substring(0, 150),
          variant: 'destructive',
        });
        
        setLoadingState(false);
        return;
      }
      
      if (response.success && response.data) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`✅ ${platformName} Refresh Complete`);
        console.log(`${'='.repeat(60)}`);
        console.log(`📊 Updated ${platformName} Data:`, response.data.platforms?.[platform]);
        
        // Log scraped JSON data if available
        if (response.scrapedData) {
          console.log(`\n📦 RAW SCRAPED DATA (JSON):`);
          console.log(JSON.stringify(response.scrapedData, null, 2));
        }
        
        // Log comparison between old and new data
        if (response.oldData && response.newData) {
          console.log(`\n📈 DATA COMPARISON:`);
          console.log(`   Rating: ${response.oldData.rating || 0} → ${response.newData.rating || 0}`);
          console.log(`   Problems: ${response.oldData.problemsSolved || response.oldData.totalSolved || 0} → ${response.newData.problemsSolved || response.newData.totalSolved || 0}`);
          console.log(`   Contests: ${response.oldData.contestsAttended || 0} → ${response.newData.contestsAttended || 0}`);
          console.log(`   Submissions: ${response.oldData.totalSubmissions || 0} → ${response.newData.totalSubmissions || 0}`);
        }
        
        console.log(`${'='.repeat(60)}\n`);
        
        // Refetch student data to ensure we have the latest from database
        try {
          let refetchResponse;
          if (isStaffView && studentId) {
            refetchResponse = await studentsAPI.getById(studentId);
          } else {
            refetchResponse = await studentsAPI.getMe();
          }
          
          if (refetchResponse.success && refetchResponse.data) {
            console.log(`🔄 UI Updated with latest ${platformName} data from database`);
            setStudent(refetchResponse.data);
            toast({
              title: `${platformName} Data Updated`,
              description: `Latest ${platformName} statistics have been fetched successfully!`,
            });
          } else {
            // Fallback to response.data if refetch fails
            console.log(`🔄 UI Updated with refresh response data (refetch failed)`);
            setStudent(response.data);
            toast({
              title: `${platformName} Data Updated`,
              description: `Latest ${platformName} statistics have been fetched successfully!`,
            });
          }
        } catch (refetchError) {
          // If refetch fails, use the response data we got from refresh
          console.warn('⚠️ Failed to refetch student data after refresh, using refresh response:', refetchError);
          console.log(`🔄 UI Updated with refresh response data (fallback)`);
          setStudent(response.data);
          toast({
            title: `${platformName} Data Updated`,
            description: `Latest ${platformName} statistics have been fetched successfully!`,
          });
        }
      } else if (response.status === 'failed') {
        // Already handled above, but double-check
        const errorMessage = response.message || `Failed to refresh ${platformName} data`;
        toast({
          title: `${platformName} Refresh Failed`,
          description: errorMessage.substring(0, 150),
          variant: 'destructive',
        });
        setLoadingState(false);
        return;
      } else {
        throw new Error(response.error || `Failed to update ${platformName} data`);
      }
    } catch (error: any) {
      console.error(`\n${'='.repeat(60)}`);
      console.error(`❌ FAILED TO REFRESH ${platformName.toUpperCase()}`);
      console.error(`${'='.repeat(60)}`);
      console.error(`Error Object:`, error);
      
      // Extract detailed error information from backend
      const errorData = error.response?.data || {};
      const errorMessage = errorData?.details || errorData?.error || error.message || `Failed to update ${platformName} data. Please try again later.`;
      
      // Log comprehensive error details to console for debugging
      console.error(`\n📋 ERROR DETAILS:`);
      console.error(`   Error: ${errorData?.error || error.message}`);
      console.error(`   Details: ${errorData?.details || 'No details provided'}`);
      console.error(`   Exit Code: ${errorData?.exitCode || 'N/A'}`);
      
      if (errorData?.stdout) {
        console.error(`\n📤 STDOUT (First 500 chars):`);
        console.error(errorData.stdout.substring(0, 500));
      }
      
      if (errorData?.stderr) {
        console.error(`\n📤 STDERR (First 500 chars):`);
        console.error(errorData.stderr.substring(0, 500));
      }
      
      // Try to parse and display JSON if present in stdout
      if (errorData?.stdout) {
        const jsonMatch = errorData.stdout.match(/📦 SCRAPED_DATA_JSON_START\s*([\s\S]*?)\s*📦 SCRAPED_DATA_JSON_END/);
        if (jsonMatch) {
          try {
            const jsonData = JSON.parse(jsonMatch[1].trim());
            console.error(`\n📦 PARSED SCRAPED DATA (JSON):`);
            console.error(JSON.stringify(jsonData, null, 2));
          } catch (e) {
            console.warn('⚠️ Could not parse JSON data from error output');
          }
        }
      }
      
      console.error(`\n${'='.repeat(60)}\n`);
      
      // Handle timeout specifically
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast({
          title: 'Request Timeout',
          description: `${platformName} scraping is taking longer than expected. Please try again in a moment.`,
          variant: 'destructive',
        });
      } else {
        // Show user-friendly error message
        const userMessage = errorData?.details 
          ? `${errorData.details.substring(0, 150)}${errorData.details.length > 150 ? '...' : ''}`
          : errorMessage.substring(0, 200);
        
        toast({
          title: 'Update Failed',
          description: userMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setLoadingState(false);
    }
  };

  // LeetCode data refresh handler (kept for backward compatibility)
  const handleRefreshLeetCode = async () => {
    await handleRefreshPlatform('leetcode');
  };

  // Refresh all data handler (calls Python scrapers automatically)
  const handleRefreshAllData = async () => {
    setIsRefreshingAll(true);
    const startTime = Date.now();
    
    // Safety timeout wrapper - ensures we don't hang forever
    const safetyTimeout = 420000; // 7 minutes (longer than API timeout of 6 minutes)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout: Operation took longer than 7 minutes'));
      }, safetyTimeout);
    });
    
    try {
      toast({
        title: '🔄 Refreshing Data',
        description: 'Automatically running LeetCode, CodeChef, and Codeforces scrapers. This may take 1-2 minutes...',
        duration: 5000,
      });

      console.log('🚀 Refresh button clicked - Starting automatic scraping...');
      
      // Automatically call the API which runs the scrapers
      // Use Promise.race to ensure we don't hang forever
      const response = await Promise.race([
        studentsAPI.scrapeMyData(),
        timeoutPromise
      ]) as any;
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      if (response.success && response.data) {
        // Update all student data in UI
        setStudent(response.data);
        setResumeUrl(response.data.resume || '');
        setRepositories(response.data.projectRepositories || []);
        setPlatformLinksForm({
          leetcode: response.data.platformLinks?.leetcode || '',
          codechef: response.data.platformLinks?.codechef || '',
          codeforces: response.data.platformLinks?.codeforces || '',
          github: response.data.platformLinks?.github || '',
          codolio: response.data.platformLinks?.codolio || ''
        });
        
        // Show success message with scraping results
        const scrapingResults = (response as any).scrapingResults || { successful: [], errors: [] };
        const successful = scrapingResults.successful || [];
        const errors = scrapingResults.errors || [];
        
        if (successful.length > 0) {
          toast({
            title: '✅ Data Refreshed Successfully!',
            description: `Updated: ${successful.map((p: string) => p.toUpperCase()).join(', ')} in ${duration}s. ${errors.length > 0 ? 'Some platforms had errors.' : ''}`,
          });
          
          // Log success
          console.log(`✅ Scraping completed successfully in ${duration}s`);
          console.log(`   Successful platforms: ${successful.join(', ')}`);
          if (errors.length > 0) {
            console.log(`   Errors: ${errors.map((e: any) => `${e.platform}: ${e.error}`).join(', ')}`);
          }
        } else if (errors.length > 0) {
          toast({
            title: '⚠️ Refresh Completed with Errors',
            description: `Some platforms could not be updated. Duration: ${duration}s`,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'ℹ️ Refresh Completed',
            description: 'No platform data to update. Make sure your LeetCode, CodeChef, and Codeforces links are set in Platform Profiles.',
          });
        }
      } else {
        throw new Error('Failed to refresh data');
      }
    } catch (error: any) {
      console.error('❌ Failed to refresh data:', error);
      
      // Handle timeout specifically (including our safety timeout)
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || error.message?.includes('Operation took longer')) {
        toast({
          title: '⏱️ Request Timeout',
          description: 'Scraping is taking longer than expected. The data may still be updating in the background. Please refresh the page in a minute.',
          variant: 'destructive',
          duration: 8000,
        });
      } else {
        toast({
          title: '❌ Refresh Failed',
          description: error.response?.data?.error || error.message || 'Failed to refresh data. Please try again later.',
          variant: 'destructive',
        });
      }
    } finally {
      // Always reset loading state, even if something went wrong
      setIsRefreshingAll(false);
    }
  };

  const totalProblems = 
    (student.platforms?.codechef?.problemsSolved || 0) +
    (student.platforms?.leetcode?.problemsSolved || 0) +
    (student.platforms?.codeforces?.problemsSolved || 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Profile */}
            <div className="flex items-center gap-1 pl-2">
              {/* Back button for staff view */}
              {isStaffView && (
                <Button
                  variant="ghost"
                  onClick={() => navigate('/staff/dashboard')}
                  className="gap-2 mr-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600/20 to-indigo-600/20 rounded-full blur opacity-40"></div>
                <Avatar className="flex shrink-0 overflow-hidden rounded-full relative w-8 h-8 border border-indigo-600/15 shadow-md">
                  <AvatarImage 
                    src={currentAvatar}
                    alt={student?.name || 'Student'}
                    className="aspect-square h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${student?.name || 'Student'}&background=4F46E5&color=ffffff&size=128&font-size=0.4&bold=true&format=png`;
                    }}
                  />
                  <AvatarFallback>{student?.name?.split(' ').map((n: string) => n[0]).join('') || 'S'}</AvatarFallback>
                </Avatar>
              </div>
              <h1 className="text-sm font-medium bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                {isStaffView ? `Viewing: ${student?.name || 'Student'}` : `Welcome, ${student?.name?.split(' ')[0] || 'Student'}`}
              </h1>
              {!isStaffView && <span className="text-xs">😄</span>}
            </div>
            {/* Logout - only show for student view */}
            {isStudentView && (
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Branding */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">GO Tracker</h2>
          <p className="text-slate-600">Student Performance Dashboard</p>
        </div>

        {/* Welcome Section with Avatar Editor */}
        <div className="mb-8">
          <Card className="bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 rounded-lg">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600/50 via-indigo-600/50 to-indigo-600/50 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                    <Avatar className="flex shrink-0 overflow-hidden rounded-full relative w-28 h-28 border-4 border-background shadow-2xl ring-2 ring-indigo-600/20 hover:ring-indigo-600/40 transition-all duration-300">
                      <AvatarImage 
                        src={currentAvatar} 
                        alt={student?.name || 'Student'}
                        className="aspect-square h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${student?.name || 'Student'}&background=4F46E5&color=ffffff&size=128&font-size=0.4&bold=true&format=png`;
                        }}
                      />
                      <AvatarFallback className="text-2xl font-bold">
                        {student?.name?.split(' ').map((n: string) => n[0]).join('') || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    {/* Avatar editing - only for student view */}
                    {isStudentView && (
                      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                        <DialogTrigger asChild>
                          <button className="absolute -bottom-1 -right-1 w-10 h-10 bg-gradient-to-r from-indigo-600 to-indigo-600/80 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 ring-2 ring-background">
                            <Camera className="w-5 h-5 text-white" />
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
                                        ? 'border-indigo-600 bg-indigo-600/10 shadow-md ring-2 ring-indigo-600/20' 
                                        : 'border-slate-200 hover:border-indigo-600/50 bg-white'
                                    }`}
                                    title={character.name}
                                  >
                                    <div className="relative">
                                        <Avatar className="w-16 h-16 mx-auto border-2 border-slate-200 group-hover:border-indigo-600/50 transition-colors">
                                        <AvatarImage 
                                          src={character.imageUrl} 
                                          alt={character.name}
                                          className="object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${character.name}&background=4F46E5&color=ffffff&size=128&font-size=0.4&bold=true&format=png`;
                                          }}
                                        />
                                        <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-indigo-600/20 to-indigo-600/20">
                                          {character.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      {selectedAvatar === character.id && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                                          <span className="text-[10px] text-white">✓</span>
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-center mt-1 text-slate-600 group-hover:text-slate-900 transition-colors line-clamp-1 font-medium">
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
                                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
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
                    )}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="space-y-3">
                      <div>
                        <h2 className="text-3xl font-heading font-bold text-slate-900">
                          {student?.name || 'Student'}
                        </h2>
                          <div className="h-1 w-20 bg-gradient-to-r from-indigo-600 to-indigo-600 rounded-full mx-auto md:mx-0 mt-2"></div>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-slate-600">
                        <div className="flex items-center gap-2 justify-center md:justify-start">
                          <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                          <span className="font-medium">{student?.rollNumber || 'N/A'}</span>
                        </div>
                        <div className="hidden md:block w-1 h-1 bg-slate-300 rounded-full"></div>
                        <div className="flex items-center gap-2 justify-center md:justify-start">
                          <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                          <span className="font-medium">{student?.batch || 'N/A'} Batch</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 justify-center md:justify-start text-sm text-slate-600">
                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                        <span>{student?.department || 'N/A'}</span>
                      </div>
                      <div className="pt-2">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600/10 to-indigo-600/10 rounded-full border border-indigo-600/20">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-slate-900">Active Student</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>

        {/* Resume & Project Repositories Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Resume Card */}
          <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Resume
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {student?.resume ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <FileText className="w-8 h-8 text-indigo-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">Resume Available</h3>
                      <p className="text-sm text-slate-600">Google Drive link uploaded</p>
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
                    {/* Edit and Delete buttons - only for student view */}
                    {isStudentView && (
                      <>
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
                      </>
                    )}
                  </div>

                  {isEditingResume && isStudentView && (
                    <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
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
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">No Resume Uploaded</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Upload your resume by providing a Google Drive link
                  </p>
                  
                  {isStudentView && (
                    !isEditingResume ? (
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
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Repositories Card */}
          <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-indigo-600" />
                  Project Repositories
                </CardTitle>
                {/* Add button - only for student view */}
                {isStudentView && (
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
                )}
              </div>
            </CardHeader>
            <CardContent>
              {repositories.length > 0 ? (
                <div className="space-y-3">
                  {repositories.map((repo) => (
                    <div key={repo.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex-1">
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-slate-900 hover:text-indigo-600 flex items-center gap-2"
                        >
                          {repo.name}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <p className="text-xs text-slate-600">{repo.description}</p>
                      </div>
                      {/* Delete button - only for student view */}
                      {isStudentView && (
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteRepo(repo.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-600 py-4">
                  No repositories added yet. Click "Add" to share your projects!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: Target, label: 'Total Problems', value: totalProblems, color: 'text-indigo-600' },
            { icon: GitCommit, label: 'GitHub Commits', value: student.platforms?.github?.commits || 0, color: 'text-indigo-600' },
            { icon: Flame, label: 'Current Streak', value: `${student.platforms?.github?.streak || 0} days`, color: 'text-indigo-600' },
            { icon: Trophy, label: 'Max Streak', value: `${student.platforms?.github?.longestStreak || 0} days`, color: 'text-indigo-600' },
          ].map((stat) => (
            <Card key={stat.label} className="bg-white border border-slate-200 shadow-sm rounded-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-slate-50 ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-600">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Platform Links Management */}
        <section className="mb-8">
          <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  Platform Profiles
                </CardTitle>
                {/* Edit button - only for student view */}
                {isStudentView && !isEditingPlatformLinks && (
                  <Button 
                    onClick={() => setIsEditingPlatformLinks(true)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Links
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!isEditingPlatformLinks ? (
                <div className="grid md:grid-cols-5 gap-4">
                  {[
                    { name: 'LeetCode', url: student.platformLinks?.leetcode, color: 'bg-indigo-600' },
                    { name: 'CodeChef', url: student.platformLinks?.codechef, color: 'bg-indigo-600' },
                    { name: 'Codeforces', url: student.platformLinks?.codeforces, color: 'bg-indigo-600' },
                    { name: 'GitHub', url: student.platformLinks?.github, color: 'bg-slate-700' },
                    { name: 'Codolio', url: student.platformLinks?.codolio, color: 'bg-indigo-600' },
                  ].map((platform) => (
                    <div
                      key={platform.name}
                      className={`flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 ${
                        platform.url ? 'hover:border-indigo-300' : 'opacity-50'
                      }`}
                    >
                      <div className={`w-8 h-8 ${platform.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <ExternalLink className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{platform.name}</p>
                        {platform.url ? (
                          <a
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline truncate block"
                          >
                            View Profile
                          </a>
                        ) : (
                          <p className="text-xs text-slate-600">Not set</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                isStudentView && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="leetcode-link">LeetCode Profile URL</Label>
                      <Input
                        id="leetcode-link"
                        type="url"
                        placeholder="https://leetcode.com/u/username/"
                        value={platformLinksForm.leetcode}
                        onChange={(e) => setPlatformLinksForm({ ...platformLinksForm, leetcode: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="codechef-link">CodeChef Profile URL</Label>
                      <Input
                        id="codechef-link"
                        type="url"
                        placeholder="https://www.codechef.com/users/username"
                        value={platformLinksForm.codechef}
                        onChange={(e) => setPlatformLinksForm({ ...platformLinksForm, codechef: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="codeforces-link">Codeforces Profile URL</Label>
                      <Input
                        id="codeforces-link"
                        type="url"
                        placeholder="https://codeforces.com/profile/username"
                        value={platformLinksForm.codeforces}
                        onChange={(e) => setPlatformLinksForm({ ...platformLinksForm, codeforces: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="github-link">GitHub Profile URL</Label>
                      <Input
                        id="github-link"
                        type="url"
                        placeholder="https://github.com/username"
                        value={platformLinksForm.github}
                        onChange={(e) => setPlatformLinksForm({ ...platformLinksForm, github: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="codolio-link">Codolio Profile URL</Label>
                      <Input
                        id="codolio-link"
                        type="url"
                        placeholder="https://codolio.com/profile/username"
                        value={platformLinksForm.codolio}
                        onChange={(e) => setPlatformLinksForm({ ...platformLinksForm, codolio: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleUpdatePlatformLinks} size="sm">
                      Save Links
                    </Button>
                    <Button 
                      onClick={() => {
                        setIsEditingPlatformLinks(false);
                        // Reset form to current values
                        setPlatformLinksForm({
                          leetcode: student.platformLinks?.leetcode || '',
                          codechef: student.platformLinks?.codechef || '',
                          codeforces: student.platformLinks?.codeforces || '',
                          github: student.platformLinks?.github || '',
                          codolio: student.platformLinks?.codolio || ''
                        });
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                  <p className="text-xs text-slate-600">
                    💡 Tip: Usernames will be automatically extracted from URLs. After saving, the scraper will pick up your profiles on the next cycle.
                  </p>
                </div>
                )
              )}
            </CardContent>
          </Card>
        </section>

        {/* Platform Tabs - All Platforms in One Clean Interface */}
        <section className="mb-8">
          <div className="mb-6">
            <h2 className="text-3xl font-semibold text-slate-900">Platform Data</h2>
            <p className="text-sm text-slate-600 mt-1">Swipe or click tabs to view each platform. Use the refresh button inside each tab to update data.</p>
          </div>
          <PlatformTabs
            student={student}
            isStudentView={isStudentView}
            onRefresh={handleRefreshPlatform}
            refreshingStates={{
              leetcode: isRefreshingLeetCode,
              codechef: isRefreshingCodechef,
              codeforces: isRefreshingCodeforces,
              github: isRefreshingGithub,
              codolio: isRefreshingCodolio,
            }}
          >
            <TabsContent value="leetcode" className="mt-0">
              <div className="py-6 overflow-y-auto max-h-[calc(100vh-300px)]">
                <PlatformTabContent
                  platform="leetcode"
                  data={student.platforms?.leetcode}
                  link={student.platformLinks?.leetcode}
                  onRefresh={() => handleRefreshPlatform('leetcode')}
                  isRefreshing={isRefreshingLeetCode}
                  isStudentView={isStudentView}
                />
              </div>
            </TabsContent>
            <TabsContent value="codechef" className="mt-0">
              <div className="py-6 overflow-y-auto max-h-[calc(100vh-300px)]">
                <PlatformTabContent
                  platform="codechef"
                  data={student.platforms?.codechef}
                  link={student.platformLinks?.codechef}
                  onRefresh={() => handleRefreshPlatform('codechef')}
                  isRefreshing={isRefreshingCodechef}
                  isStudentView={isStudentView}
                />
              </div>
            </TabsContent>
            <TabsContent value="codeforces" className="mt-0">
              <div className="py-6 overflow-y-auto max-h-[calc(100vh-300px)]">
                <PlatformTabContent
                  platform="codeforces"
                  data={student.platforms?.codeforces}
                  link={student.platformLinks?.codeforces}
                  onRefresh={() => handleRefreshPlatform('codeforces')}
                  isRefreshing={isRefreshingCodeforces}
                  isStudentView={isStudentView}
                />
              </div>
            </TabsContent>
            <TabsContent value="github" className="mt-0">
              <div className="py-6 overflow-y-auto max-h-[calc(100vh-300px)]">
                <PlatformTabContent
                  platform="github"
                  data={student.platforms?.github || (student as any).github || {}}
                  link={student.platformLinks?.github}
                  onRefresh={() => handleRefreshPlatform('github')}
                  isRefreshing={isRefreshingGithub}
                  isStudentView={isStudentView}
                />
              </div>
            </TabsContent>
            <TabsContent value="codolio" className="mt-0">
              <div className="py-6 overflow-y-auto max-h-[calc(100vh-300px)]">
                <PlatformTabContent
                  platform="codolio"
                  data={student.platforms?.codolio}
                  link={student.platformLinks?.codolio}
                  onRefresh={() => handleRefreshPlatform('codolio')}
                  isRefreshing={isRefreshingCodolio}
                  isStudentView={isStudentView}
                />
              </div>
            </TabsContent>
          </PlatformTabs>
        </section>

        {/* Submission Heatmaps - Codeforces */}
        {student.platforms?.codeforces?.heatmap?.length > 0 && (
          <section className="mb-8">
            <div className="mb-6">
              <h2 className="text-3xl font-semibold text-slate-900 mb-2">Submission Heatmaps</h2>
              <p className="text-sm text-slate-600">Activity visualization across all platforms</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Codeforces Submission Heatmap */}
              <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    Codeforces Activity Heatmap
                  </CardTitle>
                  <p className="text-xs text-slate-600">
                    {student.platforms.codeforces.heatmap.length} days of submission data
                  </p>
                </CardHeader>
                <CardContent>
                  <HeatmapCalendar
                    data={student.platforms.codeforces.heatmap.map((entry: any) => ({
                      date: entry.date,
                      count: entry.count || 0
                    }))}
                    title="Codeforces Submissions"
                    colorScheme="custom"
                    customColor="#4F46E5"
                  />
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-slate-900">
                          {student.platforms.codeforces.heatmap.reduce((sum: number, entry: any) => sum + (entry.count || 0), 0)}
                        </p>
                        <p className="text-xs text-slate-600">Total Submissions</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">
                          {Math.max(...student.platforms.codeforces.heatmap.map((entry: any) => entry.count || 0))}
                        </p>
                        <p className="text-xs text-slate-600">Max Daily</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">
                          {student.platforms.codeforces.heatmap.filter((entry: any) => (entry.count || 0) > 0).length}
                        </p>
                        <p className="text-xs text-slate-600">Active Days</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Codolio Heatmap & Badges */}
        <section className="mb-8">
          <Card className="bg-white border border-slate-200 shadow-sm rounded-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Codolio Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-3xl font-bold text-indigo-600">{student.platforms?.codolio?.totalSubmissions || 0}</p>
                  <p className="text-sm text-slate-600">Total Submissions</p>
                </div>
                <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-3xl font-bold text-indigo-600">{student.platforms?.codolio?.totalActiveDays || 0}</p>
                  <p className="text-sm text-slate-600">Total Active Days</p>
                </div>
                <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-3xl font-bold text-indigo-600">{student.platforms?.codolio?.totalContests || 0}</p>
                  <p className="text-sm text-slate-600">Total Contests</p>
                </div>
                <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-3xl font-bold text-indigo-600">{student.platforms?.codolio?.badges?.length || 0}</p>
                  <p className="text-sm text-slate-600">Badges</p>
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
                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
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
            <h2 className="text-3xl font-semibold text-slate-900 mb-4">This Week vs Last Week</h2>
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
