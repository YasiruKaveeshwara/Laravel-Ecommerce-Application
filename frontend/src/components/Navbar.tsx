"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingCart, LogIn, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// simple, editable categories
const CATEGORIES = [
  { href: "/products", label: "Phones" },
  { href: "/bundles", label: "Bundles" },
  { href: "/trade-in", label: "Trade-in" },
  { href: "/support", label: "Support" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // subtle style on scroll (mobile & desktop)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    setOpen(false);
    if (query) router.push(`/?q=${encodeURIComponent(query)}`);
  };

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
                  <SheetTitle className='text-base'>Browse</SheetTitle>
                  <Button variant='ghost' onClick={() => setOpen(false)} aria-label='Close menu'>
                    <X />
                  </Button>
                </SheetHeader>

                {/* Mobile search */}
                <form onSubmit={onSearch} className='p-4 border-b border-border flex gap-2'>
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder='Search products'
                    aria-label='Search products'
                  />
                  <Button type='submit' aria-label='Search'>
                    <Search className='mr-2 h-4 w-4' />
                    Search
                  </Button>
                </form>

                {/* Mobile nav links */}
                <nav className='p-2'>
                  {CATEGORIES.map((c) => (
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
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link href='/' className='text-lg font-semibold tracking-tight text-sky-600'>
            Pulse Mobile
          </Link>

          {/* Desktop nav */}
          <nav className='hidden md:flex items-center gap-2 ml-4'>
            {CATEGORIES.map((c) => (
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

          {/* Desktop search */}
          <form onSubmit={onSearch} className='hidden md:flex items-center gap-2 w-[320px]'>
            <div className='relative flex-1'>
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder='Search products'
                aria-label='Search products'
                className='pl-9'
              />
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none' />
            </div>
            <Button type='submit' aria-label='Search'>
              Search
            </Button>
          </form>

          {/* Actions */}
          <div className='flex items-center gap-2'>
            <Link href='/login' aria-label='Sign in'>
              <Button variant='outline' className='hidden md:inline-flex'>
                <LogIn className='h-4 w-4 mr-2' />
                Sign in
              </Button>
            </Link>

            <Link href='/cart' aria-label='Cart'>
              <Button variant='ghost' className='relative'>
                <ShoppingCart className='h-5 w-5' />
                {/* cart badge placeholder */}
                <span
                  aria-hidden
                  className='absolute -right-1 -top-1 text-[10px] min-w-[16px] h-[16px] px-1 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center'>
                  0
                </span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile search under the bar (optional alternative) */}
        {/* <div className="md:hidden py-2">
          <form onSubmit={onSearch} className="flex gap-2">
            <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search products" aria-label="Search products"/>
            <Button type="submit" aria-label="Search"><Search className="h-4 w-4"/></Button>
          </form>
        </div> */}
      </div>
    </header>
  );
}
