
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncSettings() {
    try {
        // Update apcFee to 10000 to match apc_amount
        const updated = await prisma.systemSettings.updateMany({
            where: {
                key: 'apcFee'
            },
            data: {
                value: '10000'
            }
        });

        console.log(`Updated ${updated.count} settings for apcFee.`);

        // Verify
        const settings = await prisma.systemSettings.findMany({
            where: {
                key: {
                    in: ['apc_amount', 'apcFee']
                }
            }
        });
        console.log('Synced Settings:', settings);
    } catch (error) {
        console.error('Error syncing settings:', error);
    } finally {
        await prisma.$disconnect();
    }
}

syncSettings();
