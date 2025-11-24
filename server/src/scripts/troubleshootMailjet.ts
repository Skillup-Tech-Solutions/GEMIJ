import Mailjet from 'node-mailjet';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.MAILJET_API_KEY;
const apiSecret = process.env.MAILJET_API_SECRET;

console.log('\n' + '='.repeat(70));
console.log('MAILJET EMAIL DELIVERY TROUBLESHOOTING');
console.log('='.repeat(70));
console.log('');

if (!apiKey || !apiSecret) {
    console.error('❌ Mailjet credentials not found in .env');
    process.exit(1);
}

const mailjet = new Mailjet({
    apiKey: apiKey,
    apiSecret: apiSecret
});

async function checkMailjetStatus() {
    try {
        console.log('1. Checking Mailjet Account Status...');
        console.log('-'.repeat(70));

        // Check sender addresses
        console.log('\n📧 Checking Sender Addresses:');
        try {
            const senders = await mailjet.get('sender').request();
            console.log('Registered senders:', JSON.stringify(senders.body, null, 2));
        } catch (error: any) {
            console.log('Could not fetch senders:', error.message);
        }

        // Check recent messages
        console.log('\n📬 Checking Recent Messages (last 10):');
        try {
            const messages = await mailjet.get('message', { version: 'v3' }).request({
                Limit: 10,
                Sort: 'ArrivedAt DESC'
            });

            const body = messages.body as any;
            if (body.Data && body.Data.length > 0) {
                body.Data.forEach((msg: any, index: number) => {
                    console.log(`\n${index + 1}. Message ID: ${msg.ID}`);
                    console.log(`   To: ${msg.ContactAlt || 'N/A'}`);
                    console.log(`   Status: ${msg.Status}`);
                    console.log(`   Arrived: ${msg.ArrivedAt}`);
                    console.log(`   Subject: ${msg.Subject || 'N/A'}`);
                });
            } else {
                console.log('No recent messages found');
            }
        } catch (error: any) {
            console.log('Could not fetch messages:', error.message);
        }

        // Check message statistics
        console.log('\n📊 Checking Message Statistics:');
        try {
            const stats = await mailjet.get('statcounters', { version: 'v3' }).request({
                CounterSource: 'APIKey',
                CounterResolution: 'Day',
                CounterTiming: 'Message',
                FromTS: Math.floor(Date.now() / 1000) - 86400, // Last 24 hours
                ToTS: Math.floor(Date.now() / 1000)
            });
            console.log('Statistics:', JSON.stringify(stats.body, null, 2));
        } catch (error: any) {
            console.log('Could not fetch statistics:', error.message);
        }

        console.log('\n' + '='.repeat(70));
        console.log('COMMON ISSUES & SOLUTIONS:');
        console.log('='.repeat(70));
        console.log('');
        console.log('1. ⚠️  SENDER NOT VERIFIED');
        console.log('   - Mailjet requires sender email verification');
        console.log('   - Check your email for verification link from Mailjet');
        console.log('   - Or verify at: https://app.mailjet.com/account/sender');
        console.log('');
        console.log('2. 📧 CHECK SPAM FOLDER');
        console.log('   - Emails might be in spam/junk folder');
        console.log('   - Mark as "Not Spam" to receive future emails');
        console.log('');
        console.log('3. 🔍 DOMAIN AUTHENTICATION');
        console.log('   - For better deliverability, authenticate your domain');
        console.log('   - Add SPF and DKIM records');
        console.log('   - Configure at: https://app.mailjet.com/account/sender');
        console.log('');
        console.log('4. 📊 CHECK MAILJET DASHBOARD');
        console.log('   - Login to: https://app.mailjet.com/');
        console.log('   - Go to Statistics > Messages');
        console.log('   - Check delivery status and bounce reasons');
        console.log('');
        console.log('5. ⏱️  DELAY');
        console.log('   - Sometimes emails take a few minutes to arrive');
        console.log('   - Wait 5-10 minutes and check again');
        console.log('');
        console.log('='.repeat(70));
        console.log('');
        console.log('Current Configuration:');
        console.log('-'.repeat(70));
        console.log(`FROM_EMAIL: ${process.env.FROM_EMAIL || 'not set'}`);
        console.log(`TO_EMAIL: ahamednazeer202@gmail.com`);
        console.log(`API Key: ${(apiKey as string).substring(0, 10)}...${(apiKey as string).slice(-4)}`);
        console.log('');
        console.log('='.repeat(70));

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        if (error.statusCode) {
            console.error('Status Code:', error.statusCode);
        }
    }
}

checkMailjetStatus();
