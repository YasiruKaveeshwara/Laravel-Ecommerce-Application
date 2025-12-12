"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { handleError } from "@/lib/handleError";
import { notifyError, notifySuccess, notifyWarning } from "@/lib/notify";
import { api } from "@/lib/api";
import { useRouteGuard } from "@/lib/useRouteGuard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { DeleteButton } from "@/components/DeleteButton";

const ROLE_OPTIONS = [
	{ value: "customer", label: "Customer" },
	{ value: "administrator", label: "Administrator" },
];

type AdminUser = {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	role: "administrator" | "customer";
	created_at?: string;
};

type FormState = {
	first_name: string;
	last_name: string;
	email: string;
	role: "administrator" | "customer";
	password: string;
	password_confirmation: string;
};

type FormErrors = Partial<Record<keyof FormState, string>> & { deleteConfirm?: string };

const createEmptyForm = (): FormState => ({
	first_name: "",
	last_name: "",
	email: "",
	role: "customer",
	password: "",
	password_confirmation: "",
});

export default function AdminCustomerDetailPage() {
	const params = useParams<{ userId: string }>();
	const userId = params?.userId;
	const router = useRouter();
	const { allowed, pending } = useRouteGuard({ requireAuth: true, requireRole: "administrator" });

	const [form, setForm] = useState<FormState>(() => createEmptyForm());
	const [errors, setErrors] = useState<FormErrors>({});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState("");
	const [userMeta, setUserMeta] = useState<{ created_at?: string } | null>(null);

	const emailPattern = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

	useEffect(() => {
		if (!allowed || !userId) return;
		let isMounted = true;
		setLoading(true);
		api(`/users/${userId}`)
			.then((data: AdminUser) => {
				if (!isMounted) return;
				setForm({
					first_name: data.first_name ?? "",
					last_name: data.last_name ?? "",
					email: data.email ?? "",
					role: data.role,
					password: "",
					password_confirmation: "",
				});
				setUserMeta({ created_at: data.created_at });
				setErrors({});
			})
			.catch((error: unknown) => {
				handleError(error, { title: "Load failed", fallbackMessage: "Unable to load that user." });
			})
			.finally(() => {
				if (isMounted) setLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, [allowed, userId]);

	const validate = () => {
		const next: FormErrors = {};
		if (!form.first_name.trim()) {
			next.first_name = "First name is required.";
		} else if (form.first_name.trim().length < 2) {
			next.first_name = "First name must be at least 2 characters.";
		}
		if (!form.last_name.trim()) {
			next.last_name = "Last name is required.";
		} else if (form.last_name.trim().length < 2) {
			next.last_name = "Last name must be at least 2 characters.";
		}
		if (!form.email.trim()) {
			next.email = "Email is required.";
		} else if (!emailPattern.test(form.email.trim())) {
			next.email = "Enter a valid email address.";
		}
		if (form.password) {
			if (form.password.length < 8) {
				next.password = "Password must be at least 8 characters.";
			}
			if (form.password !== form.password_confirmation) {
				next.password_confirmation = "Passwords must match.";
			}
		}
		if (!form.password && form.password_confirmation) {
			next.password_confirmation = "Enter a new password first.";
		}
		setErrors(next);
		return Object.keys(next).length === 0;
	};

	const handleSave = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!userId) return;
		if (!validate()) {
			notifyError("Check the form", "Please fix the highlighted fields.");
			return;
		}

		setSaving(true);
		const payload: Record<string, string> = {
			first_name: form.first_name.trim(),
			last_name: form.last_name.trim(),
			email: form.email.trim(),
			role: form.role,
		};
		if (form.password) {
			payload.password = form.password;
			payload.password_confirmation = form.password_confirmation;
		}

		try {
			await api(`/users/${userId}`, { method: "PUT", body: payload });
			notifySuccess("User updated", "Account details saved.");
		} catch (error: unknown) {
			handleError(error, { title: "Update failed", fallbackMessage: "Unable to update this user." });
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!userId) return;
		const expected = form.email.trim();
		if (!deleteConfirm.trim()) {
			setErrors((prev) => ({ ...prev, deleteConfirm: "Type the user's email to confirm." }));
			notifyWarning("Confirmation required", "Type the email to confirm deletion.");
			return;
		}
		if (deleteConfirm.trim() !== expected) {
			setErrors((prev) => ({ ...prev, deleteConfirm: "Email does not match." }));
			notifyWarning("Email mismatch", "Enter the user's email to confirm deletion.");
			return;
		}

		setErrors((prev) => ({ ...prev, deleteConfirm: undefined }));
		setDeleting(true);
		try {
			await api(`/users/${userId}`, { method: "DELETE" });
			notifySuccess("User deleted", "The account has been removed.");
			router.push("/admin/customers");
		} catch (error: unknown) {
			handleError(error, { title: "Delete failed", fallbackMessage: "Unable to delete this user." });
		} finally {
			setDeleting(false);
		}
	};

	if (pending) {
		return (
			<div className='mx-auto max-w-3xl px-4 py-24'>
				<LoadingScreen message='Checking access' description='Verifying your administrator session.' />
			</div>
		);
	}

	if (!allowed) return null;

	if (loading) {
		return (
			<div className='mx-auto max-w-3xl px-4 py-24'>
				<LoadingScreen message='Loading user' description='Fetching account details.' />
			</div>
		);
	}

	return (
		<div className='mx-auto  space-y-6 '>
			<header className='flex flex-wrap items-start gap-4'>
				<div>
					<p className='text-sm font-semibold uppercase tracking-[0.3em] text-slate-500'>User</p>
					<h1 className='text-3xl font-semibold text-slate-900'>Manage account</h1>
					<p className='text-sm text-muted'>Edit profile details, roles, and credentials.</p>
				</div>
				<span
					className={`ml-auto inline-flex items-center rounded-full border px-4 py-1 text-sm font-semibold ${
						form.role === "administrator"
							? "border-sky-200 bg-sky-50 text-sky-700"
							: "border-emerald-200 bg-emerald-50 text-emerald-700"
					}`}>
					{form.role === "administrator" ? "Administrator" : "Customer"}
				</span>
			</header>

			<form onSubmit={handleSave} className='grid gap-6 lg:grid-cols-[2fr,1fr]'>
				<section className='space-y-6 rounded-3xl border border-border bg-white/80 p-6 shadow-card backdrop-blur'>
					<div className='justify-between flex'>
						<div>
							<h2 className='text-lg font-semibold text-slate-900'>Profile</h2>
							<p className='text-sm text-muted'>Aligns with the customer-facing profile experience.</p>
						</div>
						<div>
							<p className='font-semibold text-slate-900'>Created</p>
							<p className='text-muted'>{formatDate(userMeta?.created_at)}</p>
						</div>
					</div>
					<div className='grid gap-4 sm:grid-cols-2'>
						<Field label='First name'>
							<div className='space-y-1'>
								<Input
									value={form.first_name}
									onChange={(e) => {
										setForm((prev) => ({ ...prev, first_name: e.target.value }));
										setErrors((prev) => ({ ...prev, first_name: undefined }));
									}}
									required
									aria-invalid={Boolean(errors.first_name)}
									aria-describedby={errors.first_name ? "first-name-error" : undefined}
								/>
								{errors.first_name && (
									<p id='first-name-error' className='text-xs font-semibold text-rose-500'>
										{errors.first_name}
									</p>
								)}
							</div>
						</Field>
						<Field label='Last name'>
							<div className='space-y-1'>
								<Input
									value={form.last_name}
									onChange={(e) => {
										setForm((prev) => ({ ...prev, last_name: e.target.value }));
										setErrors((prev) => ({ ...prev, last_name: undefined }));
									}}
									required
									aria-invalid={Boolean(errors.last_name)}
									aria-describedby={errors.last_name ? "last-name-error" : undefined}
								/>
								{errors.last_name && (
									<p id='last-name-error' className='text-xs font-semibold text-rose-500'>
										{errors.last_name}
									</p>
								)}
							</div>
						</Field>
						<Field label='Email address' helper=''>
							<div className='space-y-1'>
								<Input
									type='email'
									value={form.email}
									onChange={(e) => {
										setForm((prev) => ({ ...prev, email: e.target.value }));
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
						<Field label='Role'>
							<div className='space-y-1'>
								<select
									value={form.role}
									onChange={(e) => {
										const value = e.target.value as FormState["role"];
										setForm((prev) => ({ ...prev, role: value }));
									}}
									className='w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100'>
									{ROLE_OPTIONS.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</div>
						</Field>
					</div>

					<div>
						<h2 className='text-lg font-semibold text-slate-900'>Credentials</h2>
						<p className='text-sm text-muted'>Set a new password or leave blank to keep unchanged.</p>
					</div>
					<div className='grid gap-4 sm:grid-cols-2'>
						<Field label='New password'>
							<div className='space-y-1'>
								<Input
									type='password'
									value={form.password}
									onChange={(e) => {
										setForm((prev) => ({ ...prev, password: e.target.value }));
										setErrors((prev) => ({ ...prev, password: undefined, password_confirmation: undefined }));
									}}
									minLength={8}
									aria-invalid={Boolean(errors.password)}
									aria-describedby={errors.password ? "new-password-error" : undefined}
								/>
								{errors.password && (
									<p id='new-password-error' className='text-xs font-semibold text-rose-500'>
										{errors.password}
									</p>
								)}
							</div>
						</Field>
						<Field label='Confirm password'>
							<div className='space-y-1'>
								<Input
									type='password'
									value={form.password_confirmation}
									onChange={(e) => {
										setForm((prev) => ({ ...prev, password_confirmation: e.target.value }));
										setErrors((prev) => ({ ...prev, password_confirmation: undefined }));
									}}
									minLength={form.password ? 8 : undefined}
									aria-invalid={Boolean(errors.password_confirmation)}
									aria-describedby={errors.password_confirmation ? "confirm-password-error" : undefined}
								/>
								{errors.password_confirmation && (
									<p id='confirm-password-error' className='text-xs font-semibold text-rose-500'>
										{errors.password_confirmation}
									</p>
								)}
							</div>
						</Field>
					</div>

					<div className='flex flex-wrap items-center gap-3'>
						<Button type='submit' disabled={saving} className='rounded-2xl px-6'>
							{saving ? "Saving..." : "Save changes"}
						</Button>
						<Link
							href='/admin/customers'
							className='text-sm font-semibold text-slate-600 underline-offset-4 hover:underline'>
							Back to list
						</Link>
					</div>
				</section>

				<aside className='space-y-6'>
					<section className='rounded-3xl border border-rose-200 bg-rose-50/80 p-6 text-rose-800 shadow-card'>
						<h3 className='text-base font-semibold'>Danger zone</h3>
						<p className='mt-2 text-sm text-rose-700'>Deleting removes access and related data.</p>
						<div className='mt-4 space-y-2 text-sm'>
							<label className='font-medium'>Type the user email to confirm</label>
							<Input
								value={deleteConfirm}
								onChange={(e) => {
									setDeleteConfirm(e.target.value);
									setErrors((prev) => ({ ...prev, deleteConfirm: undefined }));
								}}
								placeholder={form.email || "user@example.com"}
								aria-invalid={Boolean(errors.deleteConfirm)}
								aria-describedby={errors.deleteConfirm ? "delete-confirm-error" : undefined}
							/>
							{errors.deleteConfirm && (
								<p id='delete-confirm-error' className='text-xs font-semibold text-rose-500'>
									{errors.deleteConfirm}
								</p>
							)}
						</div>
						<DeleteButton
							variant='outline'
							className='mt-4 w-full rounded-2xl border-rose-400 hover:bg-rose-100'
							label={deleting ? "Deleting..." : "Delete user"}
							onClick={handleDelete}
							disabled={deleting}
						/>
					</section>
				</aside>
			</form>
		</div>
	);
}

function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
	return (
		<div className='space-y-1'>
			<label className='text-sm font-semibold text-slate-800'>{label}</label>
			{helper && <p className='text-xs text-muted'>{helper}</p>}
			{children}
		</div>
	);
}

function formatDate(value?: string) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "—";
	return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
