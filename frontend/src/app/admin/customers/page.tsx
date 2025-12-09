"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { notifyError, notifyInfo } from "@/lib/notify";

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

type UsersResponse = {
  data?: AdminUser[];
  meta?: PaginationMeta;
};

const ROLE_LABEL: Record<AdminUser["role"], string> = {
  administrator: "Admin",
  customer: "Customer",
};

export default function AdminCustomers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AdminUser["role"]>("all");
  const fetchMe = useAuth((state) => state.fetchMe);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const loadCustomers = useCallback(() => {
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    api("/users", { authToken: token, query: { per_page: 100 } })
      .then((res: UsersResponse) => {
        setUsers(res?.data || []);
        setMeta(res?.meta || null);
      })
      .catch((error: any) => {
        const message = error?.message || "Unable to load customers";
        notifyError("Customer fetch failed", message);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users
      .filter((user) => {
        const composite = (user.full_name || `${user.first_name || ""} ${user.last_name || ""}`).trim().toLowerCase();
        const emailMatch = user.email?.toLowerCase().includes(term);
        const matchesSearch = term ? composite.includes(term) || emailMatch : true;
        const matchesRole = roleFilter === "all" ? true : user.role === roleFilter;
        return matchesSearch && matchesRole;
      })
      .sort((a, b) => {
        const dateA = a.created_at ? Date.parse(a.created_at) : 0;
        const dateB = b.created_at ? Date.parse(b.created_at) : 0;
        return dateB - dateA;
      });
  }, [users, search, roleFilter]);

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

  const totalRecords = meta?.total ?? users.length;

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("all");
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-start gap-4'>
        <div>
          <p className='text-sm font-semibold uppercase tracking-[0.3em] text-slate-500'>Customers</p>
          <h1 className='text-3xl font-semibold text-slate-900'>Customer intelligence</h1>
          <p className='text-sm text-muted'>Search accounts, view segments, and keep tabs on growth.</p>
        </div>
        <div className='ml-auto flex items-center gap-3'>
          <Button variant='ghost' className='rounded-2xl border border-border px-4' onClick={resetFilters}>
            Reset filters
          </Button>
          <Button className='rounded-2xl px-5' onClick={loadCustomers}>
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
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder='Search name or email'
                className='pl-9'
              />
            </div>
          </div>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-slate-700'>Role</label>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as "all" | AdminUser["role"])}
              className='w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100'>
              <option value='all'>All roles</option>
              <option value='customer'>Customers</option>
              <option value='administrator'>Administrators</option>
            </select>
          </div>
        </div>
        <div className='mt-4 text-sm text-muted'>
          Showing {filteredUsers.length} of {totalRecords} accounts
        </div>
      </section>

      <div className='overflow-hidden rounded-3xl border border-border bg-white shadow-card'>
        <table className='w-full text-left text-sm'>
          <thead className='bg-slate-50 text-slate-500'>
            <tr>
              <th className='px-5 py-3 font-medium'>Customer</th>
              <th className='px-5 py-3 font-medium'>Email</th>
              <th className='px-5 py-3 font-medium'>Role</th>
              <th className='px-5 py-3 font-medium'>Joined</th>
              <th className='px-5 py-3 font-medium text-right'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className='px-5 py-8 text-center text-muted'>
                  Loading customer roster...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className='px-5 py-8 text-center text-muted'>
                  No customers match these filters yet.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className='border-t border-border/80'>
                  <td className='px-5 py-4'>
                    <div className='flex items-center gap-4'>
                      <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-base font-semibold text-slate-600'>
                        {getInitials(user)}
                      </div>
                      <div>
                        <p className='font-semibold text-slate-900'>
                          {user.full_name || `${user.first_name} ${user.last_name}`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className='px-5 py-4'>
                    <a href={`mailto:${user.email}`} className='text-sky-600 hover:underline'>
                      {user.email}
                    </a>
                  </td>
                  <td className='px-5 py-4'>
                    <RolePill role={user.role} />
                  </td>
                  <td className='px-5 py-4 text-slate-600'>{formatDate(user.created_at)}</td>
                  <td className='px-5 py-4 text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='ghost'
                        className='h-9 rounded-2xl px-3 text-slate-600'
                        onClick={() => window.open(`mailto:${user.email}`, "_blank")}>
                        Message
                      </Button>
                      <Button
                        variant='outline'
                        className='h-9 rounded-2xl px-3'
                        onClick={() => notifyInfo("Management tools on the way", "Stay tuned.")}>
                        Manage
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
  return (first + last).trim() || fallback.toUpperCase();
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
