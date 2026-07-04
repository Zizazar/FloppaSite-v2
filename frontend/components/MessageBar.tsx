'use client';

import { useScrollDirection } from "@/hooks/useScrollDirection";
import FlipClock from "@/components/8starlabs-ui/flip-clock";


export function MessageBar() {
  const isVisible = useScrollDirection();

  return (
    <div
      className={`fixed top-16 left-0 right-0 w-full bg-black/40 text-white text-center text-sm font-medium flex items-center justify-center transition-all duration-300 ease-in-out z-40 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <span className="px-4 text-lg font-bold">Время до начала сезона: </span>
      <FlipClock 
        size={"sm"} 
        className="py-2" 
        countdown={true} 
        targetDate={new Date(2026, 5, 22, 0, 14, 0)} 
        
      />
    </div>
  );
}
