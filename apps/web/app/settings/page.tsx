"use client";

import { useState } from "react";
import { NovaSidebar } from "@/components/nova-sidebar";
import { NovaHeader } from "@/components/nova-header";
import { SidebarInset } from "@nova/ui/components/sidebar";
import { Switch } from "@nova/ui/components/switch";
import { Label } from "@nova/ui/components/label";
import { Button } from "@nova/ui/components/button";
import { Input } from "@nova/ui/components/input";

export default function SettingsPage() {
	const [notifications, setNotifications] = useState(true);
	const [darkMode, setDarkMode] = useState(true);
	const [autoLabel, setAutoLabel] = useState(true);
	const [readReceipts, setReadReceipts] = useState(false);

	return (
		<div className="flex h-screen bg-[#0D0D0D]">
			<NovaSidebar />
			<SidebarInset className="flex-1 flex flex-col">
				<NovaHeader title="Settings" />

				<div className="flex-1 p-6 animate-fade-in">
					<div className="max-w-2xl mx-auto space-y-8">
						{/* General Settings */}
						<div className="nova-card p-6">
							<h2 className="text-lg font-semibold text-white mb-6">
								General
							</h2>
							<div className="space-y-6">
								<div className="flex items-center justify-between">
									<div>
										<Label
											htmlFor="notifications"
											className="text-[#E0E0E0] font-medium"
										>
											Email Notifications
										</Label>
										<p className="text-sm text-[#999] mt-1">
											Receive notifications for new emails
										</p>
									</div>
									<Switch
										id="notifications"
										checked={notifications}
										onCheckedChange={setNotifications}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div>
										<Label
											htmlFor="auto-label"
											className="text-[#E0E0E0] font-medium"
										>
											Auto Label
										</Label>
										<p className="text-sm text-[#999] mt-1">
											Automatically categorize emails with
											AI
										</p>
									</div>
									<Switch
										id="auto-label"
										checked={autoLabel}
										onCheckedChange={setAutoLabel}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div>
										<Label
											htmlFor="read-receipts"
											className="text-[#E0E0E0] font-medium"
										>
											Read Receipts
										</Label>
										<p className="text-sm text-[#999] mt-1">
											Send read receipts when you open
											emails
										</p>
									</div>
									<Switch
										id="read-receipts"
										checked={readReceipts}
										onCheckedChange={setReadReceipts}
									/>
								</div>
							</div>
						</div>

						{/* Account Settings */}
						<div className="nova-card p-6">
							<h2 className="text-lg font-semibold text-white mb-6">
								Account
							</h2>
							<div className="space-y-4">
								<div>
									<Label
										htmlFor="name"
										className="text-[#E0E0E0]"
									>
										Display Name
									</Label>
									<Input
										id="name"
										defaultValue="Naresh Kumar"
										className="nova-input mt-2"
									/>
								</div>
								<div>
									<Label
										htmlFor="email"
										className="text-[#E0E0E0]"
									>
										Email Address
									</Label>
									<Input
										id="email"
										defaultValue="nareshkumarg2501@gmail.com"
										className="nova-input mt-2"
										disabled
									/>
								</div>
							</div>
						</div>

						{/* AI Settings */}
						<div className="nova-card p-6">
							<h2 className="text-lg font-semibold text-white mb-6">
								AI Assistant
							</h2>
							<div className="space-y-4">
								<div>
									<Label
										htmlFor="ai-model"
										className="text-[#E0E0E0]"
									>
										AI Model
									</Label>
									<select className="nova-input mt-2 w-full">
										<option value="gpt-4">
											GPT-4 (Recommended)
										</option>
										<option value="gpt-3.5">
											GPT-3.5 Turbo
										</option>
										<option value="claude">Claude</option>
									</select>
								</div>
								<div>
									<Label
										htmlFor="tone"
										className="text-[#E0E0E0]"
									>
										Default Tone
									</Label>
									<select className="nova-input mt-2 w-full">
										<option value="professional">
											Professional
										</option>
										<option value="casual">Casual</option>
										<option value="friendly">
											Friendly
										</option>
										<option value="formal">Formal</option>
									</select>
								</div>
							</div>
						</div>

						<div className="flex justify-end">
							<Button className= glow-on-hover">
								Save Changes
							</Button>
						</div>
					</div>
				</div>
			</SidebarInset>
		</div>
	);
}
