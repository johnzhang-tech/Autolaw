import { useState, useEffect } from "react";

export function useAuthSimple() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const checkAuth = async () => {
    if (isLoggedOut) return null;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('docuai_token');
      if (!token) {
        setIsLoading(false);
        return null;
      }

      const response = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsLoggedOut(false);
        localStorage.removeItem('docuai_logged_out');
        setIsLoading(false);
        return userData;
      } else {
        setUser(null);
        setIsLoggedOut(true);
        localStorage.setItem('docuai_logged_out', 'true');
        setIsLoading(false);
        return null;
      }
    } catch (error) {
      setUser(null);
      setIsLoading(false);
      return null;
    }
  };

  useEffect(() => {
    const loggedOut = localStorage.getItem('docuai_logged_out');
    setIsLoggedOut(loggedOut === 'true');
    
    // Automatically check authentication when hook mounts
    if (loggedOut !== 'true') {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !isLoggedOut,
    checkAuth,
    logout: () => {
      localStorage.removeItem('docuai_token');
      localStorage.setItem('docuai_logged_out', 'true');
      setIsLoggedOut(true);
      setUser(null);
      window.location.href = '/';
    },
    login: async () => {
      localStorage.removeItem('docuai_logged_out');
      setIsLoggedOut(false);
      await checkAuth();
    }
  };
}