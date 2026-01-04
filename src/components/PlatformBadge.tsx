import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PlatformBadgeProps {
  platform: 'codechef' | 'hackerrank' | 'leetcode' | 'atcoder' | 'github' | 'codeforces';
  size?: 'sm' | 'md' | 'lg';
}

const platformConfig = {
  codechef: { label: 'CodeChef', className: 'bg-orange-500 hover:bg-orange-600 text-white' },
  hackerrank: { label: 'HackerRank', className: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
  leetcode: { label: 'LeetCode', className: 'bg-amber-500 hover:bg-amber-600 text-white' },
  atcoder: { label: 'AtCoder', className: 'bg-blue-500 hover:bg-blue-600 text-white' },
  github: { label: 'GitHub', className: 'bg-gray-800 hover:bg-gray-900 text-white' },
  codeforces: { label: 'Codeforces', className: 'bg-red-500 hover:bg-red-600 text-white' },
};

const PlatformBadge: React.FC<PlatformBadgeProps> = ({ platform, size = 'md' }) => {
  const config = platformConfig[platform];
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <Badge className={`${config.className} ${sizeClasses[size]} font-medium`}>
      {config.label}
    </Badge>
  );
};

export default PlatformBadge;
