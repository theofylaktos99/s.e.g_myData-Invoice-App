const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Serve static files from the dist directory (built files)
app.use(express.static(path.join(__dirname, 'dist')));

// Serve static assets from the root directory for backward compatibility
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Send the index.html file for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Frontend server running at http://localhost:${PORT}`);
});
