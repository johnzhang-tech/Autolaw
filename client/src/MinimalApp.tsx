import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Landing from "@/pages/landing";
import "./index.css";

// Test if adding Landing page causes the error
function Router() {
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