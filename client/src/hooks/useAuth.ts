import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { User } from "@shared/schema";

export function useAuth() {
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loggedOut = localStorage.getItem('docuai_logged_out');
    setIsLoggedOut(loggedOut === 'true');
  }, []);

  // Simple check without automatic retries
  const { data: user, isLoading, refetch } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled: false, // Never auto-fetch
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: Infinity,
  });

  // Manual auth check function
  const checkAuth = async () => {
    if (isLoggedOut) return null;
    try {
      const result = await refetch();
      if (result.data) {
        // Successfully authenticated
        localStorage.removeItem('docuai_logged_out');
        setIsLoggedOut(false);
      }
      return result;
    } catch (error) {
      // Only set logged out if it's actually a 401 error
      if (error?.message?.includes('401')) {
        setIsLoggedOut(true);
        localStorage.setItem('docuai_logged_out', 'true');
      }
      return null;
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !isLoggedOut,
    checkAuth,
    logout: () => {
      localStorage.setItem('docuai_logged_out', 'true');
      setIsLoggedOut(true);
      queryClient.clear();
      window.location.href = '/api/logout';
    },
    login: async () => {
      localStorage.removeItem('docuai_logged_out');
      setIsLoggedOut(false);
      await checkAuth();
    },
    refreshAuth: checkAuth
  };
}