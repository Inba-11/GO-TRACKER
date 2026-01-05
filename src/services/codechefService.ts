// CodeChef Data Service
// Updates CodeChef data every 24 hours for INBATAMIZHAN P

interface CodeChefData {
  username: string;
  rating: number;
  division: string;
  globalRank: number;
  countryRank: number;
  contestsParticipated: number;
  totalSolved: number;
  stars: number;
  league: string;
  recentActivity: {
    lastSubmission: string;
    problemsSolvedRecently: number;
  };
  profileUrl: string;
  lastUpdated: string;
}

class CodeChefService {
  private static instance: CodeChefService;
  private readonly STORAGE_KEY = 'codechef_data_inbatamizhan';
  private readonly UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly API_BASE = 'http://localhost:5000/api';

  private constructor() {}

  public static getInstance(): CodeChefService {
    if (!CodeChefService.instance) {
      CodeChefService.instance = new CodeChefService();
    }
    return CodeChefService.instance;
  }

  // Get current CodeChef data from API or localStorage
  public getCodeChefData(): CodeChefData {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    
    if (stored) {
      const data = JSON.parse(stored);
      // Check if data is still fresh (less than 24 hours old)
      const lastUpdated = new Date(data.lastUpdated);
      const now = new Date();
      const timeDiff = now.getTime() - lastUpdated.getTime();
      
      if (timeDiff < this.UPDATE_INTERVAL) {
        return data;
      }
    }

    // Return default/current data if no stored data or data is stale
    return this.getDefaultData();
  }

  // Fetch CodeChef data from API
  public async fetchFromAPI(): Promise<CodeChefData | null> {
    try {
      const response = await fetch(`${this.API_BASE}/students/roll/711523BCB023`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success && result.data && result.data.platforms && result.data.platforms.codechef) {
        const codechefData = result.data.platforms.codechef;
        
        // Transform API data to our format
        const transformedData: CodeChefData = {
          username: codechefData.username || 'kit27csbs23',
          rating: codechefData.rating || 1264,
          division: codechefData.division || 'Div 4',
          globalRank: codechefData.globalRank || codechefData.rank || 68253,
          countryRank: codechefData.countryRank || 63981,
          contestsParticipated: codechefData.contests || codechefData.contestsAttended || 96,
          totalSolved: codechefData.problemsSolved || 500,
          stars: codechefData.stars || 1,
          league: codechefData.league || 'Bronze',
          recentActivity: {
            lastSubmission: codechefData.lastActive || '2 days ago',
            problemsSolvedRecently: codechefData.recentSubmissions || 3
          },
          profileUrl: codechefData.profileUrl || 'https://www.codechef.com/users/kit27csbs23',
          lastUpdated: new Date().toISOString()
        };
        
        // Store in localStorage
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transformedData));
        
        return transformedData;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to fetch CodeChef data from API:', error);
      return null;
    }
  }

  // Update CodeChef data (try API first, fallback to default)
  public async updateCodeChefData(): Promise<CodeChefData> {
    try {
      // Try to fetch from API first
      const apiData = await this.fetchFromAPI();
      if (apiData) {
        console.log('CodeChef data updated from API successfully');
        return apiData;
      }
      
      // Fallback to default data
      const updatedData = this.getDefaultData();
      updatedData.lastUpdated = new Date().toISOString();
      
      // Store updated data
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedData));
      
      console.log('CodeChef data updated with default data');
      return updatedData;
      
    } catch (error) {
      console.error('Failed to update CodeChef data:', error);
      return this.getDefaultData();
    }
  }

  // Check if data needs update
  public needsUpdate(): boolean {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    
    if (!stored) return true;
    
    const data = JSON.parse(stored);
    const lastUpdated = new Date(data.lastUpdated);
    const now = new Date();
    const timeDiff = now.getTime() - lastUpdated.getTime();
    
    return timeDiff >= this.UPDATE_INTERVAL;
  }

  // Get time until next update
  public getTimeUntilNextUpdate(): string {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    
    if (!stored) return 'Update available now';
    
    const data = JSON.parse(stored);
    const lastUpdated = new Date(data.lastUpdated);
    const nextUpdate = new Date(lastUpdated.getTime() + this.UPDATE_INTERVAL);
    const now = new Date();
    
    if (now >= nextUpdate) return 'Update available now';
    
    const timeDiff = nextUpdate.getTime() - now.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }

  // Start automatic updates
  public startAutoUpdate(): void {
    // Initial fetch from API
    this.fetchFromAPI();
    
    // Check for updates every hour
    setInterval(() => {
      if (this.needsUpdate()) {
        this.updateCodeChefData();
      }
    }, 60 * 60 * 1000); // Check every hour
  }

  // Manual update trigger
  public async forceUpdate(): Promise<CodeChefData> {
    return await this.updateCodeChefData();
  }

  private getDefaultData(): CodeChefData {
    return {
      username: 'kit27csbs23',
      rating: 1264,
      division: 'Div 4',
      globalRank: 68253,
      countryRank: 63981,
      contestsParticipated: 96,
      totalSolved: 500,
      stars: 1,
      league: 'Bronze',
      recentActivity: {
        lastSubmission: '2 days ago',
        problemsSolvedRecently: 3
      },
      profileUrl: 'https://www.codechef.com/users/kit27csbs23',
      lastUpdated: new Date().toISOString()
    };
  }
}

export default CodeChefService;