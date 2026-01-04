require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');

const isBcryptHash = (value) => {
  if (typeof value !== 'string') return false;
  return value.startsWith('$2a$') || value.startsWith('$2b$') || value.startsWith('$2y$');
};

const run = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/go-tracker';

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const students = await Student.find({}, { _id: 1, rollNumber: 1, password: 1 });

  let alreadyHashed = 0;
  let updated = 0;
  let skippedNoPassword = 0;

  for (const s of students) {
    if (!s.password) {
      skippedNoPassword += 1;
      continue;
    }

    if (isBcryptHash(s.password)) {
      alreadyHashed += 1;
      continue;
    }

    // Expected legacy/plain password is rollNumber (from Python import)
    const nextPassword = await bcrypt.hash(s.password, 10);

    await Student.updateOne(
      { _id: s._id },
      { $set: { password: nextPassword } }
    );

    updated += 1;
  }

  console.log('✅ Student password migration finished');
  console.log({ total: students.length, updated, alreadyHashed, skippedNoPassword });

  await mongoose.disconnect();
};

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Failed to hash student passwords:', err);
    process.exit(1);
  });
