import dotenv from 'dotenv';

dotenv.config();

console.log('\n' + '='.repeat(70));
console.log('CURRENT FROM_EMAIL CONFIGURATION');
console.log('='.repeat(70));
console.log('');
console.log('Environment Variables:');
console.log('-'.repeat(70));
console.log(`FROM_EMAIL: ${process.env.FROM_EMAIL || '(not set)'}`);
console.log(`FROM_NAME: ${process.env.FROM_NAME || '(not set)'}`);
console.log('');
console.log('Fallback values in code:');
console.log('-'.repeat(70));
console.log(`Default FROM_EMAIL: gemij@em9745.ahamednazeer.qzz.io`);
console.log(`Default FROM_NAME: GEMIJ Journal`);
console.log('');
console.log('='.repeat(70));
console.log('');
console.log('What will be used:');
console.log('-'.repeat(70));
const fromEmail = process.env.FROM_EMAIL || 'gemij@em9745.ahamednazeer.qzz.io';
const fromName = process.env.FROM_NAME || 'GEMIJ Journal';
console.log(`✓ FROM_EMAIL: ${fromEmail}`);
console.log(`✓ FROM_NAME: ${fromName}`);
console.log('');
console.log('='.repeat(70));
console.log('');

// Check for duplicate entries in .env
console.log('Checking .env file for duplicates...');
console.log('-'.repeat(70));

const fs = require('fs');
const path = require('path');

try {
    const envPath = path.join(__dirname, '../../.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');

    const fromEmailLines: number[] = [];
    const fromNameLines: number[] = [];

    lines.forEach((line: string, index: number) => {
        if (line.trim().startsWith('FROM_EMAIL=')) {
            fromEmailLines.push(index + 1);
        }
        if (line.trim().startsWith('FROM_NAME=')) {
            fromNameLines.push(index + 1);
        }
    });

    if (fromEmailLines.length > 1) {
        console.log(`⚠️  WARNING: FROM_EMAIL appears ${fromEmailLines.length} times in .env`);
        console.log(`   Lines: ${fromEmailLines.join(', ')}`);
        console.log(`   The LAST occurrence (line ${fromEmailLines[fromEmailLines.length - 1]}) will be used`);
    } else if (fromEmailLines.length === 1) {
        console.log(`✓ FROM_EMAIL appears once at line ${fromEmailLines[0]}`);
    } else {
        console.log(`✗ FROM_EMAIL not found in .env`);
    }

    if (fromNameLines.length > 1) {
        console.log(`⚠️  WARNING: FROM_NAME appears ${fromNameLines.length} times in .env`);
        console.log(`   Lines: ${fromNameLines.join(', ')}`);
        console.log(`   The LAST occurrence (line ${fromNameLines[fromNameLines.length - 1]}) will be used`);
    } else if (fromNameLines.length === 1) {
        console.log(`✓ FROM_NAME appears once at line ${fromNameLines[0]}`);
    } else {
        console.log(`✗ FROM_NAME not found in .env`);
    }

} catch (error) {
    console.log('Could not read .env file');
}

console.log('');
console.log('='.repeat(70));
console.log('');
