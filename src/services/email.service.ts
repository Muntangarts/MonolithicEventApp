import nodemailer from 'nodemailer';

export async function sendEmail(to: string, subject: string, text: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: process.env.ETHEREAL_USER,
      pass: process.env.ETHEREAL_PASS,
    },
  });

  await transporter.sendMail({
    from: '"Event App" <no-reply@eventapp.com>',
    to,
    subject,
    text,
  });
}