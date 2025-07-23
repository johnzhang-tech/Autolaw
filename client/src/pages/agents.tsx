import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, FileText, Users } from "lucide-react";

// Global storage container for iframe persistence across pages
class GlobalIframeStorage {
  private static instance: GlobalIframeStorage;
  private container: HTMLDivElement | null = null;
  private iframes: Map<string, HTMLIFrameElement> = new Map();

  static getInstance(): GlobalIframeStorage {
    if (!GlobalIframeStorage.instance) {
      GlobalIframeStorage.instance = new GlobalIframeStorage();
    }
    return GlobalIframeStorage.instance;
  }

  init() {
    if (this.container || typeof window === 'undefined') return;
    
    // Create hidden container that persists across page changes
    this.container = document.createElement('div');
    this.container.id = 'global-iframe-storage';
    this.container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;overflow:hidden;pointer-events:none;z-index:-1;';
    document.body.appendChild(this.container);
  }

  storeIframe(agentId: string, iframe: HTMLIFrameElement) {
    this.init();
    if (this.container && iframe.parentNode !== this.container) {
      this.iframes.set(agentId, iframe);
      this.container.appendChild(iframe);
    }
  }

  retrieveIframe(agentId: string): HTMLIFrameElement | null {
    return this.iframes.get(agentId) || null;
  }

  hasIframe(agentId: string): boolean {
    return this.iframes.has(agentId);
  }
}

// Component that handles iframe persistence across page navigation
function PersistentAgentIframe({ 
  agentId, 
  src, 
  title, 
  isActive, 
  onLoad, 
  existingIframe 
}: {
  agentId: string;
  src: string;
  title: string;
  isActive: boolean;
  onLoad: (agentId: string, iframe: HTMLIFrameElement) => void;
  existingIframe?: HTMLIFrameElement;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let iframeElement: HTMLIFrameElement;

    if (existingIframe) {
      // Reuse existing iframe to preserve conversation
      iframeElement = existingIframe;
      if (iframeElement.parentNode) {
        iframeElement.parentNode.removeChild(iframeElement);
      }
    } else {
      // Create new iframe
      iframeElement = document.createElement('iframe');
      iframeElement.src = src;
      iframeElement.frameBorder = '0';
      iframeElement.title = title;
      iframeElement.onload = () => onLoad(agentId, iframeElement);
    }

    // Style the iframe
    iframeElement.style.cssText = 'width:100%;height:100%;min-height:600px;border:none;border-radius:0 0 8px 8px;';
    
    // Append to container
    containerRef.current.appendChild(iframeElement);
    setIframe(iframeElement);

    // Cleanup function
    return () => {
      if (iframeElement.parentNode) {
        iframeElement.parentNode.removeChild(iframeElement);
      }
    };
  }, [agentId, src, title, existingIframe, onLoad]);

  return <div ref={containerRef} className="w-full h-full" style={{ minHeight: '600px' }} />;
}

export default function Agents() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'agent1' | 'agent2' | 'agent3'>('agent1');
  const [loadedAgents, setLoadedAgents] = useState<Set<string>>(new Set(['agent1']));
  const [persistentIframes, setPersistentIframes] = useState<Map<string, HTMLIFrameElement>>(new Map());
  
  const globalStorage = GlobalIframeStorage.getInstance();
  const iframeRefs = useRef<{ [key: string]: HTMLIFrameElement | null }>({});

  // Restore state and check for existing persistent iframes
  useEffect(() => {
    const saved = sessionStorage.getItem('mr-assistant-active-tab');
    if (saved && ['agent1', 'agent2', 'agent3'].includes(saved)) {
      setActiveTab(saved as 'agent1' | 'agent2' | 'agent3');
    }
    
    const savedAgents = sessionStorage.getItem('mr-assistant-loaded-agents');
    if (savedAgents) {
      try {
        const agents = JSON.parse(savedAgents);
        setLoadedAgents(new Set(agents));
      } catch (e) {
        // Ignore parsing errors
      }
    }

    // Check for existing persistent iframes and restore them
    const restoredIframes = new Map<string, HTMLIFrameElement>();
    ['agent1', 'agent2', 'agent3'].forEach(agentId => {
      const existingIframe = globalStorage.retrieveIframe(agentId);
      if (existingIframe) {
        restoredIframes.set(agentId, existingIframe);
      }
    });
    setPersistentIframes(restoredIframes);
  }, []);

  // Store iframes globally when component unmounts (page navigation)
  useEffect(() => {
    return () => {
      Object.entries(iframeRefs.current).forEach(([agentId, iframe]) => {
        if (iframe) {
          globalStorage.storeIframe(agentId, iframe);
        }
      });
    };
  }, []);

  const handleTabChange = (newTab: 'agent1' | 'agent2' | 'agent3') => {
    setActiveTab(newTab);
    const newLoadedAgents = new Set(Array.from(loadedAgents).concat([newTab]));
    setLoadedAgents(newLoadedAgents);
    sessionStorage.setItem('mr-assistant-active-tab', newTab);
    sessionStorage.setItem('mr-assistant-loaded-agents', JSON.stringify(Array.from(newLoadedAgents)));
  };

  const handleAgentLoad = (agentId: string, iframe: HTMLIFrameElement) => {
    const newLoadedAgents = new Set(Array.from(loadedAgents).concat([agentId]));
    setLoadedAgents(newLoadedAgents);
    sessionStorage.setItem('mr-assistant-loaded-agents', JSON.stringify(Array.from(newLoadedAgents)));
    
    // Store reference for persistence
    iframeRefs.current[agentId] = iframe;
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
              <h1 className="text-2xl font-bold text-gray-900">Legal AI Agentic Assistant for Medical Records</h1>
              <p className="text-gray-600 mt-1">
                Interact with specialized legal document analysis agents
              </p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI Powered
            </Badge>
          </div>
        </div>

        {/* Tab Navigation with Controls */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex justify-between items-center px-6">
            <div className="flex space-x-8">
              <button
                onClick={() => handleTabChange('agent1')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'agent1'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span className="font-bold">Case 3 Agent</span>
                  {loadedAgents.has('agent1') && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" title="Conversation active" />
                  )}
                </div>
              </button>
              <button
                onClick={() => handleTabChange('agent2')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'agent2'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span className="font-bold">Case 2 Agent</span>
                  {loadedAgents.has('agent2') && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" title="Conversation active" />
                  )}
                </div>
              </button>
              <button
                onClick={() => handleTabChange('agent3')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'agent3'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span className="font-bold">Case Large File</span>
                  {loadedAgents.has('agent3') && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" title="Conversation active" />
                  )}
                </div>
              </button>
            </div>
            

          </div>
        </div>

        {/* Tab Content - All iframes rendered but only active one visible */}
        <div className="flex-1 p-6 relative">
          {/* Case 3 Agent */}
          <Card className={`h-full ${activeTab === 'agent1' ? '' : 'hidden'}`}>
            <CardContent className="p-0 h-full">
              <PersistentAgentIframe
                agentId="agent1"
                src="https://ragflow-altosera-u49235.vm.elestio.app/chat/share?shared_id=ef91e43c674a11f0b85b0242ac120003&from=agent&auth=VhZmFlZTYyNWM1NjExZjA4NGJjMDI0Mm"
                title="Case 3 Agent"
                isActive={activeTab === 'agent1'}
                onLoad={handleAgentLoad}
                existingIframe={persistentIframes.get('agent1')}
              />
            </CardContent>
          </Card>

          {/* Case 2 Agent */}
          <Card className={`h-full absolute inset-0 m-6 ${activeTab === 'agent2' ? '' : 'hidden'}`}>
            <CardContent className="p-0 h-full">
              {(loadedAgents.has('agent2') || activeTab === 'agent2') && (
                <PersistentAgentIframe
                  agentId="agent2"
                  src="https://ragflow-altosera-u49235.vm.elestio.app/chat/share?shared_id=f73d46aa674e11f09eda0242ac120003&from=agent&auth=VhZmFlZTYyNWM1NjExZjA4NGJjMDI0Mm"
                  title="Case 2 Agent"
                  isActive={activeTab === 'agent2'}
                  onLoad={handleAgentLoad}
                  existingIframe={persistentIframes.get('agent2')}
                />
              )}
            </CardContent>
          </Card>

          {/* Case Large File */}
          <Card className={`h-full absolute inset-0 m-6 ${activeTab === 'agent3' ? '' : 'hidden'}`}>
            <CardContent className="p-0 h-full">
              {(loadedAgents.has('agent3') || activeTab === 'agent3') && (
                <PersistentAgentIframe
                  agentId="agent3"
                  src="https://ragflow-altosera-u49235.vm.elestio.app/chat/share?shared_id=6a016e68674b11f090050242ac120003&from=agent&auth=VhZmFlZTYyNWM1NjExZjA4NGJjMDI0Mm"
                  title="Case Large File"
                  isActive={activeTab === 'agent3'}
                  onLoad={handleAgentLoad}
                  existingIframe={persistentIframes.get('agent3')}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}