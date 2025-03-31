/**
 * Simple Database Seed Script
 * 
 * This script creates and populates a JSON file with sample products
 * that can be used as a fallback data source if MongoDB is not available.
 */

const fs = require('fs');
const path = require('path');

// Sample products data
const products = [
  // Fruits
  {
    id: '1',
    name: 'Fresh Pineapples',
    description: 'Sweet and juicy pineapples from Ghana\'s coastal regions',
    price: 2.5,
    unit: 'kg',
    stock: 500,
    category: 'fruits',
    origin: 'Central Region',
    image: 'https://source.unsplash.com/featured/?pineapple',
    featured: true
  },
  {
    id: '2',
    name: 'Organic Mangoes',
    description: 'Ripe and sweet mangoes grown without pesticides',
    price: 3.0,
    unit: 'kg',
    stock: 300,
    category: 'fruits',
    origin: 'Eastern Region',
    image: 'https://source.unsplash.com/featured/?mango',
    featured: true
  },
  
  // Vegetables
  {
    id: '3',
    name: 'Fresh Cassava',
    description: 'Farm-fresh cassava roots, perfect for fufu and other dishes',
    price: 1.5,
    unit: 'kg',
    stock: 800,
    category: 'vegetables',
    origin: 'Volta Region',
    image: 'https://source.unsplash.com/featured/?cassava',
    featured: false
  },
  {
    id: '4',
    name: 'Organic Yams',
    description: 'Naturally grown yams from fertile soils',
    price: 2.0,
    unit: 'kg',
    stock: 600,
    category: 'vegetables',
    origin: 'Northern Region',
    image: 'https://source.unsplash.com/featured/?yam',
    featured: true
  },
  
  // Grains
  {
    id: '5',
    name: 'Premium Rice',
    description: 'High-quality rice grown in Ghana\'s valleys',
    price: 2.8,
    unit: 'kg',
    stock: 1000,
    category: 'grains',
    origin: 'Volta Region',
    image: 'https://source.unsplash.com/featured/?rice',
    featured: false
  },
  {
    id: '6',
    name: 'Organic Millet',
    description: 'Pesticide-free millet, perfect for porridge and other dishes',
    price: 2.2,
    unit: 'kg',
    stock: 700,
    category: 'grains',
    origin: 'Upper East Region',
    image: 'https://source.unsplash.com/featured/?millet',
    featured: false
  },
  
  // Nuts
  {
    id: '7',
    name: 'Shea Nuts',
    description: 'Premium quality shea nuts for butter production',
    price: 4.5,
    unit: 'kg',
    stock: 400,
    category: 'nuts',
    origin: 'Northern Region',
    image: 'https://source.unsplash.com/featured/?shea',
    featured: true
  },
  {
    id: '8',
    name: 'Raw Cashews',
    description: 'Unprocessed cashew nuts fresh from the farm',
    price: 5.0,
    unit: 'kg',
    stock: 350,
    category: 'nuts',
    origin: 'Brong-Ahafo Region',
    image: 'https://source.unsplash.com/featured/?cashew',
    featured: false
  },
  
  // Spices
  {
    id: '9',
    name: 'Dried Ginger',
    description: 'Sun-dried ginger with intense flavor',
    price: 3.5,
    unit: 'kg',
    stock: 200,
    category: 'spices',
    origin: 'Eastern Region',
    image: 'https://source.unsplash.com/featured/?ginger',
    featured: false
  },
  {
    id: '10',
    name: 'Ground Pepper',
    description: 'Spicy pepper powder for all your culinary needs',
    price: 4.0,
    unit: 'kg',
    stock: 150,
    category: 'spices',
    origin: 'Ashanti Region',
    image: 'https://source.unsplash.com/featured/?pepper',
    featured: true
  }
];

// Create the JSON file
const outputPath = path.join(__dirname, 'sample-products.json');
const jsonData = JSON.stringify({ products }, null, 2);

try {
  fs.writeFileSync(outputPath, jsonData);
  console.log(`✅ Successfully generated sample products data at: ${outputPath}`);
  console.log(`Total products created: ${products.length}`);
  
  // Also create a public data directory if it doesn't exist
  const publicDataDir = path.join(__dirname, 'public', 'data');
  if (!fs.existsSync(publicDataDir)) {
    fs.mkdirSync(publicDataDir, { recursive: true });
  }
  
  // Copy the file to the public directory as well
  const publicPath = path.join(publicDataDir, 'products.json');
  fs.writeFileSync(publicPath, jsonData);
  console.log(`✅ Also copied data to public directory: ${publicPath}`);
  
  console.log('\nYou can now use this data as a fallback if MongoDB is not available.');
  console.log('Add this to your server.js to serve static JSON if MongoDB fails:');
  console.log('\napp.get("/api/products/fallback", (req, res) => {');
  console.log('  res.sendFile(path.join(__dirname, "public/data/products.json"));');
  console.log('});');
  
} catch (error) {
  console.error('❌ Error generating sample data:', error.message);
} 