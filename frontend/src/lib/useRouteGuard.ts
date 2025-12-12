"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";

export type RouteGuardOptions = {
	requireAuth?: boolean;
	requireRole?: "administrator" | "customer";
	redirectTo?: string;
};

export function useRouteGuard({ requireAuth = false, requireRole, redirectTo }: RouteGuardOptions) {
	const router = useRouter();
	const pathname = usePathname();
	const user = useAuth((s) => s.user);
	const hydrate = useAuth((s) => s.hydrate);
	const initialized = useAuth((s) => s.initialized);

	useEffect(() => {
		hydrate();
	}, [hydrate]);

	useEffect(() => {
		if (!initialized) return;

		const redirectPath = redirectTo ?? `/login?redirect=${encodeURIComponent(pathname)}`;

		if (requireAuth && !user) {
			router.replace(redirectPath);
			return;
		}

		if (requireRole && user && user.role !== requireRole) {
			router.replace("/");
		}
	}, [initialized, user, requireAuth, requireRole, router, pathname, redirectTo]);

	const allowed = useMemo(() => {
		if (!initialized) return false;
		if (requireAuth && !user) return false;
		if (requireRole && user && user.role !== requireRole) return false;
		return true;
	}, [initialized, requireAuth, requireRole, user]);

	const pending = !initialized || (!allowed && (requireAuth || Boolean(requireRole)));
	return { allowed, pending };
}
