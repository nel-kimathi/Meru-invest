import nodemailer from "nodemailer";


const host = process.env.SMTP_HOST ?? "";
const isConfigured = Boolean(host) && !host.includes("example.com");

const transporter = isConfigured
  ? nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT ?? 587) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

export type MailMessage = { to: string; subject: string; html: string };

export async function sendMail({ to, subject, html }: MailMessage) {
  if (!transporter) {
    console.log(
      `[dev-stub-smtp] email suppressed (no SMTP configured)\nTo: ${to}\nSubject: ${subject}\n---\n${html}\n---`
    );
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });
}