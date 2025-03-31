// Helper script to fix region names in seed files
const fs = require('fs');
const path = require('path');

// Map of incorrect region names to correct ones from the schema enum
const regionMapping = {
  'Brong Ahafo': 'Bono',
  // Add more mappings if needed
};

// Function to fix region names in product files
function fixRegions() {
  console.log('Starting region name fixes...');
  
  // Directory containing product seed files
  const productsDir = path.join(__dirname, 'products');

  // Process each file in the products directory
  fs.readdir(productsDir, (err, files) => {
    if (err) {
      console.error('Error reading products directory:', err);
      return;
    }

    // Process only JavaScript files
    const jsFiles = files.filter(file => file.endsWith('.js'));
    
    jsFiles.forEach(file => {
      const filePath = path.join(productsDir, file);
      
      // Read file content
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error(`Error reading file ${file}:`, err);
          return;
        }
        
        let updatedContent = data;
        
        // Replace each incorrect region name with the correct one
        Object.entries(regionMapping).forEach(([incorrect, correct]) => {
          const regex = new RegExp(`region: ["']${incorrect}["']`, 'g');
          updatedContent = updatedContent.replace(regex, `region: "${correct}"`);
        });
        
        // Write updated content back to file
        if (updatedContent !== data) {
          fs.writeFile(filePath, updatedContent, 'utf8', err => {
            if (err) {
              console.error(`Error writing file ${file}:`, err);
              return;
            }
            console.log(`Updated region names in ${file}`);
          });
        } else {
          console.log(`No region name changes needed in ${file}`);
        }
      });
    });
  });
  
  return { message: 'Region fix process started' };
}

// Run directly if script is executed directly
if (require.main === module) {
  fixRegions();
}

// Export the function
module.exports = { fixRegions }; 