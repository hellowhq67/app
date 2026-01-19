/**
 * Email service for Better Auth
 * Production-ready email sending with Resend
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email using Resend API
 */
async function sendEmail({ to, subject, html }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('RESEND_API_KEY is not configured');
    // In development, just log the email
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n📧 Email would be sent to: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${html}\n`);
      return;
    }
    throw new Error('RESEND_API_KEY is required in production');
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PTE Academic <noreply@pedagogistspte.com>',
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to send email:', error);
      throw new Error(`Email sending failed: ${error}`);
    }

    const data = await response.json();
    console.log('Email sent successfully:', data.id);
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Email templates
 */

export async function sendVerificationEmail(email: string, url: string, userName?: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">PTE Academic</h1>
        </div>

        <div style="background: #ffffff; padding: 40px; border: 1px solid #e1e8ed; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1a202c; margin-top: 0;">Verify Your Email Address</h2>

          ${userName ? `<p>Hi ${userName},</p>` : '<p>Hi there,</p>'}

          <p>Thanks for signing up for PTE Academic! Please verify your email address to get started with your preparation journey.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      padding: 14px 28px;
                      text-decoration: none;
                      border-radius: 6px;
                      display: inline-block;
                      font-weight: 600;">
              Verify Email Address
            </a>
          </div>

          <p style="color: #718096; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:
            <br>
            <a href="${url}" style="color: #667eea; word-break: break-all;">${url}</a>
          </p>

          <p style="color: #718096; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e8ed;">
            This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #718096; font-size: 12px;">
          <p>© ${new Date().getFullYear()} PTE Academic. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Verify your email - PTE Academic',
    html,
  });
}

export async function sendPasswordResetEmail(email: string, url: string, userName?: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">PTE Academic</h1>
        </div>

        <div style="background: #ffffff; padding: 40px; border: 1px solid #e1e8ed; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1a202c; margin-top: 0;">Reset Your Password</h2>

          ${userName ? `<p>Hi ${userName},</p>` : '<p>Hi there,</p>'}

          <p>We received a request to reset your password for your PTE Academic account. Click the button below to create a new password.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      padding: 14px 28px;
                      text-decoration: none;
                      border-radius: 6px;
                      display: inline-block;
                      font-weight: 600;">
              Reset Password
            </a>
          </div>

          <p style="color: #718096; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:
            <br>
            <a href="${url}" style="color: #667eea; word-break: break-all;">${url}</a>
          </p>

          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
          </div>

          <p style="color: #718096; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e8ed;">
            This link will expire in 1 hour for security reasons.
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #718096; font-size: 12px;">
          <p>© ${new Date().getFullYear()} PTE Academic. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Reset your password - PTE Academic',
    html,
  });
}

export async function sendWelcomeEmail(email: string, userName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to PTE Academic! 🎉</h1>
        </div>

        <div style="background: #ffffff; padding: 40px; border: 1px solid #e1e8ed; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1a202c; margin-top: 0;">Hi ${userName}!</h2>

          <p>We're excited to have you on board. You now have access to:</p>

          <ul style="color: #4a5568; line-height: 2;">
            <li>✅ AI-powered scoring for Speaking, Writing, Reading & Listening</li>
            <li>✅ Full-length mock tests with detailed analytics</li>
            <li>✅ Practice questions for all PTE question types</li>
            <li>✅ Progress tracking and performance insights</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.BETTER_AUTH_URL || 'https://www.pedagogistspte.com'}/dashboard"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      padding: 14px 28px;
                      text-decoration: none;
                      border-radius: 6px;
                      display: inline-block;
                      font-weight: 600;">
              Start Practicing Now
            </a>
          </div>

          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #1e3a8a; font-size: 14px;">
              <strong>💡 Pro Tip:</strong> Start with the diagnostic test to identify your strengths and areas for improvement!
            </p>
          </div>

          <p style="margin-top: 30px;">Need help getting started? Check out our <a href="${process.env.BETTER_AUTH_URL || 'https://www.pedagogistspte.com'}/courses" style="color: #667eea;">courses and tutorials</a>.</p>

          <p>Happy studying!</p>
          <p style="margin-bottom: 0;"><strong>The PTE Academic Team</strong></p>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #718096; font-size: 12px;">
          <p>© ${new Date().getFullYear()} PTE Academic. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to PTE Academic - Let\'s get started! 🎉',
    html,
  });
}
