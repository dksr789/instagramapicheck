const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint to handle sending followers
app.post('/send-follower', async (req, res) => {
    const user = req.body.user; // Extract user from the request body

    // Ensure the user is defined
    if (!user) {
        return res.status(400).json({ status: 'error', message: 'User is required.' });
    }

    // Prepare the payload
    const payload = {
        captcha: "", // Assuming no captcha for testing
        page: "3933",
        free_email: "",
        user: user,
        product_id: "478"
    };

    // Request headers
    const headers = {
        'Accept': 'text/html, */*; q=0.01',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': 'https://www.instafollowers.co',
        'Referer': 'https://www.instafollowers.co/free-instagram-followers',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0',
    };

    // Debug log
    console.log('Sending request to https://www.instafollowers.co/free-profile with payload:', payload);

    try {
        const response = await axios.post(
            'https://www.instafollowers.co/free-profile',
            new URLSearchParams(payload).toString(),
            { headers }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Error in request:', error);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ status: 'error', message: 'An unexpected error occurred.' });
        }
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
