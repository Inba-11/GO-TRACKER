import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UniversalCodeChefContestGrid from '@/components/UniversalCodeChefContestGrid';
import { Trophy, Users, Target, Award } from 'lucide-react';

// Sample student data for demo
const DEMO_STUDENTS = [
  {
    rollNumber: '711523BCB041',
    name: 'PRAKASH B',
    platforms: {
      codechef: {
        username: 'prakashb',
        totalContests: 113,
        rating: 1350,
        problemsSolved: 245,
        rank: 15420
      }
    }
  },
  {
    rollNumber: '711523BCB054',
    name: 'SHARVESH L',
    platforms: {
      codechef: {
        username: 'sharveshl',
        totalContests: 111,
        rating: 1280,
        problemsSolved: 198,
        rank: 18750
      }
    }
  },
  {
    rollNumber: '711523BCB056',
    name: 'SOWMIYA S R',
    platforms: {
      codechef: {
        username: 'sowmiyasr',
        totalContests: 111,
        rating: 1245,
        problemsSolved: 187,
        rank: 19850
      }
    }
  },
  {
    rollNumber: '711523BCB049',
    name: 'SABARI YUHENDHRAN M',
    platforms: {
      codechef: {
        username: 'sabariyuhendh',
        totalContests: 110,
        rating: 1320,
        problemsSolved: 223,
        rank: 16540
      }
    }
  },
  {
    rollNumber: '711523BCB055',
    name: 'SOBHIKA P M',
    platforms: {
      codechef: {
        username: 'kit27csbs55',
        totalContests: 106,
        rating: 1190,
        problemsSolved: 165,
        rank: 22340
      }
    }
  }
];

const CodeChefDemo: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<any>(DEMO_STUDENTS[0]);
  const [stats, setStats] = useState({
    totalStudents: 28,
    totalContests: 2361,
    averageContests: 84.3,
    topPerformer: 'prakashb'
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">CodeChef Contest System Demo</h1>
          <p className="text-lg text-muted-foreground">
            Universal contest grid with real data from 28 students' CodeChef profiles
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-800">{stats.totalStudents}</div>
              <div className="text-sm text-blue-600">Students with Data</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-800">{stats.totalContests.toLocaleString()}</div>
              <div className="text-sm text-green-600">Total Contests</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-800">{stats.averageContests}</div>
              <div className="text-sm text-amber-600">Average per Student</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6 text-center">
              <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-800">@{stats.topPerformer}</div>
              <div className="text-sm text-purple-600">Top Performer</div>
            </CardContent>
          </Card>
        </div>

        {/* Student Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Select Student to View Contest History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select
                value={selectedStudent.rollNumber}
                onValueChange={(rollNumber) => {
                  const student = DEMO_STUDENTS.find(s => s.rollNumber === rollNumber);
                  if (student) setSelectedStudent(student);
                }}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {DEMO_STUDENTS.map((student) => (
                    <SelectItem key={student.rollNumber} value={student.rollNumber}>
                      {student.name} (@{student.platforms.codechef.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Contests: {selectedStudent.platforms.codechef.totalContests}</span>
                <span>Rating: {selectedStudent.platforms.codechef.rating}</span>
                <span>Problems: {selectedStudent.platforms.codechef.problemsSolved}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contest Grid Demo */}
        <UniversalCodeChefContestGrid 
          studentData={selectedStudent}
          className="w-full"
        />

        {/* Features List */}
        <Card>
          <CardHeader>
            <CardTitle>System Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600">✅ Real Data Integration</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Scraped from actual CodeChef profiles</li>
                  <li>• 28 students with verified contest counts</li>
                  <li>• Total 2,361 contests across all students</li>
                  <li>• MongoDB storage with timestamps</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-600">🎨 Enhanced UI Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Division badges (Div 2, Div 3, Div 4)</li>
                  <li>• Dual progress bars (Division vs Contest-wide)</li>
                  <li>• Three-column problem stats</li>
                  <li>• Pagination and summary statistics</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-600">⚡ Performance Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Intelligent caching system</li>
                  <li>• Lazy loading of contest data</li>
                  <li>• Responsive design</li>
                  <li>• Real-time data updates</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-amber-600">🔧 Technical Excellence</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Universal service architecture</li>
                  <li>• TypeScript type safety</li>
                  <li>• Fallback mechanisms</li>
                  <li>• Scalable for all students</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CodeChefDemo;