"use client";

import { Button } from "@nova/ui/components/button";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
	const [loading, setLoading] = useState(false);
	const redirectURL = useSearchParams().get("redirectUrl") || "/mail/inbox";

	const handleGoogleSignIn = async () => {
		try {
			setLoading(true);
			await signIn("google", { callbackUrl: redirectURL });
		} catch (error) {
			console.error("Error signing in with Google:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen w-screen bg-[#0D0D0D] flex items-center justify-center p-4">
			<div className="w-full max-w-md animate-fade-in">
				<div className="text-center mb-16">
					<h1 className="text-3xl font-bold text-white mb-2">
						Welcome to Nova
					</h1>
					<p className="text-[#999]">Sign in to your account</p>
				</div>
				<Button
					className="w-full h-12 text-base cursor-pointer"
					onClick={handleGoogleSignIn}
					disabled={loading}
				>
					<div className="flex items-center justify-center bg-white rounded-full p-0.5 mr-2">
						<Image
							src="https://img.icons8.com/fluency/48/google-logo.png"
							alt="Google logo"
							width={30}
							height={30}
						/>
					</div>
					Continue with Google
				</Button>
			</div>
		</div>
	);
}
