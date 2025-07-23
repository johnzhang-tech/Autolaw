import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Bot, FileText, Users } from "lucide-react";

// Global persistence system for cross-page navigation
const globalPersistence = {
  container: null as HTMLDivElement | null,
  iframes: {} as Record<string, HTMLIFrameElement>,
  
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'ragflow-persistence';
      this.container.style.cssText = `
        position: fixed;
        top: -10000px;
        left: -10000px;
        width: 800px;
        height: 600px;
        overflow: hidden;
        visibility: hidden;
        pointer-events: none;
        z-index: -9999;
      `;
      document.body.appendChild(this.container);
    }
  },
  
  createIframe(agentId: string, src: string, title: string) {
    if (!this.iframes[agentId]) {
      this.init();
      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.title = title;
      iframe.style.cssText = `
        width: 100%;
        height: 100%;
        min-height: 600px;
        border: none;
        border-radius: 8px;
      `;
      this.iframes[agentId] = iframe;
      this.container!.appendChild(iframe);
    }
    return this.iframes[agentId];
  },
  
  getIframe(agentId: string) {
    return this.iframes[agentId];
  }
};

export default function Agents() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('agent-active-tab') || 'agent1';
  });

  const agents = {
    agent1: {
      src: "https://ragflow-altosera-u49235.vm.elestio.app/chat/share?shared_id=ef91e43c674a11f0b85b0242ac120003&from=agent&auth=VhZmFlZTYyNWM1NjExZjA4NGJjMDI0Mm",
      title: "Case 3 Agent"
    },
    agent2: {
      src: "https://ragflow-altosera-u49235.vm.elestio.app/chat/share?shared_id=f73d46aa674e11f09eda0242ac120003&from=agent&auth=VhZmFlZTYyNWM1NjExZjA4NGJjMDI0Mm",
      title: "Case 2 Agent"
    },
    agent3: {
      src: "https://ragflow-altosera-u49235.vm.elestio.app/chat/share?shared_id=6a016e68674b11f090050242ac120003&from=agent&auth=VhZmFlZTYyNWM1NjExZjA4NGJjMDI0Mm",
      title: "Case Large File"
    }
  };

  // Initialize persistent iframes
  useEffect(() => {
    Object.entries(agents).forEach(([agentId, config]) => {
      globalPersistence.createIframe(agentId, config.src, config.title);
    });
  }, []);

  // Save active tab
  useEffect(() => {
    localStorage.setItem('agent-active-tab', activeTab);
  }, [activeTab]);

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
              <h1 className="text-2xl font-bold text-gray-900">MR Assistant</h1>
              <p className="text-gray-600 mt-1">
                Specialized legal document analysis agents
              </p>
            </div>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI Powered
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {Object.entries(agents).map(([agentId, config]) => (
              <button
                key={agentId}
                onClick={() => setActiveTab(agentId)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === agentId
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {agentId === 'agent1' && <FileText className="w-4 h-4" />}
                  {agentId === 'agent2' && <Users className="w-4 h-4" />}
                  {agentId === 'agent3' && <Bot className="w-4 h-4" />}
                  {config.title}
                </div>
              </button>
            ))}
          </div>

          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="text-sm text-gray-600">
              {activeTab === 'agent1' && "Specialized in contract analysis, terms review, and obligation assessment"}
              {activeTab === 'agent2' && "Expert in legal compliance monitoring and regulatory risk detection"}
              {activeTab === 'agent3' && "Handles large document analysis with comprehensive risk scoring"}
            </div>
          </div>

          
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, padding: '24px' }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
            border: '1px solid #e5e7eb',
            height: '100%',
            minHeight: '600px',
            position: 'relative'
          }}>
            {/* All iframes rendered simultaneously, only active one visible */}
            {Object.entries(agents).map(([agentId, config]) => {
              const persistentIframe = globalPersistence.getIframe(agentId);
              const isActive = activeTab === agentId;
              
              if (persistentIframe && isActive) {
                // Move persistent iframe to display
                setTimeout(() => {
                  const container = document.getElementById(`agent-container-${agentId}`);
                  if (container && persistentIframe.parentNode !== container) {
                    container.appendChild(persistentIframe);
                  }
                }, 0);
                
                return (
                  <div
                    key={agentId}
                    id={`agent-container-${agentId}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'block'
                    }}
                  />
                );
              }
              
              // Fallback iframe for immediate display
              return (
                <iframe
                  key={agentId}
                  src={config.src}
                  title={config.title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    minHeight: '600px',
                    border: 'none',
                    borderRadius: '8px',
                    display: isActive ? 'block' : 'none'
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}