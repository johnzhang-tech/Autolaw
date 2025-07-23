import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Mail } from "lucide-react";

export default function EmailAssistant() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  const handlePromptSelect = (promptText: string) => {
    // Set the prompt directly in our input field
    setActivePrompt(promptText);
    setInputValue(promptText);
    
    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity';
    notification.innerHTML = `
      <div class="text-sm font-medium">✓ Prompt loaded</div>
      <div class="text-xs mt-1">Click "Send to Chat" to proceed</div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
    
    // Auto-focus the input field
    setTimeout(() => {
      const inputField = document.querySelector('textarea[placeholder="Type your prompt here..."]') as HTMLTextAreaElement;
      if (inputField) {
        inputField.focus();
        inputField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleSendPrompt = async () => {
    if (!inputValue.trim()) return;
    
    try {
      // Copy to clipboard so user can paste in Ragflow
      await navigator.clipboard.writeText(inputValue);
      
      // Show instruction notification
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-sm';
      notification.innerHTML = `
        <div class="text-sm font-medium">✓ Prompt copied to clipboard!</div>
        <div class="text-xs mt-2">Now:</div>
        <div class="text-xs">1. Click in the Ragflow chat input below</div>
        <div class="text-xs">2. Press Ctrl+V (or Cmd+V) to paste</div>
        <div class="text-xs">3. Press Enter to send</div>
      `;
      document.body.appendChild(notification);
      
      // Clear the input
      setInputValue('');
      setActivePrompt('');
      
      // Auto-scroll to iframe
      const iframe = document.querySelector('iframe[title="Email Agentic Assistant"]') as HTMLIFrameElement;
      if (iframe) {
        iframe.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
      
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 6000);
      
    } catch (error) {
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = 'Failed to copy prompt';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
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
                <p className="text-sm text-gray-600">Double-click a prompt to copy it, then paste in the chat input below</p>
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

          {/* Quick Send Input */}
          <Card className="flex-shrink-0">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-gray-900">Quick Send to Chat</h3>
                </div>
                <div className="flex gap-2">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your prompt here or select from suggestions above..."
                    className="flex-1 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
                    rows={3}
                  />
                  <button
                    onClick={handleSendPrompt}
                    disabled={!inputValue.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium whitespace-nowrap self-start"
                  >
                    Send to Chat
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Tip: Select a prompt above to auto-fill, or type your own. Press Enter or click "Send to Chat" to copy to clipboard for pasting in Ragflow below.
                </p>
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