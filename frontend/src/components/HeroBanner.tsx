"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Slide = {
  id: number;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  accent: string;
  badge: string;
};

const SLIDES: Slide[] = [
  {
    id: 1,
    eyebrow: "5G EXCLUSIVE",
    title: "Nova X Ultra bundle",
    description: "Upgrade to the Nova X Ultra with 1TB storage, AI camera suite, and a bonus pair of WaveBuds Pro.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=960&q=80",
    accent: "from-[#dbeafe] via-[#eff6ff] to-[#e0f2fe]",
    badge: "Save $250",
  },
  {
    id: 2,
    eyebrow: "LAUNCH WEEK",
    title: "Galaxy Fold Inspire",
    description: "Pre-order Samsung's thinnest foldable yet with instant screen replacement and case bundle.",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=960&q=80",
    accent: "from-[#c7d2fe] via-[#e0e7ff] to-[#bfdbfe]",
    badge: "Ships June 14",
  },
  {
    id: 3,
    eyebrow: "APPLE CARE+ INCLUDED",
    title: "iPhone 16 Pro Max",
    description: "Titanium finish, A18 Pro Neural Engine, 120Hz ProMotion display — delivered with instant activation.",
    image: "https://images.unsplash.com/photo-1512499617640-c2f999098c01?auto=format&fit=crop&w=960&q=80",
    accent: "from-[#cbd5f5] via-[#e4ecff] to-[#d9f3ff]",
    badge: "New color: Ice",
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
  const words = current.title.split(" ");
  const primaryTitle = words.slice(0, 3).join(" ") || current.title;
  const secondaryTitle = words.slice(3).join(" ");

  const goTo = (next: number) => {
    const length = slides.length;
    const normalized = (next + length) % length;
    setIndex(normalized);
  };

  return (
    <section className='relative w-full overflow-hidden rounded-[36px] bg-card shadow-card'>
      <div className={cn("grid gap-10 px-6 py-10 lg:grid-cols-2", `bg-gradient-to-r ${current.accent}`)}>
        <div className='space-y-6 pr-6'>
          <p className='text-sm font-semibold uppercase tracking-[0.35em] text-sky-500'>{current.eyebrow}</p>
          <h1 className='text-4xl font-semibold leading-tight text-slate-900 lg:text-5xl'>
            {primaryTitle}
            {secondaryTitle && <span className='block text-sky-600'>{secondaryTitle}</span>}
          </h1>
          <p className='max-w-2xl text-base text-slate-600'>{current.description}</p>
          <div className='flex flex-wrap gap-3'>
            <Button className='h-11 px-6 text-base'>Shop phones</Button>
            <Button variant='outline' className='h-11 px-6 text-base border border-white/60 bg-white/70'>
              Build your plan
            </Button>
          </div>
          <dl className='grid grid-cols-3 gap-4 pt-2 text-sm text-slate-600'>
            <div>
              <dt className='text-xs uppercase tracking-wide text-slate-500'>Battery</dt>
              <dd className='text-2xl font-semibold text-sky-600'>36 hr</dd>
            </div>
            <div>
              <dt className='text-xs uppercase tracking-wide text-slate-500'>Storage</dt>
              <dd className='text-2xl font-semibold text-sky-600'>1 TB</dd>
            </div>
            <div>
              <dt className='text-xs uppercase tracking-wide text-slate-500'>Launch</dt>
              <dd className='text-2xl font-semibold text-sky-600'>2025</dd>
            </div>
          </dl>
        </div>

        <div className='relative flex items-center justify-center'>
          <div className='relative w-full max-w-xl overflow-hidden rounded-[44px] bg-white/70 p-4 shadow-card'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.image} alt={current.title} className='h-[360px] w-full rounded-[36px] object-cover' />
            <span className='absolute left-6 top-6 rounded-full bg-sky-600/90 px-4 py-1 text-sm font-semibold text-white'>
              {current.badge}
            </span>
          </div>
          <div className='absolute inset-x-0 bottom-6 flex items-center justify-center gap-2'>
            {slides.map((slide, dotIndex) => (
              <button
                key={slide.id}
                type='button'
                onClick={() => goTo(dotIndex)}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  dotIndex === index ? "w-10 bg-sky-500" : "w-3 bg-white/60"
                )}
                aria-label={`Go to slide ${dotIndex + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className='absolute inset-y-0 left-0 flex items-center px-4'>
        <button
          type='button'
          onClick={() => goTo(index - 1)}
          className='rounded-full bg-white/80 p-3 text-sky-600 shadow-card hover:bg-white'
          aria-label='Previous slide'>
          <ChevronLeft className='h-5 w-5' />
        </button>
      </div>
      <div className='absolute inset-y-0 right-0 flex items-center px-4'>
        <button
          type='button'
          onClick={() => goTo(index + 1)}
          className='rounded-full bg-white/80 p-3 text-sky-600 shadow-card hover:bg-white'
          aria-label='Next slide'>
          <ChevronRight className='h-5 w-5' />
        </button>
      </div>
    </section>
  );
}
