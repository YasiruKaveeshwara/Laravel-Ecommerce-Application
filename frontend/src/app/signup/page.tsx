"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { notifySuccess } from "@/lib/notify";
import { handleError } from "@/lib/handleError";

export default function SignupPage() {
	const router = useRouter();
	const signup = useAuth((s) => s.signup);
	const [form, setForm] = useState({
		first_name: "",
		last_name: "",
		email: "",
		password: "",
		password_confirmation: "",
	});
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

	const emailPattern = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

	const validate = () => {
		const next: Partial<Record<keyof typeof form, string>> = {};
		if (!form.first_name.trim()) {
			next.first_name = "First name is required.";
		} else if (form.first_name.trim().length < 2) {
			next.first_name = "First name should be at least 2 characters.";
		}
		if (!form.last_name.trim()) {
			next.last_name = "Last name is required.";
		} else if (form.last_name.trim().length < 2) {
			next.last_name = "Last name should be at least 2 characters.";
		}
		if (!form.email.trim()) {
			next.email = "Email is required.";
		} else if (!emailPattern.test(form.email.trim())) {
			next.email = "Enter a valid email address.";
		}
		if (!form.password) {
			next.password = "Password is required.";
		} else if (form.password.length < 8) {
			next.password = "Password must be at least 8 characters.";
		}
		if (!form.password_confirmation) {
			next.password_confirmation = "Please confirm your password.";
		} else if (form.password_confirmation !== form.password) {
			next.password_confirmation = "Passwords must match.";
		}
		setErrors(next);
		return Object.keys(next).length === 0;
	};

	const updateField = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
		setForm((prev) => ({ ...prev, [key]: event.target.value }));
	};

	const onSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!validate()) return;
		setLoading(true);
		try {
			const data = await signup({
				first_name: form.first_name.trim(),
				last_name: form.last_name.trim(),
				email: form.email.trim(),
				password: form.password,
				password_confirmation: form.password_confirmation,
			});
			const fallback = data.user.role === "administrator" ? "/admin/products" : "/";
			notifySuccess("Account created", `Welcome to Pulse Mobile, ${data.user.first_name}!`);
			router.push(data.redirect_to || fallback);
		} catch (error: unknown) {
			handleError(error, { title: "Sign-up failed", fallbackMessage: "Unable to sign up right now." });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='mx-auto max-w-md space-y-6'>
			<div className='flex flex-col items-center gap-3 text-center'>
				<Image src='/logo.png' alt='Pulse Mobile logo' width={160} height={44} className='h-14 w-auto' />
				<div>
					<h1 className='text-3xl font-semibold text-slate-900'>Create your account</h1>
					<p className='text-sm text-muted'>Sign up to start shopping the latest Pulse Mobile drops.</p>
				</div>
			</div>

			<form onSubmit={onSubmit} className='space-y-4'>
				<div className='flex gap-3'>
					<div className='space-y-1 w-full'>
						<Input
							placeholder='First name'
							value={form.first_name}
							onChange={updateField("first_name")}
							aria-invalid={Boolean(errors.first_name)}
							aria-describedby={errors.first_name ? "first-name-error" : undefined}
						/>
						{errors.first_name && (
							<p id='first-name-error' className='text-xs font-semibold text-rose-500'>
								{errors.first_name}
							</p>
						)}
					</div>
					<div className='space-y-1 w-full'>
						<Input
							placeholder='Last name'
							value={form.last_name}
							onChange={updateField("last_name")}
							aria-invalid={Boolean(errors.last_name)}
							aria-describedby={errors.last_name ? "last-name-error" : undefined}
						/>
						{errors.last_name && (
							<p id='last-name-error' className='text-xs font-semibold text-rose-500'>
								{errors.last_name}
							</p>
						)}
					</div>
				</div>
				<div className='space-y-1'>
					<Input
						type='email'
						placeholder='Email address'
						value={form.email}
						onChange={updateField("email")}
						aria-invalid={Boolean(errors.email)}
						aria-describedby={errors.email ? "email-error" : undefined}
					/>
					{errors.email && (
						<p id='email-error' className='text-xs font-semibold text-rose-500'>
							{errors.email}
						</p>
					)}
				</div>
				<div className='space-y-1'>
					<Input
						type='password'
						placeholder='Password (min 8 characters)'
						value={form.password}
						onChange={updateField("password")}
						aria-invalid={Boolean(errors.password)}
						aria-describedby={errors.password ? "password-error" : undefined}
					/>
					{errors.password && (
						<p id='password-error' className='text-xs font-semibold text-rose-500'>
							{errors.password}
						</p>
					)}
				</div>
				<div className='space-y-1'>
					<Input
						type='password'
						placeholder='Confirm password'
						value={form.password_confirmation}
						onChange={updateField("password_confirmation")}
						aria-invalid={Boolean(errors.password_confirmation)}
						aria-describedby={errors.password_confirmation ? "password-confirm-error" : undefined}
					/>
					{errors.password_confirmation && (
						<p id='password-confirm-error' className='text-xs font-semibold text-rose-500'>
							{errors.password_confirmation}
						</p>
					)}
				</div>
				<Button type='submit' disabled={loading} className='w-full'>
					{loading ? "Creating account..." : "Create account"}
				</Button>
			</form>

			<p className='text-center text-sm text-muted'>
				Already have an account?{" "}
				<Link href='/login' className='text-sky-600 underline-offset-2 hover:underline'>
					Sign in
				</Link>
			</p>
		</div>
	);
}
