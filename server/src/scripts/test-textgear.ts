/**
 * Test script for TextGear API integration
 * Run with: npx ts-node src/scripts/test-textgear.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import { textgearService } from '../services/textgearService';

async function testTextGearIntegration() {
    console.log('🧪 Testing TextGear API Integration\n');
    console.log('='.repeat(50));

    // Test 1: Simple text with errors
    console.log('\n📝 Test 1: Text with intentional errors');
    const testText1 = `This is a test sentance with some erors. The quick brown fox jump over the lazy dog. I has a dream to write good.`;

    try {
        const result1 = await textgearService.checkGrammar(testText1);
        console.log('✅ Test completed successfully');
        console.log(`   Total Errors: ${result1.totalErrors}`);
        console.log(`   Grammar Errors: ${result1.grammarErrors}`);
        console.log(`   Spelling Errors: ${result1.spellingErrors}`);
        console.log(`   Overall Score: ${result1.overallScore}/100`);
        console.log(`   Status: ${result1.status}`);
        console.log(`   Summary: ${textgearService.getSummary(result1)}`);

        if (result1.errors.length > 0) {
            console.log('\n   First few errors:');
            result1.errors.slice(0, 3).forEach((error, idx) => {
                console.log(`   ${idx + 1}. ${error.message}`);
                console.log(`      Bad: "${error.bad}" → Suggestions: ${error.suggestions.join(', ')}`);
            });
        }
    } catch (error) {
        console.error('❌ Test 1 failed:', error);
    }

    // Test 2: Perfect text
    console.log('\n📝 Test 2: Text without errors');
    const testText2 = `This is a well-written sentence. The grammar and spelling are correct. Everything should pass the check.`;

    try {
        const result2 = await textgearService.checkGrammar(testText2);
        console.log('✅ Test completed successfully');
        console.log(`   Total Errors: ${result2.totalErrors}`);
        console.log(`   Overall Score: ${result2.overallScore}/100`);
        console.log(`   Status: ${result2.status}`);
        console.log(`   Summary: ${textgearService.getSummary(result2)}`);
    } catch (error) {
        console.error('❌ Test 2 failed:', error);
    }

    // Test 3: Empty text
    console.log('\n📝 Test 3: Empty text handling');
    const testText3 = '';

    try {
        const result3 = await textgearService.checkGrammar(testText3);
        console.log('✅ Test completed successfully');
        console.log(`   Status: ${result3.status}`);
        console.log(`   Error Message: ${result3.errorMessage || 'None'}`);
    } catch (error) {
        console.error('❌ Test 3 failed:', error);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✨ All tests completed!\n');
}

// Run tests
testTextGearIntegration()
    .then(() => {
        console.log('✅ Test script finished successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Test script failed:', error);
        process.exit(1);
    });
