import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function useAuth() {
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  useEffect(() => {
    const loggedOut = localStorage.getItem('docuai_logged_out');
    setIsLoggedOut(loggedOut === 'true');
  }, []);

  const { data: user, isLoading } = useQuery({
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
      window.location.reload();
    },
    login: () => {
      localStorage.removeItem('docuai_logged_out');
      setIsLoggedOut(false);
      window.location.reload();
    }
  };
}
