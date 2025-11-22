
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateSettings() {
    try {
        // Update apc_amount to 1000
        const updated = await prisma.systemSettings.updateMany({
            where: {
                key: 'apc_amount'
            },
            data: {
                value: '1000'
            }
        });

        console.log(`Updated ${updated.count} settings.`);

        // Verify the update
        const settings = await prisma.systemSettings.findMany({
            where: {
                key: {
                    in: ['apc_amount', 'apc_currency']
                }
            }
        });
        console.log('New System Settings:', settings);
    } catch (error) {
        console.error('Error updating settings:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateSettings();
