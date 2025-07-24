import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Bot, FileText, Users, CheckCircle } from "lucide-react";

export default function Agents() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('agent-active-tab') || 'agent1';
  });
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  // Function to copy prompt text to clipboard
  const copyPromptToClipboard = async (promptText: string) => {
    try {
      await navigator.clipboard.writeText(promptText);
      console.log('Prompt copied to clipboard');
      
      // Show notification message
      setShowCopyNotification(true);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowCopyNotification(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  // Prompt templates for copy functionality
  const promptTemplates = {
    summary: `Summarize the attached medical chronology for legal review. The summary must be structured, legally relevant, and formatted for attorney or insurance use. Follow this format:

### Patient Overview
- Name:
- Date of Injury:
- Mechanism of Injury:
- Primary Complaint(s):
- Pre-existing Conditions:
- First treatment date:
- Total duration of care:

### Chronological Summary Table
| Date | Provider | Facility | Visit Type | Diagnosis/Treatment | Notable Findings |
|------|----------|----------|-------------|----------------------|-------------------|`,

    executive: `Summarize the medical chronology in a structured format for legal case preparation. Include:
- Diagnosis Summary
- Treatment Timeline
- Gaps in Treatment
- Provider Involvement
- Medical Opinions (including QME/IME if available)
- Current Status & Restrictions
- Legal Relevance or Red Flags`,

    timeline: `From the medical record, generate a table with the following columns:
- Date of Visit
- Provider Name
- Specialty
- Facility
- Purpose of Visit
- Key Diagnoses / Procedures
Only include medical visits relevant to the injury or litigation.`,

    legal: `Extract the following legally relevant facts from the medical chronology:
- Any mention of malingering, exaggeration, or subjective complaints
- Gaps in treatment > 30 days
- Work restrictions or functional impairments
- IME or QME opinions that impact liability or damages
- Pre-existing conditions that may conflict with the claim
- Non-compliance with treatment`,

    demand: `Based on the medical record, write a brief summary suitable for inclusion in a demand letter. The summary should include:
- Mechanism of injury
- Primary diagnoses and complaints
- Duration and nature of treatment
- Degree of recovery or permanent restrictions
- Any medical support for pain/suffering or disability claims`,

    mmi: `Review the record and determine:
- Has the patient reached Maximum Medical Improvement?
- If yes, when and by which provider?
- Are there any references to Functional Capacity Evaluations (FCEs)?
- Does the record document any permanent impairment ratings?`,

    future: `Identify and list all references to:
- Follow-up care or surgeries
- Long-term medication needs
- Physical or occupational therapy
- Chronic pain or mobility issues
- Psychiatric or psychological care
- Provider opinions on future prognosis`
  };

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

  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem('agent-active-tab', activeTab);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Copy Success Notification */}
      {showCopyNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-5 h-5" />
          <div>
            <div className="font-medium">Prompt copied to clipboard!</div>
            <div className="text-sm text-green-100">Now paste it into the chat box</div>
          </div>
        </div>
      )}

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

        {/* Main Content Area */}
        <div className="flex-1 flex gap-6 p-6">
          {/* Left Side - Agent Interface */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full min-h-[600px] relative">
              {/* Super simple: All iframes always rendered, just use CSS to show/hide */}
              <iframe
                src={agents.agent1.src}
                title={agents.agent1.title}
                className="absolute inset-0 w-full h-full min-h-[600px] border-none rounded-lg"
                style={{ display: activeTab === 'agent1' ? 'block' : 'none' }}
              />
              <iframe
                src={agents.agent2.src}
                title={agents.agent2.title}
                className="absolute inset-0 w-full h-full min-h-[600px] border-none rounded-lg"
                style={{ display: activeTab === 'agent2' ? 'block' : 'none' }}
              />
              <iframe
                src={agents.agent3.src}
                title={agents.agent3.title}
                className="absolute inset-0 w-full h-full min-h-[600px] border-none rounded-lg"
                style={{ display: activeTab === 'agent3' ? 'block' : 'none' }}
              />
            </div>
          </div>

          {/* Right Side - Best Practice Prompts */}
          <div className="w-80">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Best Practice Prompts
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Medical chronology review templates
                </p>
              </div>
              
              <div className="h-[580px] overflow-y-auto p-4 space-y-4">
                {/* Prompt 0: Summary */}
                <div 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer select-text"
                  onDoubleClick={() => copyPromptToClipboard(promptTemplates.summary)}
                  title="Double-click to copy prompt to clipboard"
                >
                  <h4 className="font-medium text-gray-900 mb-2">Prompt 0: Summary</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>Summarize the attached medical chronology for legal review. The summary must be structured, legally relevant, and formatted for attorney or insurance use. Follow this format:</p>
                    
                    <div className="bg-gray-50 p-3 rounded text-xs">
                      <div className="font-medium mb-2">### Patient Overview</div>
                      <div className="ml-2 space-y-1">
                        <div>- Name:</div>
                        <div>- Date of Injury:</div>
                        <div>- Mechanism of Injury:</div>
                        <div>- Primary Complaint(s):</div>
                        <div>- Pre-existing Conditions:</div>
                        <div>- First treatment date:</div>
                        <div>- Total duration of care:</div>
                      </div>
                      
                      <div className="font-medium mt-3 mb-2">### Chronological Summary Table</div>
                      <div className="text-xs">| Date | Provider | Facility | Visit Type | Diagnosis/Treatment | Notable Findings |</div>
                    </div>
                  </div>
                </div>

                {/* Prompt 1: Executive Medical Summary */}
                <div 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer select-text"
                  onDoubleClick={() => copyPromptToClipboard(promptTemplates.executive)}
                  title="Double-click to copy prompt to clipboard"
                >
                  <h4 className="font-medium text-gray-900 mb-2">Prompt 1: Executive Medical Summary</h4>
                  <div className="text-sm text-gray-700">
                    <p>Summarize the medical chronology in a structured format for legal case preparation. Include:</p>
                    <ul className="mt-2 ml-4 space-y-1 text-xs">
                      <li>• Diagnosis Summary</li>
                      <li>• Treatment Timeline</li>
                      <li>• Gaps in Treatment</li>
                      <li>• Provider Involvement</li>
                      <li>• Medical Opinions (including QME/IME if available)</li>
                      <li>• Current Status & Restrictions</li>
                      <li>• Legal Relevance or Red Flags</li>
                    </ul>
                  </div>
                </div>

                {/* Prompt 2: Provider Timeline Table */}
                <div 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer select-text"
                  onDoubleClick={() => copyPromptToClipboard(promptTemplates.timeline)}
                  title="Double-click to copy prompt to clipboard"
                >
                  <h4 className="font-medium text-gray-900 mb-2">Prompt 2: Provider Timeline Table</h4>
                  <div className="text-sm text-gray-700">
                    <p>From the medical record, generate a table with the following columns:</p>
                    <ul className="mt-2 ml-4 space-y-1 text-xs">
                      <li>• Date of Visit</li>
                      <li>• Provider Name</li>
                      <li>• Specialty</li>
                      <li>• Facility</li>
                      <li>• Purpose of Visit</li>
                      <li>• Key Diagnoses / Procedures</li>
                    </ul>
                    <p className="text-xs mt-2 italic">Only include medical visits relevant to the injury or litigation.</p>
                  </div>
                </div>

                {/* Prompt 3: Legal Highlight Extraction */}
                <div 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer select-text"
                  onDoubleClick={() => copyPromptToClipboard(promptTemplates.legal)}
                  title="Double-click to copy prompt to clipboard"
                >
                  <h4 className="font-medium text-gray-900 mb-2">Prompt 3: Legal Highlight Extraction</h4>
                  <div className="text-sm text-gray-700">
                    <p>Extract the following legally relevant facts from the medical chronology:</p>
                    <ul className="mt-2 ml-4 space-y-1 text-xs">
                      <li>• Any mention of malingering, exaggeration, or subjective complaints</li>
                      <li>• Gaps in treatment &gt; 30 days</li>
                      <li>• Work restrictions or functional impairments</li>
                      <li>• IME or QME opinions that impact liability or damages</li>
                      <li>• Pre-existing conditions that may conflict with the claim</li>
                      <li>• Non-compliance with treatment</li>
                    </ul>
                  </div>
                </div>

                {/* Prompt 4: Paralegal Summary for Demand Letter */}
                <div 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer select-text"
                  onDoubleClick={() => copyPromptToClipboard(promptTemplates.demand)}
                  title="Double-click to copy prompt to clipboard"
                >
                  <h4 className="font-medium text-gray-900 mb-2">Prompt 4: Paralegal Summary for Demand Letter</h4>
                  <div className="text-sm text-gray-700">
                    <p>Based on the medical record, write a brief summary suitable for inclusion in a demand letter. The summary should include:</p>
                    <ul className="mt-2 ml-4 space-y-1 text-xs">
                      <li>• Mechanism of injury</li>
                      <li>• Primary diagnoses and complaints</li>
                      <li>• Duration and nature of treatment</li>
                      <li>• Degree of recovery or permanent restrictions</li>
                      <li>• Any medical support for pain/suffering or disability claims</li>
                    </ul>
                  </div>
                </div>

                {/* Prompt 5: MMI & Functional Capacity Check */}
                <div 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer select-text"
                  onDoubleClick={() => copyPromptToClipboard(promptTemplates.mmi)}
                  title="Double-click to copy prompt to clipboard"
                >
                  <h4 className="font-medium text-gray-900 mb-2">Prompt 5: MMI & Functional Capacity Check</h4>
                  <div className="text-sm text-gray-700">
                    <p>Review the record and determine:</p>
                    <ul className="mt-2 ml-4 space-y-1 text-xs">
                      <li>• Has the patient reached Maximum Medical Improvement?</li>
                      <li>• If yes, when and by which provider?</li>
                      <li>• Are there any references to Functional Capacity Evaluations (FCEs)?</li>
                      <li>• Does the record document any permanent impairment ratings?</li>
                    </ul>
                  </div>
                </div>

                {/* Prompt 6: Future Medical Needs Summary */}
                <div 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer select-text"
                  onDoubleClick={() => copyPromptToClipboard(promptTemplates.future)}
                  title="Double-click to copy prompt to clipboard"
                >
                  <h4 className="font-medium text-gray-900 mb-2">Prompt 6: Future Medical Needs Summary</h4>
                  <div className="text-sm text-gray-700">
                    <p>Identify and list all references to:</p>
                    <ul className="mt-2 ml-4 space-y-1 text-xs">
                      <li>• Follow-up care or surgeries</li>
                      <li>• Long-term medication needs</li>
                      <li>• Physical or occupational therapy</li>
                      <li>• Chronic pain or mobility issues</li>
                      <li>• Psychiatric or psychological care</li>
                      <li>• Provider opinions on future prognosis</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}