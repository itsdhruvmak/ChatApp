"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { loginUser } from "@/services/auth";
import useAuth from "@/hooks/useAuth";

export default function LoginForm() {
    const router = useRouter()
    const { login } = useAuth()

    // const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()

        setError("")
        setLoading(true)

        try {
            // const data = await loginUser(email, password);
            const data = await loginUser(username, password);

            await login(data.access_token);

            router.push("/chat");
        } catch (error) {
            setError(
                error.response?.data?.detail ||
                "Login failed. Please try again."
            );
        } finally {
            setLoading(false)
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs font-medium text-neutral-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Secure Login
                        </span>
                    </div>

                    {/* Header Section */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                            Welcome back
                        </h1>
                        <p className="mt-2 text-sm text-neutral-400">
                            Sign in to your account to continue your chats.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Field */}
                        {/* <div className="space-y-1.5">
                            <label className="text-xs font-medium text-neutral-300">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-neutral-600 focus:border-neutral-600 focus:bg-neutral-950 focus:ring-2 focus:ring-neutral-700/50"
                            />
                        </div> */}

                        {/* Username Field */}
<div className="space-y-1.5">
    <label className="text-xs font-medium text-neutral-300">
        Username
    </label>
    <input
        type="text"
        placeholder="yourusername"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        required
        className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-neutral-600 focus:border-neutral-600 focus:bg-neutral-950 focus:ring-2 focus:ring-neutral-700/50"
    />
</div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-neutral-300">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-neutral-600 focus:border-neutral-600 focus:bg-neutral-950 focus:ring-2 focus:ring-neutral-700/50"
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-400 animate-shake">
                                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="relative group mt-2 w-full overflow-hidden rounded-xl bg-white py-3.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-white/5 transition-all hover:bg-neutral-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-4 w-4 animate-spin text-neutral-950" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}