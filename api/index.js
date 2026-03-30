require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Endpoint to create an order
// Notice we accept BOTH /create-order AND /api/create-order just in case
app.post(['/create-order', '/api/create-order'], async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;

        // Razorpay expects amount in the smallest currency unit (e.g., cents or paise)
        const options = {
            amount: Math.round(amount * 100),
            currency,
            receipt,
        };

        const order = await razorpay.orders.create(options);
        
        if (!order) {
            return res.status(500).json({ success: false, message: 'Failed to create order' });
        }

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Endpoint to verify payment signature
app.post(['/verify-payment', '/api/verify-payment'], (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Payment is successful and verified
            res.json({ success: true, message: "Payment verified successfully" });
        } else {
            // Payment signature mismatch
            res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
// Only start the server locally if this file is run directly (not consumed by Vercel)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log('Ensure you have your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET set in the .env file.');
    });
}

// Export the Express API for Vercel
module.exports = app;
