import nodemailer from 'nodemailer';

// Check if credentials exist before creating transporter
const hasCredentials = process.env.SMTP_USER && process.env.SMTP_PASS;

const transporter = hasCredentials ? nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}) : null;

export const sendEmail = async (to, subject, html) => {
  // If no credentials, just log to console and don't crash the app
  if (!hasCredentials || !transporter) {
    console.log('\n📧 ==========================================');
    console.log('📧 [MOCK EMAIL] Would have sent to:', to);
    console.log('📧 [MOCK EMAIL] Subject:', subject);
    console.log('📧 [INFO] To enable real emails, add SMTP_USER and SMTP_PASS to your .env file.');
    console.log('📧 ==========================================\n');
    return Promise.resolve(); // Prevents registration from failing
  }

  // If credentials exist, send real email
  try {
    await transporter.sendMail({
      from: `"GymBrosUK" <${process.env.FROM_EMAIL || 'noreply@gymbrosuk.co.uk'}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Real Email sent successfully to ${to}`);
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    // We don't throw the error here so registration still succeeds even if email fails
  }
};

export const sendWelcomeEmail = (user) => {
  return sendEmail(
    user.email,
    'Welcome to GymBrosUK! 💪',
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f0f1e; color: #fff;">
        <h1 style="color: #00d9ff;">Welcome to GymBrosUK!</h1>
        <p>Hey ${user.name},</p>
        <p>You're now part of the UK's fastest-growing gym community. Start finding your perfect training partners today!</p>
        <p>Let's crush those gains! 🔥</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">The GymBrosUK Team</p
      </div>
    `
  );
};

export const sendMatchRequestEmail = (receiver, sender) => {
  return sendEmail(
    receiver.email,
    `${sender.name} wants to train with you! 🏋️`,
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f0f1e; color: #fff;">
        <h2 style="color: #00d9ff;">New Training Request!</h2>
        <p><strong>${sender.name}</strong> wants to train with you.</p>
        <p>Location: ${sender.location?.city || 'UK'}</p>
        <p>Goals: ${sender.goals?.join(', ') || 'General Fitness'}</p>
        <p>Log in to your dashboard to accept or reject this request!</p>
      </div>
    `
  );
};