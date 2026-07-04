// Индустриальный подход: typed hooks для всех API операций
'use client';

import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useClient } from '@hey-api/client-next';
import type { Options } from '@hey-api/client-next';
import {
  getUserProfile,
  changeUsername,
  changePassword,
  getUser,
  listUsers,
  healthCheckGet,
  login,
  register,
  uploadSkin,
  getSkinByName,
  getSkinByUuid,
} from '../client/sdk.gen';
import type {
  GetUserProfileData,
  ChangeUsernameData,
  ChangeUsernameError,
  ChangePasswordData,
  ChangePasswordError,
  GetUserData,
  DeleteUserData,
  ListUsersData,
  LoginData,
  RegisterData,
  UploadSkinData,
  GetSkinByNameData,
  GetSkinByUuidData,
} from '../client/types.gen';

// Query keys factory
export const apiKeys = {
  profile: () => ['profile'] as const,
  user: (id: string) => ['user', id] as const,
  users: () => ['users'] as const,
  health: () => ['health'] as const,
  skin: (by: 'name' | 'uuid', value: string) => ['skin', by, value] as const,
};

// Хук для профиля
export const useProfile = () => {
  return useQuery({
    queryKey: apiKeys.profile(),
    queryFn: () => getUserProfile({}),
    staleTime: 1000 * 60 * 5, // 5 мин
  });
};

// Хук для списка пользователей
export const useUsers = () => {
  return useQuery({
    queryKey: apiKeys.users(),
    queryFn: () => listUsers({}),
    staleTime: 1000 * 60 * 2,
  });
};

// Хук для отдельного пользователя
export const useUser = (id: string) => {
  return useQuery({
    queryKey: apiKeys.user(id),
    queryFn: () => getUser({ path: { user_id: id } }),
    enabled: !!id,
  });
};

// Хук для health check
export const useHealthCheck = () => {
  return useQuery({
    queryKey: apiKeys.health(),
    queryFn: () => healthCheckGet({}),
    refetchInterval: 30000,
    retry: 3,
  });
};

// Хук для скина по имени
export const useSkinByName = (username: string, enabled = true) => {
  return useQuery({
    queryKey: apiKeys.skin('name', username),
    queryFn: () => getSkinByName({ path: { username } }),
    enabled: enabled && !!username,
    staleTime: 1000 * 60 * 10,
  });
};

// Хук для скина по UUID
export const useSkinByUuid = (uuid: string, enabled = true) => {
  return useQuery({
    queryKey: apiKeys.skin('uuid', uuid),
    queryFn: () => getSkinByUuid({ path: { uuid } }),
    enabled: enabled && !!uuid,
    staleTime: 1000 * 60 * 10,
  });
};

// Мутация: обновление имени пользователя
export const useChangeUsername = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { username: string }) =>
      changeUsername({ body: { username: data.username } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeys.profile() });
      queryClient.invalidateQueries({ queryKey: apiKeys.users() });
    },
  });
};

// Мутация: обновление пароля
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      changePassword({ body: data }),
  });
};

// Мутация: вход
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginData) => login({ body: data }),
    onSuccess: (data) => {
      if (data.data?.access_token) {
        localStorage.setItem('auth_token', data.data.access_token);
        queryClient.invalidateQueries();
      }
    },
  });
};

// Мутация: регистрация
export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterData) => register({ body: data }),
  });
};

// Мутация: загрузка скина
export const useUploadSkin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) =>
      uploadSkin({ body: { file: data.get('file') as File } }),
    onSuccess: (_, variables) => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries();
    },
  });
};

// Универсальный хук для кастомных запросов с клиентом
export const useApiClient = <TData, TResponse, TError>(
  operation: (options: Options<TData>) => Promise<{ data?: TResponse }>,
  key: QueryKey,
  options?: Parameters<typeof useQuery>[1]
) => {
  const { client } = useClient();

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const result = await operation({});
      return result.data as TResponse | undefined;
    },
    ...options,
  });
};