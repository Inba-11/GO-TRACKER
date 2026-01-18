require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const scraperService = require('./services/scraperService');
const connectDB = require('./config/database');

const scrapeAllStudents = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Get all active students
    const students = await Student.find({ isActive: true }).sort({ rollNumber: 1 });
    console.log(`📊 Found ${students.length} active students to scrape\n`);

    if (students.length === 0) {
      console.log('⚠️  No active students found');
      return;
    }

    let totalScraped = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    const results = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const studentInfo = {
        name: student.name,
        rollNumber: student.rollNumber,
        scraped: [],
        errors: [],
        skipped: []
      };

      try {
        console.log(`[${i + 1}/${students.length}] Scraping ${student.name} (${student.rollNumber})...`);

        // Check if student has any platform links/usernames configured
        const hasPlatformLinks = student.platformLinks && (
          student.platformLinks.leetcode ||
          student.platformLinks.codechef ||
          student.platformLinks.codeforces ||
          student.platformLinks.github ||
          student.platformLinks.codolio
        );

        const hasPlatformUsernames = student.platformUsernames && (
          student.platformUsernames.leetcode ||
          student.platformUsernames.codechef ||
          student.platformUsernames.codeforces ||
          student.platformUsernames.github ||
          student.platformUsernames.codolio
        );

        if (!hasPlatformLinks && !hasPlatformUsernames) {
          console.log(`  ⏭️  Skipped: No platform links or usernames configured`);
          studentInfo.skipped.push('No platform links configured');
          totalSkipped++;
          results.push(studentInfo);
          continue;
        }

        // Use platformUsernames if available, otherwise extract from platformLinks
        let platformUsernames = { ...student.platformUsernames };

        // Extract usernames from URLs if platformUsernames are missing
        if (!student.platformUsernames || Object.values(platformUsernames).every(u => !u)) {
          platformUsernames = {
            leetcode: extractUsernameFromUrl(student.platformLinks?.leetcode, 'leetcode'),
            codechef: extractUsernameFromUrl(student.platformLinks?.codechef, 'codechef'),
            codeforces: extractUsernameFromUrl(student.platformLinks?.codeforces, 'codeforces'),
            github: extractUsernameFromUrl(student.platformLinks?.github, 'github'),
            codolio: extractUsernameFromUrl(student.platformLinks?.codolio, 'codolio')
          };

          // Update platformUsernames in database if we extracted them
          student.platformUsernames = platformUsernames;
          await student.save();
        }

        // Create a temporary user-like object for the scraper
        const userForScraping = {
          platformUsernames: platformUsernames,
          platformLinks: student.platformLinks || {}
        };

        // Scrape all platforms
        const { results: scrapingResults, errors } = await scraperService.scrapeAllPlatforms(userForScraping);

        // Update student with scraped data
        let updated = false;
        if (scrapingResults.leetcode) {
          student.platforms.leetcode = scrapingResults.leetcode;
          studentInfo.scraped.push('leetcode');
          updated = true;
        }
        if (scrapingResults.codechef) {
          student.platforms.codechef = scrapingResults.codechef;
          studentInfo.scraped.push('codechef');
          updated = true;
        }
        if (scrapingResults.codeforces) {
          student.platforms.codeforces = scrapingResults.codeforces;
          studentInfo.scraped.push('codeforces');
          updated = true;
        }
        if (scrapingResults.github) {
          student.platforms.github = scrapingResults.github;
          studentInfo.scraped.push('github');
          updated = true;
        }
        if (scrapingResults.codolio) {
          student.platforms.codolio = scrapingResults.codolio;
          studentInfo.scraped.push('codolio');
          updated = true;
        }

        // Add errors
        errors.forEach(error => {
          studentInfo.errors.push(`${error.platform}: ${error.error}`);
        });

        if (updated) {
          student.lastScrapedAt = new Date();
          await student.save();
          totalScraped++;
          console.log(`  ✅ Scraped: ${studentInfo.scraped.join(', ')}`);
          if (studentInfo.errors.length > 0) {
            console.log(`  ⚠️  Errors: ${studentInfo.errors.join('; ')}`);
          }
        } else {
          console.log(`  ⚠️  No data scraped (all platforms failed or not configured)`);
          totalErrors++;
        }

        results.push(studentInfo);

        // Add delay between students to avoid rate limiting
        if (i < students.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
        }

      } catch (error) {
        console.error(`  ❌ Error scraping ${student.name}:`, error.message);
        studentInfo.errors.push(`General error: ${error.message}`);
        totalErrors++;
        results.push(studentInfo);
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SCRAPING SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully scraped: ${totalScraped} students`);
    console.log(`⏭️  Skipped (no links): ${totalSkipped} students`);
    console.log(`❌ Errors: ${totalErrors} students`);
    console.log(`📝 Total processed: ${students.length} students`);
    console.log('='.repeat(60));

    // Show detailed results
    const successfulStudents = results.filter(r => r.scraped.length > 0);
    const failedStudents = results.filter(r => r.errors.length > 0 && r.scraped.length === 0);
    const skippedStudents = results.filter(r => r.skipped.length > 0);

    if (successfulStudents.length > 0) {
      console.log('\n✅ SUCCESSFULLY SCRAPED:');
      successfulStudents.forEach(r => {
        console.log(`  - ${r.name} (${r.rollNumber}): ${r.scraped.join(', ')}`);
        if (r.errors.length > 0) {
          console.log(`    ⚠️  Partial errors: ${r.errors.join('; ')}`);
        }
      });
    }

    if (failedStudents.length > 0) {
      console.log('\n❌ FAILED TO SCRAPE:');
      failedStudents.forEach(r => {
        console.log(`  - ${r.name} (${r.rollNumber})`);
        r.errors.forEach(e => console.log(`    ❌ ${e}`));
      });
    }

    if (skippedStudents.length > 0) {
      console.log('\n⏭️  SKIPPED (NO PLATFORM LINKS):');
      skippedStudents.forEach(r => {
        console.log(`  - ${r.name} (${r.rollNumber})`);
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

// Helper function to extract username from URL
function extractUsernameFromUrl(url, platform) {
  if (!url || typeof url !== 'string') return '';
  
  try {
    if (platform === 'leetcode') {
      const match = url.match(/leetcode\.com\/u\/([^\/\?]+)/);
      return match ? match[1] : '';
    } else if (platform === 'codechef') {
      const match = url.match(/codechef\.com\/users\/([^\/\?]+)/);
      return match ? match[1] : '';
    } else if (platform === 'codeforces') {
      const match = url.match(/codeforces\.com\/profile\/([^\/\?]+)/);
      return match ? match[1] : '';
    } else if (platform === 'github') {
      const match = url.match(/github\.com\/([^\/\?]+)/);
      return match ? match[1] : '';
    } else if (platform === 'codolio') {
      const match = url.match(/codolio\.com\/profile\/([^\/\?]+)/);
      return match ? match[1] : '';
    }
  } catch (e) {
    return '';
  }
  return '';
}

scrapeAllStudents();

