import nodemailer from "nodemailer";

export const sendOTPEmail = async (to, otp) => {
  try {
    console.log("EMAIL_USER =", process.env.EMAIL_USER);
    console.log("EMAIL_PASS exists =", !!process.env.EMAIL_PASS);
    console.log("TO =", to);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();
    console.log("✅ Gmail Connected");

    const info = await transporter.sendMail({
      from: `"StudyAI" <${process.env.EMAIL_USER}>`,
      to,
      subject: "StudyAI OTP",
      text: `Your OTP is ${otp}`,
    });

    console.log("✅ Mail Sent");
    console.log(info);

  } catch (err) {
    console.error("❌ MAIL ERROR:", err);
    throw err;
  }
};