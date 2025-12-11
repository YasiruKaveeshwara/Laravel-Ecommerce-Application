"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type Slide = {
	id: number;
	brand: string;
	title: string;
	description: string;
	image: string;
	accent: string;
	badge: string;
};

const SLIDES: Slide[] = [
	{
		id: 1,
		brand: "Samsung",
		title: "Galaxy S24 Ultra",
		description:
			"200MP ProVision camera, Snapdragon 8 Elite, and a brighter 6.8-inch Adaptive AMOLED with S Pen built in.",
		image: "/hero/device1.webp",
		accent: "from-[#dbeafe] via-[#eff6ff] to-[#e0f2fe]",
		badge: "New Titan Gray",
	},
	{
		id: 2,
		brand: "Apple",
		title: "iPhone 16 Pro Max",
		description:
			"A18 Pro Neural Engine, 5× tetraprism camera, ProMotion 120Hz, and all‑day battery tuned for creators.",
		image: "/hero/device2.jpg",
		accent: "from-[#ffe4e6] via-[#fff1f2] to-[#fce7f3]",
		badge: "Color: Mist",
	},
	{
		id: 3,
		brand: "Google",
		title: "Pixel 9 Pro",
		description: "Pixel Neural Core, Best Take, and triple camera with Ultra HDR — ready for clean Android 15.",
		image: "/hero/device3.jpg",
		accent: "from-[#ecfeff] via-[#e0f2fe] to-[#e0f7ff]",
		badge: "AI-first",
	},
];

export function HeroBanner() {
	const [index, setIndex] = useState(0);
	const slides = useMemo(() => SLIDES, []);

	useEffect(() => {
		const timer = setInterval(() => {
			setIndex((prev) => (prev + 1) % slides.length);
		}, 6000);
		return () => clearInterval(timer);
	}, [slides.length]);

	const current = slides[index];
	const goTo = (next: number) => {
		const length = slides.length;
		const normalized = (next + length) % length;
		setIndex(normalized);
	};

	return (
		<section className='relative w-full overflow-hidden rounded-[36px] bg-card shadow-card'>
			<div
				className={cn(
					"grid gap-6 px-6 py-6 lg:grid-cols-2 sm:grid-cols-1 lg:gap-10",
					`bg-linear-to-r ${current.accent}`
				)}>
				<div className='space-y-4 pr-2 lg:pr-6'>
					<p className='text-sm font-semibold uppercase tracking-[0.35em] text-sky-600'>{current.brand}</p>
					<h1 className='text-4xl font-semibold leading-tight text-slate-900 lg:text-5xl'>{current.title}</h1>
					<p className='max-w-2xl text-base text-slate-600 lg:text-lg'>{current.description}</p>
					<div className='flex flex-wrap items-center gap-2 text-sm text-slate-700'>
						<span className='inline-flex items-center rounded-full bg-white/80 px-3 py-1 font-semibold text-slate-800 shadow-sm'>
							{current.badge}
						</span>
					</div>
					<div className='mt-4 flex items-center gap-2'>
						{slides.map((slide, dotIndex) => (
							<button
								key={slide.id}
								type='button'
								onClick={() => goTo(dotIndex)}
								className={cn(
									"h-1.5 w-8 rounded-full transition-all",
									dotIndex === index ? "bg-slate-900" : "bg-white/50"
								)}
								aria-label={`Go to slide ${dotIndex + 1}`}
							/>
						))}
					</div>
				</div>

				<div className='relative flex items-center justify-center'>
					<div className='relative w-full max-w-xl overflow-hidden rounded-4xl bg-white/70 p-4 shadow-card'>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={current.image} alt={current.title} className='h-[200px] w-full rounded-3xl object-cover' />
						<div className='absolute inset-0 pointer-events-none rounded-3xl ring-1 ring-black/5' />
					</div>
				</div>
			</div>
		</section>
	);
}
