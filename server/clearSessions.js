require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await mongoose.connection.collection('sessions').deleteMany({});
  console.log('✅ Sessions cleared');
  process.exit(0);
});