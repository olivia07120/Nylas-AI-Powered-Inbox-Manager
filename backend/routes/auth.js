import express from 'express';
import Nylas from 'nylas';
import 'dotenv/config';
import fetch from 'node-fetch';

const router = express.Router();

const clientId = process.env.NYLAS_CLIENT_ID.trim();
const apiKey = process.env.NYLAS_API_KEY.trim();
const apiUri = process.env.NYLAS_API_URL.trim();

const config = {
    clientId: clientId,
    callbackUri: "http://localhost:3001/oauth/exchange",
    apiKey: apiKey,
    apiUri: apiUri,
};

const nylas = new Nylas({
    apiKey: config.apiKey,
    apiUri: config.apiUri,
});

const cloudfare_api_key = process.env.CLOUDFARE_API_KEY.trim();

// Route to initialize authentication
router.get("/nylas/auth", (req, res) => {
    const authUrl = nylas.auth.urlForOAuth2({
        clientId: config.clientId,
        redirectUri: config.callbackUri, // This callback URI is passed to Nylas for redirection
    });
    res.redirect(authUrl);
});

// Auth callback route
router.get("/oauth/exchange", async (req, res) => {
    console.log("Received callback from Nylas");
    const code = req.query.code;

    if (!code) {
        res.status(400).send("No authorization code returned from Nylas");
        return;
    }

    const codeExchangePayload = {
        clientSecret: config.apiKey,
        clientId: config.clientId,
        redirectUri: config.callbackUri,
        code,
    };

    try {
        const response = await nylas.auth.exchangeCodeForToken(codeExchangePayload);
        const { grantId, email } = response;

        process.env.USER_GRANT_ID = grantId;

        res.redirect("http://localhost:3000/inbox-setup"); // Redirect back to the frontend after successful authentication
    } catch (error) {
        res.status(500).send("Failed to exchange authorization code for token");
    }
});

router.get('/emails', async (req, res) => {
    const days = req.query.days ? parseInt(req.query.days) : 7;

    if (!process.env.USER_GRANT_ID) {
        return res.status(401).send('Unauthorized: No grantId provided.');
    }

    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateTimestamp = Math.floor(startDate.getTime() / 1000);

        const response = await nylas.messages.list({
            identifier: process.env.USER_GRANT_ID.trim(),
            queryParams: {
                receivedAfter: startDateTimestamp,
                in: ["INBOX"] // This restricts to only received emails
            }
        });

        const messages = response.data ? response.data : response;

        if (!Array.isArray(messages)) {
            throw new Error("Response data is not an array");
        }

        const processedEmails = await Promise.all(messages.map(async (email) => {
            try {
                // First API Call: Get the summary
                const summaryRequestBody = {
                    messages: [
                        { role: "system", content: "You are an assistant that processes email content to provide a concise one line summary." },
                        { role: "user", content: `Please summarize the following email in strictly one line. Do not include any introductory phrases or explanation, only give exactly one line summary: ${email.body}` }
                    ]
                };

                const summaryResponse = await fetch('https://api.cloudflare.com/client/v4/accounts/48653b6488f46918751f239acb8f4fc2/ai/run/@cf/meta/llama-3-8b-instruct', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${cloudfare_api_key}`,
                    },
                    body: JSON.stringify(summaryRequestBody),
                });

                const summaryResult = await summaryResponse.json();
                const summary = summaryResult.result.response.match(/\*\*Summary:\*\* (.*)/)?.[1]?.trim() || summaryResult.result.response.trim() || 'No summary available';

                // Second API Call: Get the category based on the summary
                const categoryRequestBody = {
                    messages: [
                        { role: "system", content: "You are an assistant that categorizes email content into one-word categories like 'Work', 'Personal', 'Finance', etc." },
                        { role: "user", content: `Based on this summary, categorize the email into one word. Do not include any introductory phrases or explanation, only give exactly one word: ${summary}` }
                    ]
                };

                const categoryResponse = await fetch('https://api.cloudflare.com/client/v4/accounts/48653b6488f46918751f239acb8f4fc2/ai/run/@cf/meta/llama-3-8b-instruct', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${cloudfare_api_key}`,
                    },
                    body: JSON.stringify(categoryRequestBody),
                });

                const categoryResult = await categoryResponse.json();
                const category = categoryResult.result.response.trim() || 'Other';

                // Third API Call: Generate sample reply
                const replyRequestBody = {
                    messages: [
                        { role: "system", content: "You are an assistant that generates polite email replies." },
                        { role: "user", content: `Please draft a polite reply based on this email content. Do not include any introductory phrases or explanation, only give exactly sample reply: ${email.body}` }
                    ]
                };

                const replyResponse = await fetch('https://api.cloudflare.com/client/v4/accounts/48653b6488f46918751f239acb8f4fc2/ai/run/@cf/meta/llama-3-8b-instruct', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${cloudfare_api_key}`,
                    },
                    body: JSON.stringify(replyRequestBody),
                });

                const replyResult = await replyResponse.json();
                const sampleReply = replyResult.result.response.trim() || 'Sample reply unavailable.';

                // fourth api call
                const actionRequestBody = {
                    messages: [
                        { role: "system", content: "You are an assistant that provides a suggested action for email content. Suggestions should be in one word, such as 'Reply', 'Archive', 'Review', etc." },
                        { role: "user", content: `Based on this email content, suggest an action, strictly one word. Do not include any introductory phrases or explanation, only give exactly one word: ${email.body}` }
                    ]
                };

                const actionResponse = await fetch('https://api.cloudflare.com/client/v4/accounts/48653b6488f46918751f239acb8f4fc2/ai/run/@cf/meta/llama-3-8b-instruct', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${cloudfare_api_key}`,
                    },
                    body: JSON.stringify(actionRequestBody),
                });

                const actionResult = await actionResponse.json();
                const action = actionResult.result.response.trim() || 'Review';

                return {
                    ...email,
                    summary,
                    category,
                    action,
                    sampleReply,
                };
            } catch (error) {
                console.error(`Error processing email with ID ${email.id}:`, error);
                // Return email with error information or a fallback structure
                return {
                    ...email,
                    summary: 'Error processing this email',
                    category: 'Other',
                    action: 'Review',
                    sampleReply: 'Unable to generate sample reply.',
                };
            }
        }));

        res.json(processedEmails);
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).send('Failed to fetch emails');
    }
});


router.post("/send-email", async (req, res) => {
    try {
        const { to, subject, body } = req.body; // Get the email details from the request body

        const sentMessage = await nylas.messages.send({
            identifier: process.env.USER_GRANT_ID,
            requestBody: {
                to: [{ email: to }],
                subject: subject,
                body: body,
            },
        });

        res.status(200).json({ message: "Email sent successfully", sentMessage });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ message: "Failed to send email", error });
    }
});

export default router;