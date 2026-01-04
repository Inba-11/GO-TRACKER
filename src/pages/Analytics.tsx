import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { students, getStudentsByBatch } from '@/data/mockData';
import { ArrowLeft, TrendingUp, TrendingDown, Target, BookOpen, Lightbulb, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface PlatformAnalytics {
  platform: string;
  color: string;
  beforeWeek: {
    problemsSolved: number;
    rating: number;
    contests: number;
  };
  thisWeek: {
    problemsSolved: number;
    rating: number;
    contests: number;
  };
  unattemptedQuestions: {
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    topic: string;
    learningTip: string;
    resources: string[];
  }[];
}

// Mock analytics data
const generateAnalyticsData = (): PlatformAnalytics[] => {
  return [
    {
      platform: 'LeetCode',
      color: 'bg-orange-500',
      beforeWeek: { problemsSolved: 145, rating: 1456, contests: 12 },
      thisWeek: { problemsSolved: 152, rating: 1478, contests: 13 },
      unattemptedQuestions: [
        {
          category: 'Dynamic Programming',
          difficulty: 'Hard',
          topic: 'Longest Common Subsequence',
          learningTip: 'Master the concept of overlapping subproblems and optimal substructure',
          resources: ['GeeksforGeeks DP Tutorial', 'LeetCode DP Study Plan', 'YouTube: Dynamic Programming Playlist']
        },
        {
          category: 'Graph Theory',
          difficulty: 'Medium',
          topic: 'Dijkstra\'s Algorithm',
          learningTip: 'Understand shortest path algorithms and priority queues',
          resources: ['Dijkstra Algorithm Tutorial', 'Graph Theory Basics', 'Practice: Shortest Path Problems']
        },
        {
          category: 'Tree Traversal',
          difficulty: 'Easy',
          topic: 'Binary Tree Inorder',
          learningTip: 'Practice recursive and iterative tree traversal methods',
          resources: ['Binary Tree Basics', 'Tree Traversal Guide', 'Practice: Tree Problems']
        }
      ]
    },
    {
      platform: 'CodeChef',
      color: 'bg-amber-600',
      beforeWeek: { problemsSolved: 89, rating: 1623, contests: 8 },
      thisWeek: { problemsSolved: 94, rating: 1645, contests: 9 },
      unattemptedQuestions: [
        {
          category: 'Number Theory',
          difficulty: 'Hard',
          topic: 'Modular Arithmetic',
          learningTip: 'Learn modular exponentiation and Fermat\'s little theorem',
          resources: ['Number Theory for CP', 'Modular Arithmetic Guide', 'CodeChef Number Theory']
        },
        {
          category: 'Combinatorics',
          difficulty: 'Medium',
          topic: 'Permutations & Combinations',
          learningTip: 'Understand factorial, nCr, and nPr calculations with modular arithmetic',
          resources: ['Combinatorics Basics', 'Math for CP', 'Practice: Combinatorics Problems']
        }
      ]
    },
    {
      platform: 'Codeforces',
      color: 'bg-blue-500',
      beforeWeek: { problemsSolved: 67, rating: 1234, contests: 15 },
      thisWeek: { problemsSolved: 72, rating: 1267, contests: 16 },
      unattemptedQuestions: [
        {
          category: 'Greedy Algorithms',
          difficulty: 'Medium',
          topic: 'Activity Selection',
          learningTip: 'Learn to identify greedy choice property and optimal substructure',
          resources: ['Greedy Algorithm Tutorial', 'Activity Selection Problem', 'Greedy vs DP']
        },
        {
          category: 'String Algorithms',
          difficulty: 'Hard',
          topic: 'KMP Algorithm',
          learningTip: 'Understand pattern matching and failure function construction',
          resources: ['KMP Algorithm Guide', 'String Matching Algorithms', 'Pattern Matching Practice']
        }
      ]
    }
  ];
};

type BatchFilter = 'ALL' | 'A' | 'B' | 'C' | 'D' | 'NON-CRT';

const Analytics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedBatch, setSelectedBatch] = useState<BatchFilter>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  
  const filteredStudents = getStudentsByBatch(selectedBatch);
  const analyticsData = generateAnalyticsData();

  const batches: { value: BatchFilter; label: string }[] = [
    { value: 'ALL', label: 'All Batches' },
    { value: 'A', label: 'Batch A' },
    { value: 'B', label: 'Batch B' },
    { value: 'C', label: 'Batch C' },
    { value: 'D', label: 'Batch D' },
    { value: 'NON-CRT', label: 'Non-CRT' },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getChangeIcon = (before: number, after: number) => {
    if (after > before) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (after < before) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4" />;
  };

  const getChangeColor = (before: number, after: number) => {
    if (after > before) return 'text-green-500';
    if (after < before) return 'text-red-500';
    return 'text-muted-foreground';
  };

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
                <h1 className="text-xl font-heading font-bold text-foreground">Performance Analytics</h1>
                <p className="text-sm text-muted-foreground">Weekly progress analysis and learning recommendations</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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

        {/* Student Selection */}
        <section className="mb-8">
          <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Select Student for Detailed Analysis:</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStudents.slice(0, 12).map((student) => (
              <Card 
                key={student.id}
                className={`cursor-pointer transition-all ${
                  selectedStudent === student.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-secondary/50'
                }`}
                onClick={() => setSelectedStudent(student.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={student.avatar} 
                      alt={student.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{student.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{student.batch}</Badge>
                        <span className="text-xs text-muted-foreground">{student.rollNumber}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Analytics Dashboard */}
        {selectedStudent && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                Analytics for {filteredStudents.find(s => s.id === selectedStudent)?.name}
              </h2>
              <p className="text-muted-foreground">
                Weekly performance comparison and learning recommendations
              </p>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Weekly Overview</TabsTrigger>
                <TabsTrigger value="platforms">Platform Analysis</TabsTrigger>
                <TabsTrigger value="recommendations">Learning Tips</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Platform Comparison Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                  {analyticsData.map((platform) => (
                    <Card key={platform.platform} className="bg-card border-border/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{platform.platform}</CardTitle>
                          <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Problems Solved */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Problems Solved</span>
                            {getChangeIcon(platform.beforeWeek.problemsSolved, platform.thisWeek.problemsSolved)}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-foreground">
                              {platform.thisWeek.problemsSolved}
                            </span>
                            <span className={`text-sm ${getChangeColor(platform.beforeWeek.problemsSolved, platform.thisWeek.problemsSolved)}`}>
                              {platform.thisWeek.problemsSolved > platform.beforeWeek.problemsSolved ? '+' : ''}
                              {platform.thisWeek.problemsSolved - platform.beforeWeek.problemsSolved}
                            </span>
                          </div>
                          <Progress 
                            value={(platform.thisWeek.problemsSolved / (platform.beforeWeek.problemsSolved + 50)) * 100} 
                            className="h-2"
                          />
                        </div>

                        {/* Rating */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Rating</span>
                            {getChangeIcon(platform.beforeWeek.rating, platform.thisWeek.rating)}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-foreground">
                              {platform.thisWeek.rating}
                            </span>
                            <span className={`text-sm ${getChangeColor(platform.beforeWeek.rating, platform.thisWeek.rating)}`}>
                              {platform.thisWeek.rating > platform.beforeWeek.rating ? '+' : ''}
                              {platform.thisWeek.rating - platform.beforeWeek.rating}
                            </span>
                          </div>
                        </div>

                        {/* Contests */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Contests</span>
                            {getChangeIcon(platform.beforeWeek.contests, platform.thisWeek.contests)}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-foreground">
                              {platform.thisWeek.contests}
                            </span>
                            <span className={`text-sm ${getChangeColor(platform.beforeWeek.contests, platform.thisWeek.contests)}`}>
                              {platform.thisWeek.contests > platform.beforeWeek.contests ? '+' : ''}
                              {platform.thisWeek.contests - platform.beforeWeek.contests}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="platforms" className="space-y-6">
                {/* Detailed Platform Analysis */}
                {analyticsData.map((platform) => (
                  <Card key={platform.platform} className="bg-card border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${platform.color}`} />
                        {platform.platform} - Detailed Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground">Before This Week</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Problems:</span>
                              <span className="font-medium">{platform.beforeWeek.problemsSolved}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Rating:</span>
                              <span className="font-medium">{platform.beforeWeek.rating}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Contests:</span>
                              <span className="font-medium">{platform.beforeWeek.contests}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground">This Week</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Problems:</span>
                              <span className="font-medium">{platform.thisWeek.problemsSolved}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Rating:</span>
                              <span className="font-medium">{platform.thisWeek.rating}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Contests:</span>
                              <span className="font-medium">{platform.thisWeek.contests}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground">Progress</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Problems:</span>
                              <div className="flex items-center gap-2">
                                {getChangeIcon(platform.beforeWeek.problemsSolved, platform.thisWeek.problemsSolved)}
                                <span className={`font-medium ${getChangeColor(platform.beforeWeek.problemsSolved, platform.thisWeek.problemsSolved)}`}>
                                  {platform.thisWeek.problemsSolved - platform.beforeWeek.problemsSolved}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Rating:</span>
                              <div className="flex items-center gap-2">
                                {getChangeIcon(platform.beforeWeek.rating, platform.thisWeek.rating)}
                                <span className={`font-medium ${getChangeColor(platform.beforeWeek.rating, platform.thisWeek.rating)}`}>
                                  {platform.thisWeek.rating - platform.beforeWeek.rating}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Contests:</span>
                              <div className="flex items-center gap-2">
                                {getChangeIcon(platform.beforeWeek.contests, platform.thisWeek.contests)}
                                <span className={`font-medium ${getChangeColor(platform.beforeWeek.contests, platform.thisWeek.contests)}`}>
                                  {platform.thisWeek.contests - platform.beforeWeek.contests}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-6">
                {/* Learning Recommendations */}
                {analyticsData.map((platform) => (
                  <Card key={platform.platform} className="bg-card border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${platform.color}`} />
                        {platform.platform} - Learning Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {platform.unattemptedQuestions.map((question, index) => (
                          <div key={index} className="border border-border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                                <div>
                                  <h4 className="font-semibold text-foreground">{question.topic}</h4>
                                  <p className="text-sm text-muted-foreground">{question.category}</p>
                                </div>
                              </div>
                              <Badge className={getDifficultyColor(question.difficulty)}>
                                {question.difficulty}
                              </Badge>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-foreground">Learning Tip:</p>
                                  <p className="text-sm text-muted-foreground">{question.learningTip}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-3">
                                <BookOpen className="w-4 h-4 text-blue-500 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-foreground">Recommended Resources:</p>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    {question.resources.map((resource, idx) => (
                                      <li key={idx} className="flex items-center gap-2">
                                        <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                                        {resource}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </section>
        )}
      </main>
    </div>
  );
};

export default Analytics;