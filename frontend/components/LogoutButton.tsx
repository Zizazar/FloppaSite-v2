'use client';

import { useRouter } from 'next/navigation';
import { useLogout } from '@/hooks/use-api';

interface LogoutButtonProps {
  className?: string;
  children: React.ReactNode;
}

// Кнопка выхода. Стили/содержимое задаёт вызывающий (className + children),
// чтобы переиспользовать её в разных местах без изменения дизайна.
export default function LogoutButton({ className, children }: LogoutButtonProps) {
  const router = useRouter();
  const { mutate, isPending } = useLogout();

  const handleLogout = () => {
    mutate(undefined, {
      // Редиректим в любом случае — даже если сессия уже истекла на бэкенде.
      onSettled: () => {
        router.push('/');
        router.refresh();
      },
    });
  };

  return (
    <button type="button" onClick={handleLogout} disabled={isPending} className={className}>
      {children}
    </button>
  );
}
