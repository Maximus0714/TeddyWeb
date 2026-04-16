require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const createOrder = require('./api/create-order');
const verifyPayment = require('./api/verify-payment');

// Serve static files from the root directory
app.use(express.static(__dirname));

// Mount Vercel Serverless Functions into Express for local development
app.post('/api/create-order', (req, res) => createOrder(req, res));
app.post('/api/verify-payment', (req, res) => verifyPayment(req, res));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Local Express development server running on port ${PORT}`);
    console.log('NOTE: This server is bypassed completely by Vercel when deployed.');
});
