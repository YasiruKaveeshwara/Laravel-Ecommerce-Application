"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/store/auth";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { notifySuccess } from "@/lib/notify";
import { handleError } from "@/lib/handleError";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const login = useAuth((s) => s.login);
	const router = useRouter();

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			const data = await login(email, password);
			const fallback = data.user.role === "administrator" ? "/admin/products" : "/";
			notifySuccess("Signed in", `Welcome back, ${data.user.first_name}!`);
			router.push(data.redirect_to || fallback);
		} catch (error: unknown) {
			handleError(error, { title: "Sign-in failed", fallbackMessage: "Unable to sign in right now." });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='max-w-sm mx-auto space-y-4'>
			<div className='flex flex-col items-center gap-3 text-center'>
				<Image src='/logo.png' alt='Pulse Mobile logo' width={160} height={44} className='h-14 w-auto' />
				<div>
					<h1 className='text-3xl font-semibold text-slate-900'>Welcome back</h1>
					<p className='text-sm text-muted'>Sign in to manage orders, track devices, and check out faster.</p>
				</div>
			</div>
			<form onSubmit={onSubmit} className='space-y-3'>
				<Input type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email' required />
				<Input
					type='password'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder='Password'
					required
				/>
				<Button disabled={loading} type='submit' className='w-full'>
					Login
				</Button>
			</form>
			<p className='text-center text-sm text-muted'>
				New to Pulse Mobile?{" "}
				<Link href='/signup' className='text-sky-600 underline-offset-2 hover:underline'>
					Create an account
				</Link>
			</p>
		</div>
	);
}
