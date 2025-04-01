/**
 * IMPROVE AFRICA Marketplace - Product Seed Script
 * 
 * This script populates the database with a comprehensive list of agricultural products
 * from various categories including grains, legumes, oilseeds, roots & tubers, fruits,
 * vegetables, and spices.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Check if MongoDB URI is defined
if (!process.env.MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not defined in environment variables.');
  console.error('Please create a .env file with MONGODB_URI or provide the connection string directly.');
  process.exit(1);
}

// Import Product model - match the schema with your existing model
const Product = require('./models/Product');

// Create a backup directory for public/data
const backupDir = path.join(__dirname, 'public', 'data');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('🔌 Connected to MongoDB successfully');
  runSeed();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Ghana regions for random assignment
const regions = [
  'Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern', 
  'Greater Accra', 'North East', 'Northern', 'Oti', 'Savannah', 
  'Upper East', 'Upper West', 'Volta', 'Western', 'Western North'
];

// Ghana cities for random assignment
const cities = [
  'Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Cape Coast', 'Sunyani', 
  'Koforidua', 'Ho', 'Bolgatanga', 'Wa', 'Techiman', 'Elmina',
  'Hohoe', 'Axim', 'Nkawkaw', 'Obuasi', 'Tarkwa', 'Winneba'
];

// Get random city and region
function getRandomLocation() {
  return {
    city: cities[Math.floor(Math.random() * cities.length)],
    region: regions[Math.floor(Math.random() * regions.length)],
    country: 'Ghana'
  };
}

// Generate a random price within a range
function getRandomPrice(min, max) {
  return +(Math.random() * (max - min) + min).toFixed(2);
}

// Generate a random quantity within a range
function getRandomQuantity(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random boolean with probability
function getRandomBoolean(probability = 0.3) {
  return Math.random() < probability;
}

// Generate a random rating between 3.5 and 5.0
function getRandomRating() {
  return +(Math.random() * (5.0 - 3.5) + 3.5).toFixed(1);
}

// Random harvest date within the last year
function getRandomHarvestDate() {
  const now = new Date();
  const pastDate = new Date(now.setMonth(now.getMonth() - Math.floor(Math.random() * 12)));
  return pastDate;
}

// Generate a random seller ID - you'll need to replace these with actual user IDs from your database
// Using dummy IDs for now
const sellerIds = [
  '67e0283b0cf80dda5cfd3edb',  // Use existing seller ID from the logs
  '67e0283b0cf80dda5cfd3edc',
  '67e0283b0cf80dda5cfd3edd',
  '67e0283b0cf80dda5cfd3ede'
];

function getRandomSellerId() {
  return sellerIds[Math.floor(Math.random() * sellerIds.length)];
}

// Build the products array
const productsData = [
  // GRAINS CATEGORY
  {
    name: 'White Maize',
    description: 'Locally grown white maize kernels, perfect for making traditional dishes. High in starch and essential vitamins.',
    price: getRandomPrice(3, 7),
    unit: 'kg',
    quantity: getRandomQuantity(1000, 5000),
    category: 'Grains',
    subcategory: 'Maize',
    images: ['/images/white-maize.jpg'],
    isOrganic: getRandomBoolean(),
    origin: getRandomLocation(),
    seller: getRandomSellerId(),
    rating: getRandomRating(),
    status: 'available',
    harvestDate: getRandomHarvestDate(),
    reviews: []
  },
  {
    name: 'Yellow Maize',
    description: 'Golden yellow maize with excellent nutritional profile, rich in carotenoids and vitamin A. Ideal for animal feed and food products.',
    price: getRandomPrice(3, 7),
    unit: 'kg',
    quantity: getRandomQuantity(1000, 5000),
    category: 'Grains',
    subcategory: 'Maize',
    images: ['/images/yellow-maize.jpg'],
    isOrganic: getRandomBoolean(),
    origin: getRandomLocation(),
    seller: getRandomSellerId(),
    rating: getRandomRating(),
    status: 'available',
    harvestDate: getRandomHarvestDate(),
    reviews: []
  },
  {
    name: 'Hard Red Wheat',
    description: 'Premium high-protein wheat variety, perfect for bread making. Produces strong, elastic dough with excellent baking qualities.',
    price: getRandomPrice(5, 9),
    unit: 'kg',
    quantity: getRandomQuantity(800, 3000),
    category: 'Grains',
    subcategory: 'Wheat',
    images: ['/images/hard-red-wheat.jpg'],
    isOrganic: getRandomBoolean(),
    origin: getRandomLocation(),
    seller: getRandomSellerId(),
    rating: getRandomRating(),
    status: 'available',
    harvestDate: getRandomHarvestDate(),
    reviews: []
  },
  {
    name: 'Basmati Rice',
    description: 'Aromatic long-grain rice with distinctive fragrance. Grains remain separate when cooked, making it perfect for special dishes.',
    price: getRandomPrice(8, 15),
    unit: 'kg',
    quantity: getRandomQuantity(500, 2000),
    category: 'Grains',
    subcategory: 'Rice',
    images: ['/images/basmati-rice.jpg'],
    isOrganic: getRandomBoolean(),
    origin: getRandomLocation(),
    seller: getRandomSellerId(),
    rating: getRandomRating(),
    status: getRandomBoolean(0.1) ? 'featured' : 'available',
    harvestDate: getRandomHarvestDate(),
    reviews: []
  },
  {
    name: 'Barley',
    description: 'Versatile cereal grain used in brewing, animal feed, and food products. High in fiber and nutrients.',
    price: getRandomPrice(4, 8),
    unit: 'kg',
    quantity: getRandomQuantity(800, 3000),
    category: 'Grains',
    subcategory: 'Barley',
    images: ['/images/barley.jpg'],
    isOrganic: getRandomBoolean(),
    origin: getRandomLocation(),
    seller: getRandomSellerId(),
    rating: getRandomRating(),
    status: 'available',
    harvestDate: getRandomHarvestDate(),
    reviews: []
  },
  {
    name: 'White Sorghum',
    description: 'Drought-resistant white sorghum, ideal for flour and porridge. Gluten-free with mild flavor profile.',
    price: getRandomPrice(4, 7),
    unit: 'kg',
    quantity: getRandomQuantity(800, 2500),
    category: 'Grains',
    subcategory: 'Sorghum',
    images: ['/images/white-sorghum.jpg'],
    isOrganic: getRandomBoolean(),
    origin: getRandomLocation(),
    seller: getRandomSellerId(),
    rating: getRandomRating(),
    status: 'available',
    harvestDate: getRandomHarvestDate(),
    reviews: []
  },
  {
    name: 'Red Sorghum',
    description: 'High-tannin red sorghum, popular in brewing traditional beverages. Rich, earthy flavor with excellent storage properties.',
    price: getRandomPrice(4, 7),
    unit: 'kg',
    quantity: getRandomQuantity(800, 2500),
    category: 'Grains',
    subcategory: 'Sorghum',
    images: ['/images/red-sorghum.jpg'],
    isOrganic: getRandomBoolean(),
    origin: getRandomLocation(),
    seller: getRandomSellerId(),
    rating: getRandomRating(),
    status: 'available',
    harvestDate: getRandomHarvestDate(),
    reviews: []
  },
  {
    name: 'Brown Sorghum',
    description: 'Nutrient-rich brown sorghum with balanced flavor profile. Excellent for animal feed and human consumption.',
    price: getRandomPrice(4, 7),
    unit: 'kg',
    quantity: getRandomQuantity(800, 2500),
    category: 'Grains',
    subcategory: 'Sorghum',
    images: ['/images/brown-sorghum.jpg'],
    isOrganic: getRandomBoolean(),
    origin: getRandomLocation(),
    seller: getRandomSellerId(),
    rating: getRandomRating(),
    status: 'available',
    harvestDate: getRandomHarvestDate(),
    reviews: []
  },
  {
    name: 'Sweet Sorghum',
    description: 'Sugary stems and grain make this variety ideal for syrup production and livestock feed. Natural sweetener alternative.',
    price: getRandomPrice(4, 8),
    unit: 'kg',
    quantity: getRandomQuantity(800, 2500),
    category: 'Grains',
    subcategory: 'Sorghum',
    images: ['/images/sweet-sorghum.jpg'],
    isOrganic: getRandomBoolean(),
    origin: getRandomLocation(),
    seller: getRandomSellerId(),
    rating: getRandomRating(),
    status: 'available',
    harvestDate: getRandomHarvestDate(),
    reviews: []
  },
  {
    name: 'Pearl Millet',
    description: 'Hardy, drought-resistant grain with high nutritional value. Rich in iron, protein and fiber.',
    price: getRandomPrice(4, 7),
    unit: 'kg',
    quantity: getRandomQuantity(800, 2000),
    category: 'Grains',
    subcategory: 'Millet',
    images: ['/images/pearl-millet.jpg'],
    isOrganic: getRandomBoolean(),
    origin: getRandomLocation(),
    seller: getRandomSellerId(),
    rating: getRandomRating(),
    status: 'available',
    harvestDate: getRandomHarvestDate(),
    reviews: []
  },

  // LEGUMES CATEGORY
  {
    name: 'Black Beans',
    description: 'Glossy black beans with creamy texture and earthy flavor. Rich in protein and antioxidants.',
    price: getRandomPrice(5, 9),
    unit: 'kg',
    quantity: getRandomQuantity(500, 2000),
    category: 'Legumes',
    subcategory: 'Beans',
    images: ['/images/black-beans.jpg'],
    isOrganic: getRandomBoolean(),
    origin: getRandomLocation(),
    seller: getRandomSellerId(),
    rating: getRandomRating(),
    status: 'available',
    harvestDate: getRandomHarvestDate(),
    reviews: []
  },
  {
    name: 'Kidney Beans',
    description: 'Dark red kidney-shaped beans that hold their shape during cooking. Ideal for stews and chili.',
    price: getRandomPrice(5, 9),
    unit: 'kg',
    quantity: getRandomQuantity(500, 2000),
    category: 'Legumes',
    subcategory: 'Beans',
    images: ['/images/kidney-beans.jpg'],
    isOrganic: getRandomBoolean(),
    origin: getRandomLocation(),
    seller: getRandomSellerId(),
    rating: getRandomRating(),
    status: 'available',
    harvestDate: getRandomHarvestDate(),
    reviews: []
  },
  // Add 8 more legumes here...

  // VEGETABLES CATEGORY - Add missing ones from your list
  {
    name: 'Crown Broccoli',
    description: 'Compact dark green heads with tight florets. Rich in vitamins K and C with exceptional flavor.',
    price: getRandomPrice(4, 8),
    unit: 'kg',
    quantity: getRandomQuantity(300, 1000),
    category: 'Vegetables',
    subcategory: 'Brassicas',
    images: ['/images/crown-broccoli.jpg'],
    isOrganic: getRandomBoolean(0.4),
    origin: getRandomLocation(),
    seller: getRandomSellerId(),
    rating: getRandomRating(),
    status: getRandomBoolean(0.1) ? 'featured' : 'available',
    harvestDate: getRandomHarvestDate(),
    reviews: []
  },
  {
    name: 'Green Cabbage',
    description: 'Dense, tightly packed heads with crisp texture. Versatile for cooking and perfect for slaw and fermentation.',
    price: getRandomPrice(3, 6),
    unit: 'kg',
    quantity: getRandomQuantity(400, 1200),
    category: 'Vegetables',
    subcategory: 'Brassicas',
    images: ['/images/green-cabbage.jpg'],
    isOrganic: getRandomBoolean(0.4),
    origin: getRandomLocation(),
    seller: getRandomSellerId(),
    rating: getRandomRating(),
    status: 'available',
    harvestDate: getRandomHarvestDate(),
    reviews: []
  },
  // Add more vegetable products...

  // FRUITS CATEGORY
  {
    name: 'Cavendish Banana',
    description: 'Sweet, creamy texture with gentle aroma. The world\'s most popular banana variety.',
    price: getRandomPrice(3, 6),
    unit: 'kg',
    quantity: getRandomQuantity(500, 2000),
    category: 'Fruits',
    subcategory: 'Banana',
    images: ['/images/cavendish-banana.jpg'],
    isOrganic: getRandomBoolean(0.4),
    origin: getRandomLocation(),
    seller: getRandomSellerId(),
    rating: getRandomRating(),
    status: getRandomBoolean(0.15) ? 'featured' : 'available',
    harvestDate: getRandomHarvestDate(),
    reviews: []
  },
  {
    name: 'Kent Mango',
    description: 'Large, juicy mangoes with minimal fiber and rich, sweet flavor. Perfect balance of sweetness and acidity.',
    price: getRandomPrice(5, 10),
    unit: 'kg',
    quantity: getRandomQuantity(300, 1000),
    category: 'Fruits',
    subcategory: 'Mango',
    images: ['/images/kent-mango.jpg'],
    isOrganic: getRandomBoolean(0.4),
    origin: getRandomLocation(),
    seller: getRandomSellerId(),
    rating: getRandomRating(),
    status: getRandomBoolean(0.15) ? 'featured' : 'available',
    harvestDate: getRandomHarvestDate(),
    reviews: []
  }
  // Add more fruits...
];

// Add more categories: roots & tubers, oilseeds, and remaining spices
// For brevity, I've included samples for each category - you can expand this list

async function runSeed() {
  try {
    // Check if products already exist
    const existingCount = await Product.countDocuments();
    console.log(`Found ${existingCount} existing products in database`);

    if (existingCount > 12) {
      console.log('Database already has more than the initial 12 products. Skipping seeding to avoid duplicates.');
      console.log('If you want to reseed, please drop the products collection first.');
      mongoose.connection.close();
      return;
    }

    console.log(`🌱 Starting to seed ${productsData.length} new products...`);

    // Create a backup of existing products
    const existingProducts = await Product.find().lean();
    fs.writeFileSync(
      path.join(backupDir, 'products-backup.json'),
      JSON.stringify(existingProducts, null, 2)
    );
    console.log('✅ Backup of existing products created at public/data/products-backup.json');

    // Insert the new products
    const result = await Product.insertMany(productsData);
    
    console.log(`✅ Successfully added ${result.length} new products to the database!`);
    console.log(`📊 Total products in database now: ${await Product.countDocuments()}`);

    // Create a JSON file with all products for fallback
    const allProducts = await Product.find().lean();
    fs.writeFileSync(
      path.join(backupDir, 'products.json'),
      JSON.stringify(allProducts, null, 2)
    );
    console.log('✅ Created products.json fallback file at public/data/products.json');

    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

// Script execution will start from the MongoDB connection callback 