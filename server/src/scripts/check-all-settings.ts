
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllSettings() {
    try {
        const settings = await prisma.systemSettings.findMany({
            where: {
                key: {
                    in: ['apc_amount', 'apcFee', 'apc_currency', 'currency']
                }
            }
        });
        console.log('All APC Settings:', settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAllSettings();
