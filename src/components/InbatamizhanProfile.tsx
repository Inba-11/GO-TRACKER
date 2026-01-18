import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Trophy, Star, Target, Calendar, MapPin, GraduationCap, RefreshCw } from 'lucide-react';

interface InbatamizhanData {
  username: string;
  rating: number;
  maxRating: number;
  problemsSolved: number;
  rank: number;
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

const InbatamizhanProfile: React.FC = () => {
  const [data, setData] = useState<InbatamizhanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const rollNumber = '711523BCB023';

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/students/inbatamizhan');
      if (!response.ok) {
        throw new Error('Failed to fetch INBATAMIZHAN P data');
      }
      
      const result = await response.json();
      if (result.success && result.data.platforms?.codechef) {
        setData(result.data.platforms.codechef);
      } else {
        throw new Error('CodeChef data not found for INBATAMIZHAN P');
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
      
      // Trigger scraper
      const response = await fetch('/api/scrape/inbatamizhan', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh data');
      }
      
      // Wait a moment then fetch updated data
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
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading INBATAMIZHAN P data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="text-red-600 text-center">
            <p className="font-semibold">Error loading data</p>
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
    );
  }

  if (!data) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <div className="text-yellow-600 text-center">
            <p className="font-semibold">No data available</p>
            <p className="text-sm mt-1">INBATAMIZHAN P CodeChef data not found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStarColor = (stars: number) => {
    if (stars >= 7) return 'text-red-500';
    if (stars >= 6) return 'text-orange-500';
    if (stars >= 5) return 'text-yellow-500';
    if (stars >= 4) return 'text-green-500';
    if (stars >= 3) return 'text-blue-500';
    if (stars >= 2) return 'text-purple-500';
    return 'text-gray-500';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 2500) return 'text-red-600 bg-red-100';
    if (rating >= 2000) return 'text-orange-600 bg-orange-100';
    if (rating >= 1800) return 'text-yellow-600 bg-yellow-100';
    if (rating >= 1600) return 'text-green-600 bg-green-100';
    if (rating >= 1400) return 'text-blue-600 bg-blue-100';
    if (rating >= 1200) return 'text-purple-600 bg-purple-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-blue-900">
                INBATAMIZHAN P
              </CardTitle>
              <p className="text-blue-700 font-medium">Roll Number: {rollNumber}</p>
            </div>
            <Button 
              onClick={refreshData} 
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <Badge variant="secondary" className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />
              {data.studentType}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {data.country}
            </Badge>
            <Badge variant="secondary" className={getRatingColor(data.rating)}>
              {data.league}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rating Card */}
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Current Rating</p>
                <p className="text-2xl font-bold text-purple-900">{data.rating}</p>
                <p className="text-xs text-purple-500">Max: {data.maxRating}</p>
              </div>
              <div className={`flex items-center ${getStarColor(data.stars)}`}>
                {Array.from({ length: data.stars }, (_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Problems Solved Card */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Problems Solved</p>
                <p className="text-2xl font-bold text-green-900">{data.problemsSolved}</p>
                <p className="text-xs text-green-500">Total Submissions</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Global Rank Card */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Global Rank</p>
                <p className="text-2xl font-bold text-orange-900">#{data.globalRank.toLocaleString()}</p>
                <p className="text-xs text-orange-500">Worldwide</p>
              </div>
              <Trophy className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        {/* Contests Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Contests</p>
                <p className="text-2xl font-bold text-blue-900">{data.contests}</p>
                <p className="text-xs text-blue-500">Participated</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Institution Card */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Institution Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{data.institution}</p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>CodeChef Username: <strong>{data.username}</strong></span>
              <span>•</span>
              <span>Last Updated: {new Date(data.lastUpdated).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg text-indigo-900">Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-900">{data.stars}★</p>
              <p className="text-sm text-indigo-600">Star Rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-900">
                {Math.round((data.problemsSolved / data.contests) * 10) / 10}
              </p>
              <p className="text-sm text-indigo-600">Avg Problems/Contest</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-900">
                {data.rating > data.lastWeekRating ? '+' : ''}{data.rating - data.lastWeekRating}
              </p>
              <p className="text-sm text-indigo-600">Rating Change</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InbatamizhanProfile;