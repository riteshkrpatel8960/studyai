import nodemailer from "nodemailer";

export const sendOTPEmail = async (to, otp) => {
  try {
    console.log("Creating transporter...");

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },

      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
    });

    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log(
      "EMAIL_PASS:",
      process.env.EMAIL_PASS ? "Loaded" : "Not Loaded"
    );

    console.log("Verifying SMTP...");
    await transporter.verify();
    console.log("SMTP Verified ✅");

    console.log("Sending Email...");

    const info = await transporter.sendMail({
      from: `"StudyAI" <${process.env.EMAIL_USER}>`,
      to,
      subject: "StudyAI Password Reset OTP",
      text: `Your OTP is ${otp}. Valid for 5 minutes.`,
      html: `
        <div style="font-family:Arial,sans-serif">
          <h2>StudyAI Password Reset</h2>
          <p>Your OTP is:</p>
          <h1 style="color:#2563eb">${otp}</h1>
          <p>This OTP is valid for <b>5 minutes</b>.</p>
        </div>
      `,
    });

    console.log("Email Sent Successfully ✅");
    console.log(info.messageId);

    return true;

  } catch (err) {
    console.error("MAIL ERROR ❌");
    console.error(err);

    throw err;
  }
};