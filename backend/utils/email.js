import { Resend } from 'resend';

const from = () =>
  process.env.EMAIL_FROM || `Banoge Safari <onboarding@resend.dev>`;

export const sendSignupEmail = async ({ name, email }) => {
  if (!process.env.RESEND_API_KEY) return;

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: from(),
    to: email,
    subject: 'Welcome to Banoge Safari',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; color: #222;">
        <h2 style="margin-bottom: 16px;">Welcome to Banoge Safari, ${name}!</h2>
        <p style="font-size: 15px; line-height: 1.6;">Your account has been created successfully. You can now explore our tours, book adventures, and manage your reservations.</p>
        <p style="font-size: 15px; line-height: 1.6;">If you didn't create this account, please ignore this email.</p>
        <p style="margin-top: 24px; font-size: 13px; color: #888;">The Banoge Safari Team</p>
      </div>
    `,
  });

  if (error) {
    console.error('Failed to send signup email:', error.message);
  }
};
