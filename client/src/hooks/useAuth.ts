import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function useAuth() {
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loggedOut = localStorage.getItem('docuai_logged_out');
    setIsLoggedOut(loggedOut === 'true');
  }, []);

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !isLoggedOut,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !isLoggedOut,
    logout: () => {
      localStorage.setItem('docuai_logged_out', 'true');
      setIsLoggedOut(true);
      queryClient.clear();
      window.location.href = '/api/logout';
    },
    login: async () => {
      localStorage.removeItem('docuai_logged_out');
      setIsLoggedOut(false);
      // Refetch user data instead of reloading the page
      await refetch();
      queryClient.invalidateQueries();
    },
    refreshAuth: async () => {
      await refetch();
    }
  };
}
