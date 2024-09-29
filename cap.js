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
    const user = req.body.user;

    if (!user) {
        return res.status(400).json({ status: 'error', message: 'User is required.' });
    }

    const payload = {
        captcha: "",
        page: "3933",
        free_email: "",
        user: user,
        product_id: "478"
    };

    const headers = {
        'Accept': 'text/html, */*; q=0.01',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': 'https://www.instafollowers.co',
        'Referer': 'https://www.instafollowers.co/free-instagram-followers',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'DNT': '1',
        'Upgrade-Insecure-Requests': '1'
    };

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
            console.log('Response data:', error.response.data); // Log response data
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
