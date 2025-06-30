import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Create from "@/pages/create";
import Upload from "@/pages/upload";
import QA from "@/pages/qa";
import Documents from "@/pages/documents";
import Dashboard from "@/pages/dashboard";
import PaymentSimple from "@/pages/payment-simple";
import Manage from "@/pages/manage";
import TestApi from "@/pages/test-api";

import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

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
      {/* Public routes */}
      <Route path="/billing" component={PaymentSimple} />
      
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/create" component={Create} />
          <Route path="/upload" component={Upload} />
          <Route path="/qa" component={QA} />
          <Route path="/documents" component={Documents} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/manage" component={Manage} />
          <Route path="/test-api" component={TestApi} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
