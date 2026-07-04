import Link from "next/link";
import Image from "next/image";
import { User, LogIn, ShieldAlert } from "lucide-react";
import miniLogo from "@/assets/FloppaLand_mini_logo.png";
import UserMenu from "./UserMenu";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-zinc-950/80 backdrop-blur-md border-b border-green-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <Image 
                src={miniLogo} 
                alt="FloppaLand Mini Logo" 
                width={200}
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/#start" className="text-zinc-300 hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Как начать</Link>
               <Link href="/#info" className="text-zinc-300 hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">О сервере</Link>
              <Link href="/#mods" className="text-zinc-300 hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Моды</Link>
              <Link href="/archive" className="text-zinc-300 hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Архив</Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <UserMenu></UserMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
