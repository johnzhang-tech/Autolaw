import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, FileText, Users } from "lucide-react";

export default function Agents() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'agent1' | 'agent2' | 'agent3'>('agent1');

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
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI Powered
            </Badge>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab('agent1')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'agent1'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Case 3 Agent</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('agent2')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'agent2'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Case 2 Agent</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('agent3')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'agent3'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Case Large File</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              {activeTab === 'agent1' && (
                <iframe
                  key="case3-agent"
                  src="https://ragflow-altosera-u49235.vm.elestio.app/chat/share?shared_id=ef91e43c674a11f0b85b0242ac120003&from=agent&auth=VhZmFlZTYyNWM1NjExZjA4NGJjMDI0Mm"
                  style={{ width: '100%', height: '100%', minHeight: '600px', border: 'none' }}
                  title="Case 3 Agent"
                  className="rounded-lg"
                />
              )}
              
              {activeTab === 'agent2' && (
                <iframe
                  key="case2-agent"
                  src="https://ragflow-altosera-u49235.vm.elestio.app/chat/share?shared_id=f73d46aa674e11f09eda0242ac120003&from=agent&auth=VhZmFlZTYyNWM1NjExZjA4NGJjMDI0Mm"
                  style={{ width: '100%', height: '100%', minHeight: '600px', border: 'none' }}
                  title="Case 2 Agent"
                  className="rounded-lg"
                />
              )}
              
              {activeTab === 'agent3' && (
                <iframe
                  key="large-file-agent"
                  src="https://ragflow-altosera-u49235.vm.elestio.app/chat/share?shared_id=6a016e68674b11f090050242ac120003&from=agent&auth=VhZmFlZTYyNWM1NjExZjA4NGJjMDI0Mm"
                  style={{ width: '100%', height: '100%', minHeight: '600px', border: 'none' }}
                  title="Case Large File"
                  className="rounded-lg"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}