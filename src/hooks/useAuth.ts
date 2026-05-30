import { useCallback } from "react";
import { trpc } from "@/providers/trpc";

export function useAuth() {
  const utils = trpc.useUtils();
  const meQuery = trpc.localAuth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: () => {
      utils.localAuth.me.invalidate();
    },
  });
  const logoutMutation = trpc.localAuth.logout.useMutation({
    onSuccess: () => {
      utils.localAuth.me.invalidate();
    },
  });

  const isLoading = meQuery.isLoading || loginMutation.isPending;
  const isAuthenticated = meQuery.data?.authenticated ?? false;
  const userRole = (meQuery.data?.role as string) || "";
  const isAdmin = isAuthenticated && userRole === "admin";
  const isManager = isAuthenticated && (userRole === "admin" || userRole === "manager");
  const userName = (meQuery.data?.username as string) || "";

  const login = useCallback(
    async (username: string, password: string) => {
      const result = await loginMutation.mutateAsync({ username, password });
      if (result.success && result.token) {
        localStorage.setItem('auth_token', result.token);
      }
      return result;
    },
    [loginMutation]
  );

  const logout = useCallback(async () => {
    localStorage.removeItem('auth_token');
    await logoutMutation.mutateAsync();
    window.location.reload();
  }, [logoutMutation]);

  return {
    isLoading,
    isAuthenticated,
    isAdmin,
    isManager,
    userRole,
    userName,
    login,
    logout,
  };
}
