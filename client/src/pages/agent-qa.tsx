import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";

export default function AgentQA() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Agent Q&A</h1>
              <p className="text-slate-600 mt-1">Interactive AI agent powered by RagFlow</p>
            </div>
          </div>
        </div>

        {/* Main Content - RagFlow Iframe */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg border border-slate-200 h-full">
            <iframe
              src="https://ragflow-altosera-u49235.vm.elestio.app/chat/share?shared_id=c85690b05bac11f0ae270242ac120008&from=agent&auth=VhZmFlZTYyNWM1NjExZjA4NGJjMDI0Mm&locale=en"
              style={{ width: "100%", height: "100%", minHeight: "600px" }}
              frameBorder="0"
              title="RagFlow Agent Q&A"
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}