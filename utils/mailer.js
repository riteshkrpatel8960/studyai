import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTPEmail = async (to, otp) => {
  const { data, error } = await resend.emails.send({
    from: "StudyAI <onboarding@resend.dev>",
    to: [to],
    subject: "StudyAI Password Reset OTP",
    html: `
      <h2>StudyAI Password Reset</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for 5 minutes.</p>
    `,
  });

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  console.log("✅ Email Sent", data);
};