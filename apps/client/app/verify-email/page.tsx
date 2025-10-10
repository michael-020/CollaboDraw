"use client";
import { useState, useEffect, FormEvent } from "react";
import { useAuthStore } from "@/stores/authStore/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader } from "lucide-react";
import Image from "next/image";

export default function EmailVerify() {
  const {
    sentEmail,
    sendingEmail,
    verifyEmail,
    isVerifying,
    handleGoogleSignup,
    handleGoogleAuthError,
    otpSent,
    resetOtpSent,
  } = useAuthStore();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const router = useRouter();

  useEffect(() => {
    handleGoogleAuthError();
    return () => {
      resetOtpSent();
    };
  }, [handleGoogleAuthError, resetOtpSent]);

  async function handleSendOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await sentEmail({ email });
  }

  async function handleSubmitOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await verifyEmail({ email, otp });
    router.push("/signup");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white px-2">
      <div className="bg-neutral-900 bg-[radial-gradient(circle,_rgb(26,26,26)_0%,_rgb(9,9,9)_100%)] p-4 sm:p-8 md:p-10 rounded-2xl shadow-lg shadow-gray-800 w-full max-w-xs sm:max-w-md md:max-w-lg">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">Email Verification</h1>
        <form className="flex flex-col gap-4 sm:gap-6" onSubmit={otpSent ? handleSubmitOtp : handleSendOtp}>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-base sm:text-lg">Email</label>
            <input
              type="email"
              placeholder="Enter Email..."
              className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg text-base sm:text-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              name="email"
              id="email"
              required
              disabled={otpSent}
            />
          </div>
          {otpSent && (
            <div className="flex flex-col gap-2">
              <label htmlFor="otp" className="text-base sm:text-lg">OTP</label>
              <input
                type="text"
                placeholder="Enter OTP..."
                className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg text-base sm:text-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                onChange={(e) => setOtp(e.target.value)}
                value={otp}
                name="otp"
                id="otp"
                required
              />
            </div>
          )}
          <button
            type="submit"
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition duration-300 w-full text-base sm:text-lg"
            disabled={otpSent ? isVerifying : sendingEmail}
          >
            {otpSent
              ? isVerifying
                ? <Loader className="mx-auto animate-spin" />
                : "Verify OTP"
              : sendingEmail
                ? <Loader className="mx-auto animate-spin" />
                : "Send OTP"
            }
          </button>
          <div className="text-center">
            <p>
              Already have an Account?{" "}
              <Link href="/signin" className="hover:underline text-emerald-400 cursor-pointer">
                Sign in
              </Link>
            </p>
          </div>
        </form>
        {/* OR Continue With Section */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="px-3 text-gray-400 text-sm">Or</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>
        <button
          type="button"
          onClick={handleGoogleSignup}
          className="flex items-center justify-center gap-3 w-full py-3 rounded-lg bg-white hover:bg-gray-100 transition font-semibold text-gray-900 border border-gray-300"
        >
          <Image src="/google.svg" alt="Google" width={22} height={22} />
          Continue with Google
        </button>
      </div>
      
    </div>
  );
}