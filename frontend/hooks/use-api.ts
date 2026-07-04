'use client';

// Типизированные хуки поверх сгенерированного SDK (@/client).
// Аутентификация — через HttpOnly-куку access_token (см. lib/api-client.ts),
// поэтому здесь НЕТ работы с токенами/localStorage: куки прикрепляются браузером
// автоматически к запросам на /api/* (проксируются на бэкенд в next.config.ts).

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  changePassword,
  changeUsername,
  getUser,
  getUserProfile,
  listUsers,
  login,
  logout,
  register,
  uploadSkin,
} from '@/client';
import type {
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  UserResponse,
} from '@/client';

// ---------------------------------------------------------------------------
// Query keys — единая фабрика ключей кэша
// ---------------------------------------------------------------------------
export const apiKeys = {
  profile: () => ['profile'] as const,
  users: () => ['users'] as const,
  user: (id: number) => ['user', id] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Текущий авторизованный пользователь (GET /user/me). */
export const useCurrentUser = () =>
  useQuery({
    queryKey: apiKeys.profile(),
    queryFn: async (): Promise<UserResponse> => {
      const { data } = await getUserProfile({ throwOnError: true });
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: false, // 401 не имеет смысла ретраить
  });

/** Список пользователей (для админки). */
export const useUsers = () =>
  useQuery({
    queryKey: apiKeys.users(),
    queryFn: async () => {
      const { data } = await listUsers({ throwOnError: true });
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });

/** Один пользователь по id. */
export const useUserById = (userId: number, enabled = true) =>
  useQuery({
    queryKey: apiKeys.user(userId),
    queryFn: async () => {
      const { data } = await getUser({ path: { user_id: userId }, throwOnError: true });
      return data;
    },
    enabled: enabled && Number.isFinite(userId),
  });

// ---------------------------------------------------------------------------
// Auth mutations
// ---------------------------------------------------------------------------

/** Вход. Бэкенд ставит HttpOnly-куку, поэтому токен здесь не сохраняем. */
export const useLogin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: LoginRequest) => {
      const { data } = await login({ body, throwOnError: true });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeys.profile() }),
  });
};

/** Регистрация. */
export const useRegister = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: RegisterRequest) => {
      const { data } = await register({ body, throwOnError: true });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeys.profile() }),
  });
};

/** Выход. Бэкенд удаляет куку; чистим весь кэш. */
export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await logout({ throwOnError: true });
    },
    onSuccess: () => qc.clear(),
  });
};

// ---------------------------------------------------------------------------
// Profile mutations
// ---------------------------------------------------------------------------

export const useChangeUsername = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      const { data } = await changeUsername({ query: { username }, throwOnError: true });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: apiKeys.profile() });
      qc.invalidateQueries({ queryKey: apiKeys.users() });
    },
  });
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: async (body: ChangePasswordRequest) => {
      const { data } = await changePassword({ body, throwOnError: true });
      return data;
    },
  });

export const useUploadSkin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: Blob | File) => {
      const { data } = await uploadSkin({ body: { file }, throwOnError: true });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: apiKeys.profile() }),
  });
};
