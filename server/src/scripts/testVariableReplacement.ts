/**
 * Quick test to verify variables are being replaced in emails
 */

import { getEmailTemplate } from '../templates/emailTemplates';
import handlebars from 'handlebars';

console.log('🔍 Testing Variable Replacement...\n');

// Test password reset template
const template = getEmailTemplate('password_reset');
const testData = {
    userName: 'Dr. John Doe',
    resetUrl: 'https://gemij.com/reset-password?token=abc123',
    journalName: 'GEMIJ Journal'
};

// Generate HTML from template function
const htmlTemplate = template.html(testData);

// Compile the HTML to replace all {{variable}} placeholders
const compiledHtml = handlebars.compile(htmlTemplate)(testData);

// Check if variables are replaced
console.log('Checking for unreplaced variables...\n');

const unreplacedVars = compiledHtml.match(/\{\{[^}]+\}\}/g);

if (unreplacedVars) {
    console.log('❌ FAILED: Found unreplaced variables:');
    unreplacedVars.forEach(v => console.log(`   - ${v}`));
    process.exit(1);
} else {
    console.log('✅ SUCCESS: All variables properly replaced!');
    console.log('\nSample output:');
    console.log('- Contains "Dr. John Doe":', compiledHtml.includes('Dr. John Doe'));
    console.log('- Contains "GEMIJ Journal":', compiledHtml.includes('GEMIJ Journal'));
    console.log('- Contains reset URL:', compiledHtml.includes('reset-password?token=abc123'));
    console.log('\n✅ Variable replacement is working correctly!');
    process.exit(0);
}
