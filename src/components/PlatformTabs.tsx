import React, { useState, useRef, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface PlatformTabsProps {
  student: any;
  isStudentView: boolean;
  onRefresh: (platform: 'leetcode' | 'codechef' | 'codeforces' | 'github' | 'codolio') => Promise<void>;
  refreshingStates: {
    leetcode: boolean;
    codechef: boolean;
    codeforces: boolean;
    github: boolean;
    codolio: boolean;
  };
  children?: React.ReactNode;
}

const PLATFORMS = [
  { id: 'leetcode', label: 'LeetCode', value: 'leetcode' },
  { id: 'codechef', label: 'CodeChef', value: 'codechef' },
  { id: 'codeforces', label: 'Codeforces', value: 'codeforces' },
  { id: 'github', label: 'GitHub', value: 'github' },
  { id: 'codolio', label: 'Codolio', value: 'codolio' },
] as const;

const PlatformTabs: React.FC<PlatformTabsProps> = ({
  student,
  isStudentView,
  onRefresh,
  refreshingStates,
  children
}) => {
  const [activeTab, setActiveTab] = useState<string>('leetcode');
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const minSwipeDistance = 50;

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left = next tab
      const currentIndex = PLATFORMS.findIndex(p => p.value === activeTab);
      if (currentIndex < PLATFORMS.length - 1) {
        setActiveTab(PLATFORMS[currentIndex + 1].value);
      }
    } else if (isRightSwipe) {
      // Swipe right = previous tab
      const currentIndex = PLATFORMS.findIndex(p => p.value === activeTab);
      if (currentIndex > 0) {
        setActiveTab(PLATFORMS[currentIndex - 1].value);
      }
    }

    // Reset touch positions
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't interfere with input fields
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const currentIndex = PLATFORMS.findIndex(p => p.value === activeTab);
        
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
          setActiveTab(PLATFORMS[currentIndex - 1].value);
        } else if (e.key === 'ArrowRight' && currentIndex < PLATFORMS.length - 1) {
          setActiveTab(PLATFORMS[currentIndex + 1].value);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  return (
    <div 
      ref={tabsContainerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="w-full"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
          <TabsList className="w-full grid grid-cols-5 h-12 bg-transparent p-0 gap-0">
            {PLATFORMS.map((platform) => (
              <TabsTrigger
                key={platform.id}
                value={platform.value}
                className={cn(
                  "text-sm font-medium text-slate-600 transition-colors",
                  "data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600",
                  "hover:text-slate-900 border-b-2 border-transparent rounded-none"
                )}
              >
                {platform.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Render platform content */}
        <div className="w-full">
          {children}
        </div>
      </Tabs>
    </div>
  );
};

export default PlatformTabs;
