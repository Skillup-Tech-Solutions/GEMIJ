const Mailjet = require('node-mailjet');

const apiKey = process.env.MJ_APIKEY_PUBLIC || '5098c404ab2364fffe0a7cde4f44532b';
const apiSecret = process.env.MJ_APIKEY_PRIVATE || 'fd025f7be7629fcc69529e8391495aeb';

const mailjet = new Mailjet({
  apiKey: apiKey,
  apiSecret: apiSecret,
});

async function sendTestEmail() {
  try {
    const request = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: 'from@gemijjournal.online',   // replace with your sender
            Name: 'Mailjet Test',
          },
          To: [
            {
              Email: 'ahamednazeer202@gmail.com',   // replace with your test recipient
              Name: 'Test User',
            },
          ],
          Subject: 'Mailjet test email',
          TextPart: 'Hello, this is a test email from Mailjet via Node.js.',
          HTMLPart:
            '<h3>Hello!</h3><p>This is a <b>test email</b> sent via Mailjet API.</p>',
        },
      ],
    });

    console.log('Email sent!');
    console.log(JSON.stringify(request.body, null, 2));
  } catch (err: any) {
    console.error('Error sending Mailjet email:');
    if (err.statusCode) console.error('Status:', err.statusCode);
    console.error(err.message || err);
  }
}

sendTestEmail();