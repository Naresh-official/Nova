"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@nova/ui/components/button";
import { Input } from "@nova/ui/components/input";
import { Label } from "@nova/ui/components/label";

export default function SignupPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	return (
		<div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
			<div className="w-full max-w-md animate-fade-in">
				<div className="text-center mb-8">
					<div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
						N
					</div>
					<h1 className="text-3xl font-bold text-white mb-2">
						Join Nova
					</h1>
					<p className="text-[#999]">Create your account</p>
				</div>

				<div className="nova-card p-8">
					<form className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="name" className="text-[#E0E0E0]">
								Full Name
							</Label>
							<Input
								id="name"
								type="text"
								placeholder="Enter your full name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="nova-input"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email" className="text-[#E0E0E0]">
								Email
							</Label>
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="nova-input"
							/>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="password"
								className="text-[#E0E0E0]"
							>
								Password
							</Label>
							<Input
								id="password"
								type="password"
								placeholder="Create a password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="nova-input"
							/>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="confirmPassword"
								className="text-[#E0E0E0]"
							>
								Confirm Password
							</Label>
							<Input
								id="confirmPassword"
								type="password"
								placeholder="Confirm your password"
								value={confirmPassword}
								onChange={(e) =>
									setConfirmPassword(e.target.value)
								}
								className="nova-input"
							/>
						</div>

						<Button className= w-full h-12 text-base glow-on-hover">
							Create Account
						</Button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-[#999]">
							Already have an account?{" "}
							<Link
								href="/login"
								className="text-blue-400 hover:text-blue-300 transition-colors"
							>
								Sign in
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
