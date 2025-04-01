/**
 * Improve Africa - Troubleshooting Script
 * 
 * This script helps diagnose common issues with the application.
 * Run with: node troubleshoot.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const http = require('http');

// Configuration
const config = {
  serverPort: 3000,
  dbName: 'improve-africa',
  dbPort: 27017,
  requiredFiles: [
    'server.js',
    'seed.js',
    'models/Product.js',
    'models/User.js',
    'market.html'
  ]
};

console.log('Starting diagnostic checks for Improve Africa...');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Helper to print colored messages
function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Print header
function printHeader(title) {
  console.log('\n' + '='.repeat(60));
  print(` ${title} `, 'bold');
  console.log('='.repeat(60));
}

// Print result
function printResult(test, result, message) {
  if (result) {
    print(`✅ ${test}: ${message}`, 'green');
  } else {
    print(`❌ ${test}: ${message}`, 'red');
  }
}

// Check if required files exist
async function checkRequiredFiles() {
  printHeader('FILE SYSTEM CHECKS');
  
  let allFilesExist = true;
  
  for (const file of config.requiredFiles) {
    const exists = fs.existsSync(path.resolve(file));
    printResult('File', exists, `${file} ${exists ? 'exists' : 'is missing'}`);
    if (!exists) allFilesExist = false;
  }
  
  return allFilesExist;
}

// Check MongoDB connection
async function checkDatabase() {
  printHeader('DATABASE CHECKS');
  
  try {
    print('Attempting to connect to MongoDB...', 'blue');
    const uri = `mongodb://localhost:${config.dbPort}/${config.dbName}`;
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    printResult('Database', true, `Connected to MongoDB at ${uri}`);
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name).join(', ');
    
    if (collections.length > 0) {
      printResult('Collections', true, `Found collections: ${collectionNames}`);
      
      // Check documents in products collection
      if (collections.some(c => c.name === 'products')) {
        const productCount = await mongoose.connection.db.collection('products').countDocuments();
        printResult('Products', productCount > 0, 
          productCount > 0 ? `Found ${productCount} products` : 'No products found in database');
        
        if (productCount === 0) {
          print('\nℹ️ To seed the database with sample products, run:', 'yellow');
          print('   node seed.js', 'cyan');
        }
      } else {
        printResult('Products', false, 'Products collection not found');
      }
    } else {
      printResult('Collections', false, 'No collections found in database');
    }
    
    return true;
  } catch (error) {
    printResult('Database', false, `Failed to connect: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      print('\nℹ️ MongoDB might not be running. Try these steps:', 'yellow');
      print('1. Check if MongoDB is installed:', 'cyan');
      print('   mongod --version', 'cyan');
      print('2. Start MongoDB service:', 'cyan');
      if (process.platform === 'win32') {
        print('   net start MongoDB  (as Administrator)', 'cyan');
      } else {
        print('   sudo systemctl start mongod', 'cyan');
      }
      print('3. Verify MongoDB is listening on port 27017', 'cyan');
    }
    
    return false;
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

// Check if server is running
function checkServer() {
  printHeader('SERVER CHECKS');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: config.serverPort,
      path: '/api/test',
      method: 'GET',
      timeout: 3000
    };
    
    print(`Testing connection to http://localhost:${config.serverPort}/api/test...`, 'blue');
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            printResult('Server', true, `Server is running (status: ${response.status})`);
            print(`API version: ${response.message}`, 'green');
            
            if (response.environment) {
              print(`Node.js: ${response.environment.node}`, 'green');
              print(`Mongoose: ${response.environment.mongo}`, 'green');
              printResult('Database Connection', response.environment.isConnected, 
                response.environment.isConnected ? 'Server is connected to database' : 'Server is not connected to database');
            }
            
            resolve(true);
          } catch (e) {
            printResult('Server', true, 'Server is running but returned invalid JSON');
            resolve(true);
          }
        } else {
          printResult('Server', false, `Server returned status code ${res.statusCode}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      printResult('Server', false, `Server is not running (${error.message})`);
      
      print('\nℹ️ To start the server, run:', 'yellow');
      print('   node server.js', 'cyan');
      
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      printResult('Server', false, 'Request timed out');
      resolve(false);
    });
    
    req.end();
  });
}

// Check for Node.js processes
function checkNodeProcesses() {
  return new Promise((resolve) => {
    const cmd = process.platform === 'win32' 
      ? 'tasklist /FI "IMAGENAME eq node.exe" /FO CSV /NH' 
      : 'ps aux | grep node';
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        print(`Error checking Node.js processes: ${error.message}`, 'red');
        resolve(false);
        return;
      }
      
      printHeader('NODE.JS PROCESSES');
      
      if (stdout.includes('node') || stdout.includes('node.exe')) {
        print('Node.js processes found:', 'blue');
        
        const lines = stdout.split('\n')
          .filter(line => line.includes('node') || line.includes('node.exe'))
          .filter(line => !line.includes('grep'));
        
        lines.forEach(line => console.log(line));
        
        resolve(true);
      } else {
        print('No Node.js processes found running', 'yellow');
        resolve(false);
      }
    });
  });
}

// Run all checks
async function runDiagnostics() {
  printHeader('IMPROVE AFRICA DIAGNOSTICS');
  print('Running diagnostic checks...', 'blue');
  
  // File system checks
  const filesOk = await checkRequiredFiles();
  
  // Database checks
  const databaseOk = await checkDatabase();
  
  // Server checks
  const serverOk = await checkServer();
  
  // Process checks
  await checkNodeProcesses();
  
  // Summary
  printHeader('DIAGNOSTIC SUMMARY');
  
  printResult('Files', filesOk, filesOk ? 'All required files are present' : 'Some files are missing');
  printResult('Database', databaseOk, databaseOk ? 'Database is accessible' : 'Database has issues');
  printResult('Server', serverOk, serverOk ? 'Server is running' : 'Server is not running');
  
  if (!filesOk || !databaseOk || !serverOk) {
    print('\nRecommended actions:', 'yellow');
    
    if (!filesOk) {
      print('- Make sure all required files are in the correct locations', 'cyan');
    }
    
    if (!databaseOk) {
      print('- Install and start MongoDB', 'cyan');
      print('- Run the seed script: node seed.js', 'cyan');
    }
    
    if (!serverOk) {
      print('- Start the server: node server.js', 'cyan');
    }
  } else {
    print('\nAll systems are operational! 🎉', 'green');
  }
}

// Run the diagnostics
runDiagnostics()
  .catch(error => {
    print(`Error during diagnostics: ${error.message}`, 'red');
    process.exit(1);
  }); 