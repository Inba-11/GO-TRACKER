import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle common error cases
    if (error.response?.status === 401) {
      const requestUrl: string = error.config?.url || '';
      const hasToken = !!localStorage.getItem('authToken');

      // If login itself fails, do NOT redirect (let the UI show the error)
      if (requestUrl.includes('/auth/login')) {
        return Promise.reject(error);
      }

      // If we had a token and got 401, the session is invalid/expired
      if (hasToken) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } else if (error.response?.status === 403) {
      // Forbidden - insufficient permissions
      console.error('Access forbidden: Insufficient permissions');
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      console.error('Request timeout: Please check your connection');
    }
    
    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
  role: 'student' | 'staff' | 'owner';
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    role: 'student' | 'staff' | 'owner';
    studentData?: any;
  };
}

export interface Student {
  id: string;
  _id: string;
  name: string;
  email: string;
  rollNumber: string;
  batch: 'A' | 'B' | 'C' | 'D' | 'NON-CRT';
  department: string;
  year: number;
  avatar: string;
  defaultAvatar: string;
  platformLinks: {
    leetcode: string;
    codeforces: string;
    github: string;
    codechef: string;
    codolio: string;
  };
  platforms: {
    codechef: PlatformStats;
    hackerrank: PlatformStats;
    leetcode: PlatformStats;
    atcoder: PlatformStats;
    codeforces: PlatformStats;
    github: GitHubStats;
    codolio: CodolioStats;
  };
  weeklyProgress: WeeklyProgress[];
  resume?: string | null;
  projectRepositories: ProjectRepository[];
  isActive: boolean;
  lastScrapedAt: string;
}

export interface PlatformStats {
  username: string;
  rating: number;
  maxRating: number;
  problemsSolved: number;
  rank: number;
  lastWeekRating: number;
  contests: number;
  contestsAttended: number;
  totalContests?: number; // Total contests participated (scraped from profile)
  contestCountUpdatedAt?: string; // When contest count was last updated
  lastUpdated: string;
}

export interface GitHubStats {
  username: string;
  repositories: number;
  contributions: number;
  commits: number;
  followers: number;
  lastWeekContributions: number;
  streak: number;
  longestStreak: number;
  lastUpdated: string;
}

export interface CodolioStats {
  username: string;
  totalSubmissions: number;
  totalActiveDays: number;
  totalContests: number;
  currentStreak: number;
  maxStreak: number;
  dailySubmissions: { date: string; count: number }[];
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
  }>;
  lastUpdated: string;
}

export interface WeeklyProgress {
  week: string;
  codechef: number;
  hackerrank: number;
  leetcode: number;
  atcoder: number;
  codeforces: number;
  github: number;
}

export interface ProjectRepository {
  id: string;
  _id: string;
  name: string;
  url: string;
  description: string;
  addedAt: string;
}

export interface StatsOverview {
  totalStudents: number;
  totalProblems: number;
  totalContributions: number;
  activePlatforms: number;
}

export interface TopPerformers {
  codechef: Student | null;
  hackerrank: Student | null;
  leetcode: Student | null;
  atcoder: Student | null;
  codeforces: Student | null;
  github: Student | null;
}

// Authentication API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  getMe: async (): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>('/auth/me');
    return response.data;
  },
};

// Students API
export const studentsAPI = {
  getAll: async (params?: { batch?: string; sortBy?: string; order?: string }): Promise<ApiResponse<Student[]>> => {
    const response = await api.get<ApiResponse<Student[]>>('/students', { params });
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<Student>> => {
    const response = await api.get<ApiResponse<Student>>('/students/me');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Student>> => {
    const response = await api.get<ApiResponse<Student>>(`/students/${id}`);
    return response.data;
  },

  getByRollNumber: async (rollNumber: string): Promise<ApiResponse<Student>> => {
    const response = await api.get<ApiResponse<Student>>(`/students/roll/${rollNumber}`);
    return response.data;
  },

  updateAvatar: async (avatarId?: string, customAvatar?: string): Promise<ApiResponse<Student>> => {
    const response = await api.put<ApiResponse<Student>>('/students/me/avatar', { avatarId, customAvatar });
    return response.data;
  },

  updateResume: async (resumeUrl: string): Promise<ApiResponse<Student>> => {
    const response = await api.put<ApiResponse<Student>>('/students/me/resume', { resumeUrl });
    return response.data;
  },

  deleteResume: async (): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>('/students/me/resume');
    return response.data;
  },

  addRepository: async (repo: { name: string; url: string; description: string }): Promise<ApiResponse<Student>> => {
    const response = await api.post<ApiResponse<Student>>('/students/me/repositories', repo);
    return response.data;
  },

  deleteRepository: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/students/me/repositories/${id}`);
    return response.data;
  },

  scrapeData: async (id: string, force?: boolean): Promise<ApiResponse<Student>> => {
    const response = await api.post<ApiResponse<Student>>(`/students/${id}/scrape`, {}, { params: { force } });
    return response.data;
  },

  create: async (studentData: Partial<Student>): Promise<ApiResponse<Student>> => {
    const response = await api.post<ApiResponse<Student>>('/students', studentData);
    return response.data;
  },

  update: async (id: string, studentData: Partial<Student>): Promise<ApiResponse<Student>> => {
    const response = await api.put<ApiResponse<Student>>(`/students/${id}`, studentData);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/students/${id}`);
    return response.data;
  },
};

// Stats API
export const statsAPI = {
  getOverview: async (): Promise<ApiResponse<StatsOverview>> => {
    const response = await api.get<ApiResponse<StatsOverview>>('/stats/overview');
    return response.data;
  },

  getTopPerformers: async (): Promise<ApiResponse<TopPerformers>> => {
    const response = await api.get<ApiResponse<TopPerformers>>('/stats/top-performers');
    return response.data;
  },

  getAdminStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get<ApiResponse<any>>('/stats/admin');
    return response.data;
  },
};

// Export the configured axios instance for custom requests
export default api;
