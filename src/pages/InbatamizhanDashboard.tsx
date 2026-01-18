import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, Star, Target, Calendar, MapPin, GraduationCap, 
  RefreshCw, ExternalLink, Code, GitCommit, Flame, Award,
  TrendingUp, BookOpen, Clock, Users, Zap, Medal,
  Activity, BarChart3, PieChart, LineChart, Hash,
  Globe, School, User, CheckCircle, ArrowUp, ArrowDown
} from 'lucide-react';

interface InbatamizhanData {
  username: string;
  rating: number;
  maxRating: number;
  problemsSolved: number;
  globalRank: number;
  stars: number;
  country: string;
  institution: string;
  contests: number;
  contestsAttended: number;
  totalContests: number;
  lastWeekRating: number;
  contestCountUpdatedAt: string;
  lastUpdated: string;
  league: string;
  studentType: string;
}

const InbatamizhanDashboard: React.FC = () => {
  const [data, setData] = useState<InbatamizhanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const rollNumber = '711523BCB023';
  const studentName = 'INBATAMIZHAN P';

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/students/inbatamizhan');
      if (!response.ok) {
        throw new Error('Failed to fetch student data');
      }
      
      const result = await response.json();
      if (result.success && result.data.platforms?.codechef) {
        setData(result.data.platforms.codechef);
      } else {
        throw new Error('CodeChef data not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      
      const response = await fetch('http://localhost:5000/api/scraping/inbatamizhan', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh data');
      }
      
      setTimeout(() => {
        fetchData();
        setRefreshing(false);
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading INBATAMIZHAN P Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="border-red-200 bg-red-50 max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-600">
              <p className="font-semibold">Error loading dashboard</p>
              <p className="text-sm mt-1">{error}</p>
              <Button 
                onClick={fetchData} 
                variant="outline" 
                size="sm" 
                className="mt-3"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStarColor = (stars: number) => {
    if (stars >= 7) return 'text-red-500';
    if (stars >= 6) return 'text-orange-500';
    if (stars >= 5) return 'text-yellow-500';
    if (stars >= 4) return 'text-green-500';
    if (stars >= 3) return 'text-blue-500';
    if (stars >= 2) return 'text-purple-500';
    return 'text-amber-500';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 2500) return 'from-red-500 to-red-600';
    if (rating >= 2000) return 'from-orange-500 to-orange-600';
    if (rating >= 1800) return 'from-yellow-500 to-yellow-600';
    if (rating >= 1600) return 'from-green-500 to-green-600';
    if (rating >= 1400) return 'from-blue-500 to-blue-600';
    if (rating >= 1200) return 'from-purple-500 to-purple-600';
    return 'from-slate-500 to-slate-600';
  };

  const ratingChange = data ? data.rating - data.lastWeekRating : 0;
  const avgProblemsPerContest = data ? Math.round((data.problemsSolved / data.contests) * 10) / 10 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-blue-200">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${studentName}&background=3b82f6&color=ffffff&size=128&font-size=0.4&bold=true&format=png`} />
                  <AvatarFallback className="bg-blue-500 text-white font-bold">IP</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-lg font-bold text-slate-800">
                    {studentName}
                  </h1>
                  <p className="text-sm text-slate-600">Student Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Live Data
              </Badge>
              <Button 
                onClick={refreshData} 
                disabled={refreshing}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-white/50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <div className="mb-8">
          <Card className="border-0 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <div className="text-center lg:text-left mb-6 lg:mb-0">
                  <h2 className="text-4xl font-bold mb-2">{studentName}</h2>
                  <p className="text-blue-100 text-lg mb-4">Roll Number: {rollNumber}</p>
                  <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
                    <Badge className="bg-white/20 text-white border-white/30">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      Student
                    </Badge>
                    <Badge className="bg-white/20 text-white border-white/30">
                      <MapPin className="h-3 w-3 mr-1" />
                      {data?.country || 'India'}
                    </Badge>
                    <Badge className="bg-white/20 text-white border-white/30">
                      <Trophy className="h-3 w-3 mr-1" />
                      {data?.league || 'Bronze League'}
                    </Badge>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="text-3xl font-bold mb-2">{data?.rating || 1264}</div>
                    <div className="text-blue-100 text-sm">Current Rating</div>
                    <div className={`flex items-center justify-center mt-2 ${getStarColor(data?.stars || 1)}`}>
                      {Array.from({ length: data?.stars || 1 }, (_, i) => (
                        <Star key={i} className="h-5 w-5 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 bg-gradient-to-br from-emerald-50 to-green-100 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700">Problems Solved</p>
                  <p className="text-3xl font-bold text-emerald-900">{data?.problemsSolved || 500}</p>
                  <p className="text-xs text-emerald-600 mt-1">Total Submissions</p>
                </div>
                <div className="p-3 bg-emerald-500 rounded-full">
                  <Target className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-100 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Contests</p>
                  <p className="text-3xl font-bold text-blue-900">{data?.contests || 96}</p>
                  <p className="text-xs text-blue-600 mt-1">Participated</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-full">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-orange-50 to-amber-100 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Global Rank</p>
                  <p className="text-3xl font-bold text-orange-900">#{(data?.globalRank || 16720).toLocaleString()}</p>
                  <p className="text-xs text-orange-600 mt-1">Worldwide</p>
                </div>
                <div className="p-3 bg-orange-500 rounded-full">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-purple-50 to-violet-100 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Star Rating</p>
                  <p className="text-3xl font-bold text-purple-900">{data?.stars || 1}★</p>
                  <p className="text-xs text-purple-600 mt-1">{data?.league || 'Bronze League'}</p>
                </div>
                <div className="p-3 bg-purple-500 rounded-full">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Performance Metrics */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Rating Progress</p>
                    <p className="text-sm text-slate-600">Current vs Last Week</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 ${ratingChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {ratingChange >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    <span className="font-bold">{ratingChange >= 0 ? '+' : ''}{ratingChange}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Avg Problems/Contest</p>
                    <p className="text-sm text-slate-600">Efficiency Metric</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800">{avgProblemsPerContest}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Award className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Max Rating</p>
                    <p className="text-sm text-slate-600">Personal Best</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800">{data?.maxRating || 1314}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Institution Details */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <School className="h-5 w-5 text-blue-500" />
                Institution Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Kalaignar Karunanidhi Institute of Technology
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Kannampalayam, Coimbatore, Tamil Nadu
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    Computer Science & Business Systems
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Active Student
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">CodeChef Username:</span>
                  <span className="font-medium text-slate-800">{data?.username || 'kit27csbs23'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">Roll Number:</span>
                  <span className="font-medium text-slate-800">{rollNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">Country:</span>
                  <span className="font-medium text-slate-800">{data?.country || 'India'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <Activity className="h-5 w-5 text-green-500" />
                Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-green-100 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-800">{data?.problemsSolved || 500}</div>
                  <div className="text-xs text-emerald-600">Problems</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
                  <div className="text-2xl font-bold text-blue-800">{data?.contests || 96}</div>
                  <div className="text-xs text-blue-600">Contests</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-violet-100 rounded-lg">
                  <div className="text-2xl font-bold text-purple-800">{data?.stars || 1}★</div>
                  <div className="text-xs text-purple-600">Stars</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-amber-100 rounded-lg">
                  <div className="text-2xl font-bold text-orange-800">#{(data?.globalRank || 16720).toLocaleString()}</div>
                  <div className="text-xs text-orange-600">Rank</div>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                  <Clock className="h-4 w-4" />
                  <span>Last Updated:</span>
                </div>
                <p className="text-xs text-slate-500">
                  {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'Recently'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CodeChef Profile Link */}
        <div className="mb-8">
          <Card className="border-0 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 text-white">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="text-center md:text-left mb-4 md:mb-0">
                  <h3 className="text-xl font-bold mb-2">CodeChef Profile</h3>
                  <p className="text-orange-100">
                    View complete profile with contest history and submissions
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    asChild
                    variant="secondary"
                    className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                  >
                    <a 
                      href="https://www.codechef.com/users/kit27csbs23" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View on CodeChef
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full border border-slate-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-slate-600">
              Data automatically updated every hour
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InbatamizhanDashboard;