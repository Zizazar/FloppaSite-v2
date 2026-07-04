import type { Metadata } from 'next';
import { Inter, Space_Grotesk, Geist } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { MessageBar } from '@/components/MessageBar';
import ClientAuth from '@/components/ClientAuth';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'FloppaLand - Minecraft Server',
  description: 'Присоединяйся к нашему Minecraft проекту FloppaLand!',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={cn("scroll-smooth", space.variable, "font-sans", geist.variable)}>
      <body className="bg-zinc-950 text-zinc-50 font-sans antialiased selection:bg-green-500/30 selection:text-green-200" suppressHydrationWarning>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <ClientAuth />
          {/* if page is home page then show message bar */}
          {typeof window !== 'undefined' && window.location.pathname === "/" && <MessageBar />}
          <main className="flex-grow">
            {children}
          </main>
          <footer className="py-8 text-center text-zinc-500 text-sm border-t border-white/5">
            <p>&copy; {new Date().getFullYear()} FloppaLand. Все права защищены.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
