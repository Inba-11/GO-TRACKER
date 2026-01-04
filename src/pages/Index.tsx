import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Shield, User } from 'lucide-react';
import RoleCard from '@/components/RoleCard';

const Index = () => {
  const navigate = useNavigate();

  const roles = [
    {
      title: 'Staff Portal',
      description: 'Monitor student performance across all coding platforms',
      icon: GraduationCap,
      gradient: 'gradient-bg-primary',
      path: '/login/staff',
      delay: 100,
    },
    {
      title: 'ByteBuster Admin',
      description: 'Platform management and analytics dashboard',
      icon: Shield,
      gradient: 'gradient-bg-accent',
      path: '/login/owner',
      delay: 200,
    },
    {
      title: 'Student Portal',
      description: 'View your personal coding journey and progress',
      icon: User,
      gradient: 'gradient-bg-blue',
      path: '/login/student',
      delay: 300,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
        
        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center max-w-3xl mx-auto animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Student Performance Analytics
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6 leading-tight">
              Track, Analyze &{' '}
              <span className="gradient-text">Excel</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
              A comprehensive platform to monitor coding performance across CodeChef, HackerRank, 
              LeetCode, AtCoder, and GitHub. Empowering students and educators with actionable insights.
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {roles.map((role) => (
              <div key={role.title} className="animate-slide-up" style={{ animationDelay: `${role.delay}ms` }}>
                <RoleCard
                  title={role.title}
                  description={role.description}
                  icon={role.icon}
                  gradient={role.gradient}
                  onClick={() => navigate(role.path)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
              Why ByteBuster?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built for modern coding education with real-time insights
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { title: 'Real-time Sync', desc: 'Auto-sync with coding platforms' },
              { title: 'Smart Analytics', desc: 'AI-powered performance insights' },
              { title: 'Progress Tracking', desc: 'Week-over-week comparisons' },
              { title: 'Leaderboards', desc: 'Competitive rankings system' },
            ].map((feature, i) => (
              <div 
                key={feature.title}
                className="text-center p-6 rounded-xl bg-card border border-border/50 card-hover animate-slide-up"
                style={{ animationDelay: `${(i + 1) * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-lg gradient-bg-primary mx-auto mb-4 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-primary-foreground/30" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2026 ByteBuster. Empowering the next generation of coders.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
