const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

// Import product categories
const grains = require('./products/grains');
const legumes = require('./products/legumes');
const oilseeds = require('./products/oilseeds');
const rootsAndTubers = require('./products/rootsAndTubers');
const fruits = require('./products/fruits');
const vegetables = require('./products/vegetables');
const spices = require('./products/spices');

// Load environment variables
dotenv.config();

// A default seller ID (you may want to update this with a real seller from your database)
const SELLER_ID = '67e0283b0cf80dda5cfd3edb';

// Add seller ID to all products
const addSellerToProducts = (products) => {
  return products.map(product => ({
    ...product,
    seller: SELLER_ID
  }));
};

// Combine all products
const products = [
  ...addSellerToProducts(grains),
  ...addSellerToProducts(legumes),
  ...addSellerToProducts(oilseeds),
  ...addSellerToProducts(rootsAndTubers),
  ...addSellerToProducts(fruits),
  ...addSellerToProducts(vegetables),
  ...addSellerToProducts(spices)
];

// Function to seed products to database
async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert products
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products`);

    // Log unique categories
    const categories = [...new Set(products.map(p => p.category))];
    console.log('Product categories:', categories);

    // Log some sample regions
    const regions = {};
    products.forEach(p => {
      if (!regions[p.origin.region]) {
        regions[p.origin.region] = new Set();
      }
      regions[p.origin.region].add(p.origin.city);
    });

    console.log('Regions with cities:');
    Object.keys(regions).forEach(region => {
      console.log(`${region}: ${[...regions[region]].join(', ')}`);
    });

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding products:', error);
    await mongoose.connection.close();
    console.log('Database connection closed after error');
  }
}

// Run the seed function
seedProducts(); 