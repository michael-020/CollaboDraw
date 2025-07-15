"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore/authStore";
import { Loader } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect } from "next/navigation";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string()
    .min(8, "Password should be at least 8 characters")
    .max(100, "Password should not exceed 100 characters")
    .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
    .regex(/[0-9]/, "Password must contain at least 1 number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type FormFields = z.infer<typeof schema>;

export default function Signup() {
  const { signup, isSigningUp, inputEmail, authUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const emailFromUrl = searchParams.get('email');
    const token = searchParams.get('token');
    const source = searchParams.get('source');
    
    if (emailFromUrl && token && source === 'google') {
      // Store token in localStorage or state management
      localStorage.setItem('setupToken', token);
      useAuthStore.setState({ inputEmail: emailFromUrl });
    }
    
    if (!inputEmail && !emailFromUrl) {
      redirect("/verify-email");
    }
    
    if(authUser) redirect("/home-page");
  }, [inputEmail, authUser]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<FormFields>({
    defaultValues: {
      email: inputEmail || ""
    },
    resolver: zodResolver(schema)
  });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const { name, email, password, confirmPassword } = data;
      signup({ name, email, password, confirmPassword });
    } catch (error) {
      setError("root", { message: "Registration failed" });
      console.error("Error while signing up", error)
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white px-2">
      <div className="bg-neutral-900 bg-[radial-gradient(circle,_rgb(26,26,26)_0%,_rgb(9,9,9)_100%)] p-4 sm:p-8 md:p-10 rounded-2xl shadow-lg shadow-gray-800 w-full max-w-xs sm:max-w-md md:max-w-lg">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">Sign-up</h1>
        <form className="flex flex-col gap-4 sm:gap-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-base sm:text-lg">Name</label>
            <input
              type="text"
              {...register("name")}
              placeholder="Enter Name..."
              className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg text-base sm:text-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              id="name"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-base sm:text-lg">Email</label>
            <input
              type="email"
              {...register("email")}
              readOnly
              value={inputEmail}
              className="bg-gray-700/30 border border-gray-600 text-white px-4 py-3 rounded-lg text-base sm:text-lg focus:outline-none"
              id="email"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-2 relative">
            <label htmlFor="password" className="text-base sm:text-lg">Password</label>
            <div className="flex items-center justify-center">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Enter Password..."
                className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg text-base sm:text-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none w-full"
                id="password"
              />
              <button
                type="button"
                className="absolute right-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="text-gray-400 text-xl" />
                ) : (
                  <Eye className="text-gray-400 text-xl" />
                )}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div className="flex flex-col gap-2 relative">
            <label htmlFor="confirmPassword" className="text-base sm:text-lg">Confirm Password</label>
            <div className="flex items-center justify-center">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="Confirm Password..."
                className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg text-base sm:text-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none w-full"
                id="confirmPassword"
              />
              <button
                type="button"
                className="absolute right-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="text-gray-400 text-xl" />
                ) : (
                  <Eye className="text-gray-400 text-xl" />
                )}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <button
            type="submit"
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition duration-300 w-full text-base sm:text-lg"
            disabled={isSigningUp}
          >
            {isSigningUp ? <Loader className="mx-auto animate-spin" /> : "Sign-up"}
          </button>
        </form>
      </div>
    </div>
  )
}