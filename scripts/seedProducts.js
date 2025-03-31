const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

// Load environment variables
dotenv.config();

// Sample products data
const sampleProducts = [
    {
        name: "Premium Organic Cocoa Beans",
        description: "High-quality organic cocoa beans from the Western region of Ghana.",
        price: 12.50,
        unit: "kg",
        quantity: 500,
        category: "Spices",
        subcategory: "Cocoa",
        images: ["https://example.com/images/cocoa-1.jpg"],
        isOrganic: true,
        certification: "USDA Organic",
        origin: {
            region: "Western",
            city: "Takoradi"
        },
        seller: "507f1f77bcf86cd799439011",
        rating: 4.8,
        status: "available"
    },
    {
        name: "Fresh Pineapples",
        description: "Sweet and juicy pineapples from Central region farms.",
        price: 5.00,
        unit: "piece",
        quantity: 1000,
        category: "Fruits",
        subcategory: "Tropical Fruits",
        images: ["https://example.com/images/pineapple-1.jpg"],
        isOrganic: false,
        origin: {
            region: "Central",
            city: "Cape Coast"
        },
        seller: "507f1f77bcf86cd799439011",
        rating: 4.5,
        status: "available"
    },
    {
        name: "Premium Rice",
        description: "High-quality local rice from Northern region.",
        price: 80.00,
        unit: "bag",
        quantity: 200,
        category: "Grains",
        subcategory: "Rice",
        images: ["https://example.com/images/rice-1.jpg"],
        isOrganic: false,
        origin: {
            region: "Northern",
            city: "Tamale"
        },
        seller: "507f1f77bcf86cd799439011",
        rating: 4.7,
        status: "available"
    }
];

async function seedDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('Clearing existing products...');
        await Product.deleteMany({});
        
        console.log('Inserting sample products...');
        await Product.insertMany(sampleProducts);
        
        console.log('Database seeded successfully!');
        console.log(`Added ${sampleProducts.length} products`);
        
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the seeding function
seedDatabase(); 