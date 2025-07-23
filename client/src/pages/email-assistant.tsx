import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Mail } from "lucide-react";

export default function EmailAssistant() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handlePromptSelect = async (promptText: string) => {
    // Create floating overlay with the prompt text
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
    overlay.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-2xl">
        <h3 class="text-lg font-bold mb-4">Selected Prompt</h3>
        <div class="bg-gray-50 p-3 rounded border text-sm mb-4 max-h-32 overflow-y-auto">
          ${promptText}
        </div>
        <div class="flex gap-3">
          <button id="send-prompt" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
            Send to Chat
          </button>
          <button id="cancel-prompt" class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Handle send button
    const sendBtn = overlay.querySelector('#send-prompt');
    sendBtn?.addEventListener('click', async () => {
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(promptText);
      } catch (e) {
        // Clipboard failed, continue anyway
      }
      
      // Remove overlay
      document.body.removeChild(overlay);
      
      // Simulate clicking in the iframe and pasting
      const iframe = document.querySelector('iframe[title="Email Agentic Assistant"]') as HTMLIFrameElement;
      if (iframe) {
        // Focus iframe
        iframe.focus();
        
        // Try to simulate user clicking in iframe
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        
        iframe.dispatchEvent(clickEvent);
        
        // Wait a bit, then try to trigger paste
        setTimeout(() => {
          // Simulate keyboard paste
          document.execCommand('paste');
          
          // Also try dispatching paste event to iframe
          const pasteEvent = new ClipboardEvent('paste', {
            bubbles: true,
            cancelable: true,
            clipboardData: new DataTransfer()
          });
          
          // Add text to clipboard data
          try {
            pasteEvent.clipboardData?.setData('text/plain', promptText);
          } catch (e) {
            // Some browsers don't allow this
          }
          
          iframe.dispatchEvent(pasteEvent);
          
          // Try window-level paste
          window.dispatchEvent(pasteEvent);
          
        }, 100);
        
        // Scroll to iframe
        iframe.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
      
      // Show completion message
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = 'Prompt sent! Check the chat input below.';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
    });
    
    // Handle cancel button
    const cancelBtn = overlay.querySelector('#cancel-prompt');
    cancelBtn?.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    // Handle overlay click to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });
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