import dotenv from 'dotenv';

// Load .env file
dotenv.config();

console.log('\n' + '='.repeat(70));
console.log('CURRENT EMAIL PROVIDER CONFIGURATION');
console.log('='.repeat(70));
console.log('');
console.log('Environment Variables:');
console.log('-'.repeat(70));
console.log(`EMAIL_PROVIDER: ${process.env.EMAIL_PROVIDER || '(not set - will auto-select)'}`);
console.log(`SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? '✓ Configured' : '✗ Not configured'}`);
console.log(`MAILJET_API_KEY: ${process.env.MAILJET_API_KEY ? '✓ Configured' : '✗ Not configured'}`);
console.log(`MAILJET_API_SECRET: ${process.env.MAILJET_API_SECRET ? '✓ Configured' : '✗ Not configured'}`);
console.log(`FROM_EMAIL: ${process.env.FROM_EMAIL || '(not set)'}`);
console.log(`FROM_NAME: ${process.env.FROM_NAME || '(not set)'}`);
console.log('');

// Simulate provider selection logic
console.log('Provider Selection Logic:');
console.log('-'.repeat(70));

const providerName = process.env.EMAIL_PROVIDER?.toLowerCase();

if (providerName === 'sendgrid') {
    console.log('✓ Explicit selection: SENDGRID');
    if (!process.env.SENDGRID_API_KEY) {
        console.log('  ⚠️  WARNING: SendGrid selected but SENDGRID_API_KEY not configured!');
    }
} else if (providerName === 'mailjet') {
    console.log('✓ Explicit selection: MAILJET');
    if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_API_SECRET) {
        console.log('  ⚠️  WARNING: Mailjet selected but credentials not configured!');
    }
} else {
    console.log('Auto-selection mode (no EMAIL_PROVIDER set):');
    if (process.env.SENDGRID_API_KEY) {
        console.log('  → Will use SENDGRID (configured, preferred for backward compatibility)');
    } else if (process.env.MAILJET_API_KEY && process.env.MAILJET_API_SECRET) {
        console.log('  → Will use MAILJET (configured)');
    } else {
        console.log('  ⚠️  WARNING: No email provider configured!');
    }
}

console.log('');
console.log('='.repeat(70));
console.log('');

// Show actual values (masked)
console.log('Actual Configuration Values:');
console.log('-'.repeat(70));
if (process.env.SENDGRID_API_KEY) {
    const masked = process.env.SENDGRID_API_KEY.substring(0, 10) + '...' + process.env.SENDGRID_API_KEY.slice(-4);
    console.log(`SENDGRID_API_KEY: ${masked}`);
}
if (process.env.MAILJET_API_KEY) {
    const masked = process.env.MAILJET_API_KEY.substring(0, 10) + '...' + process.env.MAILJET_API_KEY.slice(-4);
    console.log(`MAILJET_API_KEY: ${masked}`);
}
if (process.env.MAILJET_API_SECRET) {
    const masked = process.env.MAILJET_API_SECRET.substring(0, 10) + '...' + process.env.MAILJET_API_SECRET.slice(-4);
    console.log(`MAILJET_API_SECRET: ${masked}`);
}
console.log('');
console.log('='.repeat(70));
console.log('');

console.log('📝 NOTE: If you recently changed EMAIL_PROVIDER in .env,');
console.log('   you need to RESTART the server for changes to take effect!');
console.log('');
console.log('To restart: Stop the server (Ctrl+C) and run: npm run dev');
console.log('');
