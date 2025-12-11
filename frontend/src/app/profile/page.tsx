"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { notifyError, notifySuccess, notifyWarning } from "@/lib/notify";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { handleError } from "@/lib/handleError";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";

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
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [errors, setErrors] = useState<{
		firstName?: string;
		lastName?: string;
		email?: string;
		newPassword?: string;
		confirmPassword?: string;
		deletePassword?: string;
	}>({});

	const emailPattern = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

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

	const isDirty = useMemo(() => {
		if (!user) return false;
		return (
			firstName !== user.first_name ||
			lastName !== user.last_name ||
			email !== user.email ||
			newPassword !== "" ||
			confirmPassword !== ""
		);
	}, [confirmPassword, email, firstName, lastName, newPassword, user]);

	const handleSave = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!user) {
			router.push("/login");
			return;
		}

		const nextErrors: typeof errors = {};
		if (!firstName.trim()) {
			nextErrors.firstName = "First name is required.";
		} else if (firstName.trim().length < 2) {
			nextErrors.firstName = "First name must be at least 2 characters.";
		}
		if (!lastName.trim()) {
			nextErrors.lastName = "Last name is required.";
		} else if (lastName.trim().length < 2) {
			nextErrors.lastName = "Last name must be at least 2 characters.";
		}
		if (!email.trim()) {
			nextErrors.email = "Email is required.";
		} else if (!emailPattern.test(email.trim())) {
			nextErrors.email = "Enter a valid email address.";
		}
		if (newPassword) {
			if (newPassword.length < 8) {
				nextErrors.newPassword = "Password must be at least 8 characters.";
			}
			if (newPassword !== confirmPassword) {
				nextErrors.confirmPassword = "Passwords must match.";
			}
		}
		if (!newPassword && confirmPassword) {
			nextErrors.confirmPassword = "Enter a new password first.";
		}

		setErrors(nextErrors);
		if (Object.keys(nextErrors).length > 0) {
			notifyError("Check the form", "Please fix the highlighted fields.");
			return;
		}

		setSaving(true);

		const payload: Record<string, string> = {
			first_name: firstName.trim(),
			last_name: lastName.trim(),
			email: email.trim(),
		};

		if (newPassword) {
			payload.password = newPassword;
			payload.password_confirmation = confirmPassword;
		}

		try {
			await api("/me", { method: "PUT", body: payload });
			await fetchMe();
			notifySuccess("Profile updated", "Your account preferences are saved.");
			setNewPassword("");
			setConfirmPassword("");
		} catch (err: unknown) {
			handleError(err, {
				title: "Profile update failed",
				fallbackMessage: "Unable to update profile.",
			});
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = () => {
		if (!user) {
			router.push("/login");
			return;
		}
		if (!deletePassword) {
			setErrors((prev) => ({ ...prev, deletePassword: "Enter your password to delete the account." }));
			notifyWarning("Password required", "Enter your password to delete the account.");
			return;
		}
		setErrors((prev) => ({ ...prev, deletePassword: undefined }));
		setShowDeleteDialog(true);
	};

	const confirmDelete = async () => {
		setDeleting(true);
		setShowDeleteDialog(false);
		try {
			await api("/me", { method: "DELETE", body: { password: deletePassword } });
			notifySuccess("Account deleted", "We're signing you out.");
			logout();
			router.replace("/");
		} catch (err: unknown) {
			handleError(err, {
				title: "Account deletion failed",
				fallbackMessage: "Unable to delete account.",
			});
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
		<div className='mx-auto space-y-6 '>
			<header className='rounded-3xl  '>
				<div className='flex flex-wrap items-start gap-4'>
					<div>
						<p className='text-sm font-semibold uppercase tracking-[0.3em] text-slate-500'>Profile</p>
						<h1 className='text-3xl font-semibold text-slate-900'>Account preferences</h1>
						<p className='text-sm text-muted'>Tune personal details, security, and ownership policies.</p>
					</div>
					<span
						className={`ml-auto inline-flex items-center rounded-full border px-4 py-1 text-sm font-semibold ${roleMeta.chip}`}>
						{roleMeta.label}
					</span>
				</div>
			</header>

			<form onSubmit={handleSave} className='grid gap-6 lg:grid-cols-[2fr,1fr]'>
				<div className='space-y-6'>
					<section className='space-y-6 rounded-3xl border border-border bg-white/80 p-6 shadow-card backdrop-blur'>
						<div>
							<h2 className='text-lg font-semibold text-slate-900'>Personal info</h2>
							<p className='text-sm text-muted'>These details appear on invoices and admin tooling.</p>
						</div>
						<div className='grid gap-4 sm:grid-cols-2'>
							<Field label='First name'>
								<div className='space-y-1'>
									<Input
										value={firstName}
										onChange={(e) => {
											setFirstName(e.target.value);
											setErrors((prev) => ({ ...prev, firstName: undefined }));
										}}
										required
										aria-invalid={Boolean(errors.firstName)}
										aria-describedby={errors.firstName ? "first-name-error" : undefined}
									/>
									{errors.firstName && (
										<p id='first-name-error' className='text-xs font-semibold text-rose-500'>
											{errors.firstName}
										</p>
									)}
								</div>
							</Field>
							<Field label='Last name'>
								<div className='space-y-1'>
									<Input
										value={lastName}
										onChange={(e) => {
											setLastName(e.target.value);
											setErrors((prev) => ({ ...prev, lastName: undefined }));
										}}
										required
										aria-invalid={Boolean(errors.lastName)}
										aria-describedby={errors.lastName ? "last-name-error" : undefined}
									/>
									{errors.lastName && (
										<p id='last-name-error' className='text-xs font-semibold text-rose-500'>
											{errors.lastName}
										</p>
									)}
								</div>
							</Field>
							<Field label='Email address' helper='Used for receipts and login.'>
								<div className='space-y-1'>
									<Input
										type='email'
										value={email}
										onChange={(e) => {
											setEmail(e.target.value);
											setErrors((prev) => ({ ...prev, email: undefined }));
										}}
										required
										aria-invalid={Boolean(errors.email)}
										aria-describedby={errors.email ? "email-error" : undefined}
									/>
									{errors.email && (
										<p id='email-error' className='text-xs font-semibold text-rose-500'>
											{errors.email}
										</p>
									)}
								</div>
							</Field>
						</div>
						<div className='flex items-center  rounded-2xl bg-slate-50 '>
							<dt>Member since</dt>
							<dd className='font-semibold px-4 text-slate-900'>{formatDate(user?.created_at)}</dd>
						</div>
						<div>
							<h2 className='text-lg font-semibold text-slate-900'>Security</h2>
							<p className='text-sm text-muted'>Rotate passwords to keep your account resilient.</p>
						</div>
						<div className='grid gap-4 sm:grid-cols-2'>
							<Field label='New password' helper='Leave blank to keep current password.'>
								<div className='space-y-1'>
									<Input
										type='password'
										value={newPassword}
										onChange={(e) => {
											setNewPassword(e.target.value);
											setErrors((prev) => ({ ...prev, newPassword: undefined, confirmPassword: undefined }));
										}}
										minLength={8}
										aria-invalid={Boolean(errors.newPassword)}
										aria-describedby={errors.newPassword ? "new-password-error" : undefined}
									/>
									{errors.newPassword && (
										<p id='new-password-error' className='text-xs font-semibold text-rose-500'>
											{errors.newPassword}
										</p>
									)}
								</div>
							</Field>
							<Field label='Confirm new password'>
								<div className='space-y-1'>
									<Input
										type='password'
										value={confirmPassword}
										onChange={(e) => {
											setConfirmPassword(e.target.value);
											setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
										}}
										minLength={newPassword ? 8 : undefined}
										aria-invalid={Boolean(errors.confirmPassword)}
										aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
									/>
									{errors.confirmPassword && (
										<p id='confirm-password-error' className='text-xs font-semibold text-rose-500'>
											{errors.confirmPassword}
										</p>
									)}
								</div>
							</Field>
						</div>
						<Button type='submit' disabled={saving || !isDirty} className='rounded-2xl px-6'>
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
							}}>
							Reset
						</Button>
					</section>
				</div>

				<aside className='space-y-6'>
					<section className='rounded-3xl border border-rose-200 bg-rose-50/90 p-6 text-rose-800 shadow-card'>
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
							className='mt-4 w-full rounded-2xl border-rose-400 text-rose-700 hover:bg-rose-100'
							onClick={handleDelete}
							disabled={deleting}>
							{deleting ? "Deleting..." : "Delete account"}
						</Button>
						{errors.deletePassword && (
							<p className='mt-2 text-xs font-semibold text-rose-500'>{errors.deletePassword}</p>
						)}
					</section>
				</aside>
			</form>

			<ConfirmDialog
				open={showDeleteDialog}
				title='Delete account'
				description='This will permanently remove your account and associated data.'
				confirmLabel='Delete'
				cancelLabel='Keep account'
				confirmTone='danger'
				confirmLoading={deleting}
				onCancel={() => setShowDeleteDialog(false)}
				onConfirm={confirmDelete}
				disableOutsideClose={deleting}
			/>
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
