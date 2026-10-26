import nodemailer from "nodemailer";

export function isEmailDeliveryConfigured() {
  const requiredSettings = [
    process.env.SMTP_HOST,
    process.env.SMTP_USER,
    process.env.SMTP_PASSWORD,
    process.env.SMTP_FROM,
  ];

  // .env.example values are intentionally non-empty, so truthiness alone
  // would make the app claim that mail delivery is configured when it is not.
  if (requiredSettings.some((value) => {
    const normalized = value?.trim().toLowerCase();
    return !normalized || /^(your[-_ ]|replace[-_ ]|changeme|placeholder)/.test(normalized);
  })) {
    return false;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}

export async function sendVerificationEmail({ email, name, url }) {
  if (!isEmailDeliveryConfigured()) {
    throw new Error("EMAIL_DELIVERY_NOT_CONFIGURED");
  }

  const port = Number(process.env.SMTP_PORT || 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("EMAIL_DELIVERY_CONFIGURATION_INVALID");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE.toLowerCase() === "true"
      : port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const safeName = String(name || "there").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Verify your EduNexa email",
    text: `Hi ${name || "there"},\n\nVerify your email address to finish creating your EduNexa account:\n${url}\n\nThis link expires in 24 hours. If you did not create an account, you can ignore this email.`,
    html: `<p>Hi ${safeName},</p><p>Verify your email address to finish creating your EduNexa account.</p><p><a href="${url}">Verify email address</a></p><p>This link expires in 24 hours. If you did not create an account, you can ignore this email.</p>`,
  });
}
