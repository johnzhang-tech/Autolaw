import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import Landing from "@/pages/landing";
import "./index.css";

// Test if adding useAuth hook causes the error
function Router() {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  
  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Show loading spinner during auth check
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route component={() => <div className="p-8">404 Not Found</div>} />
    </Switch>
  );
}

function MinimalApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <Toaster />
        <Router />
      </div>
    </QueryClientProvider>
  );
}

export default MinimalApp;