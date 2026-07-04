const express = require('express');
const path = require('path');
const server = express();

// Exposes every file in the public folder
server.use(express.static(path.join(__dirname, 'public'))); 

server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './views/index.html'));
});

// Opens the server
server.listen(3000);