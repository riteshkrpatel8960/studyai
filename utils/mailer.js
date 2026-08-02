import nodemailer from "nodemailer";

export const sendOTPEmail = async (to, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("Sending OTP to:", to);

    const info = await transporter.sendMail({
      from: `"StudyAI" <${process.env.EMAIL_USER}>`,
      to,
      subject: "StudyAI Password Reset OTP",
      html: `
        <h2>StudyAI Password Reset</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
      `
    });

    console.log("✅ OTP Email Sent");
    console.log(info);

  } catch (err) {
    console.error("❌ NODEMAILER ERROR:", err);
    throw err;
  }
};