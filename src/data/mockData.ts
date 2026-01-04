import { getAvatarForStudent } from './avatars';

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  defaultAvatar: string;
  department: string;
  year: number;
  rollNumber: string;
  batch: 'A' | 'B' | 'C' | 'D' | 'NON-CRT';
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
}

export interface CodolioStats {
  username: string;
  totalSubmissions: number;
  currentStreak: number;
  maxStreak: number;
  dailySubmissions: { date: string; count: number }[];
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface GitHubStats {
  username: string;
  repositories: number;
  contributions: number;
  commits: number;
  followers: number;
  lastWeekContributions: number;
  streak: number;
}

export interface ProjectRepository {
  id: string;
  name: string;
  url: string;
  description: string;
  addedAt: string;
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

export interface StaffCredential {
  username: string;
  password: string;
}

export const staffCredentials: StaffCredential[] = [
  { username: "Pandiyarajan", password: "Mentor@123" },
  { username: "Tamilarasu", password: "Mentor@123" },
  { username: "Priya", password: "Mentor@123" },
  { username: "Seema", password: "Mentor@123" },
  { username: "Narmatha", password: "Mentor@123" },
  { username: "Sudarvizhi", password: "Mentor@123" },
  { username: "Hemalatha", password: "Mentor@123" },
];

const getDefaultAvatar = (rollNumber: string, index: number) => {
  return getAvatarForStudent(rollNumber, index);
};

const batchAssignments: Record<string, 'A' | 'B' | 'C' | 'D' | 'NON-CRT'> = {
  "711523BCB005": "A",
  "711523BCB016": "A",
  "711523BCB019": "A",
  "711523BCB031": "A",
  "711523BCB041": "A",
  "711523BCB045": "A",
  "711523BCB011": "A",
  "711523BCB015": "A",
  "711523BCB047": "A",
  "711523BCB049": "A",
  "711523BCB054": "A",
  "711523BCB055": "A",
  "711523BCB056": "A",
  "711523BCB013": "B",
  "711523BCB025": "B",
  "711523BCB034": "B",
  "711523BCB043": "B",
  "711523BCB058": "B",
  "711523BCB060": "B",
  "711523BCB001": "B",
  "711523BCB006": "B",
  "711523BCB030": "B",
  "711523BCB035": "B",
  "711523BCB039": "B",
  "711523BCB002": "C",
  "711523BCB003": "C",
  "711523BCB004": "C",
  "711523BCB010": "C",
  "711523BCB014": "C",
  "711523BCB017": "C",
  "711523BCB018": "C",
  "711523BCB020": "C",
  "711523BCB024": "C",
  "711523BCB026": "C",
  "711523BCB023": "C",
  "711523BCB028": "C",
  "711523BCB033": "C",
  "711523BCB036": "C",
  "711523BCB038": "C",
  "711523BCB053": "C",
  "711523BCB063": "C",
  "711523BCB037": "C",
  "711523BCB057": "C",
  "711523BCB007": "D",
  "711523BCB008": "D",
  "711523BCB009": "D",
  "711523BCB012": "D",
  "711523BCB021": "D",
  "711523BCB029": "D",
  "711523BCB032": "D",
  "711523BCB040": "D",
  "711523BCB042": "D",
  "711523BCB044": "D",
  "711523BCB050": "D",
  "711523BCB051": "D",
  "711523BCB052": "D",
  "711523BCB059": "D",
  "711523BCB061": "D",
  "711523BCB302": "D",
  "711523BCB304": "D",
  "71153BCB022": "NON-CRT",
  "711523BCB022": "NON-CRT",
  "711523BCB046": "NON-CRT",
  "711523BCB048": "NON-CRT",
};

const generateBadges = (): Badge[] => {
  const possibleBadges: Badge[] = [
    { id: "streak-7", name: "Week Warrior", description: "7 day streak", icon: "🔥", earnedAt: "" },
    { id: "streak-30", name: "Month Master", description: "30 day streak", icon: "⚡", earnedAt: "" },
    { id: "problems-100", name: "Century Solver", description: "100 problems solved", icon: "💯", earnedAt: "" },
    { id: "problems-500", name: "Problem Crusher", description: "500 problems solved", icon: "🏆", earnedAt: "" },
    { id: "contest-10", name: "Contest Champion", description: "10 contests attended", icon: "🎯", earnedAt: "" },
    { id: "github-100", name: "Commit King", description: "100 GitHub commits", icon: "👑", earnedAt: "" },
  ];
  
  const numBadges = Math.floor(Math.random() * 4) + 1;
  return possibleBadges.slice(0, numBadges).map(b => ({
    ...b,
    earnedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }));
};

const generateDailySubmissions = (): { date: string; count: number }[] => {
  const submissions: { date: string; count: number }[] = [];
  const today = new Date();
  
  for (let i = 90; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    submissions.push({
      date: date.toISOString().split('T')[0],
      count: Math.random() > 0.3 ? Math.floor(Math.random() * 10) + 1 : 0
    });
  }
  
  return submissions;
};

const generateWeeklyProgress = (baseRating: number) => {
  return [
    { week: "Week 1", codechef: baseRating - 100, hackerrank: baseRating - 80, leetcode: baseRating - 90, atcoder: baseRating - 110, codeforces: baseRating - 95, github: Math.floor(Math.random() * 20) + 10 },
    { week: "Week 2", codechef: baseRating - 60, hackerrank: baseRating - 50, leetcode: baseRating - 55, atcoder: baseRating - 70, codeforces: baseRating - 65, github: Math.floor(Math.random() * 25) + 15 },
    { week: "Week 3", codechef: baseRating - 30, hackerrank: baseRating - 20, leetcode: baseRating - 25, atcoder: baseRating - 35, codeforces: baseRating - 28, github: Math.floor(Math.random() * 30) + 20 },
    { week: "Week 4", codechef: baseRating, hackerrank: baseRating + 10, leetcode: baseRating + 5, atcoder: baseRating - 10, codeforces: baseRating + 8, github: Math.floor(Math.random() * 35) + 25 }
  ];
};

const generatePlatformStats = (index: number) => {
  const baseRating = 1400 + Math.floor(Math.random() * 600);
  const maxBonus = Math.floor(Math.random() * 200) + 50;
  
  return {
    codechef: { 
      username: `student${index}`, 
      rating: baseRating + Math.floor(Math.random() * 200), 
      maxRating: baseRating + maxBonus + Math.floor(Math.random() * 200),
      problemsSolved: 100 + Math.floor(Math.random() * 200), 
      rank: index + 1, 
      lastWeekRating: baseRating - 30, 
      contests: 10 + Math.floor(Math.random() * 20),
      contestsAttended: 8 + Math.floor(Math.random() * 15)
    },
    hackerrank: { 
      username: `student${index}`, 
      rating: baseRating + 100 + Math.floor(Math.random() * 200), 
      maxRating: baseRating + 100 + maxBonus + Math.floor(Math.random() * 200),
      problemsSolved: 80 + Math.floor(Math.random() * 150), 
      rank: index + 1, 
      lastWeekRating: baseRating + 70, 
      contests: 8 + Math.floor(Math.random() * 15),
      contestsAttended: 6 + Math.floor(Math.random() * 12)
    },
    leetcode: { 
      username: `student${index}`, 
      rating: baseRating + 50 + Math.floor(Math.random() * 250), 
      maxRating: baseRating + 50 + maxBonus + Math.floor(Math.random() * 250),
      problemsSolved: 150 + Math.floor(Math.random() * 250), 
      rank: index + 1, 
      lastWeekRating: baseRating + 20, 
      contests: 15 + Math.floor(Math.random() * 30),
      contestsAttended: 12 + Math.floor(Math.random() * 25)
    },
    atcoder: { 
      username: `student${index}`, 
      rating: baseRating - 50 + Math.floor(Math.random() * 150), 
      maxRating: baseRating - 50 + maxBonus + Math.floor(Math.random() * 150),
      problemsSolved: 50 + Math.floor(Math.random() * 100), 
      rank: index + 1, 
      lastWeekRating: baseRating - 80, 
      contests: 5 + Math.floor(Math.random() * 10),
      contestsAttended: 4 + Math.floor(Math.random() * 8)
    },
    codeforces: { 
      username: `student${index}`, 
      rating: baseRating + 30 + Math.floor(Math.random() * 200), 
      maxRating: baseRating + 30 + maxBonus + Math.floor(Math.random() * 200),
      problemsSolved: 120 + Math.floor(Math.random() * 180), 
      rank: index + 1, 
      lastWeekRating: baseRating, 
      contests: 12 + Math.floor(Math.random() * 25),
      contestsAttended: 10 + Math.floor(Math.random() * 20)
    },
    github: { 
      username: `student${index}`, 
      repositories: 10 + Math.floor(Math.random() * 30), 
      contributions: 200 + Math.floor(Math.random() * 800), 
      commits: 150 + Math.floor(Math.random() * 600),
      followers: 20 + Math.floor(Math.random() * 150), 
      lastWeekContributions: 15 + Math.floor(Math.random() * 40), 
      streak: 5 + Math.floor(Math.random() * 40) 
    },
    codolio: {
      username: `student${index}`,
      totalSubmissions: 100 + Math.floor(Math.random() * 500),
      currentStreak: 3 + Math.floor(Math.random() * 30),
      maxStreak: 10 + Math.floor(Math.random() * 60),
      dailySubmissions: generateDailySubmissions(),
      badges: generateBadges()
    }
  };
};

// Real student data from Excel sheet
const realStudentData = [
  { name: "AADHAM SHARIEF A", rollNumber: "711523BCB001", leetcode: "https://leetcode.com/u/Aadhamsharief/", codeforces: "https://codeforces.com/profile/kit27.csbs01", github: "https://github.com/Aadhamsharief05", codechef: "https://www.codechef.com/users/kit27csbs01", codolio: "https://codolio.com/profile/Aadhamsharief_@05" },
  { name: "AARTHI V", rollNumber: "711523BCB002", leetcode: "https://leetcode.com/u/kit27csbs02/", codeforces: "https://codeforces.com/profile/kit27.csbs02", github: "https://github.com/Aarthi07-V", codechef: "https://www.codechef.com/users/kit27csbs02", codolio: "https://codolio.com/profile/Aaruuu" },
  { name: "ABINAYA R", rollNumber: "711523BCB003", leetcode: "https://leetcode.com/u/kit27csbs03/", codeforces: "https://codeforces.com/profile/kit27.csbs03", github: "https://github.com/Abi0063", codechef: "https://www.codechef.com/users/kit27csbs03", codolio: "https://codolio.com/profile/abinaya%20rajkumar" },
  { name: "ABINAYA R", rollNumber: "711523BCB004", leetcode: "https://leetcode.com/u/AbinayaRenganathan/", codeforces: "https://codeforces.com/profile/kit27.csbs04", github: "https://github.com/AbinayaRenganathan2006", codechef: "https://www.codechef.com/users/kit27csbs04", codolio: "https://codolio.com/profile/Abinaya%20R" },
  { name: "AHAMED AMMAR O A", rollNumber: "711523BCB005", leetcode: "https://leetcode.com/u/ahamedammar25/", codeforces: "https://codeforces.com/profile/ahamedammar25", github: "https://github.com/Ahamed-ammar", codechef: "https://www.codechef.com/users/ahamed_ammar07", codolio: "https://codolio.com/profile/ahamed-ammar07" },
  { name: "AKSHAI KANNAA MB", rollNumber: "711523BCB006", leetcode: "https://leetcode.com/u/akshai426/", codeforces: "https://codeforces.com/profile/akshai0426", github: "https://github.com/AKSHAI0426", codechef: "https://www.codechef.com/users/kit27csbs06", codolio: "https://codolio.com/profile/akshai0426" },
  { name: "ALFRED ANTONY M", rollNumber: "711523BCB007", leetcode: "https://leetcode.com/u/AlfredAntony07M/", codeforces: "https://codeforces.com/profile/kit27.csbs07", github: "https://github.com/AlfredAntonyM07", codechef: "https://www.codechef.com/users/kit27csbs07", codolio: "https://codolio.com/profile/Alfred" },
  { name: "ANANDHAKUMAR S", rollNumber: "711523BCB008", leetcode: "https://leetcode.com/u/Anandhakumars13/", codeforces: "https://codeforces.com/profile/anand13", github: "https://github.com/Anandhakumar-0013", codechef: "https://www.codechef.com/users/kit27csbs08", codolio: "https://codolio.com/profile/ANANDHAKUMAR%20S" },
  { name: "ARJUN V B", rollNumber: "711523BCB009", leetcode: "https://leetcode.com/u/Arjun_vb/", codeforces: "https://codeforces.com/profile/Arjun_VB", github: "https://github.com/Arjun-115", codechef: "https://www.codechef.com/users/kit27csbs09", codolio: "https://codolio.com/profile/Arjunvb" },
  { name: "ARUNA T", rollNumber: "711523BCB010", leetcode: "https://leetcode.com/u/Aruna777/", codeforces: "https://codeforces.com/profile/Aruna777", github: "https://github.com/aruna7904", codechef: "https://www.codechef.com/users/kit27csbs10", codolio: "https://codolio.com/profile/arunaaa" },
  { name: "AYISHATHUL HAZEENA S", rollNumber: "711523BCB011", leetcode: "https://leetcode.com/u/Hasee_28/", codeforces: "https://codeforces.com/profile/Hazeena", github: "https://github.com/HazSha28", codechef: "https://www.codechef.com/users/kit27csbs11", codolio: "https://codolio.com/profile/Hazeena%20S" },
  { name: "DELHI KRISHNAN S", rollNumber: "711523BCB012", leetcode: "https://leetcode.com/u/delhikrishnan/", codeforces: "https://codeforces.com/profile/DELHI_KRISHNAN_S", github: "https://github.com/DELHIKRISHNAN", codechef: "https://www.codechef.com/users/kit27csbs12", codolio: "https://codolio.com/profile/zorolando" },
  { name: "DEVANYA N", rollNumber: "711523BCB013", leetcode: "https://leetcode.com/u/Devanya/", codeforces: "https://codeforces.com/profile/kit27.csbs13", github: "https://github.com/Devanya21", codechef: "https://www.codechef.com/users/kit27csbs13", codolio: "https://codolio.com/profile/devanya" },
  { name: "DHIVAKAR S", rollNumber: "711523BCB014", leetcode: "https://leetcode.com/u/kit27csbs14/", codeforces: "https://codeforces.com/profile/kit27.csbs14", github: "https://github.com/Dhiva-1510", codechef: "https://www.codechef.com/users/kit27csbs14", codolio: "https://codolio.com/profile/Dhiva_S" },
  { name: "DINESH S", rollNumber: "711523BCB015", leetcode: "https://leetcode.com/u/kit27csbs15", codeforces: "https://codeforces.com/profile/kit27csbs15", github: "https://github.com/Dinesh0203s/", codechef: "https://www.codechef.com/users/kit27csbs15", codolio: "https://codolio.com/profile/Dinesh_s" },
  { name: "DIVYADHARSHINI M", rollNumber: "711523BCB016", leetcode: "https://leetcode.com/u/kit27csbs16/", codeforces: "https://codeforces.com/profile/kit27csbs16", github: "https://github.com/Divyadharshini18", codechef: "https://www.codechef.com/users/kit27csbs16", codolio: "https://codolio.com/profile/divyadharshini" },
  { name: "DURGA S", rollNumber: "711523BCB017", leetcode: "https://leetcode.com/u/durga0103/", codeforces: "https://codolio.com/profile/durga0103", github: "https://github.com/durga0103", codechef: "https://www.codechef.com/users/durga0103", codolio: "https://codolio.com/profile/durga0103" },
  { name: "GITHENDRAN K", rollNumber: "711523BCB018", leetcode: "https://leetcode.com/u/githendran14232005/", codeforces: "https://codeforces.com/profile/githendran_k", github: "https://github.com/Githendran1403", codechef: "https://www.codechef.com/users/githendran_vfc", codolio: "https://codolio.com/profile/githendran%20k" },
  { name: "GOWSIKA S A", rollNumber: "711523BCB019", leetcode: "https://leetcode.com/u/GowsikaArul/", codeforces: "https://codeforces.com/profile/Gowsi", github: "https://github.com/Gowsikakho", codechef: "https://www.codechef.com/users/arul_gowsi", codolio: "https://codolio.com/profile/Gowsi_7476" },
  { name: "HARISH S", rollNumber: "711523BCB020", leetcode: "https://leetcode.com/u/Kit27csbs20/", codeforces: "https://codeforces.com/profile/kit27.csbs20", github: "https://github.com/HARISH112006", codechef: "https://www.codechef.com/users/kit27csbs20", codolio: "https://codolio.com/profile/Harish%20S" },
  { name: "HARIVARSHA C S", rollNumber: "711523BCB021", leetcode: "https://leetcode.com/u/kit27csbs/", codeforces: "https://codeforces.com/profile/Harivarsha", github: "https://github.com/Harivarsha09", codechef: "https://www.codechef.com/users/kit27csbs21", codolio: "https://codolio.com/profile/HarivarshaSenthilKumar" },
  { name: "HARTHI S", rollNumber: "71153BCB022", leetcode: "https://leetcode.com/u/harthi__/", codeforces: "https://codeforces.com/profile/kit27.csbs22", github: "https://github.com/Harthi-s-1011", codechef: "https://www.codechef.com/users/kit27csbs22", codolio: "https://codolio.com/profile/Harthi__" },
  { name: "INBATAMIZHAN P", rollNumber: "711523BCB023", leetcode: "https://leetcode.com/u/inbatamizh/", codeforces: "https://codeforces.com/profile/Inba_tamizh", github: "https://github.com/Inba-11", codechef: "https://www.codechef.com/users/kit27csbs23", codolio: "https://codolio.com/profile/Inba" },
  { name: "JEGAN S", rollNumber: "711523BCB024", leetcode: "https://leetcode.com/u/jegan08356/", codeforces: "https://codeforces.com/profile/jegan_23", github: "https://github.com/Jegan-005", codechef: "https://www.codechef.com/users/kit27csbs24", codolio: "https://codolio.com/profile/jegan_" },
  { name: "JENCY IRIN J", rollNumber: "711523BCB025", leetcode: "https://leetcode.com/u/user6421FH/", codeforces: "https://codeforces.com/profile/Irxnnn", github: "https://github.com/imirin", codechef: "https://www.codechef.com/users/imirin", codolio: "https://codolio.com/profile/imirin" },
  { name: "JOEL G", rollNumber: "711523BCB026", leetcode: "https://leetcode.com/u/kit27csbs26/", codeforces: "https://codeforces.com/profile/kit27.csbs26", github: "https://github.com/joelpersonal", codechef: "https://www.codechef.com/users/kit27csbs26", codolio: "https://codolio.com/profile/oel_" },
  { name: "KASTHURI S", rollNumber: "711523BCB028", leetcode: "https://leetcode.com/u/user8879Yd/", codeforces: "https://codeforces.com/profile/kit27csbs28", github: "https://github.com/Kasthuri008", codechef: "https://www.codechef.com/users/kit27csbs28", codolio: "https://codolio.com/profile/kasthuri" },
  { name: "KAVIYA K", rollNumber: "711523BCB029", leetcode: "https://leetcode.com/u/kit27csbs29/", codeforces: "https://codeforces.com/profile/kit27csbs29", github: "https://github.com/Kaviya2408", codechef: "https://www.codechef.com/users/kitcsbs29", codolio: "https://codolio.com/profile/Kitcsbs29" },
  { name: "KOWSALYA S", rollNumber: "711523BCB030", leetcode: "https://leetcode.com/u/Kowsalya_30/", codeforces: "https://codeforces.com/profile/kit27.csbs30", github: "https://github.com/Kowsalya1025", codechef: "https://www.codechef.com/users/ki27csbs30", codolio: "https://codolio.com/profile/Kowsalya_" },
  { name: "LAKSHANA S", rollNumber: "711523BCB031", leetcode: "https://leetcode.com/u/lakshanasampath/", codeforces: "https://codeforces.com/profile/lakshanaSampath", github: "https://github.com/lakshanaaaaa", codechef: "https://www.codechef.com/users/lakshana_11", codolio: "https://codolio.com/profile/lakshana" },
  { name: "LOURDU SATHISH J", rollNumber: "711523BCB032", leetcode: "https://leetcode.com/u/sathishjl07/", codeforces: "https://codeforces.com/profile/kit27csbs32", github: "https://github.com/sathish1807j", codechef: "https://www.codechef.com/users/kit27csbs32", codolio: "https://codolio.com/profile/Sathish" },
  { name: "MAHA LAKSHMI M", rollNumber: "711523BCB033", leetcode: "https://leetcode.com/u/kit27csbs33/", codeforces: "https://codeforces.com/profile/kit27csbs33", github: "https://github.com/mahalakshmimariisaac33", codechef: "https://www.codechef.com/users/kit27csbs33", codolio: "https://codolio.com/profile/cVmLPWrV" },
  { name: "MAHESHWARI D", rollNumber: "711523BCB034", leetcode: "https://leetcode.com/u/Mahesh--/", codeforces: "https://codeforces.com/profile/-9976", github: "https://github.com/Maheshwaridhandapani", codechef: "https://www.codechef.com/users/kit27csbs34", codolio: "https://codeforces.com/profile/-9976" },
  { name: "MANO NIKILA R", rollNumber: "711523BCB035", leetcode: "https://leetcode.com/u/Manonikila_2/", codeforces: "https://codeforces.com/profile/manonikila2", github: "https://github.com/manonikila", codechef: "https://www.codechef.com/users/manonikila", codolio: "https://codolio.com/profile/Manonikila" },
  { name: "MOHAMMED SYFUDEEN S", rollNumber: "711523BCB036", leetcode: "https://leetcode.com/u/Syfudeen_17/", codeforces: "https://codeforces.com/profile/kit27.csbs36", github: "https://github.com/Syfudeen", codechef: "https://www.codechef.com/users/syfudeen", codolio: "https://codolio.com/profile/Syf" },
  { name: "MONISHA G", rollNumber: "711523BCB037", leetcode: "https://leetcode.com/u/monisha_ganesh20/", codeforces: "https://codeforces.com/profile/monisha.ganesh20", github: "https://github.com/Monishamatthew", codechef: "https://www.codechef.com/users/kit27csbs37", codolio: "https://codolio.com/profile/monisha.ganesh20" },
  { name: "NISHANTH S", rollNumber: "711523BCB038", leetcode: "https://leetcode.com/u/user7544G/", codeforces: "https://codeforces.com/profile/Nishanth_s_007", github: "https://github.com/Nishanth-S-2005", codechef: "https://www.codechef.com/users/kit27csbs38", codolio: "https://codolio.com/profile/Nishanth_Sasikumar" },
  { name: "NIVED V PUTHEN PURAKKAL", rollNumber: "711523BCB039", leetcode: "https://leetcode.com/u/user0990Ac/", codeforces: "https://codeforces.com/profile/Nivedv", github: "https://github.com/ignt-nived", codechef: "https://www.codechef.com/users/kit27.csbs39", codolio: "https://codolio.com/profile/nived" },
  { name: "PRADEEPA P", rollNumber: "711523BCB040", leetcode: "https://leetcode.com/u/kit27csbs40/", codeforces: "https://codeforces.com/profile/kit27.csbs40", github: "https://github.com/PRADEEPA-48", codechef: "https://www.codechef.com/users/kit27csbs40", codolio: "https://codolio.com/profile/Pradhu" },
  { name: "PRAKASH B", rollNumber: "711523BCB041", leetcode: "https://leetcode.com/u/prakashme/", codeforces: "https://codeforces.com/profile/Prakashb", github: "https://github.com/prakashb96", codechef: "https://www.codechef.com/users/prakashb", codolio: "https://codolio.com/profile/prakashb" },
  { name: "PRAVIN M", rollNumber: "711523BCB042", leetcode: "https://leetcode.com/u/pravin4211/", codeforces: "https://codeforces.com/profile/kit27.csbs42", github: "https://github.com/Pravin2182005", codechef: "https://www.codechef.com/users/pravin42", codolio: "https://codolio.com/profile/pravin-42" },
  { name: "RAGAVI A", rollNumber: "711523BCB043", leetcode: "https://leetcode.com/u/kit27csbs43/", codeforces: "https://codeforces.com/profile/kit27.csbs43", github: "https://github.com/Ragavi-05", codechef: "https://www.codechef.com/users/kit27csbs43", codolio: "https://codolio.com/profile/RagaviAsokan" },
  { name: "RAJA S", rollNumber: "711523BCB044", leetcode: "https://leetcode.com/u/Raja_37/", codeforces: "https://codeforces.com/profile/RAJA_37", github: "https://github.com/Raja-037", codechef: "https://www.codechef.com/users/kit27csbs44", codolio: "https://codolio.com/profile/Raja_37" },
  { name: "RAJADURAI R", rollNumber: "711523BCB045", leetcode: "https://leetcode.com/u/Rajadurai31/", codeforces: "https://codeforces.com/profile/kit27.csbs45", github: "https://github.com/Rajadurai31", codechef: "https://www.codechef.com/users/rajadurai_31", codolio: "https://codolio.com/profile/Rajadurai31" },
  { name: "RISHI ADHINARAYAN V", rollNumber: "711523BCB046", leetcode: "https://leetcode.com/u/rishi_adhinarayan_v", codeforces: "https://codeforces.com/profile/rishi_adhinarayan_v", github: "https://github.com/rishitech-cyber", codechef: "https://www.codechef.com/users/rishi_tech", codolio: "https://share.google/zoOEZ7F8PJfMq2JG2" },
  { name: "ROBERT MITHRAN", rollNumber: "711523BCB047", leetcode: "https://leetcode.com/u/robertmithran/", codeforces: "https://codeforces.com/profile/kit27.csbs47", github: "https://github.com/Robert-Mithhran-N", codechef: "https://www.codechef.com/users/kit27csbs47", codolio: "https://codolio.com/profile/_myth_x_46" },
  { name: "RUDRESH M", rollNumber: "711523BCB048", leetcode: "https://leetcode.com/u/rudreshrudhu/", codeforces: "https://codeforces.com/profile/rudreshrudhu", github: "https://github.com/rudreshrudhu18", codechef: "https://www.codechef.com/users/rudreshrudhu", codolio: "https://codolio.com/profile/rudhu18" },
  { name: "SABARI YUHENDHRAN M", rollNumber: "711523BCB049", leetcode: "https://leetcode.com/u/sabariyuhendhran/", codeforces: "https://codeforces.com/profile/sabariyuhendh29", github: "https://github.com/sabariyuhendh", codechef: "https://www.codechef.com/users/sabariyuhendh", codolio: "https://codolio.com/profile/sabariyuhendhran" },
  { name: "SADHANA M", rollNumber: "711523BCB050", leetcode: "https://leetcode.com/u/kit27csbssadhana/", codeforces: "https://codeforces.com/profile/Sadhana_123", github: "https://github.com/Sadhanas123", codechef: "https://www.codechef.com/users/kit27csbs_50", codolio: "https://codolio.com/profile/sadhana@02" },
  { name: "SANJAY N", rollNumber: "711523BCB051", leetcode: "https://leetcode.com/u/user8425jb/", codeforces: "https://codeforces.com/profile/SANJAY_.N_", github: "https://github.com/Sanjayn230", codechef: "https://www.codechef.com/users/kit27csbs51", codolio: "https://codolio.com/profile/SANJAY_N" },
  { name: "SARAN G", rollNumber: "711523BCB052", leetcode: "https://leetcode.com/u/SaranGunasegaran/", codeforces: "https://codeforces.com/profile/kit.csbs52", github: "https://share.google/MI5banj3nuHd1Kn8F", codechef: "https://www.codechef.com/users/kit27csbs52", codolio: "https://codolio.com/profile/Saran@07" },
  { name: "SHANMUGAPRIYA P", rollNumber: "711523BCB053", leetcode: "https://leetcode.com/u/shamugapriya/", codeforces: "https://codeforces.com/profile/shanmugapriya--006", github: "https://github.com/shanmugapriya143", codechef: "https://www.codechef.com/users/kit27csbs53", codolio: "https://codolio.com/profile/ciZNdQIq" },
  { name: "SHARVESH L", rollNumber: "711523BCB054", leetcode: "https://leetcode.com/u/sharveshl/", codeforces: "https://codeforces.com/profile/sharvesh03", github: "https://github.com/sharveshl", codechef: "https://www.codechef.com/users/sharveshl", codolio: "https://codolio.com/profile/sharveshl14" },
  { name: "SOBHIKA P M", rollNumber: "711523BCB055", leetcode: "https://leetcode.com/u/kit27csbs55/", codeforces: "https://codeforces.com/profile/kit27.csbs55", github: "https://github.com/sobhika11", codechef: "https://www.codechef.com/users/kit27csbs55", codolio: "https://codolio.com/profile/sobhika" },
  { name: "SOWMIYA S R", rollNumber: "711523BCB056", leetcode: "https://leetcode.com/u/sowmiyasr/", codeforces: "https://codeforces.com/profile/Sowmiya_sr", github: "https://github.com/srsowmiya", codechef: "https://www.codechef.com/users/sowmiyasr", codolio: "https://codolio.com/profile/Sowmiya" },
  { name: "SWATHI K", rollNumber: "711523BCB057", leetcode: "https://leetcode.com/u/thecode_1215/", codeforces: "https://codeforces.com/profile/thecode_1215", github: "https://github.com/SwathiKaruppaiya15", codechef: "https://www.codechef.com/users/thecode_1215", codolio: "https://codolio.com/profile/thecode_1215" },
  { name: "THIRUMAL T", rollNumber: "711523BCB058", leetcode: "https://leetcode.com/u/Thiru_17/", codeforces: "https://codeforces.com/profile/Thiru06", github: "https://github.com/Thirumal5", codechef: "https://www.codechef.com/users/kit27csbs58", codolio: "https://codolio.com/profile/THIRU6" },
  { name: "VIGNESHKUMAR N", rollNumber: "711523BCB059", leetcode: "https://leetcode.com/u/vignesh_59/", codeforces: "https://codeforces.com/profile/Vikram_60", github: "https://github.com/vig-nesh-kumar", codechef: "https://www.codechef.com/users/vignesh_59", codolio: "https://codolio.com/profile/vignesh_59" },
  { name: "VIKRAM S", rollNumber: "711523BCB060", leetcode: "https://leetcode.com/u/vikram-s/", codeforces: "https://codeforces.com/profile/Vikram_60", github: "https://github.com/Vikramsaravanan", codechef: "https://www.codechef.com/users/kit27csbs60", codolio: "https://codolio.com/profile/Mr.Annonymous" },
  { name: "VISHWA J", rollNumber: "711523BCB061", leetcode: "https://leetcode.com/u/kit27csbs61/", codeforces: "https://codeforces.com/profile/Vishwa_J", github: "https://github.com/VishwaJ27", codechef: "https://www.codechef.com/users/kit27csbs61", codolio: "https://codolio.com/profile/Vishwa_J" },
  { name: "YOGANAYAHI M", rollNumber: "711523BCB063", leetcode: "https://leetcode.com/u/kit27csbs63/", codeforces: "https://share.google/edtHqO0B1XCQjreJV", github: "https://github.com/Yoganayahi", codechef: "https://www.codechef.com/users/kit27csbs63", codolio: "https://codolio.com/profile/yoga" },
  { name: "CHANDRAN M", rollNumber: "711523BCB302", leetcode: "https://leetcode.com/u/chandran_tech/", codeforces: "https://codeforces.com/profile/Chandran_M", github: "https://github.com/chandran33", codechef: "https://www.codechef.com/users/kit27csbs302", codolio: "https://codolio.com/profile/Chandran" },
  { name: "NISHANTH M", rollNumber: "711523BCB304", leetcode: "https://leetcode.com/u/Nishanth_tech/", codeforces: "https://codeforces.com/profile/Nishanth_forces", github: "https://github.com/Nishanth355183", codechef: "https://www.codechef.com/users/nish_m_20", codolio: "https://codolio.com/profile/nishanth@20" },
];

export const students: Student[] = realStudentData.map((data, index) => {
  const baseRating = 1400 + Math.floor(Math.random() * 600);
  const avatarCharacter = getDefaultAvatar(data.rollNumber, index);
  const batch = batchAssignments[data.rollNumber] || 'C';
  
  return {
    id: String(index + 1),
    name: data.name,
    email: `${data.rollNumber.toLowerCase()}@student.edu`,
    avatar: avatarCharacter.imageUrl,
    defaultAvatar: avatarCharacter.id,
    department: "Computer Science & Business Systems",
    year: 2,
    rollNumber: data.rollNumber,
    batch,
    platformLinks: {
      leetcode: data.leetcode,
      codeforces: data.codeforces,
      github: data.github,
      codechef: data.codechef,
      codolio: data.codolio,
    },
    platforms: generatePlatformStats(index),
    weeklyProgress: generateWeeklyProgress(baseRating),
    resume: index < 3 ? `https://drive.google.com/file/d/1example${index}/view?usp=sharing` : null, // Add sample resume links for first 3 students
    projectRepositories: [],
  };
});

export const credentials = {
  staff: staffCredentials,
  owner: { email: "owner@bytebuster.com", password: "thotupar@123" },
  students: students
    .map(s => ({ 
      username: s.name,  // Use student name as username
      email: s.email, 
      password: s.rollNumber,  // Use roll number as password (keep original case)
      id: s.id,
      rollNumber: s.rollNumber  // Add rollNumber for sorting
    }))
    .sort((a, b) => a.rollNumber.localeCompare(b.rollNumber))  // Sort by Register Number lexicographically
};

export const getTopPerformers = () => {
  return {
    codechef: [...students].sort((a, b) => b.platforms.codechef.rating - a.platforms.codechef.rating)[0],
    hackerrank: [...students].sort((a, b) => b.platforms.hackerrank.rating - a.platforms.hackerrank.rating)[0],
    leetcode: [...students].sort((a, b) => b.platforms.leetcode.rating - a.platforms.leetcode.rating)[0],
    atcoder: [...students].sort((a, b) => b.platforms.atcoder.rating - a.platforms.atcoder.rating)[0],
    github: [...students].sort((a, b) => b.platforms.github.contributions - a.platforms.github.contributions)[0],
    codeforces: [...students].sort((a, b) => b.platforms.codeforces.rating - a.platforms.codeforces.rating)[0],
  };
};

export const getOverallRankings = () => {
  return students.map(student => {
    const totalScore = 
      student.platforms.codechef.rating * 0.2 +
      student.platforms.hackerrank.rating * 0.2 +
      student.platforms.leetcode.rating * 0.25 +
      student.platforms.atcoder.rating * 0.15 +
      (student.platforms.github.contributions / 10) * 0.2;
    return { ...student, totalScore };
  }).sort((a, b) => b.totalScore - a.totalScore);
};

export const getStudentsByBatch = (batch: 'A' | 'B' | 'C' | 'D' | 'NON-CRT' | 'ALL') => {
  if (batch === 'ALL') {
    return [...students].sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
  }
  return students
    .filter(s => s.batch === batch)
    .sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
};