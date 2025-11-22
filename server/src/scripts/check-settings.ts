
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSettings() {
    try {
        const settings = await prisma.systemSettings.findMany({
            where: {
                key: {
                    in: ['apc_amount', 'apc_currency']
                }
            }
        });
        console.log('Current System Settings:', settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSettings();
