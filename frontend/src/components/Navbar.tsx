"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth";
import { useCart } from "@/store/cart";
import { notifyInfo, notifySuccess } from "@/lib/notify";
import { Lock, LogIn, LogOut, Menu, ShoppingCart, User, X } from "lucide-react";

type Audience = "guest" | "customer" | "admin";
type NavItem = {
  label: string;
  href?: string;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  action?: "logout";
};

const NAV_LINKS: Record<Audience, NavItem[]> = {
  guest: [{ label: "Orders", href: "/orders", requiresAuth: true }],
  customer: [{ label: "Orders", href: "/orders", requiresAuth: true }],
  admin: [
    { label: "Inventory", href: "/admin/products", requiresAdmin: true },
    { label: "Orders", href: "/admin/orders", requiresAdmin: true },
    { label: "Customers", href: "/admin/customers", requiresAdmin: true },
  ],
};

const ROLE_META: Record<Audience, { label: string; chip: string; blurb: string }> = {
  guest: {
    label: "Guest",
    chip: "border-slate-200 bg-white/70 text-slate-700",
    blurb: "Preview the storefront experience.",
  },
  customer: {
    label: "Customer",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
    blurb: "Track orders and manage perks.",
  },
  admin: {
    label: "Administrator",
    chip: "border-sky-200 bg-sky-50 text-sky-700",
    blurb: "Full access to the back office.",
  },
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const user = useAuth((s) => s.user);
  const hydrate = useAuth((s) => s.hydrate);
  const logout = useAuth((s) => s.logout);
  const isAdmin = user?.role === "administrator";
  const audience: Audience = isAdmin ? "admin" : user ? "customer" : "guest";
  const navItems = NAV_LINKS[audience];
  const roleMeta = ROLE_META[audience];
  const cartCount = useCart((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const navContainerRef = useRef<HTMLDivElement | null>(null);
  const navRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{ width: number; left: number } | null>(null);

  const updateIndicator = useCallback(() => {
    const activeItem = navItems.find((item) => item.href && isActive(pathname, item));
    const container = navContainerRef.current;
    if (!activeItem || !container) {
      setIndicatorStyle(null);
      return;
    }
    const target = navRefs.current[activeItem.label];
    if (!target) {
      setIndicatorStyle(null);
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    setIndicatorStyle({
      width: targetRect.width,
      left: targetRect.left - containerRect.left,
    });
  }, [navItems, pathname]);

  const navClasses = useMemo(
    () =>
      cn(
        "relative z-10 px-3 py-1.5 text-sm font-semibold text-slate-600 transition-colors",
        "hover:text-sky-800",
        "data-[active=true]:text-sky-600"
      ),
    []
  );

  // subtle style on scroll (mobile & desktop)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    navRefs.current = {};
  }, [audience]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  useEffect(() => {
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  const handleNavigate = (item: NavItem) => {
    if (item.action === "logout") {
      handleLogout();
      return;
    }
    if (!item.href) return;
    if (item.requiresAuth && !user) {
      notifyInfo("Sign in required", "Log in to continue to this page.");
      router.push(`/login?next=${encodeURIComponent(item.href)}`);
      setSheetOpen(false);
      return;
    }
    if (item.requiresAdmin && !isAdmin) {
      notifyInfo("Admin only", "Switch to an admin account to reach this view.");
      router.push("/");
      setSheetOpen(false);
      return;
    }
    router.push(item.href);
    setSheetOpen(false);
  };

  const handleLogout = () => {
    logout();
    setSheetOpen(false);
    router.push("/");
    notifySuccess("Signed out", "You are safely logged out.");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-white/40 bg-white/75 backdrop-blur-xl transition-shadow",
        scrolled ? "shadow-lg" : "shadow-sm"
      )}>
      <div className='mx-auto flex items-center gap-4 px-4 py-3 lg:px-8'>
        <div className='flex flex-1 items-center gap-3 lg:gap-6'>
          <div className='md:hidden'>
            <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant='ghost' aria-label='Toggle navigation'>
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side='left' className='flex w-[86vw] max-w-sm flex-col p-0'>
                <SheetHeader className='flex flex-row items-center justify-between border-b border-border px-4 py-3'>
                  <div className='flex items-center gap-3'>
                    <Image src='/logo.png' alt='Pulse Mobile logo' width={130} height={36} className='h-8 w-auto' />
                    <SheetTitle className='text-sm text-muted'>{roleMeta.blurb}</SheetTitle>
                  </div>
                  <Button variant='ghost' onClick={() => setSheetOpen(false)} aria-label='Close menu'>
                    <X />
                  </Button>
                </SheetHeader>

                <div className='space-y-6 px-4 py-5'>
                  <div className='flex items-center justify-between rounded-2xl border border-border/80 px-4 py-3'>
                    <div>
                      <p className='text-xs uppercase tracking-[0.3em] text-muted'>Mode</p>
                      <p className='text-sm font-semibold text-slate-900'>{roleMeta.label}</p>
                    </div>
                    <span className={cn("rounded-full px-3 py-1 text-xs font-medium", roleMeta.chip)}>
                      {roleMeta.label}
                    </span>
                  </div>

                  <nav className='space-y-2'>
                    {navItems.map((item) => (
                      <button
                        key={item.label}
                        type='button'
                        data-active={isActive(pathname, item)}
                        onClick={() => handleNavigate(item)}
                        className='flex w-full items-center justify-between rounded-2xl border border-border px-4 py-3 text-left text-sm font-medium text-slate-700 data-[active=true]:border-slate-900 data-[active=true]:bg-slate-900 data-[active=true]:text-white'>
                        <span>{item.label}</span>
                        <div className='flex items-center gap-2'>
                          {item.href === "/cart" && cartCount > 0 && (
                            <span className='rounded-full bg-sky-600 px-2 py-0.5 text-xs font-semibold text-white data-[active=false]:bg-sky-100 data-[active=false]:text-sky-700'>
                              {cartCount}
                            </span>
                          )}
                          {item.requiresAuth && !user && <Lock className='h-4 w-4 text-slate-400' />}
                        </div>
                      </button>
                    ))}
                  </nav>

                  {audience !== "admin" && (
                    <button
                      type='button'
                      onClick={() => handleNavigate({ label: "Cart", href: "/cart" })}
                      className='flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-800'>
                      <span>Cart quick view</span>
                      <span className='inline-flex items-center gap-2'>
                        <ShoppingCart className='h-4 w-4' />
                        <span className='rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700'>
                          {cartCount}
                        </span>
                      </span>
                    </button>
                  )}

                  {user ? (
                    <div className='space-y-3 rounded-2xl border border-border px-4 py-4 text-sm'>
                      <p className='text-muted'>Signed in as {user.first_name}</p>
                      <Button
                        variant='outline'
                        className='w-full justify-center'
                        onClick={() => handleNavigate({ label: "Profile", href: "/profile", requiresAuth: true })}>
                        <User className='mr-2 h-4 w-4' /> Profile
                      </Button>
                      <Button
                        className='w-full justify-center'
                        onClick={() => handleNavigate({ label: "Logout", action: "logout", requiresAuth: true })}>
                        <LogOut className='mr-2 h-4 w-4 text-red-700' /> Logout
                      </Button>
                    </div>
                  ) : (
                    <div className='space-y-2'>
                      <Button className='w-full' onClick={() => handleNavigate({ label: "Login", href: "/login" })}>
                        <LogIn className='mr-2 h-4 w-4' /> Login
                      </Button>
                      <Button variant='outline' className='w-full' onClick={() => router.push("/signup")}>
                        Create account
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link href='/' className='flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900'>
            <Image src='/logo.png' alt='Pulse Mobile logo' width={150} height={40} className='h-9 w-auto' />
            <span className='text-sky-600'>Pulse Mobile</span>
          </Link>
        </div>

        <div className='hidden flex-1 justify-center md:flex'>
          <div ref={navContainerRef} className='relative flex items-center gap-6  px-6 py-2'>
            {indicatorStyle && (
              <span
                className='pointer-events-none absolute bottom-1 left-0 z-0 h-0.5 rounded-full bg-sky-500 transition-all duration-300 ease-out'
                style={{
                  width: indicatorStyle.width,
                  transform: `translateX(${indicatorStyle.left}px)`,
                }}
              />
            )}
            {navItems.map((item) => (
              <button
                key={item.label}
                ref={(el) => {
                  navRefs.current[item.label] = el ?? null;
                }}
                type='button'
                data-active={isActive(pathname, item)}
                onClick={() => handleNavigate(item)}
                className={navClasses}>
                <span>{item.label}</span>
                {item.href === "/cart" && cartCount > 0 && (
                  <span className='ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700'>
                    {cartCount}
                  </span>
                )}
                {item.requiresAuth && !user}
              </button>
            ))}
          </div>
        </div>

        <div className='hidden flex-1 items-center justify-end gap-3 md:flex'>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
              roleMeta.chip
            )}>
            {roleMeta.label}
          </span>
          {audience !== "admin" && (
            <button
              type='button'
              onClick={() => handleNavigate({ label: "Cart", href: "/cart" })}
              className='relative  inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border text-slate-600 hover:text-slate-900'>
              <ShoppingCart className='h-5 w-5' />
              <span className='sr-only'>Cart</span>
              {cartCount > 0 && (
                <span className='absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-sky-600 px-1 text-[10px] font-semibold text-white'>
                  {cartCount}
                </span>
              )}
            </button>
          )}
          {user ? (
            <>
              <Button
                variant='ghost'
                className='text-sm text-slate-700'
                onClick={() => handleNavigate({ label: "Profile", href: "/profile", requiresAuth: true })}>
                <User className='mr-2 h-4 w-4' /> Profile
              </Button>
              <Button
                variant='outline'
                onClick={() => handleNavigate({ label: "Logout", action: "logout", requiresAuth: true })}>
                <LogOut className='mr-2 h-4 w-4 text-red-700' /> Logout
              </Button>
            </>
          ) : (
            <Button
              className='text-white shadow-sm hover:bg-slate-800'
              onClick={() => handleNavigate({ label: "Login", href: "/login" })}>
              <LogIn className='mr-2 h-4 w-4' /> Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function isActive(pathname: string | null, item: NavItem) {
  if (!item.href || !pathname) {
    return false;
  }
  if (item.href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(item.href);
}
