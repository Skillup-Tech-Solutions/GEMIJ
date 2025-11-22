import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testApcSettings() {
    try {
        console.log('=== Testing APC Settings Retrieval ===\n');

        // Test the getApcSettings function (simulating what the controllers do)
        const settings = await prisma.systemSettings.findMany({
            where: {
                key: {
                    in: ['apc_amount', 'apc_currency']
                }
            }
        });

        const apcAmount = settings.find(s => s.key === 'apc_amount');
        const apcCurrency = settings.find(s => s.key === 'apc_currency');

        const result = {
            amount: parseFloat(apcAmount?.value || '299.00'),
            currency: apcCurrency?.value || 'INR'
        };

        console.log('System Settings Retrieved:');
        console.log('  - APC Amount:', result.amount);
        console.log('  - Currency:', result.currency);
        console.log('\n✅ Expected: amount = 20000, currency = INR');

        if (result.amount === 20000 && result.currency === 'INR') {
            console.log('✅ TEST PASSED: APC settings are correctly retrieved from database\n');
        } else {
            console.log('❌ TEST FAILED: APC settings do not match expected values\n');
        }

        // Show what the old code would have done
        console.log('Old behavior (using env variables):');
        console.log('  - Would use: process.env.APC_AMOUNT || "299.00"');
        console.log('  - Would use: process.env.APC_CURRENCY || "INR"');
        console.log('\nNew behavior (using database):');
        console.log('  - Fetches from system_settings table');
        console.log('  - Amount:', result.amount);
        console.log('  - Currency:', result.currency);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testApcSettings();
