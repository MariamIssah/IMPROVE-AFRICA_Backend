/**
 * IMPROVE AFRICA Marketplace - Product Checker
 * 
 * This script queries the database and lists all products by category
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import Product model
const Product = require('./models/Product');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB successfully');
  checkProducts();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function checkProducts() {
  try {
    // Get all categories
    const categories = await Product.distinct('category');
    
    console.log(`\n=== IMPROVE AFRICA MARKETPLACE PRODUCTS ===\n`);
    console.log(`Found ${categories.length} product categories\n`);
    
    // For each category, list the products
    for (const category of categories) {
      // Get products in this category
      const products = await Product.find({ category }).sort('name');
      
      console.log(`\n=== ${category.toUpperCase()} (${products.length} products) ===`);
      
      if (products.length > 0) {
        // Group by subcategory if it exists
        const subcategories = {};
        
        products.forEach(product => {
          const subcategory = product.subcategory || 'Other';
          if (!subcategories[subcategory]) {
            subcategories[subcategory] = [];
          }
          subcategories[subcategory].push(product);
        });
        
        // List products by subcategory
        for (const [subcategory, subProducts] of Object.entries(subcategories)) {
          if (Object.keys(subcategories).length > 1) {
            console.log(`\n* ${subcategory} (${subProducts.length} products)`);
          }
          
          subProducts.forEach(product => {
            const organic = product.isOrganic ? '🌱 ' : '';
            const featured = product.status === 'featured' ? '⭐ ' : '';
            console.log(`  ${organic}${featured}${product.name} - GH₵${product.price}/${product.unit} (${product.quantity} ${product.unit} available)`);
          });
        }
      } else {
        console.log('  No products found in this category');
      }
    }
    
    console.log('\n=== END OF PRODUCT LIST ===\n');
    
    // Close the connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error checking products:', error);
    mongoose.connection.close();
    process.exit(1);
  }
} 