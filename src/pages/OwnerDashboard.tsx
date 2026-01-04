import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { students as initialStudents, Student } from '@/data/mockData';
import { LogOut, Users, Activity, Settings, Database, Shield, Bell, BarChart3, UserPlus, Trash2, Edit, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useToast } from '@/hooks/use-toast';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [showManageStudents, setShowManageStudents] = useState(false);
  
  // Add Student Dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRollNumber, setNewStudentRollNumber] = useState('');
  
  // Edit Student Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editedName, setEditedName] = useState('');
  
  // Delete Student Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = () => {
    if (!newStudentName.trim() || !newStudentRollNumber.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    const newStudent: Student = {
      id: String(students.length + 1),
      name: newStudentName,
      email: `${newStudentRollNumber.toLowerCase()}@student.edu`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newStudentName}`,
      defaultAvatar: 'batman',
      department: 'Computer Science & Business Systems',
      year: 2,
      rollNumber: newStudentRollNumber,
      platformLinks: {
        leetcode: '#',
        codeforces: '#',
        github: '#',
        codechef: '#',
        codolio: '#',
      },
      platforms: {
        codechef: { username: '', rating: 1400, maxRating: 1400, problemsSolved: 0, rank: students.length + 1, lastWeekRating: 1400, contests: 0, contestsAttended: 0 },
        hackerrank: { username: '', rating: 1400, maxRating: 1400, problemsSolved: 0, rank: students.length + 1, lastWeekRating: 1400, contests: 0, contestsAttended: 0 },
        leetcode: { username: '', rating: 1400, maxRating: 1400, problemsSolved: 0, rank: students.length + 1, lastWeekRating: 1400, contests: 0, contestsAttended: 0 },
        atcoder: { username: '', rating: 1400, maxRating: 1400, problemsSolved: 0, rank: students.length + 1, lastWeekRating: 1400, contests: 0, contestsAttended: 0 },
        codeforces: { username: '', rating: 1400, maxRating: 1400, problemsSolved: 0, rank: students.length + 1, lastWeekRating: 1400, contests: 0, contestsAttended: 0 },
        github: { username: '', repositories: 0, contributions: 0, commits: 0, followers: 0, lastWeekContributions: 0, streak: 0 },
        codolio: { username: '', totalSubmissions: 0, currentStreak: 0, maxStreak: 0, dailySubmissions: [], badges: [] },
      },
      weeklyProgress: [
        { week: "Week 1", codechef: 1400, hackerrank: 1400, leetcode: 1400, atcoder: 1400, codeforces: 1400, github: 0 },
        { week: "Week 2", codechef: 1400, hackerrank: 1400, leetcode: 1400, atcoder: 1400, codeforces: 1400, github: 0 },
        { week: "Week 3", codechef: 1400, hackerrank: 1400, leetcode: 1400, atcoder: 1400, codeforces: 1400, github: 0 },
        { week: "Week 4", codechef: 1400, hackerrank: 1400, leetcode: 1400, atcoder: 1400, codeforces: 1400, github: 0 },
      ],
      resume: null,
      projectRepositories: [],
      batch: 'C' as const,
    };

    setStudents([...students, newStudent]);
    setNewStudentName('');
    setNewStudentRollNumber('');
    setIsAddDialogOpen(false);
    toast({
      title: 'Student Added',
      description: `${newStudentName} has been added successfully.`,
    });
  };

  const handleEditStudent = () => {
    if (!editingStudent || !editedName.trim()) return;

    setStudents(students.map(s => 
      s.id === editingStudent.id ? { ...s, name: editedName } : s
    ));
    setIsEditDialogOpen(false);
    setEditingStudent(null);
    toast({
      title: 'Student Updated',
      description: `Student renamed to ${editedName}.`,
    });
  };

  const handleDeleteStudent = () => {
    if (!deletingStudent) return;

    setStudents(students.filter(s => s.id !== deletingStudent.id));
    setIsDeleteDialogOpen(false);
    setDeletingStudent(null);
    toast({
      title: 'Student Deleted',
      description: 'Student has been removed from the system.',
    });
  };

  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setEditedName(student.name);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (student: Student) => {
    setDeletingStudent(student);
    setIsDeleteDialogOpen(true);
  };

  // Analytics data
  const departmentData = [
    { name: 'CSBS', students: students.length },
  ];

  const platformUsage = [
    { name: 'LeetCode', value: 35 },
    { name: 'CodeChef', value: 25 },
    { name: 'HackerRank', value: 20 },
    { name: 'GitHub', value: 15 },
    { name: 'AtCoder', value: 5 },
  ];

  const COLORS = ['#eab308', '#f97316', '#10b981', '#1f2937', '#3b82f6'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-effect border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">ByteBuster Admin</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: 'Total Students', value: students.length, trend: '+12%' },
            { icon: Activity, label: 'Active Today', value: Math.floor(students.length * 0.7), trend: '+5%' },
            { icon: BarChart3, label: 'Avg. Rating', value: '1,756', trend: '+8%' },
            { icon: Shield, label: 'System Status', value: 'Healthy', trend: 'Up' },
          ].map((stat) => (
            <Card key={stat.label} className="bg-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-5 h-5 text-primary" />
                  <span className="text-xs text-primary font-medium">{stat.trend}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {!showManageStudents ? (
          <>
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Department Distribution */}
              <Card className="bg-card border-border/50">
                <CardHeader>
                  <CardTitle className="font-heading">Students by Department</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={departmentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Platform Usage */}
              <Card className="bg-card border-border/50">
                <CardHeader>
                  <CardTitle className="font-heading">Platform Activity Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={platformUsage}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {platformUsage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Admin Actions */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Card 
                  className="bg-card border-border/50 card-hover cursor-pointer"
                  onClick={() => setShowManageStudents(true)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl gradient-bg-accent mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">Manage Students</h3>
                    <p className="text-sm text-muted-foreground">Add, edit, or remove students</p>
                  </CardContent>
                </Card>
                {[
                  { icon: Database, label: 'Database', desc: 'View and manage data' },
                  { icon: Bell, label: 'Notifications', desc: 'Configure alerts' },
                  { icon: Settings, label: 'Settings', desc: 'Platform configuration' },
                ].map((action) => (
                  <Card key={action.label} className="bg-card border-border/50 card-hover cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 rounded-xl gradient-bg-accent mx-auto mb-4 flex items-center justify-center">
                        <action.icon className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{action.label}</h3>
                      <p className="text-sm text-muted-foreground">{action.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </>
        ) : (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => setShowManageStudents(false)}>
                  ← Back
                </Button>
                <h2 className="text-2xl font-heading font-bold text-foreground">Manage Students</h2>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" variant="gradient">
                    <UserPlus className="w-4 h-4" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Student Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter student name"
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rollNumber">Roll Number</Label>
                      <Input
                        id="rollNumber"
                        placeholder="e.g., 711523BCB065"
                        value={newStudentRollNumber}
                        onChange={(e) => setNewStudentRollNumber(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddStudent}>Add Student</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Students Table */}
            <Card className="bg-card border-border/50">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.rollNumber}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.department}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(student)}
                              className="h-8 w-8"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(student)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>
        )}
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Student Name</Label>
              <Input
                id="editName"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditStudent}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete <strong>{deletingStudent?.name}</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteStudent}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OwnerDashboard;
