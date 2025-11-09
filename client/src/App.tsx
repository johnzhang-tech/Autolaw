import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useAuthSimple as useAuth } from "@/hooks/useAuthSimple";
import Landing from "@/pages/landing";
import LoginPage from "@/pages/login";
import Home from "@/pages/home";
import Create from "@/pages/create";
import Upload from "@/pages/upload";
import QA from "@/pages/qa";
import AgentQA from "@/pages/agent-qa";
import Agents from "@/pages/agents";
import AgentsTest from "@/pages/agents-test";
import EmailAssistant from "@/pages/email-assistant";
import Documents from "@/pages/documents";
import FullDashboard from "@/pages/dashboard";
import PaymentSimple from "@/pages/payment-simple";
import Payment from "@/pages/payment";
import Manage from "@/pages/manage";
import TestApi from "@/pages/test-api";
import StorageBrowser from "@/pages/storage-browser";
import StripeSetup from "@/pages/stripe-setup";
import AdminUsers from "@/pages/admin-users";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  
  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Show loading state while checking authentication
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
      {/* Root route - redirect based on authentication */}
      <Route path="/">
        {isAuthenticated ? <Redirect to="/home" /> : <Landing />}
      </Route>
      
      {/* Public routes */}
      <Route path="/login" component={LoginPage} />
      <Route path="/billing" component={PaymentSimple} />
      
      {/* Protected routes - require authentication */}
      {!isAuthenticated ? (
        <Route component={LoginPage} />
      ) : (
        <>
          <Route path="/home" component={Home} />
          <Route path="/create" component={Create} />
          <Route path="/documents" component={Documents} />
          <Route path="/qa" component={EmailAssistant} />
          <Route path="/agents" component={Agents} />
          <Route path="/agents-test" component={AgentsTest} />
          <Route path="/dashboard" component={FullDashboard} />
          <Route path="/manage" component={Manage} />
          <Route path="/admin-users" component={AdminUsers} />
          <Route path="/test-api" component={TestApi} />
          <Route component={NotFound} />
        </>
      )}
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
