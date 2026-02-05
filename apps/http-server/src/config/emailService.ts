import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY!);

// Function to generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send OTP via email
export async function sendOTP(email: string, otp: string): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: "Collabodraw <noreply@michaelhosamani.com>",
      to: email,
      subject: "Email Verification OTP",
      html: `<p>Your OTP for email verification is: <strong>${otp}</strong></p>`,
    });

    if (error) {
      console.error("Error sending OTP email:", error);
      return false;
    }

    console.log("OTP email sent:", data.id);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
}
