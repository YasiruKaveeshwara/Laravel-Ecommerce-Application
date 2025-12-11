import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export function Footer() {
	return (
		<footer className='border-t border-border/70 bg-linear-to-b from-white/90 via-[#eef4ff] to-[#d9e8ff]'>
			<div className='mx-auto space-y-4 py-6 px-10'>
				<div className=''>
					<div className='space-y-5 '>
						<div className='flex items-center'>
							<Image src='/logo.png' alt='Pulse Mobile logo' width={160} height={44} className='h-10 w-auto' />
							<div>
								<p className='text-sm font-semibold uppercase tracking-[0.28em] text-sky-600'>Pulse Mobile</p>
								<p className='text-sm text-muted'>Modern ecommerce for connected living.</p>
							</div>
						</div>
						<p className='max-w-4xl text-base text-slate-700'>
							Crafted for people who expect the best devices, transparent plans, and concierge-level support. Stay
							powered, protected, and connected everywhere you go.
						</p>
						<div className='flex flex-wrap gap-2'>
							{["Free 2-day delivery", "24/7 concierge", "Secure checkout"].map((item) => (
								<span
									key={item}
									className='inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 pt-1 text-xs font-semibold text-slate-700 shadow-card'>
									<span className='h-2 w-2 rounded-full bg-sky-500' aria-hidden />
									{item}
								</span>
							))}
						</div>
						<div className='flex flex-wrap gap-4 text-sm text-slate-700'>
							<span className='inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/80 px-3 py-2 shadow-card'>
								<MapPin className='h-4 w-4 text-sky-600' />
								Anywhere in Sri Lanka
							</span>
							<span className='inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/80 px-3 py-2 shadow-card'>
								<Phone className='h-4 w-4 text-sky-600' />
								94-800-PULSE-24
							</span>
							<span className='inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/80 px-3 py-2 shadow-card'>
								<Mail className='h-4 w-4 text-sky-600' />
								kaveeshwaray@gmail.com
							</span>
						</div>
					</div>
				</div>

				<div className='flex flex-col gap-4  text-sm text-slate-700 md:flex-row md:items-center md:justify-center'>
					<p>© 2025 Yasiru Kaveeshwara.</p>
					<div className='flex items-center gap-3'>
						{[
							{ icon: Facebook, label: "Facebook" },
							{ icon: Instagram, label: "Instagram" },
							{ icon: Twitter, label: "Twitter" },
							{ icon: Linkedin, label: "LinkedIn" },
						].map(({ icon: Icon, label }) => (
							<Link
								key={label}
								href='/'
								aria-label={label}
								className='grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white/80 text-slate-700 shadow-card transition hover:-translate-y-0.5 hover:text-sky-600'>
								<Icon className='h-4 w-4' />
							</Link>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
}
