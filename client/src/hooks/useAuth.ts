import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { User } from "@shared/schema";

export function useAuth() {
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const queryClient = useQueryClient();

  // Simple check without automatic retries - DISABLE FOR NOW TO STOP REQUEST LOOP
  const { data: user, isLoading, refetch } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled: false, // DISABLED - stop the request spam
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    const loggedOut = localStorage.getItem('docuai_logged_out');
    setIsLoggedOut(loggedOut === 'true');
    
    // Listen for login success events
    const handleLoginSuccess = async () => {
      setIsLoggedOut(false);
      localStorage.removeItem('docuai_logged_out');
      
      // Test auth manually with session cookie
      console.log('Login success event received, testing auth...');
      console.log('Document cookies:', document.cookie);
      
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        console.log('Manual auth test status:', response.status);
        console.log('Manual auth test headers sent:', response.request?.headers);
        
        if (response.ok) {
          const userData = await response.json();
          console.log('Manual auth test SUCCESS:', userData.email);
          // Manually update the query cache
          queryClient.setQueryData(["/api/auth/user"], userData);
        } else {
          console.log('Manual auth test FAILED:', response.status);
          const errorData = await response.text();
          console.log('Error response:', errorData);
        }
      } catch (error) {
        console.error('Manual auth test ERROR:', error);
      }
    };
    
    window.addEventListener('login-success', handleLoginSuccess);
    return () => window.removeEventListener('login-success', handleLoginSuccess);
  }, [refetch]);

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