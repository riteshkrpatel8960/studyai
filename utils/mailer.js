import nodemailer from "nodemailer";

export const sendOTPEmail = async (to, otp) => {

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  await transporter.verify();
  console.log("✅ Gmail Connected");

  const info = await transporter.sendMail({
    from: `"StudyAI" <${process.env.EMAIL_USER}>`,
    to,
    subject: "StudyAI Password Reset OTP",
    html: `
      <h2>StudyAI Password Reset</h2>
      <h1>${otp}</h1>
    `,
  });

  console.log("✅ OTP Email Sent");
  console.log(info);
};