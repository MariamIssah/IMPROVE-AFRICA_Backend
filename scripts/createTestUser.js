const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const createTestUser = async () => {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB successfully');

        // Find or create test user
        let testUser = await User.findOne({ email: 'seller@test.com' });
        
        if (!testUser) {
            testUser = await User.create({
                name: 'Test Seller',
                email: 'seller@test.com',
                password: 'password123',
                role: 'seller',
                phone: '+233123456789',
                address: {
                    street: '123 Test Street',
                    city: 'Accra',
                    region: 'Greater Accra'
                }
            });
            console.log('Test user created successfully');
        } else {
            console.log('Using existing test user');
        }

        console.log('User ID:', testUser._id.toString());

        // Update the SAMPLE_SELLER_ID in seedProducts.js
        const fs = require('fs');
        const path = require('path');
        const seedProductsPath = path.join(__dirname, 'seedProducts.js');
        let seedProductsContent = fs.readFileSync(seedProductsPath, 'utf8');
        
        // Replace the sample seller ID with the new user ID
        seedProductsContent = seedProductsContent.replace(
            /const SAMPLE_SELLER_ID = '.*?'/,
            `const SAMPLE_SELLER_ID = '${testUser._id.toString()}'`
        );
        
        fs.writeFileSync(seedProductsPath, seedProductsContent);
        console.log('Updated seedProducts.js with new seller ID');

        await mongoose.connection.close();
        console.log('Database connection closed');
        
        return {
            success: true,
            userId: testUser._id.toString(),
            message: 'Test user created and seller ID updated in seedProducts.js'
        };

    } catch (error) {
        console.error('Error with test user:', error);
        await mongoose.connection.close().catch(err => console.error('Error closing connection:', err));
        
        return {
            success: false,
            error: error.message
        };
    }
};

// Run directly if script is executed directly
if (require.main === module) {
    createTestUser().then(result => {
        console.log('Result:', result);
        process.exit(result.success ? 0 : 1);
    });
}

// Export the function
module.exports = { createTestUser }; 