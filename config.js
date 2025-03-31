/**
 * Email Configuration for IMPROVE AFRICA Marketplace
 * 
 * To enable email notifications for orders, follow these steps:
 * 
 * 1. Make sure you have access to the improveafrica01@gmail.com account
 * 2. Enable 2-Step Verification on the Google account:
 *    - Go to https://myaccount.google.com/security
 *    - Click on "2-Step Verification" and follow the steps to enable it
 * 
 * 3. Generate an App Password:
 *    - Go to https://myaccount.google.com/apppasswords
 *    - Select "Mail" as the app and "Other" as the device (name it "IMPROVE AFRICA Marketplace")
 *    - Click "Generate" and copy the 16-character password
 * 
 * 4. Set the password in one of these ways:
 *    - Create an environment variable called EMAIL_PASSWORD: 
 *      Windows: set EMAIL_PASSWORD=your_app_password_here
 *      Mac/Linux: export EMAIL_PASSWORD=your_app_password_here
 *    - OR replace 'your_app_password_here' below with the actual app password (less secure)
 */

module.exports = {
  emailConfig: {
    service: 'gmail',
    auth: {
      user: 'improveafrica01@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your_app_password_here' // Replace with your actual app password
    }
  }
}; 