import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugPayment() {
    try {
        console.log('=== Checking System Settings ===');
        const settings = await prisma.systemSettings.findMany({
            where: {
                key: {
                    in: ['apc_amount', 'apc_currency']
                }
            }
        });
        console.log('System Settings:', JSON.stringify(settings, null, 2));

        console.log('\n=== Checking Recent Payments ===');
        const payments = await prisma.payment.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                submission: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        console.log('Recent Payments:');
        payments.forEach(payment => {
            console.log({
                id: payment.id,
                amount: payment.amount,
                amountType: typeof payment.amount,
                amountAsNumber: Number(payment.amount),
                currency: payment.currency,
                status: payment.status,
                author: `${payment.user.firstName} ${payment.user.lastName}`,
                submissionId: payment.submissionId.substring(0, 10),
                createdAt: payment.createdAt
            });
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugPayment();
