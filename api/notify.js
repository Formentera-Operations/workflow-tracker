const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'alejandro.benavides@formenteraops.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'Workflow Tracker <onboarding@resend.dev>';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, processName, department } = req.body;

  if (!email || !name || !processName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Send confirmation to submitter
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Workflow Submission Received',
      html: `
        <h2>Thank you for your submission, ${name}!</h2>
        <p>Your workflow automation request has been received and will be reviewed by the team.</p>
        <table style="border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; font-weight: bold;">Process:</td>
            <td style="padding: 8px;">${processName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Department:</td>
            <td style="padding: 8px;">${department}</td>
          </tr>
        </table>
        <p>We'll keep you updated on the status of your request.</p>
        <p style="color: #666; font-size: 12px;">Workflow Automation Tracker - Formentera Operations</p>
      `,
    });

    // Send notification to admin
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Workflow Submission: ${processName}`,
      html: `
        <h2>New Workflow Submission</h2>
        <table style="border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; font-weight: bold;">Submitted By:</td>
            <td style="padding: 8px;">${name} (${email})</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Process:</td>
            <td style="padding: 8px;">${processName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Department:</td>
            <td style="padding: 8px;">${department}</td>
          </tr>
        </table>
        <p><a href="${process.env.APP_URL || 'https://workflow-tracker-swz0e4btz-alex814345s-projects.vercel.app'}/admin">View in Dashboard</a></p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Failed to send email notifications' });
  }
};
