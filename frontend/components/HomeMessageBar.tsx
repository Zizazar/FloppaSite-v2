'use client';

import { usePathname } from 'next/navigation';
import { MessageBar } from '@/components/MessageBar';

// Показываем плашку с таймером только на главной странице.
// Вынесено в клиентский компонент, т.к. layout — серверный и не может
// надёжно определить текущий путь (раньше здесь был неработавший window.location).
export default function HomeMessageBar() {
  const pathname = usePathname();
  if (pathname !== '/') return null;
  return <MessageBar />;
}
