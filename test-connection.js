require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');
console.log('MongoDB URI:', process.env.MONGODB_URI.replace(/<db_password>/, '****'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB!');
    console.log('Database name:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);
    
    // Test if we can perform operations
    return mongoose.connection.db.listCollections().toArray();
  })
  .then(collections => {
    console.log('\nAvailable collections:');
    collections.forEach(collection => {
      console.log('-', collection.name);
    });
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  })
  .finally(() => {
    mongoose.connection.close();
  }); 