import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Trophy, Star, RefreshCw } from 'lucide-react';

interface Contest {
  name: string;
  division: string;
  rating: string;
  problems: string[];
  type: 'rated' | 'unrated';
}

const InbatamizhanContestList: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const contestsPerPage = 10;

  // Complete Contest data from INBATAMIZHAN P profile - DESCENDING ORDER (newest first)
  const contestData: Contest[] = [
    { name: "Starters 219", division: "Division 4 (Rated)", rating: "rated", problems: ["New Operation", "Pizza Comparision", "Ones and Zeroes I", "Cake Baking"], type: "rated" },
    { name: "Starters 218", division: "Division 4 (Rated)", rating: "rated", problems: ["Christmas Trees", "Coloured Balloons", "Stop The Count"], type: "rated" },
    { name: "Starters 217", division: "Division 4 (Rated)", rating: "rated", problems: ["Playing with Toys", "Add to make Positive", "Add 1 or 3"], type: "rated" },
    { name: "Starters 216", division: "Division 4 (Rated)", rating: "rated", problems: ["Scoring", "Best Seats", "Entertainments"], type: "rated" },
    { name: "Starters 214", division: "Division 4 (Unrated)", rating: "unrated", problems: ["Dice Play", "Chef and Close Friends", "Zero Permutation Score"], type: "unrated" },
    { name: "Starters 213", division: "Division 4 (Rated)", rating: "rated", problems: ["Exun and the Pizzas", "EXML Race", "No 4 Please"], type: "rated" },
    { name: "Starters 212", division: "Division 4 (Rated)", rating: "rated", problems: ["Basketball Score", "Signal", "Binary Flip"], type: "rated" },
    { name: "Starters 211", division: "Division 4 (Rated)", rating: "rated", problems: ["Fuel Check", "Buying Chairs", "Wolf Down"], type: "rated" },
    { name: "Starters 210", division: "Division 4 (Rated)", rating: "rated", problems: ["Profits", "Notebook Counting"], type: "rated" },
    { name: "Starters 209", division: "Division 4 (Rated)", rating: "rated", problems: ["Bitcoin Market", "Divisible Duel"], type: "rated" },
    { name: "Starters 208", division: "Division 4 (Rated)", rating: "rated", problems: ["Spring Cleaning", "Alternate Jumps"], type: "rated" },
    { name: "Starters 207", division: "Division 4 (Rated)", rating: "rated", problems: ["Make Subarray", "Tourist", "Gambling"], type: "rated" },
    { name: "Starters 206", division: "Division 4 (Rated)", rating: "rated", problems: ["Remaining Money", "Prime Sum", "Expensive Buying"], type: "rated" },
    { name: "Starters 205", division: "Division 4 (Rated)", rating: "rated", problems: ["Cute Strings", "Mirror Jump"], type: "rated" },
    { name: "Starters 204", division: "Division 4 (Rated)", rating: "rated", problems: ["Triangles", "Episodes"], type: "rated" },
    { name: "Starters 203", division: "Division 4 (Rated)", rating: "rated", problems: ["Cab Rides", "Coloured Orbs", "Passing Grade"], type: "rated" },
    { name: "Starters 202", division: "Division 4 (Rated)", rating: "rated", problems: ["Endless Play", "Two Rolls"], type: "rated" },
    { name: "Starters 200", division: "Division 4 (Rated)", rating: "rated", problems: ["Chef Bakes Cake", "Good Subsequence"], type: "rated" },
    { name: "Starters 199", division: "Division 4 (Rated)", rating: "rated", problems: ["Brick Comparisions", "Cake Making"], type: "rated" },
    { name: "Starters 198", division: "Division 4 (Rated)", rating: "rated", problems: ["Make Cat", "Decoration Discount"], type: "rated" },
    { name: "Starters 197", division: "Division 4 (Rated)", rating: "rated", problems: ["Independence Day", "All Odd Prefix Sums", "Bowling Balls"], type: "rated" },
    { name: "Starters 196", division: "Division 4 (Rated)", rating: "rated", problems: ["More Cookies", "Cloud Watching"], type: "rated" },
    { name: "Starters 195", division: "Division 4 (Rated)", rating: "rated", problems: ["Selling Sandwiches", "Failing Grades", "Marble Collector"], type: "rated" },
    { name: "Starters 194", division: "Division 4 (Rated)", rating: "rated", problems: ["Chef Bakes Cake 1", "Chef Bakes Cake 2"], type: "rated" },
    { name: "Starters 193", division: "Division 4 (Rated)", rating: "rated", problems: ["Check Odd Even Divisors", "Count Odd Even Divisors", "Rectangle and Square"], type: "rated" },
    { name: "Starters 192", division: "Division 4 (Rated)", rating: "rated", problems: ["Missing Shoes", "No Odd Sum"], type: "rated" },
    { name: "Starters 190", division: "Division 4 (Rated)", rating: "rated", problems: ["Maximum Slams", "Number Reduction"], type: "rated" },
    { name: "Starters 189", division: "Division 4 (Rated)", rating: "rated", problems: ["Pizza Party"], type: "rated" },
    { name: "Starters 188", division: "Division 4 (Rated)", rating: "rated", problems: ["Red and Blue Gems", "Train Even or Odd"], type: "rated" },
    { name: "Starters 187", division: "Division 4 (Rated)", rating: "rated", problems: ["Exercise and Rest"], type: "rated" },
    { name: "Starters 186", division: "Division 4 (Rated)", rating: "rated", problems: ["Best Movie", "Chess Win"], type: "rated" },
    { name: "Starters 185", division: "Division 4 (Rated)", rating: "rated", problems: ["Pizza Split", "Balanced Lighting"], type: "rated" },
    { name: "Starters 183", division: "Division 4 (Rated)", rating: "rated", problems: ["Max Sixers"], type: "rated" },
    { name: "Starters 182", division: "Division 4 (Rated)", rating: "rated", problems: ["IPL", "Bar Queue"], type: "rated" },
    { name: "Starters 181", division: "Division 4 (Rated)", rating: "rated", problems: ["Move Grid", "Breaking Sticks"], type: "rated" },
    { name: "Starters 180", division: "Division 4 (Rated)", rating: "rated", problems: ["Shall we play a game", "CodeMat"], type: "rated" },
    { name: "Starters 179", division: "Division 4 (Rated)", rating: "rated", problems: ["Conquer the Fest!!"], type: "rated" },
    { name: "Starters 178", division: "Division 4 (Rated)", rating: "rated", problems: ["Food Balance"], type: "rated" },
    { name: "Starters 177", division: "Division 4 (Rated)", rating: "rated", problems: ["Triangle Checking"], type: "rated" },
    { name: "Starters 176", division: "Division 4 (Rated)", rating: "rated", problems: ["Clothing Store", "Run for Fun"], type: "rated" },
    { name: "Starters 175", division: "Division 4 (Rated)", rating: "rated", problems: ["Assignment Due", "Technex Tickets"], type: "rated" },
    { name: "Starters 174", division: "Division 4 (Rated)", rating: "rated", problems: ["Too Much Homework!"], type: "rated" },
    { name: "Starters 173", division: "Division 4 (Rated upto < 2700)", rating: "rated", problems: ["Time Penalty"], type: "rated" },
    { name: "Starters 172", division: "Division 4 (Rated)", rating: "rated", problems: ["Time Machine", "Small Palindrome"], type: "rated" },
    { name: "Starters 171", division: "Division 4 (Rated)", rating: "rated", problems: ["Squid Game - Piggy Bank", "Advitiya"], type: "rated" },
    { name: "Starters 170", division: "Division 4 (Rated)", rating: "rated", problems: ["Access Code Equality", "Minimum Bottles"], type: "rated" },
    { name: "Starters 169", division: "Division 4 (Rated)", rating: "rated", problems: ["Opposite Attract", "Entry Check"], type: "rated" },
    { name: "Starters 168", division: "Division 4 (Rated)", rating: "rated", problems: ["Can You Bench", "Make Odd", "Big Achiever"], type: "rated" },
    { name: "Starters 167", division: "Division 4 (Rated)", rating: "rated", problems: ["Happy New Year!", "Delete Not Equal"], type: "rated" },
    { name: "Starters 166", division: "Division 4 (Rated)", rating: "rated", problems: ["Christmas Gifts", "Merry Christmas!"], type: "rated" },
    { name: "Starters 165", division: "Division 4 (Rated)", rating: "rated", problems: ["Christmas Cake", "Poster Perimeter", "Bulk Discount"], type: "rated" },
    { name: "Starters 164", division: "Division 4 (Rated)", rating: "rated", problems: ["New-Pro Coder", "Itz Simple"], type: "rated" },
    { name: "Starters 163", division: "Division 4 (Rated)", rating: "rated", problems: ["Chef and Socks", "Binary Sum"], type: "rated" },
    { name: "Starters 162", division: "Division 4 (Rated)", rating: "rated", problems: ["Calorie Intake", "Assignment Score"], type: "rated" },
    { name: "Starters 161", division: "Division 4 (Rated)", rating: "rated", problems: ["Moneymaking"], type: "rated" },
    { name: "Starters 160", division: "Division 4 (Rated)", rating: "rated", problems: ["Too Many Oranges", "Movie Snacks"], type: "rated" },
    { name: "Starters 159", division: "Division 4 (Rated)", rating: "rated", problems: ["Icecream and Cone", "Card Game"], type: "rated" },
    { name: "Starters 158", division: "Division 4 (Rated)", rating: "rated", problems: ["Diwali Discount", "Even vs Odd Divisors"], type: "rated" },
    { name: "Starters 157", division: "Division 4 (Rated)", rating: "rated", problems: ["Glass Prices"], type: "rated" },
    { name: "Starters 156", division: "Division 4 (Rated)", rating: "rated", problems: ["Sweets Shop"], type: "rated" },
    { name: "Starters 155", division: "Division 4 (Rated)", rating: "rated", problems: ["Chef and Parole"], type: "rated" },
    { name: "Starters 154", division: "Division 4 (Rated)", rating: "rated", problems: ["Add 1 or 2 Game", "Calorie Limit", "Coldplay Tickets"], type: "rated" },
    { name: "Starters 153", division: "Division 4 (Rated)", rating: "rated", problems: ["AI is Coming", "Make Arithmetic Progression", "Butterfly"], type: "rated" },
    { name: "Starters 152", division: "Division 4 (Rated)", rating: "rated", problems: ["Chess Olympiad"], type: "rated" },
    { name: "Starters 151", division: "Division 4 (rated)", rating: "rated", problems: ["Weightlifting"], type: "rated" },
    { name: "Starters 150", division: "Division 4 (Rated)", rating: "rated", problems: ["IOI 2024"], type: "rated" },
    { name: "Starters 149", division: "Division 4 (Rated)", rating: "rated", problems: ["Approximate Answer"], type: "rated" },
    { name: "Starters 148", division: "Division 4 (Rated)", rating: "rated", problems: ["Let Me Eat Cake!", "Clearance Sale"], type: "rated" },
    { name: "Starters 147", division: "Division 4 (Rated till 5 stars)", rating: "rated", problems: ["Independence Day 101", "Gold Coins 101"], type: "rated" },
    { name: "Starters 146", division: "Division 4 (Rated till 5 stars)", rating: "rated", problems: ["Olympics 2024"], type: "rated" },
    { name: "Starters 145", division: "Division 4 (Rated)", rating: "rated", problems: ["Volume Comparison"], type: "rated" },
    { name: "Starters 143", division: "Division 4 (Rated)", rating: "rated", problems: ["International Justice Day"], type: "rated" },
    { name: "Starters 142", division: "Division 4 (Rated)", rating: "rated", problems: ["Writing Speed", "Penalty Shoot-out"], type: "rated" },
    { name: "Starters 141", division: "Division 4 (Rated)", rating: "rated", problems: ["Lucky Clover"], type: "rated" },
    { name: "Starters 140", division: "Division 4 (Rated)", rating: "rated", problems: ["Yoga Day", "Yoga Class"], type: "rated" },
    { name: "Starters 139", division: "Division 4 (Rated)", rating: "rated", problems: ["Television Channels"], type: "rated" },
    { name: "Starters 138", division: "Division 4 (Rated)", rating: "rated", problems: ["Heat Wave", "Long Drive"], type: "rated" },
    { name: "Starters 137", division: "Division 4 (Rated)", rating: "rated", problems: ["Election Hopes"], type: "rated" },
    { name: "Starters 136", division: "Division 4 (Rated)", rating: "rated", problems: ["Who Makes P1"], type: "rated" },
    { name: "Starters 135", division: "Division 4 (Rated)", rating: "rated", problems: ["RCB vs CSK"], type: "rated" },
    { name: "Starters 134", division: "Division 4 (Rated)", rating: "rated", problems: ["Morning Run", "Money Double"], type: "rated" },
    { name: "Starters 133", division: "Division 4 (Rated)", rating: "rated", problems: ["Legs on a Farm", "Devouring Donuts"], type: "rated" },
    { name: "Starters 132", division: "Division 4 (Rated)", rating: "rated", problems: ["Change Please", "ICE CREAM"], type: "rated" },
    { name: "Starters 131", division: "Division 4 (Rated)", rating: "rated", problems: ["Remaining Neighborhoods"], type: "rated" },
    { name: "Starters 130", division: "Division 4 (Rated)", rating: "rated", problems: ["Giant Wheel"], type: "rated" },
    { name: "Starters 129", division: "Division 4 (Rated)", rating: "rated", problems: ["Football Training"], type: "rated" },
    { name: "Starters 128", division: "Division 4 (Rated)", rating: "rated", problems: ["Reach 5 Star"], type: "rated" },
    { name: "Starters 127", division: "Division 4", rating: "rated", problems: ["The Ides of March"], type: "rated" },
    { name: "Starters 126", division: "Division 4 (Rated)", rating: "rated", problems: ["AC Please"], type: "rated" },
    { name: "Starters 125", division: "Division 4 (Rated)", rating: "rated", problems: ["Overspeeding", "50-50 Rule"], type: "rated" },
    { name: "Starters 124", division: "Division 4 (Rated)", rating: "rated", problems: ["Summer Time"], type: "rated" },
    { name: "Starters 123", division: "Division 4 (Rated)", rating: "rated", problems: ["Room Allocation", "Algomaniac Finals"], type: "rated" },
    { name: "Starters 122", division: "Division 4 (Rated)", rating: "rated", problems: ["Healthy Sleep", "Problem Reviews"], type: "rated" },
    { name: "Starters 121", division: "Division 4 (Rated)", rating: "rated", problems: ["Leg Space"], type: "rated" },
    { name: "Starters 114", division: "Division 4 (Rated)", rating: "rated", problems: ["Christmas Greetings"], type: "rated" },
    { name: "Starters 112", division: "Division 4 (Rated)", rating: "rated", problems: ["Food Costs"], type: "rated" },
    { name: "Starters 111", division: "Division 4 (Rated)", rating: "rated", problems: ["404 Not Found"], type: "rated" }
  ];

  useEffect(() => {
    fetchContestsFromAPI();
  }, []);

  const fetchContestsFromAPI = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/scraping/inbatamizhan/contests');
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.contests) {
          // If we have real contest data from API, use it
          const apiContests = result.data.contests.map((contestText: string, index: number) => {
            // Enhanced parsing for contest data with problems
            // Format: "Starters 219 Division 4 (Rated) New Operation, Pizza Comparision, Ones and Zeroes I, Cake Baking"
            
            const contestMatch = contestText.match(/^(Starters \d+)\s+(Division \d+[^A-Za-z]*(?:\([^)]*\))?)\s+(.+)$/);
            
            if (contestMatch) {
              const [, name, division, problemsText] = contestMatch;
              const problems = problemsText.split(',').map(p => p.trim()).filter(p => p.length > 0);
              
              return {
                name: name.trim(),
                division: division.trim(),
                rating: division.toLowerCase().includes('unrated') ? 'unrated' : 'rated',
                problems: problems,
                type: division.toLowerCase().includes('unrated') ? 'unrated' as const : 'rated' as const
              };
            } else {
              // Fallback parsing
              const name = contestText.match(/Starters \d+/)?.[0] || `Contest ${index + 1}`;
              const division = contestText.includes('Division 4') ? 'Division 4 (Rated)' : 'Division 4';
              const problems = contestText.split(/[,;]/).slice(1).map(p => p.trim()).filter(p => p.length > 0);
              
              return {
                name,
                division,
                rating: 'rated',
                problems: problems.slice(0, 4), // Limit to 4 problems for display
                type: 'rated' as const
              };
            }
          });
          
          // Ensure contests are in descending order (newest first) and filter valid contests
          const validContests = apiContests.filter(contest => contest.name.includes('Starters'));
          const sortedContests = validContests.length > 0 ? validContests : contestData;
          setContests(sortedContests);
        } else {
          // Fallback to static data (already in descending order)
          setContests(contestData);
        }
      } else {
        // Fallback to static data
        setContests(contestData);
      }
    } catch (error) {
      console.error('Failed to fetch contests from API:', error);
      // Fallback to static data
      setContests(contestData);
    } finally {
      setLoading(false);
    }
  };

  const refreshContests = async () => {
    setRefreshing(true);
    try {
      // Trigger scraper to get latest data
      const response = await fetch('http://localhost:5000/api/scraping/inbatamizhan', {
        method: 'POST'
      });
      
      if (response.ok) {
        // Wait for scraper to complete, then fetch updated contest data
        setTimeout(async () => {
          await fetchContestsFromAPI();
          setRefreshing(false);
        }, 3000);
      } else {
        setRefreshing(false);
      }
    } catch (error) {
      console.error('Failed to refresh contests:', error);
      setRefreshing(false);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(contests.length / contestsPerPage);
  const startIndex = (currentPage - 1) * contestsPerPage;
  const endIndex = startIndex + contestsPerPage;
  const currentContests = contests.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-slate-600">Loading contests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with refresh button and total problems count */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-600">
              Showing {startIndex + 1}-{Math.min(endIndex, contests.length)} of {contests.length} contests (Latest First)
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full border border-green-200">
            <Trophy className="h-4 w-4 text-green-600" />
            <span className="text-sm font-semibold text-green-800">
              {contests.reduce((total, contest) => total + contest.problems.length, 0)} Total Problems
            </span>
          </div>
        </div>
        <Button
          onClick={refreshContests}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Contest List */}
      <div className="space-y-3">
        {currentContests.map((contest, index) => {
          // Calculate the actual contest number (descending order)
          const contestNumber = contests.length - (startIndex + index);
          
          return (
            <div
              key={`${contest.name}-${index}`}
              className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span class="text-sm font-bold text-white bg-gradient-to-r from-[#3CB8BA] to-[#2DD4BF] px-3 py-1 rounded-full shadow-sm">
                        #{contestNumber}
                      </span>
                      <h3 className="font-semibold text-slate-800 text-lg">{contest.name}</h3>
                    </div>
                    <Badge 
                      variant={contest.type === 'rated' ? 'default' : 'secondary'}
                      className={contest.type === 'rated' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}
                    >
                      {contest.division}
                    </Badge>
                    {contest.type === 'rated' && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-yellow-600 font-medium">Rated</span>
                      </div>
                    )}
                  </div>
                  
                  {contest.problems.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Trophy className="h-4 w-4 text-amber-500" />
                          <span className="font-medium">Problems Solved:</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                          <span>{contest.problems.length}</span>
                          <span>problems</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {contest.problems.map((problem, problemIndex) => (
                          <span
                            key={problemIndex}
                            className="inline-flex items-center px-3 py-1.5 bg-[#61B93C] text-white text-sm rounded-md border border-[#61B93C] font-medium hover:bg-[#61B93C]/90 transition-colors"
                          >
                            {problem}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-center gap-2 ml-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <span className="text-xs text-slate-500">Participated</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Contest #{contestNumber}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <Button
              onClick={goToPrevious}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              onClick={goToNext}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-sm text-slate-600">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}
    </div>
  );
};

export default InbatamizhanContestList;