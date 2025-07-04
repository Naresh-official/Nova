"use client";

import { useState } from "react";
import { NovaSidebar } from "@/components/Sidebar";
import { SidebarInset } from "@nova/ui/components/sidebar";
import { Button } from "@nova/ui/components/button";
import { Input } from "@nova/ui/components/input";
import { Textarea } from "@nova/ui/components/textarea";
import {
	X,
	Send,
	Plus,
	Sparkles,
	Paperclip,
	ImageIcon,
	Smile,
} from "lucide-react";
import Link from "next/link";

export default function ComposePage() {
	const [to, setTo] = useState("");
	const [cc, setCc] = useState("");
	const [bcc, setBcc] = useState("");
	const [subject, setSubject] = useState("");
	const [body, setBody] = useState("");
	const [showCc, setShowCc] = useState(false);
	const [showBcc, setShowBcc] = useState(false);

	return (
		<div className="flex h-screen bg-[#0D0D0D]">
			<NovaSidebar />
			<SidebarInset className="flex-1 flex flex-col">
				<div className="flex-1 p-6 animate-fade-in">
					<div className="max-w-4xl mx-auto">
						<div className="nova-card p-6">
							<div className="space-y-4">
								{/* To Field */}
								<div className="flex items-center gap-4">
									<label className="text-[#999] text-sm w-16">
										To:
									</label>
									<Input
										placeholder="Enter email"
										value={to}
										onChange={(e) => setTo(e.target.value)}
										className="nova-input flex-1"
									/>
									<div className="flex items-center gap-2 text-sm">
										<button
											onClick={() => setShowCc(!showCc)}
											className="text-[#999] hover:text-white transition-colors"
										>
											Cc
										</button>
										<button
											onClick={() => setShowBcc(!showBcc)}
											className="text-[#999] hover:text-white transition-colors"
										>
											Bcc
										</button>
									</div>
								</div>

								{/* Cc Field */}
								{showCc && (
									<div className="flex items-center gap-4 animate-slide-in">
										<label className="text-[#999] text-sm w-16">
											Cc:
										</label>
										<Input
											placeholder="Enter email"
											value={cc}
											onChange={(e) =>
												setCc(e.target.value)
											}
											className="nova-input flex-1"
										/>
									</div>
								)}

								{/* Bcc Field */}
								{showBcc && (
									<div className="flex items-center gap-4 animate-slide-in">
										<label className="text-[#999] text-sm w-16">
											Bcc:
										</label>
										<Input
											placeholder="Enter email"
											value={bcc}
											onChange={(e) =>
												setBcc(e.target.value)
											}
											className="nova-input flex-1"
										/>
									</div>
								)}

								{/* Subject Field */}
								<div className="flex items-center gap-4">
									<label className="text-[#999] text-sm w-16">
										Subject:
									</label>
									<Input
										placeholder="Re: Design review feedback"
										value={subject}
										onChange={(e) =>
											setSubject(e.target.value)
										}
										className="nova-input flex-1"
									/>
								</div>

								{/* From Field */}
								<div className="flex items-center gap-4">
									<label className="text-[#999] text-sm w-16">
										From:
									</label>
									<div className="flex items-center gap-2 text-[#E0E0E0]">
										<span>nareshkumarg2501@gmail.com</span>
										<span className="text-[#999] text-sm">
											Primary
										</span>
									</div>
								</div>
							</div>

							{/* Body */}
							<div className="mt-6">
								<Textarea
									placeholder="Write your message..."
									value={body}
									onChange={(e) => setBody(e.target.value)}
									className="nova-input min-h-[300px] resize-none"
								/>
							</div>

							{/* Toolbar */}
							<div className="flex items-center justify-between mt-6 pt-4 border-t border-[#2A2A2A]">
								<div className="flex items-center gap-2">
									<Button>
										<Send className="w-4 h-4 mr-2" />
										Send
									</Button>

									<Button className="-secondary glow-on-hover">
										<Plus className="w-4 h-4 mr-2" />
										Add
									</Button>

									<Button className="-secondary glow-on-hover">
										<Sparkles className="w-4 h-4 mr-2" />
										Generate
									</Button>
								</div>

								<div className="flex items-center gap-2">
									<Button
										variant="ghost"
										size="sm"
										className="text-[#666] hover:text-white hover:bg-[#2A2A2A]"
									>
										<Paperclip className="w-4 h-4" />
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className="text-[#666] hover:text-white hover:bg-[#2A2A2A]"
									>
										<ImageIcon className="w-4 h-4" />
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className="text-[#666] hover:text-white hover:bg-[#2A2A2A]"
									>
										<Smile className="w-4 h-4" />
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</SidebarInset>
		</div>
	);
}
