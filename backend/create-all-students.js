require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const connectDB = require('./config/database');

// Student data with batches from test file
const studentsData = [
  { name: "AADHAM SHARIEF A", rollNumber: "711523BCB001", password: "711523BCB001", batch: "B" },
  { name: "AARTHI V", rollNumber: "711523BCB002", password: "711523BCB002", batch: "C" },
  { name: "ABINAYA R", rollNumber: "711523BCB003", password: "711523BCB003", batch: "C" },
  { name: "ABINAYA R", rollNumber: "711523BCB004", password: "711523BCB004", batch: "C" },
  { name: "AHAMED AMMAR O A", rollNumber: "711523BCB005", password: "711523BCB005", batch: "A" },
  { name: "AKSHAI KANNAA MB", rollNumber: "711523BCB006", password: "711523BCB006", batch: "B" },
  { name: "ALFRED ANTONY M", rollNumber: "711523BCB007", password: "711523BCB007", batch: "D" },
  { name: "ANANDHAKUMAR S", rollNumber: "711523BCB008", password: "711523BCB008", batch: "D" },
  { name: "ARJUN V B", rollNumber: "711523BCB009", password: "711523BCB009", batch: "D" },
  { name: "ARUNA T", rollNumber: "711523BCB010", password: "711523BCB010", batch: "C" },
  { name: "AYISHATHUL HAZEENA S", rollNumber: "711523BCB011", password: "711523BCB011", batch: "A" },
  { name: "DELHI KRISHNAN S", rollNumber: "711523BCB012", password: "711523BCB012", batch: "D" },
  { name: "DEVANYA N", rollNumber: "711523BCB013", password: "711523BCB013", batch: "B" },
  { name: "DHIVAKAR S", rollNumber: "711523BCB014", password: "711523BCB014", batch: "C" },
  { name: "DINESH S", rollNumber: "711523BCB015", password: "711523BCB015", batch: "A" },
  { name: "DIVYADHARSHINI M", rollNumber: "711523BCB016", password: "711523BCB016", batch: "A" },
  { name: "DURGA S", rollNumber: "711523BCB017", password: "711523BCB017", batch: "C" },
  { name: "GITHENDRAN K", rollNumber: "711523BCB018", password: "711523BCB018", batch: "C" },
  { name: "GOWSIKA S A", rollNumber: "711523BCB019", password: "711523BCB019", batch: "A" },
  { name: "HARISH S", rollNumber: "711523BCB020", password: "711523BCB020", batch: "C" },
  { name: "HARIVARSHA C S", rollNumber: "711523BCB021", password: "711523BCB021", batch: "D" },
  { name: "HARTHI S", rollNumber: "711523BCB022", password: "71153BCB022", batch: "NON-CRT" }, // Fixed roll number, kept original password
  { name: "INBATAMIZHAN P", rollNumber: "711523BCB023", password: "711523BCB023", batch: "C" },
  { name: "JEGAN S", rollNumber: "711523BCB024", password: "711523BCB024", batch: "C" },
  { name: "JENCY IRIN J", rollNumber: "711523BCB025", password: "711523BCB025", batch: "B" },
  { name: "JOEL G", rollNumber: "711523BCB026", password: "711523BCB026", batch: "C" },
  { name: "KASTHURI S", rollNumber: "711523BCB028", password: "711523BCB028", batch: "C" },
  { name: "KAVIYA K", rollNumber: "711523BCB029", password: "711523BCB029", batch: "D" },
  { name: "KOWSALYA S", rollNumber: "711523BCB030", password: "711523BCB030", batch: "B" },
  { name: "LAKSHANA S", rollNumber: "711523BCB031", password: "711523BCB031", batch: "A" },
  { name: "LOURDU SATHISH J", rollNumber: "711523BCB032", password: "711523BCB032", batch: "D" },
  { name: "MAHA LAKSHMI M", rollNumber: "711523BCB033", password: "711523BCB033", batch: "C" },
  { name: "MAHESHWARI D", rollNumber: "711523BCB034", password: "711523BCB034", batch: "B" },
  { name: "MANO NIKILA R", rollNumber: "711523BCB035", password: "711523BCB035", batch: "B" },
  { name: "MOHAMMED SYFUDEEN S", rollNumber: "711523BCB036", password: "711523BCB036", batch: "C" },
  { name: "MONISHA G", rollNumber: "711523BCB037", password: "711523BCB037", batch: "C" },
  { name: "NISHANTH S", rollNumber: "711523BCB038", password: "711523BCB038", batch: "C" },
  { name: "NIVED V PUTHEN PURAKKAL", rollNumber: "711523BCB039", password: "711523BCB039", batch: "B" },
  { name: "PRADEEPA P", rollNumber: "711523BCB040", password: "711523BCB040", batch: "D" },
  { name: "PRAKASH B", rollNumber: "711523BCB041", password: "711523BCB041", batch: "A" },
  { name: "PRAVIN M", rollNumber: "711523BCB042", password: "711523BCB042", batch: "D" },
  { name: "RAGAVI A", rollNumber: "711523BCB043", password: "711523BCB043", batch: "B" },
  { name: "RAJA S", rollNumber: "711523BCB044", password: "711523BCB044", batch: "D" },
  { name: "RAJADURAI R", rollNumber: "711523BCB045", password: "711523BCB045", batch: "A" },
  { name: "RISHI ADHINARAYAN V", rollNumber: "711523BCB046", password: "711523BCB046", batch: "NON-CRT" },
  { name: "ROBERT MITHRAN", rollNumber: "711523BCB047", password: "711523BCB047", batch: "A" },
  { name: "RUDRESH M", rollNumber: "711523BCB048", password: "711523BCB048", batch: "NON-CRT" },
  { name: "SABARI YUHENDHRAN M", rollNumber: "711523BCB049", password: "711523BCB049", batch: "A" },
  { name: "SADHANA M", rollNumber: "711523BCB050", password: "711523BCB050", batch: "D" },
  { name: "SANJAY N", rollNumber: "711523BCB051", password: "711523BCB051", batch: "D" },
  { name: "SARAN G", rollNumber: "711523BCB052", password: "711523BCB052", batch: "D" },
  { name: "SHANMUGAPRIYA P", rollNumber: "711523BCB053", password: "711523BCB053", batch: "C" },
  { name: "SHARVESH L", rollNumber: "711523BCB054", password: "711523BCB054", batch: "A" },
  { name: "SOBHIKA P M", rollNumber: "711523BCB055", password: "711523BCB055", batch: "A" },
  { name: "SOWMIYA S R", rollNumber: "711523BCB056", password: "711523BCB056", batch: "A" },
  { name: "SWATHI K", rollNumber: "711523BCB057", password: "711523BCB057", batch: "C" },
  { name: "THIRUMAL T", rollNumber: "711523BCB058", password: "711523BCB058", batch: "B" },
  { name: "VIGNESHKUMAR N", rollNumber: "711523BCB059", password: "711523BCB059", batch: "D" },
  { name: "VIKRAM S", rollNumber: "711523BCB060", password: "711523BCB060", batch: "B" },
  { name: "VISHWA J", rollNumber: "711523BCB061", password: "711523BCB061", batch: "D" },
  { name: "YOGANAYAHI M", rollNumber: "711523BCB063", password: "711523BCB063", batch: "C" },
  { name: "CHANDRAN M", rollNumber: "711523BCB302", password: "711523BCB302", batch: "D" },
  { name: "NISHANTH M", rollNumber: "711523BCB304", password: "711523BCB304", batch: "D" }
];

const createAllStudents = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB\n');
    
    let created = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    const errorDetails = [];
    
    for (let i = 0; i < studentsData.length; i++) {
      const studentInfo = studentsData[i];
      const rollNumber = studentInfo.rollNumber;
      const password = studentInfo.password;
      
      try {
        // Check if student already exists
        let student = await Student.findOne({ rollNumber });
        
        if (student) {
          // Update password if needed
          const isMatch = await student.comparePassword(password);
          if (!isMatch) {
            console.log(`[${i + 1}/${studentsData.length}] 🔄 Updating password for ${studentInfo.name} (${rollNumber})`);
            student.password = password; // Will be hashed by pre-save hook
            await student.save();
            updated++;
          } else {
            console.log(`[${i + 1}/${studentsData.length}] ⏭️  ${studentInfo.name} (${rollNumber}) - Already exists with correct password`);
            skipped++;
          }
          continue;
        }
        
        // Generate email from roll number
        const email = `${rollNumber.toLowerCase()}@student.edu`;
        
        // Create new student
        const studentData = {
          name: studentInfo.name,
          rollNumber: rollNumber,
          email: email,
          password: password, // Will be hashed by pre-save hook
          batch: studentInfo.batch,
          department: 'Computer Science & Business Systems',
          year: 2,
          isActive: true
        };
        
        student = new Student(studentData);
        await student.save();
        
        // Verify password works
        const isMatch = await student.comparePassword(password);
        const status = isMatch ? '✅' : '❌';
        
        console.log(`[${i + 1}/${studentsData.length}] ${status} Created ${studentInfo.name} (${rollNumber}) - Batch: ${studentInfo.batch}`);
        created++;
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        console.error(`[${i + 1}/${studentsData.length}] ❌ Error creating ${studentInfo.name} (${rollNumber}):`, error.message);
        errors++;
        errorDetails.push({
          name: studentInfo.name,
          rollNumber: rollNumber,
          error: error.message
        });
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Created: ${created} students`);
    console.log(`🔄 Updated: ${updated} students`);
    console.log(`⏭️  Skipped: ${skipped} students`);
    console.log(`❌ Errors: ${errors} students`);
    console.log(`📝 Total: ${studentsData.length} students`);
    console.log('='.repeat(60));
    
    if (errorDetails.length > 0) {
      console.log('\n❌ ERROR DETAILS:');
      errorDetails.forEach(err => {
        console.log(`  - ${err.name} (${err.rollNumber}): ${err.error}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Fatal Error:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
};

createAllStudents();

