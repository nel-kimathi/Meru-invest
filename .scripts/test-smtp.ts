import nodemailer from "nodemailer";

async function main() {
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: "noreply@meruinvest.co.ke",
      pass: process.env.SMTP_PASS || "",
    },
  });

  await transporter.verify();
  console.log("SMTP connection verified");

  const info = await transporter.sendMail({
    from: "noreply@meruinvest.co.ke",
    to: process.env.TEST_TO || "nelsonkimathi2014@gmail.com",
    subject: "MIICCOF SMTP Test",
    html: "<p>This is a test email from the MIICCOF platform.</p>",
  });

  console.log("Email sent:", info.messageId);
}

main().catch((err) => {
  console.error("SMTP test failed:", err.message);
  process.exit(1);
});
