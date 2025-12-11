import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";

export const metadata = { title: "Orange", description: "Modern ecommerce experience" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en'>
			<body className='min-h-screen bg-bg text-text antialiased'>
				<Navbar />
				<main className='w-full px-6 lg:px-12 py-10 space-y-10'>{children}</main>
				<Footer />
				<Toaster />
			</body>
		</html>
	);
}
