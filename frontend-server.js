const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Serve static files from the current directory
app.use(express.static('.'));

// Send the index.html file for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Frontend server running at http://localhost:${PORT}`);
});
