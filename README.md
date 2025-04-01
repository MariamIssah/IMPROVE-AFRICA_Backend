# IMPROVE AFRICA Backend

Backend services for the IMPROVE AFRICA agricultural marketplace platform.

## Overview

This repository contains the server-side code for IMPROVE AFRICA, a comprehensive agricultural marketplace platform designed to empower farmers, create job opportunities, and transform Africa's agricultural future.

## Features

- RESTful API for product management
- User registration and authentication
- Order processing system
- Email notifications
- MongoDB integration
- Admin dashboard

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- Nodemailer
- JSON Web Tokens (JWT)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Gmail account for email notifications

### Installation

1. Clone the repository:

```bash
git clone https://github.com/MariamIssah/IMPROVE-AFRICA_Backend.git
cd IMPROVE-AFRICA_Backend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:
   Create a `.env` file with the following variables:

```
PORT=3004
MONGODB_URI=your_mongodb_connection_string
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

4. Start the server:

```bash
npm start
```

The server will run at http://localhost:3004 by default.

## API Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/category/:category` - Get products by category
- `GET /api/search?q=query` - Search products
- `POST /api/order` - Place an order
- `GET /api/orders` - View all orders (admin only)
- `POST /api/product` - Add a new product (admin only)

## Frontend Integration

This backend should be used with the IMPROVE AFRICA frontend. To connect:

1. Ensure the backend server is running
2. Configure the frontend to make API calls to http://localhost:3004/api/...
3. For frontend code and setup, visit the frontend repository

## Contact

For any questions or issues, please contact:

- Email: admin@improveafrica.com
