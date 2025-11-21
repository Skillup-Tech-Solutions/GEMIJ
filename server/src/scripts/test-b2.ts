import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function testService() {
    console.log('Testing BackblazeService...');

    // Dynamic import to ensure env vars are loaded first
    const { backblazeService } = await import('../services/backblazeService');

    try {
        // Test authorization and bucket listing (implicitly via authorize method)
        console.log('Attempting to authorize...');
        // We can't access private methods, but we can try an operation that requires auth
        // Let's try to get a file URL for a dummy file
        const url = await backblazeService.getFileUrl('test-file.txt');
        console.log('✅ Authorization successful!');
        console.log(`Generated URL for test file: ${url}`);

        console.log('\nService configuration seems correct.');
        console.log('Using bucket:', (backblazeService as any).bucketName); // Accessing private prop for debugging

    } catch (error: any) {
        console.error('❌ Service test failed:', error.message || error);
    }
}

testService();
