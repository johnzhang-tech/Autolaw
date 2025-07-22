import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/pages/login";
import Home from "@/pages/home";
import Create from "@/pages/create";
import Upload from "@/pages/upload";
import QA from "@/pages/qa";
import AgentQA from "@/pages/agent-qa";
import Documents from "@/pages/documents";
import Dashboard from "@/pages/dashboard";
import PaymentSimple from "@/pages/payment-simple";
import Payment from "@/pages/payment";
import Manage from "@/pages/manage";
import TestApi from "@/pages/test-api";
import StorageBrowser from "@/pages/storage-browser";
import StripeSetup from "@/pages/stripe-setup";
import AdminUsers from "@/pages/admin-users";
import NotFound from "@/pages/not-found";

function Router() {
  // Temporarily disable authentication to fix the runtime error
  // const { isAuthenticated, isLoading, checkAuth } = useAuth();
  
  // Check auth on mount
  // useEffect(() => {
  //   checkAuth();
  // }, []);

  // Show loading spinner during auth check
  // if (isLoading) {
  //   return (
  //     <div className="h-screen flex items-center justify-center bg-white">
  //       <div className="text-center">
  //         <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
  //         <p className="mt-4 text-gray-600">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Temporary: Always show login page until we fix the match error
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/billing" component={PaymentSimple} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <Toaster />
        <Router />
      </div>
    </QueryClientProvider>
  );
}

export default App;
