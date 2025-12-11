import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export default function NotFound() {
	return (
		<div className='flex  items-center justify-center'>
			<div className='w-full max-w-lg rounded-3xl border border-slate-200 bg-white px-8 py-10 text-center shadow-lg shadow-slate-200/60'>
				<div className='flex flex-col items-center gap-3 text-sm font-semibold uppercase tracking-[0.25em] text-sky-500'>
					<ShoppingBag className='h-4 w-4 text-sky-500' />
					Page not found
				</div>
				<h1 className='mt-3 text-4xl font-bold tracking-tight text-slate-900'>We couldn&apos;t find that page</h1>
				<p className='mt-3 text-base text-slate-600'>
					The link might be incorrect or the page was moved. Try heading back to the main shop.
				</p>
				<div className='mt-6 flex justify-center'>
					<Link
						href='/'
						className='inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800'>
						<ArrowLeft className='h-4 w-4' />
						Back to home
					</Link>
				</div>
			</div>
		</div>
	);
}
