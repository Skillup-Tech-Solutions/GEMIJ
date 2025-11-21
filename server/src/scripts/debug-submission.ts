import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testSubmission() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'author@journal.com',
            password: 'author123'
        });
        const token = loginRes.data.data.token;
        console.log('Logged in. Token:', token.substring(0, 20) + '...');

        // 2. Create Submission
        console.log('Creating submission...');
        const submissionData = {
            title: 'Test Submission Title',
            abstract: 'Test Abstract',
            keywords: ['keyword1', 'keyword2'], // Frontend sends array
            manuscriptType: 'research-article',
            isDoubleBlind: false,
            suggestedReviewers: [],
            excludedReviewers: [],
            comments: 'Test comments',
            coAuthors: [
                {
                    firstName: 'Co',
                    lastName: 'Author',
                    email: 'coauthor@example.com',
                    affiliation: 'Test Affiliation',
                    isCorresponding: false,
                    order: 1
                }
            ]
        };

        const subRes = await axios.post(`${API_URL}/submissions`, submissionData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Submission created:', subRes.data);

    } catch (error: any) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testSubmission();
