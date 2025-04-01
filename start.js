/**
 * Improve Africa Marketplace - Server Launcher
 * 
 * This script provides a robust way to start the server with proper error handling
 * and automatic fallback to static mode if MongoDB is not available.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// ANSI colors for console output
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

// Helper function to print colored text
function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Check if sample-products.json exists, if not create it
function ensureSampleDataExists() {
  const sampleDataPath = path.join(__dirname, 'sample-products.json');
  const publicDataDir = path.join(__dirname, 'public', 'data');
  const publicDataPath = path.join(publicDataDir, 'products.json');
  
  // Check if we need to create the sample data
  if (!fs.existsSync(sampleDataPath)) {
    print('Sample data not found. Generating fallback data...', 'yellow');
    
    try {
      // Run the simple-seed.js script
      require('./simple-seed');
      print('✅ Sample data generated successfully', 'green');
    } catch (error) {
      print(`❌ Failed to generate sample data: ${error.message}`, 'red');
      process.exit(1);
    }
  } else {
    print('✅ Sample data file exists', 'green');
    
    // Make sure public data directory exists
    if (!fs.existsSync(publicDataDir)) {
      fs.mkdirSync(publicDataDir, { recursive: true });
    }
    
    // Make sure the data is copied to public directory
    if (!fs.existsSync(publicDataPath)) {
      fs.copyFileSync(sampleDataPath, publicDataPath);
      print('✅ Copied sample data to public directory', 'green');
    }
  }
}

// Start the server
function startServer() {
  print('\n' + '='.repeat(60), 'bold');
  print(' IMPROVE AFRICA MARKETPLACE SERVER ', 'bold');
  print('='.repeat(60) + '\n', 'bold');
  
  // Ensure sample data exists for fallback
  ensureSampleDataExists();
  
  print('Starting server...', 'blue');
  
  // Start the server process
  const server = spawn('node', ['server.js'], {
    stdio: 'inherit'
  });
  
  // Handle server process events
  server.on('error', (error) => {
    print(`❌ Server failed to start: ${error.message}`, 'red');
    print('Troubleshooting tips:', 'yellow');
    print('1. Check if Node.js is installed correctly', 'cyan');
    print('2. Ensure all dependencies are installed (run npm install)', 'cyan');
    print('3. Check if port 3000 is already in use', 'cyan');
  });
  
  server.on('exit', (code, signal) => {
    if (code !== 0) {
      print(`❌ Server exited with code ${code}`, 'red');
      
      if (code === 1) {
        print('This may be due to MongoDB connection issues.', 'yellow');
        print('Troubleshooting tips:', 'yellow');
        print('1. Check if MongoDB is installed and running', 'cyan');
        print('2. Run node check-mongodb.js to diagnose database issues', 'cyan');
        print('3. Run node troubleshoot.js for more detailed diagnostics', 'cyan');
      }
    }
  });
  
  // Monitor the server by checking if it's responding
  setTimeout(checkServerStatus, 2000);
}

// Check if the server is responding
function checkServerStatus() {
  http.get('http://localhost:3000/api/test', (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        print('✅ Server is running and responding', 'green');
        print(`API Status: ${response.status}`, 'green');
        print(`MongoDB Connection: ${response.environment?.isConnected ? 'Connected' : 'Disconnected'}`, response.environment?.isConnected ? 'green' : 'yellow');
        
        if (!response.environment?.isConnected) {
          print('⚠️ Server is running in fallback mode (without MongoDB)', 'yellow');
          print('Some features may be limited.', 'yellow');
          print('To use full features, install and start MongoDB, then restart the server.', 'yellow');
        }
        
        print('\nOpen your browser and navigate to:', 'blue');
        print('http://localhost:3000/market.html', 'cyan');
      } catch (e) {
        print('Server responded but returned invalid JSON', 'yellow');
      }
    });
  }).on('error', (err) => {
    print('⚠️ Server not responding yet, will try again...', 'yellow');
    setTimeout(checkServerStatus, 2000);
  });
}

// Start the server
startServer(); 