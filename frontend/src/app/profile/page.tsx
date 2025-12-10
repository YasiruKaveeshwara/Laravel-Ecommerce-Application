"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { handleError } from "@/lib/handleError";

export default function ProfilePage() {
	const router = useRouter();
	const user = useAuth((state) => state.user);
	const fetchMe = useAuth((state) => state.fetchMe);
	const logout = useAuth((state) => state.logout);

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [deletePassword, setDeletePassword] = useState("");
	const [status, setStatus] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		fetchMe();
	}, [fetchMe]);

	useEffect(() => {
		if (user) {
			setFirstName(user.first_name);
			setLastName(user.last_name);
			setEmail(user.email);
		}
	}, [user]);

	const roleMeta = useMemo(() => {
		const isAdmin = user?.role === "administrator";
		return {
			label: isAdmin ? "Administrator" : "Customer",
			chip: isAdmin ? "border-sky-200 bg-sky-50 text-sky-700" : "border-emerald-200 bg-emerald-50 text-emerald-700",
			blurb: isAdmin ? "Full access to console tools" : "Personal storefront experience",
		};
	}, [user]);

	const handleSave = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!user) {
			router.push("/login");
			return;
		}
		setSaving(true);
		setStatus(null);
		setError(null);

		if (newPassword && newPassword !== confirmPassword) {
			setSaving(false);
			setError("Passwords do not match.");
			return;
		}

		const payload: Record<string, string> = {
			first_name: firstName,
			last_name: lastName,
			email,
		};

		if (newPassword) {
			payload.password = newPassword;
			payload.password_confirmation = confirmPassword;
		}

		try {
			await api("/me", { method: "PUT", body: payload });
			await fetchMe();
			setStatus("Profile updated successfully.");
			setNewPassword("");
			setConfirmPassword("");
		} catch (err: unknown) {
			const message = handleError(err, {
				title: "Profile update failed",
				fallbackMessage: "Unable to update profile.",
			});
			setError(message);
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!user) {
			router.push("/login");
			return;
		}
		if (!deletePassword) {
			setError("Enter your password to delete the account.");
			return;
		}
		const confirmed = window.confirm("This will permanently delete your account. Continue?");
		if (!confirmed) {
			return;
		}
		setDeleting(true);
		setError(null);
		setStatus(null);
		try {
			await api("/me", { method: "DELETE", body: { password: deletePassword } });
			logout();
			router.replace("/");
		} catch (err: unknown) {
			const message = handleError(err, {
				title: "Account deletion failed",
				fallbackMessage: "Unable to delete account.",
			});
			setError(message);
		} finally {
			setDeleting(false);
		}
	};

	if (!user) {
		return (
			<div className='mx-auto flex max-w-2xl flex-col items-center gap-4 py-20 text-center'>
				<p className='text-lg font-semibold text-slate-900'>Sign in to manage your profile.</p>
				<p className='text-sm text-muted'>You need an account to view or edit profile details.</p>
				<div className='flex gap-3'>
					<Button onClick={() => router.push("/login")}>Sign in</Button>
					<Button variant='outline' onClick={() => router.push("/signup")}>
						Create account
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='mx-auto max-w-5xl space-y-6 py-10'>
			<header className='rounded-3xl border border-border bg-white/80 p-6 shadow-card backdrop-blur'>
				<div className='flex flex-wrap items-center gap-4'>
					<div>
						<p className='text-sm font-semibold uppercase tracking-[0.3em] text-slate-500'>Profile</p>
						<h1 className='text-3xl font-semibold text-slate-900'>Account preferences</h1>
						<p className='text-sm text-muted'>Manage personal details, security, and ownership.</p>
					</div>
					<span
						className={`ml-auto inline-flex items-center rounded-full border px-4 py-1 text-sm font-medium ${roleMeta.chip}`}>
						{roleMeta.label}
					</span>
				</div>
				<p className='mt-4 text-xs text-muted'>{roleMeta.blurb}</p>
			</header>

			{status && (
				<div className='rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700'>
					{status}
				</div>
			)}
			{error && (
				<div className='rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>{error}</div>
			)}

			<form onSubmit={handleSave} className='grid gap-6 lg:grid-cols-[2fr,1fr]'>
				<section className='space-y-6 rounded-3xl border border-border bg-white/80 p-6 shadow-card backdrop-blur'>
					<div>
						<h2 className='text-lg font-semibold text-slate-900'>Personal info</h2>
						<p className='text-sm text-muted'>Update the basics that appear on invoices and admin tools.</p>
					</div>
					<div className='grid gap-4 sm:grid-cols-2'>
						<Field label='First name'>
							<Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
						</Field>
						<Field label='Last name'>
							<Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
						</Field>
						<Field label='Email address' helper='Used for receipts and login.'>
							<Input type='email' value={email} onChange={(e) => setEmail(e.target.value)} required />
						</Field>
						<Field label='Role'>
							<Input value={roleMeta.label} disabled />
						</Field>
					</div>
					<div className='grid gap-4 sm:grid-cols-2'>
						<Field label='New password' helper='Leave blank to keep current password.'>
							<Input
								type='password'
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								minLength={8}
							/>
						</Field>
						<Field label='Confirm new password'>
							<Input
								type='password'
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								minLength={newPassword ? 8 : undefined}
							/>
						</Field>
					</div>
					<div className='flex flex-wrap gap-3'>
						<Button type='submit' disabled={saving} className='px-6'>
							{saving ? "Saving..." : "Save changes"}
						</Button>
						<Button
							type='button'
							variant='ghost'
							onClick={() => {
								if (!user) return;
								setFirstName(user.first_name);
								setLastName(user.last_name);
								setEmail(user.email);
								setNewPassword("");
								setConfirmPassword("");
								setStatus(null);
								setError(null);
							}}>
							Reset
						</Button>
					</div>
				</section>

				<aside className='space-y-6'>
					<section className='rounded-3xl border border-border bg-white/80 p-6 shadow-card'>
						<h3 className='text-base font-semibold text-slate-900'>Account snapshot</h3>
						<dl className='mt-4 space-y-3 text-sm text-muted'>
							<div className='flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3'>
								<dt>Member since</dt>
								<dd className='font-semibold text-slate-900'>{formatDate(user?.created_at)}</dd>
							</div>
							<div className='flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3'>
								<dt>User ID</dt>
								<dd className='font-semibold text-slate-900'>#{user?.id}</dd>
							</div>
						</dl>
					</section>

					<section className='rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-card'>
						<h3 className='text-base font-semibold'>Danger zone</h3>
						<p className='mt-2 text-sm text-rose-700'>Delete your account and all associated data.</p>
						<div className='mt-4 space-y-2 text-sm'>
							<label className='font-medium'>Confirm password</label>
							<Input
								type='password'
								value={deletePassword}
								onChange={(e) => setDeletePassword(e.target.value)}
								placeholder='Enter password to confirm'
							/>
						</div>
						<Button
							type='button'
							variant='outline'
							className='mt-4 w-full border-rose-400 text-rose-700 hover:bg-rose-100'
							onClick={handleDelete}
							disabled={deleting}>
							{deleting ? "Deleting..." : "Delete account"}
						</Button>
					</section>
				</aside>
			</form>
		</div>
	);
}

function Field({ label, helper, children }: { label: string; helper?: string; children: ReactNode }) {
	return (
		<div className='space-y-2'>
			<label className='text-sm font-medium text-slate-700'>{label}</label>
			{children}
			{helper && <p className='text-xs text-muted'>{helper}</p>}
		</div>
	);
}

function formatDate(value?: string | null) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "—";
	return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
