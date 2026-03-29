const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));

// Serve Static Frontend (from 'public' directory)
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route to serve the frontend for any other requests
app.get('*any', (req, res) => {
    // If it's an API request that didn't match anything above, maybe return 404
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    // Otherwise, serve the front-end index.html
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
