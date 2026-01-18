import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Globe, Award, TrendingUp } from 'lucide-react';

interface LeetCodeProfileSectionProps {
  username: string;
  realName?: string;
  userAvatar?: string;
  ranking?: number;
  reputation?: number;
  globalRanking?: number;
  topPercentage?: number;
}

const LeetCodeProfileSection: React.FC<LeetCodeProfileSectionProps> = ({
  username,
  realName,
  userAvatar,
  ranking,
  reputation,
  globalRanking,
  topPercentage
}) => {
  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-heading flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <Avatar className="w-24 h-24 border-2 border-primary/20">
              {userAvatar ? (
                <AvatarImage src={userAvatar} alt={username} />
              ) : (
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {username.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Username</p>
              <p className="font-semibold text-foreground">{username}</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {realName && (
              <div className="p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Real Name</p>
                </div>
                <p className="font-semibold text-foreground">{realName}</p>
              </div>
            )}

            {ranking !== undefined && ranking > 0 && (
              <div className="p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Profile Ranking</p>
                </div>
                <p className="font-semibold text-foreground">
                  #{ranking.toLocaleString()}
                </p>
              </div>
            )}

            {globalRanking !== undefined && globalRanking > 0 && (
              <div className="p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Global Ranking</p>
                </div>
                <p className="font-semibold text-foreground">
                  #{globalRanking.toLocaleString()}
                </p>
              </div>
            )}

            {reputation !== undefined && reputation > 0 && (
              <div className="p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Reputation</p>
                </div>
                <p className="font-semibold text-foreground">
                  {reputation.toLocaleString()}
                </p>
              </div>
            )}

            {topPercentage !== undefined && topPercentage > 0 && (
              <div className="p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Top Percentile</p>
                </div>
                <p className="font-semibold text-foreground">
                  Top {topPercentage.toFixed(2)}%
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeetCodeProfileSection;

