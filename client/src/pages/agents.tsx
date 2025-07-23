import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, FileText, Users } from "lucide-react";

// Global iframe persistence using a single hidden container
const IFRAME_STORAGE_KEY = 'mr-assistant-iframes';

class SimpleIframeManager {
  private static instance: SimpleIframeManager;
  private container: HTMLDivElement | null = null;
  private iframes: Map<string, HTMLIFrameElement> = new Map();

  static getInstance(): SimpleIframeManager {
    if (!SimpleIframeManager.instance) {
      SimpleIframeManager.instance = new SimpleIframeManager();
    }
    return SimpleIframeManager.instance;
  }

  init() {
    if (this.container || typeof window === 'undefined') return;
    
    this.container = document.createElement('div');
    this.container.id = 'iframe-storage';
    this.container.style.cssText = 'position:absolute;top:-9999px;left:-9999px;width:1px;height:1px;overflow:hidden;';
    document.body.appendChild(this.container);
  }

  getOrCreateIframe(agentId: string, src: string): HTMLIFrameElement {
    this.init();
    
    if (!this.iframes.has(agentId)) {
      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.style.cssText = 'width:100%;height:100%;min-height:600px;border:none;border-radius:0 0 8px 8px;';
      iframe.frameBorder = '0';
      iframe.title = `Agent ${agentId}`;
      
      this.iframes.set(agentId, iframe);
      
      // Store in hidden container initially
      if (this.container) {
        this.container.appendChild(iframe);
      }
    }
    
    return this.iframes.get(agentId)!;
  }

  showInContainer(agentId: string, container: HTMLElement) {
    const iframe = this.iframes.get(agentId);
    if (iframe && container) {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
      container.appendChild(iframe);
    }
  }

  hideIframe(agentId: string) {
    const iframe = this.iframes.get(agentId);
    if (iframe && this.container) {
      if (iframe.parentNode && iframe.parentNode !== this.container) {
        iframe.parentNode.removeChild(iframe);
        this.container.appendChild(iframe);
      }
    }
  }
}

export default function Agents() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'agent1' | 'agent2' | 'agent3'>('agent1');
  const [loadedAgents, setLoadedAgents] = useState<Set<string>>(new Set(['agent1']));
  
  const iframeManager = SimpleIframeManager.getInstance();

  // Agent URLs
  const agentUrls = {
    agent1: 'https://ragflow-altosera-u49235.vm.elestio.app/chat/share?shared_id=ef91e43c674a11f0b85b0242ac120003&from=agent&auth=VhZmFlZTYyNWM1NjExZjA4NGJjMDI0Mm',
    agent2: 'https://ragflow-altosera-u49235.vm.elestio.app/chat/share?shared_id=f73d46aa674e11f09eda0242ac120003&from=agent&auth=VhZmFlZTYyNWM1NjExZjA4NGJjMDI0Mm',
    agent3: 'https://ragflow-altosera-u49235.vm.elestio.app/chat/share?shared_id=6a016e68674b11f090050242ac120003&from=agent&auth=VhZmFlZTYyNWM1NjExZjA4NGJjMDI0Mm'
  };

  // Restore last active tab from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('mr-assistant-active-tab');
    if (saved && ['agent1', 'agent2', 'agent3'].includes(saved)) {
      setActiveTab(saved as 'agent1' | 'agent2' | 'agent3');
    }
  }, []);

  const handleTabChange = (newTab: 'agent1' | 'agent2' | 'agent3') => {
    setActiveTab(newTab);
    setLoadedAgents(prev => new Set(Array.from(prev).concat([newTab])));
    sessionStorage.setItem('mr-assistant-active-tab', newTab);
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

        {/* Tab Content with persistent iframes */}
        <div className="flex-1 p-6">
          {/* Case 3 Agent */}
          <Card className={`h-full ${activeTab === 'agent1' ? '' : 'hidden'}`}>
            <CardContent className="p-0 h-full">
              <PersistentIframe 
                agentId="agent1"
                src={agentUrls.agent1}
                isActive={activeTab === 'agent1'}
                onLoad={() => setLoadedAgents(prev => new Set(Array.from(prev).concat(['agent1'])))}
              />
            </CardContent>
          </Card>

          {/* Case 2 Agent */}
          <Card className={`h-full ${activeTab === 'agent2' ? '' : 'hidden'}`}>
            <CardContent className="p-0 h-full">
              {(loadedAgents.has('agent2') || activeTab === 'agent2') && (
                <PersistentIframe 
                  agentId="agent2"
                  src={agentUrls.agent2}
                  isActive={activeTab === 'agent2'}
                  onLoad={() => setLoadedAgents(prev => new Set(Array.from(prev).concat(['agent2'])))}
                />
              )}
            </CardContent>
          </Card>

          {/* Case Large File */}
          <Card className={`h-full ${activeTab === 'agent3' ? '' : 'hidden'}`}>
            <CardContent className="p-0 h-full">
              {(loadedAgents.has('agent3') || activeTab === 'agent3') && (
                <PersistentIframe 
                  agentId="agent3"
                  src={agentUrls.agent3}
                  isActive={activeTab === 'agent3'}
                  onLoad={() => setLoadedAgents(prev => new Set(Array.from(prev).concat(['agent3'])))}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Component for persistent iframe management
function PersistentIframe({ 
  agentId, 
  src, 
  isActive, 
  onLoad 
}: { 
  agentId: string; 
  src: string; 
  isActive: boolean; 
  onLoad: () => void; 
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeManager = SimpleIframeManager.getInstance();

  useEffect(() => {
    if (containerRef.current && isActive) {
      const iframe = iframeManager.getOrCreateIframe(agentId, src);
      iframeManager.showInContainer(agentId, containerRef.current);
      
      // Handle load event
      if (!iframe.onload) {
        iframe.onload = onLoad;
      }
    } else if (!isActive) {
      // Hide iframe when not active
      iframeManager.hideIframe(agentId);
    }
  }, [agentId, src, isActive, onLoad]);

  return <div ref={containerRef} className="w-full h-full" style={{ minHeight: '600px' }} />;
}