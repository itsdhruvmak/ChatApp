"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { verifyOTP } from "@/services/auth";
import useAuth from "@/hooks/useAuth";

export default function VerifyEmailForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { login } = useAuth();

    const email = searchParams.get("email");

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");

        if (!email) {
            setError("Email is missing.");
            return;
        }

        setLoading(true);

        try {
            const data = await verifyOTP(email, otp);
            console.log("RAW ACCESS TOKEN:", JSON.stringify(data.access_token));

            // Backend returns JWT after OTP verification
            await login(data.access_token);

            // Go directly to chat
            router.push("/chat");
        } catch (error) {
            setError(
                error.response?.data?.detail ||
                "OTP verification failed."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#09090b] px-4 py-12 selection:bg-neutral-800 selection:text-white">
            {/* Background Ambient Glow Effects */}
            <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-indigo-500/20 blur-3xl pointer-events-none" />

            {/* Main Card Container */}
            <div className="relative w-full max-w-md">
                {/* Subtle outer glow border */}
                <div className="absolute -inset-0.5 rounded-[28px] bg-gradient-to-b from-neutral-700 to-neutral-800 opacity-50 blur-[1px]" />

                <div className="relative rounded-[26px] border border-neutral-800/80 bg-neutral-900/90 p-8 shadow-2xl shadow-black/80 backdrop-blur-2xl sm:p-10">
                    
                    {/* Brand / Logo Indicator */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-700/50 bg-neutral-800/50 text-white shadow-inner">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs font-medium text-neutral-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                            Email Verification
                        </span>
                    </div>

                    {/* Header Section */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                            Verify your email
                        </h1>
                        <p className="mt-2 text-sm text-neutral-400">
                            Enter the 6-digit code sent to{" "}
                            <span className="font-medium text-white">
                                {email || "your email"}
                            </span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* OTP Input Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-neutral-300">
                                Verification Code
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="------"
                                value={otp}
                                onChange={(event) =>
                                    setOtp(
                                        event.target.value.replace(/\D/g, "")
                                    )
                                }
                                required
                                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3.5 text-center text-2xl font-mono tracking-[0.75em] text-white outline-none transition-all placeholder:tracking-widest placeholder:text-neutral-700 focus:border-neutral-600 focus:bg-neutral-950 focus:ring-2 focus:ring-neutral-700/50"
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-400">
                                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="relative group mt-2 w-full overflow-hidden rounded-xl bg-white py-3.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-white/5 transition-all hover:bg-neutral-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-4 w-4 animate-spin text-neutral-950" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </span>
                            ) : (
                                "Verify email"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}