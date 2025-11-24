/**
 * Direct test of TextGear API to compare with curl
 */
import axios from 'axios';

async function testDirect() {
    const apiKey = '0C54vq0FRgGW8sWf';
    const testText = 'This is a test';

    console.log('Testing TextGear API directly...');
    console.log('API Key:', apiKey);
    console.log('Text:', testText);
    console.log('');

    try {
        const response = await axios.get('https://api.textgears.com/grammar', {
            params: {
                text: testText,
                language: 'en-US',
                key: apiKey
            }
        });

        console.log('✅ Success!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ Error:', error);
        if (axios.isAxiosError(error) && error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testDirect();
