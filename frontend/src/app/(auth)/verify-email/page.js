import { Suspense } from "react";
import VerifyEmailForm from "@/components/auth/OTPForm";

export default function VerifyEmailPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100">
            <Suspense
                fallback={
                    <p className="text-gray-500">
                        Loading...
                    </p>
                }
            >
                <VerifyEmailForm />
            </Suspense>
        </main>
    );
}