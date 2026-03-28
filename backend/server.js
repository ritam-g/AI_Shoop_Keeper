const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
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

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'AI Negotiation Game Backend is running!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
