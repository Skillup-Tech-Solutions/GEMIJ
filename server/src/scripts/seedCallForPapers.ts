import { prisma } from '../lib/prisma';

async function seedCallForPapersTemplate() {
    console.log('Seeding Call for Papers template...');

    const templateName = 'Call for Papers - Standard';
    const subject = 'Call for Papers: Submit your research to {{journalName}}';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px; }
    .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { padding: 20px; }
    .button { display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{journalName}}</h1>
    </div>
    <div class="content">
      <p>Dear {{firstName}} {{lastName}},</p>
      
      <p>We are pleased to invite you to submit your research for publication in the upcoming issue of <strong>{{journalName}}</strong>.</p>
      
      <p>Our journal is dedicated to publishing high-quality research and providing a platform for scholars to share their findings with the global academic community.</p>
      
      <h3>Why Submit?</h3>
      <ul>
        <li>Rigorous peer review process</li>
        <li>Rapid publication timeline</li>
        <li>Global visibility and indexing</li>
      </ul>
      
      <p>We welcome original research papers, review articles, and case studies. Please visit our website to review the author guidelines and submission process.</p>
      
      <div style="text-align: center;">
        <a href="{{journalUrl}}/submit-paper" class="button">Submit Your Manuscript</a>
      </div>
      
      <p>If you have any questions, please do not hesitate to contact our editorial office.</p>
      
      <p>Best regards,<br>
      The Editorial Team<br>
      {{journalName}}</p>
    </div>
    <div class="footer">
      <p>You are receiving this email because you are a registered user of {{journalName}}.</p>
      <p><a href="{{journalUrl}}" style="color: #666;">Visit our Website</a></p>
    </div>
  </div>
</body>
</html>
  `;

    const textContent = `
Call for Papers: Submit your research to {{journalName}}

Dear {{firstName}} {{lastName}},

We are pleased to invite you to submit your research for publication in the upcoming issue of {{journalName}}.

Our journal is dedicated to publishing high-quality research and providing a platform for scholars to share their findings with the global academic community.

Why Submit?
- Rigorous peer review process
- Rapid publication timeline
- Global visibility and indexing

We welcome original research papers, review articles, and case studies. Please visit our website to review the author guidelines and submission process.

Submit Your Manuscript: {{journalUrl}}/submit-paper

If you have any questions, please do not hesitate to contact our editorial office.

Best regards,
The Editorial Team
{{journalName}}
  `;

    try {
        // Check if it exists to avoid duplicates or errors
        const existing = await prisma.emailTemplate.findUnique({
            where: { name: templateName }
        });

        if (existing) {
            console.log('Template already exists. Updating...');
            await prisma.emailTemplate.update({
                where: { id: existing.id },
                data: {
                    subject,
                    htmlContent,
                    textContent,
                    variables: ['firstName', 'lastName', 'journalName', 'journalUrl'],
                    isActive: true
                }
            });
        } else {
            await prisma.emailTemplate.create({
                data: {
                    name: templateName,
                    subject,
                    htmlContent,
                    textContent,
                    variables: ['firstName', 'lastName', 'journalName', 'journalUrl'],
                    isActive: true
                }
            });
        }

        console.log('✅ Call for Papers template seeded successfully.');
    } catch (error) {
        console.error('Error seeding template:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedCallForPapersTemplate();
