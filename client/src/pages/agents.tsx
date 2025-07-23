import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Bot, FileText, Users } from "lucide-react";
import { useAgentPersistence } from "@/hooks/useAgentPersistence";

export default function Agents() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { 
    activeTab, 
    setActiveTab, 
    createOrGetIframe, 
    moveIframeToContainer, 
    moveIframeToHidden 
  } = useAgentPersistence();
  
  const contentRef = useRef<HTMLDivElement>(null);

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

  // Initialize all iframes and handle tab switching
  useEffect(() => {
    // Create all iframes initially
    Object.entries(agents).forEach(([agentId, config]) => {
      createOrGetIframe(agentId, config.src, config.title);
    });
  }, []);

  // Handle active tab changes
  useEffect(() => {
    if (contentRef.current) {
      // Hide all iframes first
      Object.keys(agents).forEach(agentId => {
        if (agentId !== activeTab) {
          moveIframeToHidden(agentId);
        }
      });
      
      // Show active iframe
      moveIframeToContainer(activeTab, contentRef.current);
    }
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
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab('agent1')}
              style={{
                padding: '16px 24px',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: activeTab === 'agent1' ? '2px solid #3b82f6' : '2px solid transparent',
                backgroundColor: activeTab === 'agent1' ? '#eff6ff' : 'transparent',
                color: activeTab === 'agent1' ? '#2563eb' : '#6b7280',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText style={{ width: '16px', height: '16px' }} />
                <span>Case 3 Agent</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('agent2')}
              style={{
                padding: '16px 24px',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: activeTab === 'agent2' ? '2px solid #3b82f6' : '2px solid transparent',
                backgroundColor: activeTab === 'agent2' ? '#eff6ff' : 'transparent',
                color: activeTab === 'agent2' ? '#2563eb' : '#6b7280',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users style={{ width: '16px', height: '16px' }} />
                <span>Case 2 Agent</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('agent3')}
              style={{
                padding: '16px 24px',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: activeTab === 'agent3' ? '2px solid #3b82f6' : '2px solid transparent',
                backgroundColor: activeTab === 'agent3' ? '#eff6ff' : 'transparent',
                color: activeTab === 'agent3' ? '#2563eb' : '#6b7280',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText style={{ width: '16px', height: '16px' }} />
                <span>Case Large File</span>
              </div>
            </button>
          </div>
          

        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, padding: '24px' }}>
          <div 
            ref={contentRef}
            style={{ 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
              border: '1px solid #e5e7eb',
              height: '100%'
            }}
          >
            {/* Iframe will be dynamically moved here */}
          </div>
        </div>
      </div>
    </div>
  );
}