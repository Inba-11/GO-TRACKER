# scraper/import_students.py
from pymongo import MongoClient
from datetime import datetime
import re

# MongoDB connection
MONGO_URI = 'mongodb://localhost:27017/'
DB_NAME = 'go-tracker'

# Batch assignments
BATCH_ASSIGNMENTS = {
    "711523BCB005": "A", "711523BCB016": "A", "711523BCB019": "A", "711523BCB031": "A",
    "711523BCB041": "A", "711523BCB045": "A", "711523BCB011": "A", "711523BCB015": "A",
    "711523BCB047": "A", "711523BCB049": "A", "711523BCB054": "A", "711523BCB055": "A",
    "711523BCB056": "A",
    "711523BCB013": "B", "711523BCB025": "B", "711523BCB034": "B", "711523BCB043": "B",
    "711523BCB058": "B", "711523BCB060": "B", "711523BCB001": "B", "711523BCB006": "B",
    "711523BCB030": "B", "711523BCB035": "B", "711523BCB039": "B",
    "711523BCB002": "C", "711523BCB003": "C", "711523BCB004": "C", "711523BCB010": "C",
    "711523BCB014": "C", "711523BCB017": "C", "711523BCB018": "C", "711523BCB020": "C",
    "711523BCB024": "C", "711523BCB026": "C", "711523BCB023": "C", "711523BCB028": "C",
    "711523BCB033": "C", "711523BCB036": "C", "711523BCB038": "C", "711523BCB053": "C",
    "711523BCB063": "C", "711523BCB037": "C", "711523BCB057": "C",
    "711523BCB007": "D", "711523BCB008": "D", "711523BCB009": "D", "711523BCB012": "D",
    "711523BCB021": "D", "711523BCB029": "D", "711523BCB032": "D", "711523BCB040": "D",
    "711523BCB042": "D", "711523BCB044": "D", "711523BCB050": "D", "711523BCB051": "D",
    "711523BCB052": "D", "711523BCB059": "D", "711523BCB061": "D", "711523BCB302": "D",
    "711523BCB304": "D",
    "71153BCB022": "NON-CRT", "711523BCB022": "NON-CRT", "711523BCB046": "NON-CRT",
    "711523BCB048": "NON-CRT"
}

def extract_username_from_url(url, platform):
    """Extract username from platform URL"""
    if not url or url.upper() in ['NULL', 'CODOLIO', '']:
        return ''
    
    try:
        url = url.strip()
        
        if platform == 'leetcode':
            if 'leetcode.com/u/' in url:
                username = url.split('leetcode.com/u/')[-1].rstrip('/')
                return username.split('/')[0]
            elif ' - LeetCode Profile' in url:
                return url.split(' - LeetCode Profile')[0].strip()
            else:
                return url.split('/')[-1].rstrip('/')
                
        elif platform == 'codechef':
            if 'codechef.com/users/' in url:
                return url.split('/users/')[-1]
            return url
            
        elif platform == 'codeforces':
            if 'codeforces.com/profile/' in url:
                return url.split('/profile/')[-1]
            elif 'share.google' in url or url.upper() == 'NULL':
                return ''
            return url
            
        elif platform == 'github':
            if 'github.com/' in url:
                username = url.split('github.com/')[-1].rstrip('/')
                return username.split('/')[0]
            elif 'share.google' in url:
                return ''
            return url
            
        elif platform == 'codolio':
            if 'codolio.com/profile/' in url:
                username = url.split('/profile/')[-1]
                username = username.replace('%20', ' ')
                return username.split('/')[0]
            elif 'share.google' in url or url.upper() in ['CODOLIO', 'NULL']:
                return ''
            return url
    except Exception as e:
        print(f"Error extracting username from {url}: {e}")
        return ''
    return ''

def parse_student_data():
    """Parse student data from the provided text"""
    students_data = """AADHAM SHARIEF A | https://leetcode.com/u/Aadhamsharief/ | https://codeforces.com/profile/kit27.csbs01 | https://github.com/Aadhamsharief05 | https://www.codechef.com/users/kit27csbs01 | 711523BCB001 | https://codolio.com/profile/Aadhamsharief_@05
AARTHI V | https://leetcode.com/u/kit27csbs02/ | https://codeforces.com/profile/kit27.csbs02 | https://github.com/Aarthi07-V | https://www.codechef.com/users/kit27csbs02 | 711523BCB002 | https://codolio.com/profile/Aaruuu
ABINAYA R | https://leetcode.com/u/kit27csbs03/ | https://codeforces.com/profile/kit27.csbs03 | https://github.com/Abi0063 | https://www.codechef.com/users/kit27csbs03 | 711523BCB003 | https://codolio.com/profile/abinaya%20rajkumar
ABINAYA R | AbinayaRenganathan - LeetCode Profile | kit27.csbs04 - Codeforces | https://github.com/AbinayaRenganathan2006 | https://www.codechef.com/users/kit27csbs04 | 711523BCB004 | https://codolio.com/profile/Abinaya%20R
AHAMED AMMAR O A | https://leetcode.com/u/ahamedammar25/ | https://codeforces.com/profile/ahamedammar25 | https://github.com/Ahamed-ammar | https://www.codechef.com/users/ahamed_ammar07 | 711523BCB005 | https://codolio.com/profile/ahamed-ammar07
AKSHAI KANNAA MB | https://leetcode.com/u/akshai426/ | https://codeforces.com/profile/akshai0426 | https://github.com/AKSHAI0426 | https://www.codechef.com/users/kit27csbs06 | 711523BCB006 | https://codolio.com/profile/akshai0426
ALFRED ANTONY M | https://leetcode.com/u/AlfredAntony07M/ | https://codeforces.com/profile/kit27.csbs07 | https://github.com/AlfredAntonyM07 | https://www.codechef.com/users/kit27csbs07 | 711523BCB007 | https://codolio.com/profile/Alfred
ANANDHAKUMAR S | https://leetcode.com/u/Anandhakumars13/ | https://codeforces.com/profile/anand13 | https://github.com/Anandhakumar-0013 | https://www.codechef.com/users/kit27csbs08 | 711523BCB008 | https://codolio.com/profile/ANANDHAKUMAR%20S
ARJUN V B | https://leetcode.com/u/Arjun_vb/ | https://codeforces.com/profile/Arjun_VB | https://github.com/Arjun-115 | https://www.codechef.com/users/kit27csbs09 | 711523BCB009 | https://codolio.com/profile/Arjunvb
ARUNA T | https://leetcode.com/u/Aruna777/ | https://codeforces.com/profile/Aruna777 | https://github.com/aruna7904 | https://www.codechef.com/users/kit27csbs10 | 711523BCB010 | https://codolio.com/profile/arunaaa
AYISHATHUL HAZEENA S | https://leetcode.com/u/Hasee_28/ | https://codeforces.com/profile/Hazeena | https://github.com/HazSha28 | https://www.codechef.com/users/kit27csbs11 | 711523BCB011 | https://codolio.com/profile/Hazeena%20S
DELHI KRISHNAN S | https://leetcode.com/u/delhikrishnan/ | https://codeforces.com/profile/DELHI_KRISHNAN_S | https://github.com/DELHIKRISHNAN | https://www.codechef.com/users/kit27csbs12 | 711523BCB012 | CODOLIO
DEVANYA N | https://leetcode.com/u/Devanya/ | https://codeforces.com/profile/kit27.csbs13 | https://github.com/Devanya21 | https://www.codechef.com/users/kit27csbs13 | 711523BCB013 | https://codolio.com/profile/devanya
DHIVAKAR S | https://leetcode.com/u/kit27csbs14/ | https://codeforces.com/profile/kit27.csbs14 | https://github.com/Dhiva-1510 | https://www.codechef.com/users/kit27csbs14 | 711523BCB014 | https://codolio.com/profile/Dhiva_S
DINESH S | https://leetcode.com/u/kit27csbs15 | https://codeforces.com/profile/kit27csbs15 | https://github.com/Dinesh0203s/ | https://www.codechef.com/users/kit27csbs15 | 711523BCB015 | https://codolio.com/profile/Dinesh_s
DIVYADHARSHINI M | https://leetcode.com/u/kit27csbs16/ | https://codeforces.com/profile/kit27csbs16 | https://github.com/Divyadharshini18 | https://www.codechef.com/users/kit27csbs16 | 711523BCB016 | https://codolio.com/profile/divyadharshini
DURGA S | https://leetcode.com/u/durga0103/ | https://codolio.com/profile/durga0103 | https://github.com/durga0103 | https://www.codechef.com/users/durga0103 | 711523BCB017 | https://codolio.com/profile/durga0103
GITHENDRAN K | https://leetcode.com/u/githendran14232005/ | https://codeforces.com/profile/githendran_k | https://github.com/Githendran1403 | https://www.codechef.com/users/githendran_vfc | 711523BCB018 | https://codolio.com/profile/githendran%20k
GOWSIKA S A | https://leetcode.com/u/GowsikaArul/ | https://codeforces.com/profile/Gowsi | https://github.com/Gowsikakho | https://www.codechef.com/users/arul_gowsi | 711523BCB019 | https://codolio.com/profile/Gowsi_7476
HARISH S | https://leetcode.com/u/Kit27csbs20/ | https://codeforces.com/profile/kit27.csbs20 | https://github.com/HARISH112006 | https://www.codechef.com/users/kit27csbs20 | 711523BCB020 | https://codolio.com/profile/Harish%20S
HARIVARSHA C S | https://leetcode.com/u/kit27csbs/ | https://codeforces.com/profile/Harivarsha | https://github.com/Harivarsha09 | https://www.codechef.com/users/kit27csbs21 | 711523BCB021 | https://codolio.com/profile/HarivarshaSenthilKumar
HARTHI S | https://leetcode.com/u/harthi__/ | https://codeforces.com/profile/kit27.csbs22 | https://github.com/Harthi-s-1011 | https://www.codechef.com/users/kit27csbs22 | 71153BCB022 | https://codolio.com/profile/Harthi__
INBATAMIZHAN P | https://leetcode.com/u/inbatamizh/ | https://codeforces.com/profile/Inba_tamizh | https://github.com/Inba-11 | https://www.codechef.com/users/kit27csbs23 | 711523BCB023 | https://codolio.com/profile/Inba
JEGAN S | https://leetcode.com/u/jegan08356/ | https://codeforces.com/profile/jegan_23 | https://github.com/Jegan-005 | https://www.codechef.com/users/kit27csbs24 | 711523BCB024 | https://codolio.com/profile/jegan_
JENCY IRIN J | https://leetcode.com/u/user6421FH/ | https://codeforces.com/profile/Irxnnn | https://github.com/imirin | https://www.codechef.com/users/imirin | 711523BCB025 | https://codolio.com/profile/imirin
JOEL G | https://leetcode.com/u/kit27csbs26/ | https://codeforces.com/profile/kit27.csbs26 | https://github.com/joelpersonal | https://www.codechef.com/users/kit27csbs26 | 711523BCB026 | https://codolio.com/profile/oel_
KASTHURI S | https://leetcode.com/u/user8879Yd/ | https://codeforces.com/profile/kit27csbs28 | https://github.com/Kasthuri008 | https://www.codechef.com/users/kit27csbs28 | 711523BCB028 | https://codolio.com/profile/kasthuri
KAVIYA K | https://leetcode.com/u/kit27csbs29/ | https://codeforces.com/profile/kit27csbs29 | https://github.com/Kaviya2408 | https://www.codechef.com/users/kitcsbs29 | 711523BCB029 | https://codolio.com/profile/Kitcsbs29
KOWSALYA S | https://leetcode.com/u/Kowsalya_30/ | https://codeforces.com/profile/kit27.csbs30 | https://github.com/Kowsalya1025 | https://www.codechef.com/users/ki27csbs30 | 711523BCB030 | https://codolio.com/profile/Kowsalya_
LAKSHANA S | https://leetcode.com/u/lakshanasampath/ | https://codeforces.com/profile/lakshanaSampath | https://github.com/lakshanaaaaa | https://www.codechef.com/users/lakshana_11 | 711523BCB031 | https://codolio.com/profile/lakshana
LOURDU SATHISH J | https://leetcode.com/u/sathishjl07/ | https://codeforces.com/profile/kit27csbs32 | https://github.com/sathish1807j | https://www.codechef.com/users/kit27csbs32 | 711523BCB032 | https://codolio.com/profile/Sathish
MAHA LAKSHMI M | https://leetcode.com/u/kit27csbs33/ | https://codeforces.com/profile/kit27csbs33 | https://github.com/mahalakshmimariisaac33 | https://www.codechef.com/users/kit27csbs33 | 711523BCB033 | https://codolio.com/profile/cVmLPWrV
MAHESHWARI D | https://leetcode.com/u/Mahesh--/ | https://codeforces.com/profile/-9976 | https://github.com/Maheshwaridhandapani | https://www.codechef.com/users/kit27csbs34 | 711523BCB034 | https://codeforces.com/profile/-9976
MANO NIKILA R | https://leetcode.com/u/Manonikila_2/ | https://codeforces.com/profile/manonikila2 | https://github.com/manonikila | https://www.codechef.com/users/manonikila | 711523BCB035 | https://codolio.com/profile/Manonikila
MOHAMMED SYFUDEEN S | https://leetcode.com/u/Syfudeen_17/ | https://codeforces.com/profile/kit27.csbs36 | https://github.com/Syfudeen | https://www.codechef.com/users/syfudeen | 711523BCB036 | https://codolio.com/profile/Syf
MONISHA G | https://leetcode.com/u/monisha_ganesh20/ | https://codeforces.com/profile/monisha.ganesh20 | https://github.com/Monishamatthew | https://www.codechef.com/users/kit27csbs37 | 711523BCB037 | https://codolio.com/profile/monisha.ganesh20
NISHANTH S | https://leetcode.com/u/user7544G/ | https://codeforces.com/profile/Nishanth_s_007 | https://github.com/Nishanth-S-2005 | https://www.codechef.com/users/kit27csbs38 | 711523BCB038 | https://codolio.com/profile/Nishanth_Sasikumar
NIVED V PUTHEN PURAKKAL | https://leetcode.com/u/user0990Ac/ | https://codeforces.com/profile/Nivedv | https://github.com/ignt-nived | https://www.codechef.com/users/kit27.csbs39 | 711523BCB039 | https://codolio.com/profile/nived
PRADEEPA P | https://leetcode.com/u/kit27csbs40/ | https://codeforces.com/profile/kit27.csbs40 | https://github.com/PRADEEPA-48 | https://www.codechef.com/users/kit27csbs40 | 711523BCB040 | https://codolio.com/profile/Pradhu
PRAKASH B | https://leetcode.com/u/prakashme/ | https://codeforces.com/profile/Prakashb | https://github.com/prakashb96 | https://www.codechef.com/users/prakashb | 711523BCB041 | https://codolio.com/profile/prakashb
PRAVIN M | https://leetcode.com/u/pravin4211/ | https://codeforces.com/profile/kit27.csbs42 | https://github.com/Pravin2182005 | https://www.codechef.com/users/pravin42 | 711523BCB042 | https://codolio.com/profile/pravin-42
RAGAVI A | https://leetcode.com/u/kit27csbs43/ | https://codeforces.com/profile/kit27.csbs43 | https://github.com/Ragavi-05 | https://www.codechef.com/users/kit27csbs43 | 711523BCB043 | https://codolio.com/profile/RagaviAsokan
RAJA S | https://leetcode.com/u/Raja_37/ | https://codeforces.com/profile/RAJA_37 | https://github.com/Raja-037 | https://www.codechef.com/users/kit27csbs44 | 711523BCB044 | https://codolio.com/profile/Raja_37
RAJADURAI R | https://leetcode.com/u/Rajadurai31/ | https://codeforces.com/profile/kit27.csbs45 | https://github.com/Rajadurai31 | https://www.codechef.com/users/rajadurai_31 | 711523BCB045 | https://codolio.com/profile/Rajadurai31
RISHI ADHINARAYAN V | https://leetcode.com/u/rishi_adhinarayan_v | https://codeforces.com/profile/rishi_adhinarayan_v | https://github.com/rishitech-cyber | https://www.codechef.com/users/rishi_tech | 711523BCB046 | https://share.google/zoOEZ7F8PJfMq2JG2
ROBERT MITHRAN | https://leetcode.com/u/robertmithran/ | https://codeforces.com/profile/kit27.csbs47 | https://github.com/Robert-Mithhran-N | https://www.codechef.com/users/kit27csbs47 | 711523BCB047 | https://codolio.com/profile/_myth_x_46
RUDRESH M | https://leetcode.com/u/rudreshrudhu/ | https://codeforces.com/profile/rudreshrudhu | https://github.com/rudreshrudhu18 | https://www.codechef.com/users/rudreshrudhu | 711523BCB048 | https://codolio.com/profile/rudhu18
SABARI YUHENDHRAN M | https://leetcode.com/u/sabariyuhendhran/ | https://codeforces.com/profile/sabariyuhendh29 | https://github.com/sabariyuhendh | https://www.codechef.com/users/sabariyuhendh | 711523BCB049 | https://codolio.com/profile/sabariyuhendhran
SADHANA M | https://leetcode.com/u/kit27csbssadhana/ | https://codeforces.com/profile/Sadhana_123 | https://github.com/Sadhanas123 | https://www.codechef.com/users/kit27csbs_50 | 711523BCB050 | https://codolio.com/profile/sadhana@02
SANJAY N | https://leetcode.com/u/user8425jb/ | https://codeforces.com/profile/SANJAY_.N_ | https://github.com/Sanjayn230 | https://www.codechef.com/users/kit27csbs51 | 711523BCB051 | https://codolio.com/profile/SANJAY_N
SARAN G | https://leetcode.com/u/SaranGunasegaran/ | https://codeforces.com/profile/kit.csbs52 | https://share.google/MI5banj3nuHd1Kn8F | https://www.codechef.com/users/kit27csbs52 | 711523BCB052 | https://codolio.com/profile/Saran@07
SHANMUGAPRIYA P | https://leetcode.com/u/shamugapriya/ | https://codeforces.com/profile/shanmugapriya--006 | https://github.com/shanmugapriya143 | https://www.codechef.com/users/kit27csbs53 | 711523BCB053 | https://codolio.com/profile/ciZNdQIq
SHARVESH L | https://leetcode.com/u/sharveshl/ | https://codeforces.com/profile/sharvesh03 | https://github.com/sharveshl | https://www.codechef.com/users/sharveshl | 711523BCB054 | https://codolio.com/profile/sharveshl14
SOBHIKA P M | https://leetcode.com/u/kit27csbs55/ | https://codeforces.com/profile/kit27.csbs55 | https://github.com/sobhika11 | https://www.codechef.com/users/kit27csbs55 | 711523BCB055 | https://codolio.com/profile/sobhika
SOWMIYA S R | https://leetcode.com/u/sowmiyasr/ | https://codeforces.com/profile/Sowmiya_sr | https://github.com/srsowmiya | https://www.codechef.com/users/sowmiyasr | 711523BCB056 | https://codolio.com/profile/Sowmiya
SWATHI K | https://leetcode.com/u/thecode_1215/ | https://codeforces.com/profile/thecode_1215 | https://github.com/SwathiKaruppaiya15 | https://www.codechef.com/users/thecode_1215 | 711523BCB057 | Swathi Karuppaiya | Codolio
THIRUMAL T | https://leetcode.com/u/Thiru_17/ | https://codeforces.com/profile/Thiru06 | https://github.com/Thirumal5 | https://www.codechef.com/users/kit27csbs58 | 711523BCB058 | https://codolio.com/profile/THIRU6
VIGNESHKUMAR N | https://leetcode.com/u/vignesh_59/ | NULL | https://github.com/vig-nesh-kumar | https://www.codechef.com/users/vignesh_59 | 711523BCB059 | https://codolio.com/profile/vignesh_59/problemSolving/codechef
VIKRAM S | https://leetcode.com/u/vikram-s/ | https://codeforces.com/profile/Vikram_60 | https://github.com/Vikramsaravanan | https://www.codechef.com/users/kit27csbs60 | 711523BCB060 | https://codolio.com/profile/Mr.Annonymous
VISHWA J | https://leetcode.com/u/kit27csbs61/ | https://codeforces.com/profile/Vishwa_J | https://github.com/VishwaJ27 | https://www.codechef.com/users/kit27csbs61 | 711523BCB061 | https://codolio.com/profile/Vishwa_J
YOGANAYAHI M | kit27csbs63 - LeetCode Profile | https://share.google/edtHqO0B1XCQjreJV | https://github.com/Yoganayahi | https://www.codechef.com/users/kit27csbs63 | 711523BCB063 | https://codolio.com/profile/yoga
CHANDRAN M | https://leetcode.com/u/chandran_tech/ | https://codeforces.com/profile/Chandran_M | https://github.com/chandran33 | https://www.codechef.com/users/kit27csbs302 | 711523BCB302 | https://codolio.com/profile/Chandran
NISHANTH M | https://leetcode.com/u/Nishanth_tech/ | https://codeforces.com/profile/Nishanth_forces | https://github.com/Nishanth355183 | https://www.codechef.com/users/nish_m_20 | 711523BCB304 | https://codolio.com/profile/nishanth@20"""
    
    students = []
    lines = students_data.strip().split('\n')
    
    for line in lines:
        parts = [p.strip() for p in line.split('|')]
        if len(parts) < 7:
            continue
            
        name = parts[0]
        leetcode_link = parts[1]
        codeforces_link = parts[2]
        github_link = parts[3]
        codechef_link = parts[4]
        password = parts[5]  # Roll number
        codolio_link = parts[6]
        
        roll_number = password
        
        # Determine batch
        batch = BATCH_ASSIGNMENTS.get(roll_number, 'C')
        
        # Extract usernames
        leetcode_username = extract_username_from_url(leetcode_link, 'leetcode')
        codechef_username = extract_username_from_url(codechef_link, 'codechef')
        codeforces_username = extract_username_from_url(codeforces_link, 'codeforces')
        github_username = extract_username_from_url(github_link, 'github')
        codolio_username = extract_username_from_url(codolio_link, 'codolio')
        
        # Clean URLs (remove invalid ones)
        def clean_url(url):
            if not url or url.upper() in ['NULL', 'CODOLIO']:
                return ''
            if 'share.google' in url:
                return ''
            if 'http' not in url:
                return ''
            return url
        
        student = {
            'name': name,
            'rollNumber': roll_number,
            'email': f'{roll_number.lower()}@student.edu',
            'password': roll_number,  # Will be hashed by Node.js pre-save hook
            'batch': batch,
            'department': 'Computer Science & Business Systems',
            'year': 2,
            'platformLinks': {
                'leetcode': clean_url(leetcode_link),
                'codechef': clean_url(codechef_link),
                'codeforces': clean_url(codeforces_link),
                'github': clean_url(github_link),
                'codolio': clean_url(codolio_link)
            },
            'platformUsernames': {
                'leetcode': leetcode_username,
                'codechef': codechef_username,
                'codeforces': codeforces_username,
                'github': github_username,
                'codolio': codolio_username
            },
            'platforms': {
                'leetcode': {
                    'username': leetcode_username,
                    'rating': 0,
                    'maxRating': 0,
                    'problemsSolved': 0,
                    'rank': 0,
                    'contests': 0,
                    'contestsAttended': 0,
                    'lastWeekRating': 0,
                    'lastUpdated': datetime.now()
                },
                'codechef': {
                    'username': codechef_username,
                    'rating': 0,
                    'maxRating': 0,
                    'problemsSolved': 0,
                    'rank': 0,
                    'contests': 0,
                    'contestsAttended': 0,
                    'lastWeekRating': 0,
                    'lastUpdated': datetime.now()
                },
                'codeforces': {
                    'username': codeforces_username,
                    'rating': 0,
                    'maxRating': 0,
                    'problemsSolved': 0,
                    'rank': 0,
                    'contests': 0,
                    'contestsAttended': 0,
                    'lastWeekRating': 0,
                    'lastUpdated': datetime.now()
                },
                'hackerrank': {
                    'username': '',
                    'rating': 0,
                    'maxRating': 0,
                    'problemsSolved': 0,
                    'rank': 0,
                    'contests': 0,
                    'contestsAttended': 0,
                    'lastWeekRating': 0,
                    'lastUpdated': datetime.now()
                },
                'atcoder': {
                    'username': '',
                    'rating': 0,
                    'maxRating': 0,
                    'problemsSolved': 0,
                    'rank': 0,
                    'contests': 0,
                    'contestsAttended': 0,
                    'lastWeekRating': 0,
                    'lastUpdated': datetime.now()
                },
                'github': {
                    'username': github_username,
                    'repositories': 0,
                    'contributions': 0,
                    'commits': 0,
                    'followers': 0,
                    'lastWeekContributions': 0,
                    'streak': 0,
                    'lastUpdated': datetime.now()
                },
                'codolio': {
                    'username': codolio_username,
                    'totalSubmissions': 0,
                    'currentStreak': 0,
                    'maxStreak': 0,
                    'dailySubmissions': [],
                    'badges': [],
                    'lastUpdated': datetime.now()
                }
            },
            'weeklyProgress': [],
            'avatar': '',
            'defaultAvatar': 'spiderman',
            'resume': None,
            'projectRepositories': [],
            'isActive': True,
            'lastScrapedAt': datetime.now(),
            'scrapingErrors': [],
            'createdAt': datetime.now(),
            'updatedAt': datetime.now()
        }
        
        students.append(student)
    
    return students

def import_to_mongodb():
    """Import students to MongoDB"""
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        students_collection = db.students
        
        students = parse_student_data()
        
        print(f"📊 Parsed {len(students)} students")
        
        imported = 0
        updated = 0
        
        for student in students:
            result = students_collection.update_one(
                {'rollNumber': student['rollNumber']},
                {'$set': student},
                upsert=True
            )
            
            if result.upserted_id:
                imported += 1
            else:
                updated += 1
        
        print(f"✅ Imported {imported} new students")
        print(f"✅ Updated {updated} existing students")
        print(f"📝 Total: {len(students)} students in database")
        
        # Verify import
        total_count = students_collection.count_documents({})
        print(f"🔍 Database now contains {total_count} students")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Error importing to MongoDB: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("🚀 Starting student data import...")
    print(f"📡 Connecting to MongoDB: {MONGO_URI}")
    print(f"📚 Database: {DB_NAME}")
    print("-" * 50)
    
    if import_to_mongodb():
        print("-" * 50)
        print("✅ Import completed successfully!")
        print("\n💡 Next steps:")
        print("1. Run scraping scripts to fetch platform data")
        print("2. Start backend server: cd ../backend && npm run dev")
        print("3. Start frontend: npm run dev")
    else:
        print("❌ Import failed. Please check the error above.")

