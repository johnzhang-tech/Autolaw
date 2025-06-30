import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">DocuAI</h1>
          <p className="text-gray-600">AI-Powered Real Estate Documentation</p>
          <div className="mt-8">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
