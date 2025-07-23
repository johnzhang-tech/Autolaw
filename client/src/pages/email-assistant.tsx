import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Mail } from "lucide-react";

export default function EmailAssistant() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-white border-r border-gray-200`}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Email Agentic Assistant</h1>
              <p className="text-gray-600 mt-1">
                AI-powered email analysis and response assistant
              </p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI Powered
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col gap-6">
          {/* Best Practice Prompts Section */}
          <Card className="flex-shrink-0" style={{ maxHeight: '40vh' }}>
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Analysis Best Practice Prompts</h3>
                <p className="text-sm text-gray-600">Select a prompt to get started with professional email analysis</p>
              </div>
              
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(40vh - 120px)' }}>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200">
                    <p className="text-sm font-medium text-gray-900">Analyze email tone and professionalism</p>
                    <p className="text-xs text-gray-600 mt-1">Review communication style and suggest improvements</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200">
                    <p className="text-sm font-medium text-gray-900">Extract key action items and deadlines</p>
                    <p className="text-xs text-gray-600 mt-1">Identify tasks, responsibilities, and time-sensitive items</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200">
                    <p className="text-sm font-medium text-gray-900">Identify legal risks and compliance issues</p>
                    <p className="text-xs text-gray-600 mt-1">Scan for potential legal concerns in email content</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200">
                    <p className="text-sm font-medium text-gray-900">Summarize email thread and key decisions</p>
                    <p className="text-xs text-gray-600 mt-1">Create concise summary of long email conversations</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200">
                    <p className="text-sm font-medium text-gray-900">Check for confidentiality and privacy concerns</p>
                    <p className="text-xs text-gray-600 mt-1">Review for sensitive information disclosure risks</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200">
                    <p className="text-sm font-medium text-gray-900">Generate professional email response draft</p>
                    <p className="text-xs text-gray-600 mt-1">Create appropriate reply based on context and tone</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200">
                    <p className="text-sm font-medium text-gray-900">Analyze contract terms mentioned in email</p>
                    <p className="text-xs text-gray-600 mt-1">Review contractual obligations and commitments discussed</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200">
                    <p className="text-sm font-medium text-gray-900">Validate email authenticity and detect phishing</p>
                    <p className="text-xs text-gray-600 mt-1">Check for suspicious content and security threats</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ragflow Chat Assistant */}
          <Card className="flex-1 min-h-0">
            <CardContent className="p-0 h-full">
              <iframe
                src="https://ragflow-altosera-u49235.vm.elestio.app/chat/share?shared_id=5fe51950675711f0a9ce0242ac120003&from=agent&auth=VhZmFlZTYyNWM1NjExZjA4NGJjMDI0Mm"
                style={{ width: '100%', height: '100%', minHeight: '400px' }}
                frameBorder="0"
                title="Email Agentic Assistant"
                className="rounded-lg"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}