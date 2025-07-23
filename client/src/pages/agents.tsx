import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, FileText, Users } from "lucide-react";
import { useAgentState } from "@/lib/agentState";
import { globalIframeManager } from "@/lib/globalIframeManager";

export default function Agents() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const agentState = useAgentState();
  const agent1Ref = useRef<HTMLDivElement>(null);
  const agent2Ref = useRef<HTMLDivElement>(null);
  const agent3Ref = useRef<HTMLDivElement>(null);
  
  // Initialize state from persistent storage
  const [activeTab, setActiveTab] = useState<'agent1' | 'agent2' | 'agent3'>(
    agentState.getActiveAgent() as 'agent1' | 'agent2' | 'agent3'
  );

  // Agent configuration
  const agentConfigs = {
    agent1: {
      src: 'https://ragflow-altosera-u49235.vm.elestio.app/chat/share?shared_id=ef91e43c674a11f0b85b0242ac120003&from=agent&auth=VhZmFlZTYyNWM1NjExZjA4NGJjMDI0Mm',
      title: 'Case 3 Agent'
    },
    agent2: {
      src: 'https://ragflow-altosera-u49235.vm.elestio.app/chat/share?shared_id=f73d46aa674e11f09eda0242ac120003&from=agent&auth=VhZmFlZTYyNWM1NjExZjA4NGJjMDI0Mm',
      title: 'Case 2 Agent'
    },
    agent3: {
      src: 'https://ragflow-altosera-u49235.vm.elestio.app/chat/share?shared_id=6a016e68674b11f090050242ac120003&from=agent&auth=VhZmFlZTYyNWM1NjExZjA4NGJjMDI0Mm',
      title: 'Case Large File'
    }
  };

  // Initialize and manage iframes
  useEffect(() => {
    const setupIframes = () => {
      // Initialize all iframes
      Object.keys(agentConfigs).forEach(agentId => {
        const config = agentConfigs[agentId as keyof typeof agentConfigs];
        globalIframeManager.createOrGetIframe(agentId, config.src);
      });

      // Show active tab iframe
      const refs = { agent1: agent1Ref, agent2: agent2Ref, agent3: agent3Ref };
      const activeRef = refs[activeTab];
      
      if (activeRef.current) {
        globalIframeManager.moveIframeToContainer(activeTab, activeRef.current);
        agentState.markAgentLoaded(activeTab);
      }
    };

    setupIframes();
  }, []);

  // Update active tab when component mounts to restore last viewed agent
  useEffect(() => {
    const lastActive = agentState.getActiveAgent() as 'agent1' | 'agent2' | 'agent3';
    setActiveTab(lastActive);
  }, []);

  const handleTabChange = (newTab: 'agent1' | 'agent2' | 'agent3') => {
    // Hide current iframe
    globalIframeManager.hideIframe(activeTab);
    
    // Update state
    setActiveTab(newTab);
    agentState.setActiveAgent(newTab);
    
    // Show new iframe
    const refs = { agent1: agent1Ref, agent2: agent2Ref, agent3: agent3Ref };
    const newRef = refs[newTab];
    
    if (newRef.current) {
      globalIframeManager.moveIframeToContainer(newTab, newRef.current);
      agentState.markAgentLoaded(newTab);
    }
  };

  const handleAgentLoad = (agentId: string) => {
    agentState.markAgentLoaded(agentId);
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
                  {agentState.isAgentLoaded('agent1') && (
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
                  {agentState.isAgentLoaded('agent2') && (
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
                  {agentState.isAgentLoaded('agent3') && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" title="Conversation active" />
                  )}
                </div>
              </button>
            </div>
            

          </div>
        </div>

        {/* Tab Content with persistent iframe containers */}
        <div className="flex-1 p-6">
          {/* Case 3 Agent */}
          <Card className={`h-full ${activeTab === 'agent1' ? '' : 'hidden'}`}>
            <CardContent className="p-0 h-full">
              <div ref={agent1Ref} className="w-full h-full" style={{ minHeight: '600px' }} />
            </CardContent>
          </Card>

          {/* Case 2 Agent */}
          <Card className={`h-full ${activeTab === 'agent2' ? '' : 'hidden'}`}>
            <CardContent className="p-0 h-full">
              <div ref={agent2Ref} className="w-full h-full" style={{ minHeight: '600px' }} />
            </CardContent>
          </Card>

          {/* Case Large File */}
          <Card className={`h-full ${activeTab === 'agent3' ? '' : 'hidden'}`}>
            <CardContent className="p-0 h-full">
              <div ref={agent3Ref} className="w-full h-full" style={{ minHeight: '600px' }} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}