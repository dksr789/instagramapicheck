const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
const { HttpsProxyAgent } = require('https-proxy-agent');
const cors = require('cors'); // Import cors

const app = express();
const PORT = process.env.PORT || 3000;

// Set up the HTTP proxy
const proxyUrl = 'http://user-sp1v2wmc2y-sessionduration-60:fOl7bCyk_4e1NEv9ey@us.smartproxy.com:10001'; 
const proxyAgent = new HttpsProxyAgent(proxyUrl);

// Middleware
app.use(cors()); // Use cors middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

const api_key = "CAP-A051285D2DE3A3A0977D243A17BB1BE8"; // Your CapSolver API key
const site_key = "6LdTKLAaAAAAAGCcpkU2iT6LtCWaYReFSO7274x6"; // Your reCAPTCHA site key
const site_url = "https://www.instafollowers.co/free-instagram-followers"; // URL of the site with the captcha

async function solveCaptcha() {
    const payload = {
        clientKey: api_key,
        task: {
            type: 'ReCaptchaV2TaskProxyLess',
            websiteKey: site_key,
            websiteURL: site_url
        }
    };

    try {
        const res = await axios.post("https://api.capsolver.com/createTask", payload);
        const task_id = res.data.taskId;
        if (!task_id) {
            throw new Error("Failed to create captcha task.");
        }

        while (true) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for 1 second

            const getResultPayload = { clientKey: api_key, taskId: task_id };
            const resp = await axios.post("https://api.capsolver.com/getTaskResult", getResultPayload);
            const status = resp.data.status;

            if (status === "ready") {
                return resp.data.solution.gRecaptchaResponse;
            }
            if (status === "failed" || resp.data.errorId) {
                throw new Error("Captcha solving failed: " + resp.data.errorId);
            }
        }
    } catch (error) {
        console.error("Error solving captcha:", error);
        throw error; // Re-throw the error to handle it in the route
    }
}

app.post('/send-follower', async (req, res) => {
    const user = req.body.user;

    if (!user) {
        return res.status(400).json({ status: 'error', message: 'User is required.' });
    }

    // Call the captcha solver
    let captchaResponse;
    try {
        captchaResponse = await solveCaptcha();
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Failed to solve captcha.' });
    }

    // Prepare the payload
    const payload = {
        captcha: captchaResponse,
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    };

    try {
        const response = await axios.post('https://www.instafollowers.co/free-profile', new URLSearchParams(payload).toString(), {
            headers,
            httpsAgent: proxyAgent // Use the proxy agent
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error making request:', error);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ status: 'error', message: 'An unexpected error occurred.' });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
