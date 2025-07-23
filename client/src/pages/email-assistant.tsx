import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Mail } from "lucide-react";

export default function EmailAssistant() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');

  const handlePromptSelect = (promptText: string) => {
    // Set the selected prompt and force iframe reload with new URL
    setSelectedPrompt(promptText);
    setIframeKey(prev => prev + 1);
    
    // Copy to clipboard as backup
    navigator.clipboard.writeText(promptText).catch(() => {});
    
    // Show notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity';
    notification.textContent = '✓ Reloading chat with prompt...';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 2000);
  };

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
                <p className="text-sm text-gray-600">Double-click a prompt to auto-paste it into the chat below</p>
              </div>
              
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(40vh - 120px)' }}>
                <div className="space-y-3">
                  <div 
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200 hover:border-blue-300"
                    onDoubleClick={() => handlePromptSelect("Analyze email tone and professionalism - Review communication style and suggest improvements")}
                  >
                    <p className="text-sm font-medium text-gray-900">Analyze email tone and professionalism</p>
                    <p className="text-xs text-gray-600 mt-1">Review communication style and suggest improvements</p>
                  </div>
                  
                  <div 
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200 hover:border-blue-300"
                    onDoubleClick={() => handlePromptSelect("Extract key action items and deadlines - Identify tasks, responsibilities, and time-sensitive items from this email")}
                  >
                    <p className="text-sm font-medium text-gray-900">Extract key action items and deadlines</p>
                    <p className="text-xs text-gray-600 mt-1">Identify tasks, responsibilities, and time-sensitive items</p>
                  </div>
                  
                  <div 
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200 hover:border-blue-300"
                    onDoubleClick={() => handlePromptSelect("Identify legal risks and compliance issues - Scan for potential legal concerns in email content")}
                  >
                    <p className="text-sm font-medium text-gray-900">Identify legal risks and compliance issues</p>
                    <p className="text-xs text-gray-600 mt-1">Scan for potential legal concerns in email content</p>
                  </div>
                  
                  <div 
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200 hover:border-blue-300"
                    onDoubleClick={() => handlePromptSelect("Summarize email thread and key decisions - Create concise summary of long email conversations")}
                  >
                    <p className="text-sm font-medium text-gray-900">Summarize email thread and key decisions</p>
                    <p className="text-xs text-gray-600 mt-1">Create concise summary of long email conversations</p>
                  </div>
                  
                  <div 
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200 hover:border-blue-300"
                    onDoubleClick={() => handlePromptSelect("Check for confidentiality and privacy concerns - Review for sensitive information disclosure risks")}
                  >
                    <p className="text-sm font-medium text-gray-900">Check for confidentiality and privacy concerns</p>
                    <p className="text-xs text-gray-600 mt-1">Review for sensitive information disclosure risks</p>
                  </div>
                  
                  <div 
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200 hover:border-blue-300"
                    onDoubleClick={() => handlePromptSelect("Generate professional email response draft - Create appropriate reply based on context and tone")}
                  >
                    <p className="text-sm font-medium text-gray-900">Generate professional email response draft</p>
                    <p className="text-xs text-gray-600 mt-1">Create appropriate reply based on context and tone</p>
                  </div>
                  
                  <div 
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200 hover:border-blue-300"
                    onDoubleClick={() => handlePromptSelect("Analyze contract terms mentioned in email - Review contractual obligations and commitments discussed")}
                  >
                    <p className="text-sm font-medium text-gray-900">Analyze contract terms mentioned in email</p>
                    <p className="text-xs text-gray-600 mt-1">Review contractual obligations and commitments discussed</p>
                  </div>
                  
                  <div 
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200 hover:border-blue-300"
                    onDoubleClick={() => handlePromptSelect("Validate email authenticity and detect phishing - Check for suspicious content and security threats")}
                  >
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
              {selectedPrompt && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Mail className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700 font-medium">Selected Prompt:</p>
                      <p className="text-sm text-blue-600 mt-1">{selectedPrompt}</p>
                      <button 
                        onClick={() => setSelectedPrompt('')}
                        className="text-xs text-blue-500 hover:text-blue-700 mt-2 underline"
                      >
                        Clear prompt
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <iframe
                key={iframeKey}
                src={`https://ragflow-altosera-u49235.vm.elestio.app/chat/share?shared_id=5fe51950675711f0a9ce0242ac120003&from=agent&auth=VhZmFlZTYyNWM1NjExZjA4NGJjMDI0Mm${selectedPrompt ? `&initial_prompt=${encodeURIComponent(selectedPrompt)}` : ''}`}
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