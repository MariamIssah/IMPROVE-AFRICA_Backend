const express = require('express');
const path = require('path');
const app = express();

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Also serve files from root for backward compatibility
app.use(express.static(__dirname));

// Set proper content types
app.use((req, res, next) => {
    const ext = path.extname(req.path).toLowerCase();
    if (ext === '.js') {
        res.type('application/javascript');
    } else if (ext === '.css') {
        res.type('text/css');
    } else if (ext === '.html') {
        res.type('text/html');
    }
    next();
});

// Start the server
const PORT = 60999;
app.listen(PORT, () => {
    console.log(`Static file server running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}/market.html`);
}); 