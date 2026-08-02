import nodemailer from "nodemailer";

export const sendOTPEmail = async (to, otp) => {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"StudyAI" <${process.env.EMAIL_USER}>`,
    to,
    subject: "StudyAI Password Reset OTP",
    html: `
      <h2>StudyAI Password Reset</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for 5 minutes.</p>
    `
  });

  console.log("✅ OTP Email Sent");
};