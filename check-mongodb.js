/**
 * MongoDB Installation Check Script
 * 
 * This script checks if MongoDB is properly installed and accessible.
 * Run with: node check-mongodb.js
 */

const { exec } = require('child_process');
const mongoose = require('mongoose');

console.log('Checking MongoDB installation and connection...');

// Check MongoDB version
function checkMongoDBVersion() {
  return new Promise((resolve, reject) => {
    exec('mongod --version', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ MongoDB is not installed or not in PATH');
        console.error(`Error: ${error.message}`);
        console.log('\nTo install MongoDB:');
        console.log('1. Visit: https://www.mongodb.com/try/download/community');
        console.log('2. Download and install MongoDB Community Server');
        console.log('3. Add MongoDB bin directory to your system PATH');
        reject(error);
        return;
      }
      
      console.log('✅ MongoDB is installed');
      console.log(stdout.split('\n')[0]); // Print first line of version info
      resolve();
    });
  });
}

// Check if MongoDB service is running
function checkMongoDBService() {
  return new Promise((resolve, reject) => {
    // Different commands for Windows vs Unix-like systems
    const command = process.platform === 'win32' 
      ? 'sc query mongodb || sc query MongoDB'
      : 'pgrep mongod || pgrep mongodb';
    
    exec(command, (error, stdout, stderr) => {
      if (error || !stdout.trim()) {
        console.error('❌ MongoDB service is not running');
        console.log('\nTo start MongoDB service:');
        if (process.platform === 'win32') {
          console.log('1. Open Services (services.msc)');
          console.log('2. Find MongoDB and start it');
          console.log('   OR');
          console.log('1. Run Command Prompt as Administrator');
          console.log('2. Type: net start MongoDB');
        } else {
          console.log('1. Run: sudo systemctl start mongod');
          console.log('   OR');
          console.log('1. Run: sudo service mongod start');
        }
        resolve(false);
        return;
      }
      
      console.log('✅ MongoDB service is running');
      resolve(true);
    });
  });
}

// Check connection to database
async function checkMongoDBConnection() {
  try {
    const uri = 'mongodb://localhost:27017/improve-africa';
    console.log(`Attempting to connect to: ${uri}`);
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Successfully connected to MongoDB database');
    
    // Check database stats
    const stats = await mongoose.connection.db.stats();
    console.log('\nDatabase stats:');
    console.log(`- Database: improve-africa`);
    console.log(`- Collections: ${stats.collections}`);
    console.log(`- Documents: ${stats.objects}`);
    console.log(`- Storage size: ${Math.round(stats.storageSize / 1024 / 1024 * 100) / 100} MB`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB database');
    console.error(`Error: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\nPossible solutions:');
      console.log('1. Make sure MongoDB service is running');
      console.log('2. Check if MongoDB is listening on default port 27017');
      console.log('3. Verify there are no firewalls blocking the connection');
    }
    
    return false;
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

// Run all checks
async function runChecks() {
  console.log('='.repeat(50));
  console.log('MONGODB INSTALLATION CHECKER');
  console.log('='.repeat(50));
  
  try {
    await checkMongoDBVersion();
    console.log('-'.repeat(50));
    
    const serviceRunning = await checkMongoDBService();
    console.log('-'.repeat(50));
    
    if (serviceRunning) {
      const connectionSuccessful = await checkMongoDBConnection();
      console.log('-'.repeat(50));
      
      if (connectionSuccessful) {
        console.log('✅ All checks passed! MongoDB is properly installed and accessible.');
        return true;
      }
    }
    
    console.log('❌ Some checks failed. Please fix the issues mentioned above.');
    return false;
  } catch (error) {
    console.log('-'.repeat(50));
    console.log('❌ MongoDB installation check failed.');
    return false;
  }
}

// Run the checks
runChecks()
  .then(success => {
    console.log('='.repeat(50));
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Error running checks:', error);
    process.exit(1);
  }); 