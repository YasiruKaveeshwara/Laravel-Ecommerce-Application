"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Pencil, Search, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { notifySuccess } from "@/lib/notify";
import { handleError } from "@/lib/handleError";
import { LoadingScreen } from "@/components/LoadingScreen";
import { normalizePaginatedResponse, summarizePagination } from "@/lib/pagination";
import { PaginationControls } from "@/components/PaginationControls";
import { useRouteGuard } from "@/lib/useRouteGuard";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";

type AdminUser = {
	id: string;
	first_name: string;
	last_name: string;
	full_name?: string;
	email: string;
	role: "administrator" | "customer";
	created_at?: string;
};

type PaginationMeta = {
	total?: number;
	per_page?: number;
	current_page?: number;
	last_page?: number;
};

const ROLE_LABEL: Record<AdminUser["role"], string> = {
	administrator: "Admin",
	customer: "Customer",
};

const relativeTimeFormatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
const PER_PAGE = 20;

type AdminFilters = {
	search: string;
	role: "all" | AdminUser["role"];
};

const createDefaultFilters = (): AdminFilters => ({ search: "", role: "all" });

export default function AdminCustomers() {
	const { allowed, pending } = useRouteGuard({ requireAuth: true, requireRole: "administrator" });
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [meta, setMeta] = useState<PaginationMeta | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filters, setFilters] = useState<AdminFilters>(() => createDefaultFilters());
	const [appliedFilters, setAppliedFilters] = useState<AdminFilters>(() => createDefaultFilters());
	const appliedFiltersRef = useRef(appliedFilters);
	const pageRef = useRef(1);
	const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

	useEffect(() => {
		appliedFiltersRef.current = appliedFilters;
	}, [appliedFilters]);

	const loadCustomers = useCallback(async (overrideFilters?: AdminFilters, overridePage?: number) => {
		setLoading(true);
		setError(null);
		try {
			const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
			const activeFilters = overrideFilters ?? appliedFiltersRef.current;
			const pageToFetch = overridePage ?? pageRef.current;
			const response = await api("/users", {
				authToken: token,
				query: {
					per_page: PER_PAGE,
					q: activeFilters.search.trim() || undefined,
					role: activeFilters.role === "all" ? undefined : activeFilters.role,
					page: pageToFetch,
				},
			});
			const normalized = normalizePaginatedResponse<AdminUser>(response);
			setUsers(normalized.items);
			setMeta(normalized.meta);
			const resolvedPage = normalized.meta?.current_page ?? pageToFetch;
			pageRef.current = resolvedPage;
		} catch (err: unknown) {
			const message = handleError(err, {
				title: "Customer fetch failed",
				fallbackMessage: "Unable to load customers.",
			});
			setError(message);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (allowed) {
			loadCustomers();
		}
	}, [allowed, loadCustomers]);

	const stats = useMemo(() => {
		const totalCustomers = users.filter((user) => user.role === "customer").length;
		const adminCount = users.filter((user) => user.role === "administrator").length;
		const newThisMonth = users.filter((user) => {
			if (!user.created_at) {
				return false;
			}
			const createdAt = Date.parse(user.created_at);
			if (Number.isNaN(createdAt)) {
				return false;
			}
			const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
			return createdAt >= cutoff;
		}).length;
		return { totalCustomers, adminCount, newThisMonth };
	}, [users]);

	const paginationSummary = useMemo(
		() => summarizePagination(meta, { fallbackCount: users.length, pageSize: PER_PAGE }),
		[meta, users.length]
	);

	const paginationPositionCopy = paginationSummary.hasResults
		? `Page ${paginationSummary.currentPage} of ${paginationSummary.lastPage}`
		: "No pages";

	const filtersDirty = useMemo(() => {
		return filters.search !== appliedFilters.search || filters.role !== appliedFilters.role;
	}, [filters, appliedFilters]);

	const paginationCopy = paginationSummary.hasResults
		? `Showing ${paginationSummary.from}-${paginationSummary.to} of ${paginationSummary.total} accounts`
		: "Showing 0 accounts";

	const handleApplyFilters = () => {
		const next = { ...filters };
		setAppliedFilters(next);
		loadCustomers(next, 1);
	};

	const resetFilters = () => {
		const next = createDefaultFilters();
		setFilters(next);
		setAppliedFilters(next);
		loadCustomers(next, 1);
	};

	const emptyStateLoading = loading && users.length === 0;

	if (pending) {
		return (
			<LoadingScreen
				message='Checking permissions...'
				description='One moment while we verify your access.'
				className='border-none bg-transparent shadow-none'
			/>
		);
	}

	if (!allowed) {
		return null;
	}

	return (
		<div className='space-y-6'>
			<div className='flex flex-wrap items-start gap-4'>
				<div>
					<p className='text-sm font-semibold uppercase tracking-[0.3em] text-slate-500'>Users</p>
					<h1 className='text-3xl font-semibold text-slate-900'>User intelligence</h1>
					<p className='text-sm text-muted'>Search accounts, view segments, and keep tabs on growth.</p>
				</div>
				<div className='ml-auto flex items-center gap-3'>
					<Button variant='ghost' className='rounded-2xl border border-border px-4' onClick={() => loadCustomers()}>
						Refresh list
					</Button>
				</div>
			</div>

			<div className='grid gap-4 md:grid-cols-3'>
				<SummaryTile label='Total customers' value={stats.totalCustomers.toString()} hint='Active customer profiles' />
				<SummaryTile label='Admins' value={stats.adminCount.toString()} hint='Internal teammates with access' />
				<SummaryTile label='New this month' value={stats.newThisMonth.toString()} hint='Joined in last 30 days' />
			</div>

			<section className='rounded-3xl border border-border bg-white/80 p-6 shadow-card backdrop-blur'>
				<div className='grid gap-4 md:grid-cols-3'>
					<div className='md:col-span-2 space-y-2'>
						<label className='text-sm font-medium text-slate-700'>Search</label>
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted' />
							<Input
								value={filters.search}
								onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
								placeholder='Search name or email'
								className='pl-9'
							/>
						</div>
					</div>
					<div className='space-y-2'>
						<label className='text-sm font-medium text-slate-700'>Role</label>
						<select
							value={filters.role}
							onChange={(event) =>
								setFilters((prev) => ({ ...prev, role: event.target.value as AdminFilters["role"] }))
							}
							className='w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100'>
							<option value='all'>All roles</option>
							<option value='customer'>Customers</option>
							<option value='administrator'>Administrators</option>
						</select>
					</div>
				</div>
				<div className='mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted'>
					<span>
						{paginationCopy}
						{paginationSummary.hasResults && <span className='text-slate-400'> · {paginationPositionCopy}</span>}
					</span>
					<div className='flex items-center gap-3'>
						<Button variant='ghost' className='rounded-2xl border border-border px-4' onClick={resetFilters}>
							Reset filters
						</Button>
						<Button className='rounded-2xl px-6' onClick={handleApplyFilters} disabled={!filtersDirty}>
							Apply filters
						</Button>
					</div>
				</div>
			</section>

			{error && (
				<div className='rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>{error}</div>
			)}

			<div className='rounded-3xl border border-border bg-linear-to-b from-white via-white to-slate-50 shadow-card'>
				{emptyStateLoading ? (
					<LoadingScreen
						message='Loading customer roster...'
						description='Fetching the latest customer and admin profiles.'
						className='border-none bg-transparent shadow-none'
					/>
				) : (
					<>
						<div className='overflow-x-auto px-2 pb-2'>
							<table className='w-full border-separate border-spacing-y-3 text-sm text-slate-600'>
								<thead className='text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
									<tr>
										<th className='px-5 py-2 text-left'>User</th>
										<th className='px-5 py-2 text-left'>Role</th>
										<th className='px-5 py-2 text-left'>Joined</th>
										<th className='px-5 py-2 text-center'>Actions</th>
									</tr>
								</thead>
								<tbody>
									{loading ? (
										<tr>
											<td colSpan={4} className='rounded-3xl bg-white/80 px-5 py-10 text-center text-muted'>
												<LoadingScreen
													message='Loading customers...'
													description='Please wait while we fetch the customer list.'
													className='border-none bg-transparent shadow-none'
												/>
											</td>
										</tr>
									) : users.length === 0 ? (
										<tr>
											<td colSpan={4} className='rounded-3xl bg-white/80 px-5 py-10 text-center text-muted'>
												No customers match these filters yet.
											</td>
										</tr>
									) : (
										users.map((user) => {
											const relativeJoined = formatRelativeTime(user.created_at);
											return (
												<tr
													key={user.id}
													className='align-middle rounded-3xl border border-border/70 bg-white/90 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-xl'>
													<td className='px-5 py-4 align-middle first:rounded-l-3xl'>
														<div className='flex items-center gap-4'>
															<div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 text-base font-semibold text-slate-700'>
																{getInitials(user)}
															</div>
															<div>
																<p className='font-semibold text-slate-900'>
																	{user.full_name || `${user.first_name} ${user.last_name}`}
																</p>
																<p className='text-xs text-muted'>
																	<a href={`mailto:${user.email}`} className='text-sky-600 hover:underline'>
																		{user.email}
																	</a>
																</p>
															</div>
														</div>
													</td>
													<td className='px-5 py-4 align-middle'>
														<RolePill role={user.role} />
													</td>
													<td className='px-5 py-4 align-middle text-slate-600'>
														<p className='text-sm font-semibold text-slate-900'>{formatDate(user.created_at)}</p>
														{relativeJoined && (
															<p className='text-xs font-semibold text-emerald-600'>{relativeJoined}</p>
														)}
													</td>
													<td className='px-5 py-4 align-middle text-center'>
														<div className='flex items-center justify-center gap-2'>
															<Link
																href={`/admin/customers/${user.id}`}
																className='inline-flex items-center justify-center rounded-full border border-border/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-slate-50'>
																<Pencil className='h-4 w-4 mr-2' />
																Edit
															</Link>
															<Button
																variant='ghost'
																size='icon'
																className='rounded-full text-rose-600 hover:bg-rose-50'
																onClick={() => setDeleteTarget(user)}>
																<Trash2 className='h-4 w-4' /> Delete
															</Button>
														</div>
													</td>
												</tr>
											);
										})
									)}
								</tbody>
							</table>
						</div>
						<PaginationControls
							meta={meta}
							itemsCount={users.length}
							pageSize={PER_PAGE}
							loading={loading}
							entityLabel='accounts'
							onPageChange={(page) => loadCustomers(undefined, page)}
						/>
						<ConfirmDialog
							open={Boolean(deleteTarget)}
							title='Delete user'
							description={`This will permanently remove ${deleteTarget?.email}.`}
							confirmLabel='Delete'
							cancelLabel='Cancel'
							confirmTone='danger'
							confirmLoading={deleteLoading}
							onCancel={() => setDeleteTarget(null)}
							onConfirm={async () => {
								if (!deleteTarget) return;
								setDeleteLoading(true);
								try {
									await api(`/users/${deleteTarget.id}`, { method: "DELETE" });
									setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
									notifySuccess("User deleted", "The account has been removed.");
								} catch (err: unknown) {
									handleError(err, { title: "Delete failed", fallbackMessage: "Unable to delete this user." });
								} finally {
									setDeleteLoading(false);
									setDeleteTarget(null);
								}
							}}
						/>
					</>
				)}
			</div>
		</div>
	);
}

function SummaryTile({ label, value, hint }: { label: string; value: string; hint: string }) {
	return (
		<div className='rounded-3xl border border-border bg-white/80 p-5 shadow-card'>
			<p className='text-xs uppercase tracking-[0.3em] text-slate-500'>{label}</p>
			<p className='mt-2 text-2xl font-semibold text-slate-900'>{value}</p>
			<p className='text-xs text-muted'>{hint}</p>
		</div>
	);
}

function RolePill({ role }: { role: AdminUser["role"] }) {
	const styles =
		role === "administrator"
			? "border-sky-200 bg-sky-50 text-sky-700"
			: "border-emerald-200 bg-emerald-50 text-emerald-700";
	return (
		<span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${styles}`}>
			{ROLE_LABEL[role]}
		</span>
	);
}

function getInitials(user: AdminUser) {
	const first = (user.first_name || "").charAt(0);
	const last = (user.last_name || "").charAt(0);
	const fallback = (user.full_name || user.email || "").charAt(0);
	return ((first + last).trim() || fallback || "").toUpperCase();
}

function formatDate(value?: string) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "—";
	return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatRelativeTime(value?: string) {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	const diffMs = Date.now() - date.getTime();
	const minute = 60 * 1000;
	const hour = 60 * minute;
	const day = 24 * hour;
	const month = 30 * day;

	if (Math.abs(diffMs) < minute) return "just now";
	if (Math.abs(diffMs) < hour) {
		const minutes = Math.round(diffMs / minute) || 1;
		return relativeTimeFormatter.format(-minutes, "minute");
	}
	if (Math.abs(diffMs) < day) {
		const hours = Math.round(diffMs / hour) || 1;
		return relativeTimeFormatter.format(-hours, "hour");
	}
	if (Math.abs(diffMs) < month) {
		const days = Math.round(diffMs / day) || 1;
		return relativeTimeFormatter.format(-days, "day");
	}
	const months = Math.round(diffMs / month) || 1;
	return relativeTimeFormatter.format(-months, "month");
}
