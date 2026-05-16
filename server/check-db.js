const mongoose = require('mongoose');
const Session = require('./models/Session');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const session = await Session.findOne({ roomId: 'C6E6937A' });
  
  if (!session) {
    console.log('NO SESSION FOUND for this roomId');
  } else {
    console.log('Session found ✓');
    console.log('Snapshots count:', session.snapshots?.length);
    console.log('Keystrokes count:', session.keystrokes?.length);
    console.log('First snapshot:', session.snapshots?.[0]);
  }
  
  await mongoose.disconnect();
}

check().catch(console.error);