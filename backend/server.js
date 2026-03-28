const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'AI Negotiation Game Backend is running!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
