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
      try {
        // Clear localStorage flag
        localStorage.removeItem('docuai_logged_out');
        setIsLoggedOut(false);
        
        // Call the login endpoint to clear session logout flag
        await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        // Refetch user data to update authentication state
        await refetch();
        queryClient.invalidateQueries();
      } catch (error) {
        console.error('Login failed:', error);
        // Reset logout state if login fails
        localStorage.setItem('docuai_logged_out', 'true');
        setIsLoggedOut(true);
      }
    },
    refreshAuth: async () => {
      await refetch();
    }
  };
}
