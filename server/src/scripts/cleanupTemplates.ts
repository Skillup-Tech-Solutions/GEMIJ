import { prisma } from '../lib/prisma';

async function cleanupTemplates() {
    console.log('Cleaning up email templates...');

    const keepTemplateName = 'Call for Papers - Standard';

    try {
        const result = await prisma.emailTemplate.deleteMany({
            where: {
                name: {
                    not: keepTemplateName
                }
            }
        });

        console.log(`✅ Deleted ${result.count} templates. Only '${keepTemplateName}' remains.`);
    } catch (error) {
        console.error('Error cleaning up templates:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanupTemplates();
