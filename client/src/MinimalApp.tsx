import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import "./index.css";

// Minimal test component for wouter
function TestPage() {
  return (
    <div className="p-8">
      <h1>Test Page</h1>
      <p>This is a minimal test with wouter routing.</p>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={TestPage} />
      <Route component={() => <div className="p-8">404 Not Found</div>} />
    </Switch>
  );
}

function MinimalApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default MinimalApp;