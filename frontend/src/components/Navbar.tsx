"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingCart, LogIn, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth";
import { notifySuccess } from "@/lib/notify";

const STORE_LINKS = [
  { href: "/products", label: "Phones" },
  { href: "/bundles", label: "Bundles" },
  { href: "/trade-in", label: "Trade-in" },
  { href: "/support", label: "Support" },
];

const ADMIN_LINKS = [
  { href: "/admin", label: "Storefront" },
  { href: "/admin/products", label: "Inventory" },
  { href: "/admin/products/new", label: "Add Product" },
  { href: "/admin/customers", label: "Customers" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const user = useAuth((s) => s.user);
  const hydrate = useAuth((s) => s.hydrate);
  const logout = useAuth((s) => s.logout);
  const isAdmin = user?.role === "administrator";
  const navLinks = isAdmin ? ADMIN_LINKS : STORE_LINKS;

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

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur",
        scrolled && "shadow-card"
      )}>
      <div className='w-full px-6 lg:px-12'>
        <div className='h-14 flex items-center gap-3'>
          {/* Mobile: menu button */}
          <div className='md:hidden'>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant='ghost' aria-label='Open menu'>
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side='left' className='w-[88vw] p-0'>
                <SheetHeader className='p-4 border-b border-border flex-row items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Image src='/logo.png' alt='Pulse Mobile logo' width={140} height={40} className='h-8 w-auto' />
                    <SheetTitle className='text-base'>Browse</SheetTitle>
                  </div>
                  <Button variant='ghost' onClick={() => setOpen(false)} aria-label='Close menu'>
                    <X />
                  </Button>
                </SheetHeader>

                {/* Mobile nav links */}
                <nav className='p-2'>
                  {navLinks.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-xl px-4 py-3 text-sm",
                        pathname?.startsWith(c.href)
                          ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "hover:bg-black/5 dark:hover:bg-white/5"
                      )}>
                      {c.label}
                    </Link>
                  ))}
                </nav>

                <div className='border-t border-border p-4 space-y-3 text-sm'>
                  {user ? (
                    <div className='flex flex-col gap-3'>
                      <p className='text-muted'>Signed in as {user.first_name}</p>
                      {isAdmin ? (
                        <p className='rounded-xl border border-dashed border-sky-200 bg-sky-50 px-3 py-2 text-sky-700'>
                          Admin access active
                        </p>
                      ) : (
                        <p className='rounded-xl border border-dashed border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700'>
                          Customer perks unlocked
                        </p>
                      )}
                      <Button
                        variant='outline'
                        onClick={() => {
                          logout();
                          setOpen(false);
                          router.push("/");
                          notifySuccess("Signed out", "You are safely logged out.");
                        }}>
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className='flex flex-col gap-2'>
                      <Button onClick={() => router.push("/login")}>Sign in</Button>
                      <Button variant='outline' onClick={() => router.push("/signup")}>
                        Create account
                      </Button>
                    </div>
                  )}
                </div>

                {user && (
                  <button
                    type='button'
                    onClick={() => {
                      setOpen(false);
                      router.push("/profile");
                    }}
                    className='mx-4 mb-4 flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-left text-sm shadow-card'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600'>
                      <User className='h-5 w-5' />
                    </div>
                    <div>
                      <p className='font-semibold text-slate-900'>{user.first_name}</p>
                      <p className='text-xs text-muted'>Profile & settings</p>
                    </div>
                  </button>
                )}
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link href='/' className='flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900'>
            <Image src='/logo.png' alt='Pulse Mobile logo' width={160} height={44} className='h-9 w-auto' />
            <span className='text-sky-600'>Pulse Mobile</span>
          </Link>

          {/* Desktop nav */}
          <nav className='hidden md:flex items-center gap-2 ml-4'>
            {navLinks.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-sm",
                  pathname?.startsWith(c.href)
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                )}
                aria-current={pathname?.startsWith(c.href) ? "page" : undefined}>
                {c.label}
              </Link>
            ))}
          </nav>

          {/* Spacer */}
          <div className='flex-1' />

          {/* Actions */}
          <div className='flex items-center gap-2'>
            {user ? (
              <>
                <Link
                  href='/profile'
                  className='hidden md:inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border text-slate-600 hover:text-sky-600'>
                  <User className='h-5 w-5' />
                </Link>
                {isAdmin ? (
                  <Link href='/admin/products' className='hidden md:inline-flex text-sm text-muted hover:text-sky-600'>
                    Admin Console
                  </Link>
                ) : (
                  <Link href='/orders' className='hidden md:inline-flex text-sm text-muted hover:text-sky-600'>
                    My Orders
                  </Link>
                )}
                <span className='hidden md:inline text-sm text-muted'>Hi, {user.first_name}</span>
                <Button
                  variant='outline'
                  onClick={() => {
                    logout();
                    router.push("/");
                    notifySuccess("Signed out", "See you next time.");
                  }}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href='/login' aria-label='Sign in'>
                  <Button variant='outline' className='hidden md:inline-flex'>
                    <LogIn className='h-4 w-4 mr-2' />
                    Sign in
                  </Button>
                </Link>
                <Link href='/signup' className='hidden md:inline-flex'>
                  <Button>Create account</Button>
                </Link>
              </>
            )}

            {!isAdmin && (
              <Link href='/cart' aria-label='Cart'>
                <Button variant='ghost' className='relative'>
                  <ShoppingCart className='h-5 w-5' />
                  <span
                    aria-hidden
                    className='absolute -right-1 -top-1 text-[10px] min-w-[16px] h-[16px] px-1 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center'>
                    0
                  </span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
