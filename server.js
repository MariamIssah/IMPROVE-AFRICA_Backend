/**
 * IMPROVE AFRICA Marketplace Server
 * 
 * This server loads product data from the category files in scripts/products.
 */
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const config = require('./config');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3004;
const mongoose = require('mongoose');
const Product = require('./models/Product');
const bodyParser = require('body-parser');
const { config: dotenvConfig } = require('dotenv');

// Load environment variables
dotenvConfig();

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'improveafrica01@gmail.com',
        pass: 'wyjx hook zjaq exgf'
    }
});

// Import product data from all categories
let allProducts = [];

try {
  // Use absolute path for product data files
  const scriptsPath = 'C:/Users/awini/IMPROVE-AFRICA/scripts';
  
  // Import product data files with absolute paths
  const fruitsProducts = require(`${scriptsPath}/products/fruits.js`);
  const grainsProducts = require(`${scriptsPath}/products/grains.js`);
  const legumesProducts = require(`${scriptsPath}/products/legumes.js`);
  const oilseedsProducts = require(`${scriptsPath}/products/oilseeds.js`);
  const rootsAndTubersProducts = require(`${scriptsPath}/products/rootsAndTubers.js`);
  const spicesProducts = require(`${scriptsPath}/products/spices.js`);
  const vegetablesProducts = require(`${scriptsPath}/products/vegetables.js`);

  // Import utility scripts with absolute paths
  const { fixRegions } = require(`${scriptsPath}/fixRegions`);
  const { createTestUser } = require(`${scriptsPath}/createTestUser`);

  // Combine all products
  allProducts = [
    ...fruitsProducts,
    ...grainsProducts,
    ...legumesProducts,
    ...oilseedsProducts,
    ...rootsAndTubersProducts,
    ...spicesProducts,
    ...vegetablesProducts
  ];

  console.log('Successfully loaded product data from scripts');
} catch (error) {
  console.log('Warning: Could not load product data from scripts:', error.message);
  console.log('Starting with empty product list');
  allProducts = [];
}

// Store for orders (in-memory database)
const orders = [];

// Configure Express
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from both the root directory and the IMPROVE-AFRICA directory
app.use(express.static(path.join(__dirname)));
app.use(express.static('C:/Users/awini/IMPROVE-AFRICA'));
if (process.env.FRONTEND_PATH) {
  app.use(express.static(process.env.FRONTEND_PATH));
}

// Main homepage route - redirects to market.html
app.get('/', (req, res) => {
  res.redirect('/market.html');
});

// API endpoint to get all products
app.get('/api/products', (req, res) => {
  res.json(allProducts);
});

// API endpoint to get products by category
app.get('/api/products-by-category/:category', (req, res) => {
  const category = req.params.category;
  const filteredProducts = allProducts.filter(product => 
    product.category === category
  );
  res.json(filteredProducts);
});

// API endpoint to get a specific product by name
app.get('/api/product/:name', (req, res) => {
  const productName = req.params.name;
  const product = allProducts.find(p => p.name === productName);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json(product);
});

// API endpoint to place an order
app.post('/api/order', async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, items, deliveryAddress } = req.body;

    // Log the received order data for debugging
    console.log('Received order data:', req.body);

    // Validate order data
    if (!customerName || !customerEmail || !customerPhone || !items || !deliveryAddress) {
      console.error('Missing required fields:', { customerName, customerEmail, customerPhone, items, deliveryAddress });
      return res.status(400).json({ 
        error: 'Missing required order information',
        details: {
          customerName: !customerName,
          customerEmail: !customerEmail,
          customerPhone: !customerPhone,
          items: !items,
          deliveryAddress: !deliveryAddress
        }
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = allProducts.find(p => p.name === item.name);
      if (!product) {
        console.error('Product not found:', item.name);
        return res.status(400).json({ error: `Product not found: ${item.name}` });
      }

      if (product.quantity < item.quantity) {
        console.error('Insufficient stock:', { product: item.name, requested: item.quantity, available: product.quantity });
        return res.status(400).json({ error: `Insufficient stock for ${item.name}` });
      }

      const itemTotal = product.price * item.quantity * 10; // Multiply by 10 for Ghana Cedis
      totalAmount += itemTotal;

      orderItems.push({
        name: product.name,
        quantity: item.quantity,
        unit: product.unit,
        price: product.price,
        total: itemTotal
      });

      // Update product quantity
      product.quantity -= item.quantity;
    }

    // Create order object
    const order = {
      orderId: Date.now().toString(),
      customerName,
      customerEmail,
      customerPhone,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      status: 'pending',
      orderDate: new Date()
    };

    // Store order
    orders.push(order);

    // Send confirmation emails
    try {
      await sendOrderEmails({
        customerEmail,
        items: orderItems,
        totalAmount,
        orderId: order.orderId,
        customerPhone,
        deliveryAddress,
        customerName
      });
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Don't fail the order if email fails
    }

    console.log('Order placed successfully:', order.orderId);
    res.json({
      success: true,
      message: 'Order placed successfully',
      orderId: order.orderId,
      totalAmount
    });
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({ 
      error: 'Failed to process order',
      details: error.message
    });
  }
});

// API endpoint to view all orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// API endpoint to add a new product
app.post('/api/product', async (req, res) => {
  try {
    const productData = req.body;
    
    // If we have MongoDB connection, use it
    if (mongoose.connection.readyState === 1) {
      const Product = require('./models/Product');
      const newProduct = new Product(productData);
      await newProduct.save();
      res.status(201).json(newProduct);
    } else {
      // Otherwise just add to our in-memory array
      // Generate a simple ID
      productData._id = 'prod_' + Date.now();
      allProducts.push(productData);
      res.status(201).json(productData);
    }
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// API endpoint to get products by category
app.get('/api/products/category/:category', (req, res) => {
  const category = req.params.category;

  let products;
  switch(category.toLowerCase()) {
    case 'grains':
      products = grainsProducts;
      break;
    case 'legumes':
      products = legumesProducts;
      break;
    case 'oilseeds':
      products = oilseedsProducts;
      break;
    case 'roots-tubers':
    case 'roots & tubers':
      products = rootsAndTubersProducts;
      break;
    case 'fruits':
      products = fruitsProducts;
      break;
    case 'vegetables':
      products = vegetablesProducts;
      break;
    case 'spices':
      products = spicesProducts;
      break;
    default:
      products = allProducts;
  }

    res.json(products);
});

// API endpoint to search products
app.get('/api/search', (req, res) => {
  const query = req.query.q.toLowerCase();
  
  if (!query) {
    return res.json(allProducts);
  }
  
  try {
    const searchResults = allProducts.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      (product.subcategory && product.subcategory.toLowerCase().includes(query))
    );
    
    res.json(searchResults);
  } catch (err) {
    console.error('Error searching products:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Admin interface
app.get('/admin', (req, res) => {
  // Calculate statistics
  const stats = {
    totalProducts: allProducts.length,
    categoryCounts: {},
    organicCount: allProducts.filter(p => p.isOrganic).length,
    regionCounts: {},
    sellerCount: new Set(allProducts.filter(p => p.seller).map(p => p.seller)).size,
    orderCount: orders.length
  };
  
  // Count by category
  allProducts.forEach(product => {
    if (!stats.categoryCounts[product.category]) {
      stats.categoryCounts[product.category] = 0;
    }
    stats.categoryCounts[product.category]++;
    
    if (product.origin && product.origin.region) {
      if (!stats.regionCounts[product.origin.region]) {
        stats.regionCounts[product.origin.region] = 0;
      }
      stats.regionCounts[product.origin.region]++;
    }
  });
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>IMPROVE AFRICA - Admin</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100">
      <header class="bg-green-600 text-white p-6">
        <div class="max-w-6xl mx-auto">
          <h1 class="text-3xl font-bold">IMPROVE AFRICA Marketplace</h1>
          <p class="mt-2">Premium agricultural products from across Africa</p>
        </div>
      </header>
      
      <!-- Main navigation bar -->
      <nav class="bg-white shadow-md py-4">
        <div class="max-w-6xl mx-auto flex flex-wrap items-center justify-between px-4">
          <div class="flex items-center space-x-6">
            <a href="/" class="font-semibold text-gray-700 hover:text-green-600">Home</a>
            <a href="/search" class="font-semibold text-gray-700 hover:text-green-600">Search Products</a>
            <a href="/api/debug/orders" class="font-semibold text-gray-700 hover:text-green-600">View Orders</a>
            <a href="/admin" class="font-semibold text-green-600 hover:text-green-800">Admin Tools</a>
          </div>
        </div>
      </nav>
      
      <div class="max-w-6xl mx-auto mt-8 px-4 pb-8">
        <!-- Statistics cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white rounded-lg shadow p-4">
            <h3 class="text-sm font-medium text-gray-500">Total Products</h3>
            <p class="text-3xl font-bold text-gray-800">${stats.totalProducts}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <h3 class="text-sm font-medium text-gray-500">Organic Products</h3>
            <p class="text-3xl font-bold text-green-600">${stats.organicCount}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <h3 class="text-sm font-medium text-gray-500">Regions</h3>
            <p class="text-3xl font-bold text-blue-600">${Object.keys(stats.regionCounts).length}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <h3 class="text-sm font-medium text-gray-500">Orders</h3>
            <p class="text-3xl font-bold text-purple-600">${stats.orderCount}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Left column - Tools -->
          <div class="md:col-span-2">
            <div class="bg-white rounded-lg shadow-md p-6">
              <h1 class="text-2xl font-bold mb-6">Admin Tools</h1>
              
              <div class="space-y-6">
                <div class="p-6 border rounded-lg bg-gray-50">
                  <h2 class="text-xl font-semibold mb-4">Fix Regions</h2>
                  <p class="mb-4 text-gray-700">
                    Run the fixRegions script to standardize region names across all product files.
                  </p>
                  <button id="fixRegionsBtn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Run Fix Regions Script
                  </button>
                  <div id="fixRegionsResult" class="mt-4 hidden"></div>
                </div>
                
                <div class="p-6 border rounded-lg bg-gray-50">
                  <h2 class="text-xl font-semibold mb-4">Create Test User</h2>
                  <p class="mb-4 text-gray-700">
                    Create a test user account for development and testing purposes.
                  </p>
                  <button id="createUserBtn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Create Test User
                  </button>
                  <div id="createUserResult" class="mt-4 hidden"></div>
                </div>
                
                <div class="p-6 border rounded-lg bg-gray-50">
                  <h2 class="text-xl font-semibold mb-4">View All Orders</h2>
                  <p class="mb-4 text-gray-700">
                    View all orders in the system.
                  </p>
                  <a href="/api/debug/orders" class="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                    View Orders
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Right column - Stats -->
          <div>
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-semibold mb-4">Product Statistics</h2>
              
              <div class="space-y-6">
                <div>
                  <h3 class="text-md font-medium text-gray-700 mb-2">Products by Category</h3>
                  <div class="space-y-2">
                    ${Object.entries(stats.categoryCounts).map(([category, count]) => `
                      <div class="flex items-center">
                        <div class="w-24 text-sm text-gray-700">${category}</div>
                        <div class="flex-grow bg-gray-200 rounded-full h-2.5">
                          <div class="bg-green-600 h-2.5 rounded-full" style="width: ${Math.round(count/stats.totalProducts*100)}%"></div>
                        </div>
                        <div class="w-10 text-right text-sm text-gray-700">${count}</div>
                      </div>
                    `).join('')}
                  </div>
                </div>
                
                <div>
                  <h3 class="text-md font-medium text-gray-700 mb-2">Top Regions</h3>
                  <div class="space-y-2">
                    ${Object.entries(stats.regionCounts)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([region, count]) => `
                        <div class="flex items-center">
                          <div class="w-24 text-sm text-gray-700">${region}</div>
                          <div class="flex-grow bg-gray-200 rounded-full h-2.5">
                            <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${Math.round(count/stats.totalProducts*100)}%"></div>
                          </div>
                          <div class="w-10 text-right text-sm text-gray-700">${count}</div>
                        </div>
                      `).join('')}
                  </div>
                </div>
                
                <div class="pt-4 border-t">
                  <h3 class="text-md font-medium text-gray-700 mb-2">Quick Links</h3>
                  <div class="grid grid-cols-2 gap-2">
                    <a href="/" class="text-center p-2 border rounded hover:bg-gray-50 text-gray-700">
                      View Marketplace
                    </a>
                    <a href="/search" class="text-center p-2 border rounded hover:bg-gray-50 text-gray-700">
                      Search Products
                    </a>
                    <a href="/api/debug/orders" class="text-center p-2 border rounded hover:bg-gray-50 text-gray-700">
                      View Orders
                    </a>
                    <a href="/api/products" class="text-center p-2 border rounded hover:bg-gray-50 text-gray-700">
                      API: All Products
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer class="bg-gray-800 text-white p-6 mt-8">
        <div class="max-w-6xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 class="text-lg font-semibold mb-4">IMPROVE AFRICA Marketplace</h3>
              <p class="text-gray-400">Premium agricultural products from Ghana and across Africa.</p>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-4">Quick Links</h3>
              <ul class="space-y-2">
                <li><a href="/" class="text-gray-400 hover:text-white">Home</a></li>
                <li><a href="/search" class="text-gray-400 hover:text-white">Search Products</a></li>
                <li><a href="/api/debug/orders" class="text-gray-400 hover:text-white">View Orders</a></li>
                <li><a href="/admin" class="text-gray-400 hover:text-white">Admin Tools</a></li>
              </ul>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-4">Categories</h3>
              <ul class="space-y-2">
                <li><a href="/api/products/category/grains" class="text-gray-400 hover:text-white">Grains</a></li>
                <li><a href="/api/products/category/legumes" class="text-gray-400 hover:text-white">Legumes</a></li>
                <li><a href="/api/products/category/fruits" class="text-gray-400 hover:text-white">Fruits</a></li>
                <li><a href="/api/products/category/vegetables" class="text-gray-400 hover:text-white">Vegetables</a></li>
              </ul>
            </div>
          </div>
          <div class="mt-8 pt-6 border-t border-gray-700 text-gray-400">
            <p>&copy; 2023 IMPROVE AFRICA. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      <script>
        document.getElementById('fixRegionsBtn').addEventListener('click', function() {
          const resultDiv = document.getElementById('fixRegionsResult');
          resultDiv.innerHTML = '<div class="animate-pulse">Running script...</div>';
          resultDiv.classList.remove('hidden');
          
          fetch('/api/admin/fix-regions', {
            method: 'POST'
          })
          .then(response => response.json())
          .then(data => {
            resultDiv.innerHTML = '<div class="text-green-600">' + data.message + '</div>';
          })
          .catch(error => {
            resultDiv.innerHTML = '<div class="text-red-600">Error: ' + error.message + '</div>';
          });
        });
        
        document.getElementById('createUserBtn').addEventListener('click', function() {
          const resultDiv = document.getElementById('createUserResult');
          resultDiv.innerHTML = '<div class="animate-pulse">Creating user...</div>';
          resultDiv.classList.remove('hidden');
          
          fetch('/api/admin/create-test-user', {
            method: 'POST'
          })
          .then(response => response.json())
          .then(data => {
            resultDiv.innerHTML = '<div class="text-green-600">' + data.message + '</div>';
          })
          .catch(error => {
            resultDiv.innerHTML = '<div class="text-red-600">Error: ' + error.message + '</div>';
          });
        });
      </script>
    </body>
    </html>
  `);
});

// API endpoint to debug/test order submission
app.get('/api/debug/test-order', (req, res) => {
  const testOrderHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Order Submission</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, textarea, select { width: 100%; padding: 8px; box-sizing: border-box; }
        button { background: #4CAF50; color: white; padding: 10px 15px; border: none; cursor: pointer; }
        #result { margin-top: 20px; padding: 10px; border: 1px solid #ddd; display: none; }
      </style>
    </head>
    <body>
      <h1>Test Order Submission</h1>
      <form id="orderForm">
        <div class="form-group">
          <label for="productName">Product:</label>
          <select id="productName" name="productName" required>
            <option value="">Select a product</option>
            ${allProducts.map(p => {
              const cedisPrice = p.price * 10;
              return `<option value="${p.name}">${p.name} - ₵${cedisPrice.toFixed(2)} (${p.price.toFixed(2)} x 10)/${p.unit}</option>`;
            }).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="quantity">Quantity:</label>
          <input type="number" id="quantity" name="quantity" min="1" required>
        </div>
        <div class="form-group">
          <label for="customerName">Your Name:</label>
          <input type="text" id="customerName" name="customerName" required>
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" required>
        </div>
        <div class="form-group">
          <label for="phone">Phone:</label>
          <input type="tel" id="phone" name="phone" required>
        </div>
        <div class="form-group">
          <label for="address">Address:</label>
          <textarea id="address" name="address" required></textarea>
        </div>
        <div class="form-group">
          <label for="location">Location (optional):</label>
          <input type="text" id="location" name="location">
        </div>
        <div class="form-group">
          <label for="additionalNotes">Additional Notes (optional):</label>
          <textarea id="additionalNotes" name="additionalNotes"></textarea>
        </div>
        <button type="submit">Submit Order</button>
      </form>
      <div id="result"></div>

      <script>
        document.getElementById('orderForm').addEventListener('submit', function(e) {
          e.preventDefault();
          const resultDiv = document.getElementById('result');
          resultDiv.style.display = 'block';
          resultDiv.innerHTML = 'Submitting order...';
          
          const formData = {
            productName: document.getElementById('productName').value,
            quantity: document.getElementById('quantity').value,
            customerName: document.getElementById('customerName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            location: document.getElementById('location').value,
            additionalNotes: document.getElementById('additionalNotes').value
          };
          
          fetch('/api/order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          })
          .then(response => response.json())
          .then(data => {
            if (data.error) {
              resultDiv.innerHTML = '<p style="color: red;">Error: ' + data.error + '</p>';
            } else {
              resultDiv.innerHTML = '<p style="color: green;">Order placed successfully!</p>' +
                '<p>Order ID: ' + data.orderId + '</p>' +
                '<p>Total: ₵' + data.totalAmountCedis.toFixed(2) + '</p>';
            }
          })
          .catch(error => {
            resultDiv.innerHTML = '<p style="color: red;">Error: ' + error.message + '</p>';
          });
        });
      </script>
    </body>
    </html>
  `;
  
  res.send(testOrderHtml);
});

// API endpoint to view all orders (for debugging)
app.get('/api/debug/orders', (req, res) => {
  const ordersHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>All Orders</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        .order { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }
        .order-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .order-id { font-weight: bold; }
        .order-date { color: #666; }
        .order-details { margin-left: 15px; }
        .no-orders { color: #666; font-style: italic; }
      </style>
    </head>
    <body>
      <h1>All Orders</h1>
      ${orders.length === 0 ? '<p class="no-orders">No orders yet.</p>' : ''}
      ${orders.map(order => `
        <div class="order">
          <div class="order-header">
            <span class="order-id">Order ID: ${order.orderId}</span>
            <span class="order-date">Date: ${new Date(order.orderDate).toLocaleString()}</span>
          </div>
          <p><strong>Customer:</strong> ${order.customerInfo.name}</p>
          <p><strong>Items:</strong> ${order.items.length}</p>
          <p><strong>Total Amount:</strong> ₵${order.totalAmountCedis ? order.totalAmountCedis.toFixed(2) : (order.totalAmount * 10).toFixed(2)}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Contact:</strong> ${order.customerInfo.email}, ${order.customerInfo.phone}</p>
          <p><strong>Address:</strong> ${order.customerInfo.address}</p>
          ${order.location ? `<p><strong>Location:</strong> ${order.location}</p>` : ''}
          ${order.customerInfo.notes ? `<p><strong>Notes:</strong> ${order.customerInfo.notes}</p>` : ''}
        </div>
      `).join('')}
    </body>
    </html>
  `;
  
  res.send(ordersHtml);
});

// Function to send order confirmation emails
async function sendOrderEmails(orderDetails) {
  const { customerEmail, items, totalAmount, orderId, customerPhone, deliveryAddress, customerName } = orderDetails;
  const adminEmail = 'improveafrica01@gmail.com';
  const adminPhone = '0551948463';

  // Create customer email content
  const customerEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Order Confirmation - Thank You for Your Purchase!</h2>

      <p>Dear ${customerName},</p>

      <p>Thank you for your order with us! We're excited to let you know that we have received your order and it is being processed.</p>

      <h3>Order Details:</h3>
      <ul>
        <li><strong>Order Number:</strong> ${orderId}</li>
        <li><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</li>
        <li><strong>Items Purchased:</strong></li>
        <ul>
          ${items.map(item => `
            <li>${item.name} - ${item.quantity} ${item.unit} - ₵${(item.price * 10).toFixed(2)}</li>
          `).join('')}
        </ul>
        <li><strong>Total Amount:</strong> ₵${totalAmount.toFixed(2)}</li>
      </ul>

      <h3>Shipping Information:</h3>
      <ul>
        <li><strong>Shipping Address:</strong> ${deliveryAddress}</li>
      </ul>

      <p>You will receive another email once your order has been shipped, along with tracking information.</p>

      <p>If you have any questions or need assistance, feel free to contact our customer support team at ${adminEmail} or ${adminPhone}.</p>

      <p>Thank you for choosing us! We appreciate your business.</p>

      <p>Best regards,<br>
      IMPROVE AFRICA Marketplace<br>
      Phone: ${adminPhone}<br>
      Email: ${adminEmail}</p>
    </div>
  `;

  // Create admin email content
  const adminEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="background-color: #FFE0E0; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h2 style="color: #D32F2F; margin-bottom: 10px;">New Order Received</h2>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Customer Name:</strong> ${customerName}</p>
        <p><strong>Customer Phone:</strong> ${customerPhone}</p>
        <p><strong>Customer Email:</strong> ${customerEmail}</p>
        <p><strong>Delivery Address:</strong> ${deliveryAddress}</p>
      </div>

      <div style="margin-bottom: 30px;">
        <h3 style="color: #2E7D32; margin-bottom: 15px;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: center;">Quantity</th>
              <th style="padding: 10px; text-align: right;">Price per ${items[0].unit}</th>
              <th style="padding: 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity} ${item.unit}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₵${(item.price * 10).toFixed(2)}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₵${(item.price * item.quantity * 10).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background-color: #f5f5f5;">
              <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total Amount:</strong></td>
              <td style="padding: 10px; text-align: right;"><strong>₵${totalAmount.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;

  // Email to customer
  const customerMailOptions = {
    from: 'improveafrica01@gmail.com',
    to: customerEmail,
    subject: 'Order Confirmation - Thank You for Your Purchase!',
    html: customerEmailHtml
  };

  // Email to admin
  const adminMailOptions = {
    from: 'improveafrica01@gmail.com',
    to: adminEmail,
    subject: 'New Order Received - IMPROVE AFRICA Marketplace',
    html: adminEmailHtml
  };

  try {
    await transporter.sendMail(customerMailOptions);
    await transporter.sendMail(adminMailOptions);
    console.log('Order confirmation emails sent successfully!');
  } catch (error) {
    console.error('Error sending order confirmation emails:', error);
    throw error;
  }
}

// Connect to MongoDB with better error handling
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    // Start the server only after successful MongoDB connection
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Visit http://localhost:${PORT} to view all products`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1); // Exit the process if MongoDB connection fails
  }); 