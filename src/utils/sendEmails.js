import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  // sender
  const tranporter = nodemailer.createTransport({
    host: "localhost",
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  // receiver
  if (html) {
    const info = await tranporter.sendMail({
      from: `"E-commerce Application ♥️" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });
  } else {
    const info = await tranporter.sendMail({
      from: `"E-commerce Application ♥️" <${process.env.EMAIL}>`,
      to,
      subject,
      attachments,
    });
  }

  if (info.rejected.length > 0) return false;
  return true;
};
