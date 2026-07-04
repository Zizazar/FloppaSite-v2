'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile, type UserResponse } from "@/client";

export function useUser() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarTimestamp, setAvatarTimestamp] = useState(() => Date.now());
  const router = useRouter();

  useEffect(() => {
    let active = true;

    async function loadUser() {
      const { data, error } = await getUserProfile();
      if (!active) return;

      if (error || !data) {
        router.replace("/login");
        return;
      }
      setUser(data);
      setIsLoading(false);
    }

    loadUser();
    return () => {
      active = false;
    };
  }, [router]);

  // Вызываем после загрузки нового скина, чтобы обновить закэшированную картинку.
  const updateAvatarCache = () => setAvatarTimestamp(Date.now());

  return { user, setUser, isLoading, avatarTimestamp, updateAvatarCache };
}
