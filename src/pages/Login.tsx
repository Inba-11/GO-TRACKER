import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { ArrowLeft, GraduationCap, Shield, User, Eye, EyeOff, Sparkles, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authAPI } from '@/services/api';

const roleConfig = {
  staff: {
    title: 'Staff Portal',
    description: 'Access the student performance dashboard',
    icon: GraduationCap,
    gradient: 'from-emerald-500 to-teal-500',
    accentGradient: 'from-emerald-500/20 to-teal-500/20',
    redirect: '/staff/dashboard',
  },
  owner: {
    title: 'Admin Portal',
    description: 'Platform management & analytics',
    icon: Shield,
    gradient: 'from-purple-500 to-pink-500',
    accentGradient: 'from-purple-500/20 to-pink-500/20',
    redirect: '/owner/dashboard',
  },
  student: {
    title: 'Student Portal',
    description: 'Track your coding progress',
    icon: User,
    gradient: 'from-blue-500 to-cyan-500',
    accentGradient: 'from-blue-500/20 to-cyan-500/20',
    redirect: '/student/dashboard',
  },
};

const Login = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [staffUsernames, setStaffUsernames] = useState<Array<{ username: string; name: string }>>([]);
  const [loadingStaffUsernames, setLoadingStaffUsernames] = useState(false);

  const config = roleConfig[role as keyof typeof roleConfig];

  // Fetch staff usernames when role is 'staff'
  useEffect(() => {
    if (role === 'staff') {
      const fetchStaffUsernames = async () => {
        try {
          setLoadingStaffUsernames(true);
          const response = await authAPI.getStaffUsernames();
          if (response.success && response.data) {
            setStaffUsernames(response.data);
          }
        } catch (error) {
          console.error('Failed to fetch staff usernames:', error);
          toast({
            title: 'Warning',
            description: 'Could not load teacher usernames. You can still type manually.',
            variant: 'default',
          });
        } finally {
          setLoadingStaffUsernames(false);
        }
      };
      fetchStaffUsernames();
    }
  }, [role, toast]);

  if (!config) {
    navigate('/');
    return null;
  }

  const Icon = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password, role as UserRole);
      
      if (success) {
        toast({
          title: 'Login Successful',
          description: `Welcome to the ${role} portal!`,
        });
        
        // For students, redirect to dashboard with their ID
        if (role === 'student') {
          // Get user data from localStorage (set by login function)
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          const userId = userData.id;
          
          if (userId) {
            navigate(`/student/dashboard/${userId}`);
          } else {
            // Fallback to old route if ID not available
            navigate(config.redirect);
          }
        } else {
          navigate(config.redirect);
        }
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid credentials. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Login Error',
        description: error.message || 'An error occurred during login.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 gap-2 hover:bg-secondary/50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>

        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl overflow-hidden">
          {/* Gradient top accent */}
          <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />
          
          <CardHeader className="text-center pb-4 pt-8">
            {/* Icon with gradient background */}
            <div className="flex justify-center mb-4">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${config.gradient} p-[2px] shadow-lg`}>
                <div className="w-full h-full bg-card rounded-[14px] flex items-center justify-center">
                  <Icon className="w-10 h-10 text-transparent bg-clip-text bg-gradient-to-br" style={{backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`}} />
                </div>
              </div>
            </div>
            
            {/* Title with badge */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-accent animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Portal Access</span>
              <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            </div>
            
            <CardTitle className="text-3xl font-heading font-bold text-gradient mb-2">
              {config.title}
            </CardTitle>
            <CardDescription className="text-sm">{config.description}</CardDescription>
          </CardHeader>
          
          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username/Email Field - Dropdown for staff, input for others */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  {role === 'owner' ? 'Email Address' : role === 'staff' ? 'Teacher Username' : 'Username'}
                </Label>
                {role === 'staff' ? (
                  <Select
                    value={username}
                    onValueChange={setUsername}
                    required
                    disabled={loadingStaffUsernames}
                  >
                    <SelectTrigger className="bg-secondary/50 border-border/50 focus:border-primary/50 transition-colors">
                      <SelectValue placeholder={loadingStaffUsernames ? "Loading teachers..." : "Select teacher username"} />
                    </SelectTrigger>
                    <SelectContent>
                      {staffUsernames.map((staff) => (
                        <SelectItem key={staff.username} value={staff.username}>
                          {staff.name} ({staff.username})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      placeholder={role === 'owner' ? 'admin@example.com' : 'Enter your username'}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="bg-secondary/50 border-border/50 focus:border-primary/50 transition-colors pl-4"
                    />
                    <Zap className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              
              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-secondary/50 border-border/50 focus:border-primary/50 transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full mt-6 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300" 
                size="lg"
                disabled={isLoading || !username || !password}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Footer text */}
              <p className="text-xs text-center text-muted-foreground mt-4">
                Secure portal • All data encrypted
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Bottom decoration */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>GO Tracker • Student Performance Dashboard</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
