import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getUserProfile, UserResponse } from "@/client";

export function useUser() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const { data, error } = await getUserProfile();
      if (error || !data) {
        router.push("/login");
        return;
      }
      setUser(data);
      setIsLoading(false);
    }
    loadUser();
  }, [router]);

  // Вызываем это после загрузки нового скина, чтобы обновить картинку
  const updateAvatarCache = () => setAvatarTimestamp(Date.now());

  return { user, setUser, isLoading, avatarTimestamp, updateAvatarCache };
}