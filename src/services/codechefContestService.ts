// CodeChef Contest Data Service
// Real contest data for INBATAMIZHAN P (kit27csbs23)

export interface ContestData {
  id: number;
  name: string;
  problems_solved: string[];
  problems_count: number;
  date: string;
  attended: boolean;
  rating?: number;
  rating_change?: number;
  rank?: number;
  problems_given: number; // Problems available to user's division (e.g., 4 for Div 4)
  total_problems_in_contest: number; // Total problems across all divisions (e.g., 8 total)
  division_participated: string; // Division the user participated in (e.g., "Div 4")
  success_rate: number;
  division_success_rate: number; // Success rate within user's division
  contest_wide_success_rate: number; // Success rate considering all contest problems
}

export interface CodeChefContestHistory {
  username: string;
  total_contests: number;
  contests: ContestData[];
  scraped_at: string;
}

class CodeChefContestService {
  private static instance: CodeChefContestService;
  private readonly STORAGE_KEY = 'codechef_contests_kit27csbs23';
  private totalContestsFromAPI: number | null = null;

  private constructor() {}

  public static getInstance(): CodeChefContestService {
    if (!CodeChefContestService.instance) {
      CodeChefContestService.instance = new CodeChefContestService();
    }
    return CodeChefContestService.instance;
  }

  // Fetch total contest count from API or student data
  public async fetchTotalContestsFromAPI(studentData?: any): Promise<number> {
    // First, try to get from student data if provided
    if (studentData?.platforms?.codechef?.totalContests) {
      this.totalContestsFromAPI = studentData.platforms.codechef.totalContests;
      return this.totalContestsFromAPI;
    }

    // Try API call
    try {
      const response = await fetch('/api/students/me');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.platforms?.codechef?.totalContests) {
          this.totalContestsFromAPI = data.data.platforms.codechef.totalContests;
          return this.totalContestsFromAPI;
        }
      }
    } catch (error) {
      console.error('Error fetching total contests from API:', error);
    }
    
    // Fallback: Try to get from our scraped data file
    try {
      const scrapedResponse = await fetch('/codechef_contest_count.json');
      if (scrapedResponse.ok) {
        const scrapedData = await scrapedResponse.json();
        if (scrapedData.total_contests) {
          this.totalContestsFromAPI = scrapedData.total_contests;
          return this.totalContestsFromAPI;
        }
      }
    } catch (error) {
      console.error('Error fetching scraped contest data:', error);
    }
    
    // Final fallback to scraped value
    return 96;
  }

  // Get total contest count (from API or fallback)
  public async getTotalContests(): Promise<number> {
    if (this.totalContestsFromAPI !== null) {
      return this.totalContestsFromAPI;
    }
    
    return await this.fetchTotalContestsFromAPI();
  }

  // Real contest data scraped from CodeChef profile
  // Shows only the last 15 contests for better performance and focus
  public async getRealContestDataAsync(): Promise<CodeChefContestHistory> {
    const totalContests = await this.getTotalContests();
    
    return {
      "username": "kit27csbs23",
      "total_contests": totalContests, // Dynamic total from API/MongoDB
      "contests": this.getLast15Contests(),
      "scraped_at": new Date().toISOString()
    };
  }

  // Synchronous version for backward compatibility
  public getRealContestData(): CodeChefContestHistory {
    return {
      "username": "kit27csbs23",
      "total_contests": this.totalContestsFromAPI || 96, // Use cached value or fallback
      "contests": this.getLast15Contests(),
      "scraped_at": new Date().toISOString()
    };
  }

  // Extract the contest data to a separate method
  private getLast15Contests(): ContestData[] {
    return [
      {
        "id": 97,
        "name": "Starters 219 (Rated)",
        "problems_solved": ["New Operation", "Pizza Comparision", "Ones and Zeroes I", "Cake Baking"],
        "problems_count": 4,
        "problems_given": 4,
        "total_problems_in_contest": 8,
        "division_participated": "Div 4",
        "date": "2025-12-31",
        "attended": true,
        "success_rate": 100.0,
        "division_success_rate": 100.0,
        "contest_wide_success_rate": 50.0,
        "rating": 1264,
        "rating_change": 30,
        "rank": 1672
      },
      {
        "id": 96,
        "name": "Starters 218 (Rated)",
        "problems_solved": ["Christmas Trees", "Coloured Balloons", "Stop The Count"],
        "problems_count": 3,
        "problems_given": 4,
        "total_problems_in_contest": 8,
        "division_participated": "Div 4",
        "date": "2025-12-24",
        "attended": true,
        "success_rate": 75.0,
        "division_success_rate": 75.0,
        "contest_wide_success_rate": 37.5,
        "rating": 1234,
        "rating_change": -15,
        "rank": 2145
      },
      {
        "id": 95,
        "name": "Starters 217 (Rated)",
        "problems_solved": ["Playing with Toys", "Add to make Positive", "Add 1 or 3"],
        "problems_count": 3,
        "problems_given": 4,
        "total_problems_in_contest": 8,
        "division_participated": "Div 4",
        "date": "2025-12-17",
        "attended": true,
        "success_rate": 75.0,
        "division_success_rate": 75.0,
        "contest_wide_success_rate": 37.5,
        "rating": 1249,
        "rating_change": 25,
        "rank": 1834
      },
      {
        "id": 94,
        "name": "Starters 216 (Rated)",
        "problems_solved": ["Scoring", "Best Seats", "Entertainments"],
        "problems_count": 3,
        "problems_given": 4,
        "total_problems_in_contest": 8,
        "division_participated": "Div 4",
        "date": "2025-12-10",
        "attended": true,
        "success_rate": 75.0,
        "division_success_rate": 75.0,
        "contest_wide_success_rate": 37.5,
        "rating": 1224,
        "rating_change": 18,
        "rank": 1956
      },
      {
        "id": 93,
        "name": "Starters 214 (Unrated)",
        "problems_solved": ["Dice Play", "Chef and Close Friends", "Zero Permutation Score"],
        "problems_count": 3,
        "problems_given": 4,
        "total_problems_in_contest": 7,
        "division_participated": "Div 4",
        "date": "2025-11-26",
        "attended": true,
        "success_rate": 75.0,
        "division_success_rate": 75.0,
        "contest_wide_success_rate": 42.9,
        "rating": 1206,
        "rating_change": 0,
        "rank": 2234
      },
      {
        "id": 92,
        "name": "Starters 213 (Rated)",
        "problems_solved": ["Exun and the Pizzas", "EXML Race", "No 4 Please"],
        "problems_count": 3,
        "problems_given": 4,
        "total_problems_in_contest": 8,
        "division_participated": "Div 4",
        "date": "2025-11-19",
        "attended": true,
        "success_rate": 75.0,
        "division_success_rate": 75.0,
        "contest_wide_success_rate": 37.5,
        "rating": 1206,
        "rating_change": 12,
        "rank": 2156
      },
      {
        "id": 91,
        "name": "Starters 212 (Rated)",
        "problems_solved": ["Basketball Score", "Signal", "Binary Flip"],
        "problems_count": 3,
        "problems_given": 4,
        "total_problems_in_contest": 8,
        "division_participated": "Div 4",
        "date": "2025-11-12",
        "attended": true,
        "success_rate": 75.0,
        "division_success_rate": 75.0,
        "contest_wide_success_rate": 37.5,
        "rating": 1194,
        "rating_change": 22,
        "rank": 1876
      },
      {
        "id": 90,
        "name": "Starters 211 (Rated)",
        "problems_solved": ["Fuel Check", "Buying Chairs", "Wolf Down"],
        "problems_count": 3,
        "problems_given": 4,
        "total_problems_in_contest": 8,
        "division_participated": "Div 4",
        "date": "2025-11-05",
        "attended": true,
        "success_rate": 75.0,
        "division_success_rate": 75.0,
        "contest_wide_success_rate": 37.5,
        "rating": 1172,
        "rating_change": 28,
        "rank": 1654
      },
      {
        "id": 89,
        "name": "Starters 210 (Rated)",
        "problems_solved": ["Profits", "Notebook Counting"],
        "problems_count": 2,
        "problems_given": 4,
        "total_problems_in_contest": 8,
        "division_participated": "Div 4",
        "date": "2025-10-29",
        "attended": true,
        "success_rate": 50.0,
        "division_success_rate": 50.0,
        "contest_wide_success_rate": 25.0,
        "rating": 1144,
        "rating_change": -8,
        "rank": 2567
      },
      {
        "id": 88,
        "name": "Starters 209 (Rated)",
        "problems_solved": ["Bitcoin Market", "Divisible Duel"],
        "problems_count": 2,
        "problems_given": 4,
        "total_problems_in_contest": 8,
        "division_participated": "Div 4",
        "date": "2025-10-22",
        "attended": true,
        "success_rate": 50.0,
        "division_success_rate": 50.0,
        "contest_wide_success_rate": 25.0,
        "rating": 1152,
        "rating_change": -12,
        "rank": 2789
      },
      {
        "id": 87,
        "name": "Starters 208 (Rated)",
        "problems_solved": ["Spring Cleaning", "Alternate Jumps"],
        "problems_count": 2,
        "problems_given": 4,
        "total_problems_in_contest": 8,
        "division_participated": "Div 4",
        "date": "2025-10-15",
        "attended": true,
        "success_rate": 50.0,
        "division_success_rate": 50.0,
        "contest_wide_success_rate": 25.0,
        "rating": 1164,
        "rating_change": -5,
        "rank": 2456
      },
      {
        "id": 86,
        "name": "Starters 207 (Rated)",
        "problems_solved": ["Make Subarray", "Tourist", "Gambling"],
        "problems_count": 3,
        "problems_given": 4,
        "total_problems_in_contest": 8,
        "division_participated": "Div 4",
        "date": "2025-10-08",
        "attended": true,
        "success_rate": 75.0,
        "division_success_rate": 75.0,
        "contest_wide_success_rate": 37.5,
        "rating": 1169,
        "rating_change": 15,
        "rank": 1987
      },
      {
        "id": 85,
        "name": "Starters 206 (Rated)",
        "problems_solved": ["Remaining Money", "Prime Sum", "Expensive Buying"],
        "problems_count": 3,
        "problems_given": 4,
        "total_problems_in_contest": 8,
        "division_participated": "Div 4",
        "date": "2025-10-01",
        "attended": true,
        "success_rate": 75.0,
        "division_success_rate": 75.0,
        "contest_wide_success_rate": 37.5,
        "rating": 1154,
        "rating_change": 20,
        "rank": 1765
      },
      {
        "id": 84,
        "name": "Starters 205 (Rated)",
        "problems_solved": ["Cute Strings", "Mirror Jump"],
        "problems_count": 2,
        "problems_given": 4,
        "total_problems_in_contest": 8,
        "division_participated": "Div 4",
        "date": "2025-09-24",
        "attended": true,
        "success_rate": 50.0,
        "division_success_rate": 50.0,
        "contest_wide_success_rate": 25.0,
        "rating": 1134,
        "rating_change": -10,
        "rank": 2634
      },
      {
        "id": 83,
        "name": "Starters 204 (Rated)",
        "problems_solved": ["Triangles", "Episodes"],
        "problems_count": 2,
        "problems_given": 4,
        "total_problems_in_contest": 8,
        "division_participated": "Div 4",
        "date": "2025-09-17",
        "attended": true,
        "success_rate": 50.0,
        "division_success_rate": 50.0,
        "contest_wide_success_rate": 25.0,
        "rating": 1144,
        "rating_change": -7,
        "rank": 2523
      }
    ];
  }

  // Get paginated contest data
  public getContestPage(page: number, pageSize: number = 10): {
    contests: ContestData[];
    totalPages: number;
    currentPage: number;
    totalContests: number;
  } {
    const data = this.getRealContestData();
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      contests: data.contests.slice(startIndex, endIndex),
      totalPages: Math.ceil(data.contests.length / pageSize),
      currentPage: page,
      totalContests: data.contests.length
    };
  }

  // Get contest statistics
  public getContestStats(): {
    totalContests: number;
    attended: number;
    totalProblemsSolved: number;
    attendanceRate: number;
    averageProblemsPerContest: number;
    bestRank: number;
    currentRating: number;
  } {
    const data = this.getRealContestData();
    const attendedContests = data.contests.filter(c => c.attended);
    const totalProblemsSolved = data.contests.reduce((sum, c) => sum + c.problems_count, 0);
    const rankedContests = data.contests.filter(c => c.rank);
    const bestRank = rankedContests.length > 0 ? Math.min(...rankedContests.map(c => c.rank!)) : 0;
    const latestRating = data.contests.find(c => c.rating)?.rating || 1264;

    return {
      totalContests: data.total_contests, // Show total contests participated (96), not just recent ones
      attended: attendedContests.length,
      totalProblemsSolved,
      attendanceRate: (attendedContests.length / data.contests.length) * 100,
      averageProblemsPerContest: totalProblemsSolved / attendedContests.length,
      bestRank,
      currentRating: latestRating
    };
  }
}

export default CodeChefContestService;