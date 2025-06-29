import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  Plus, 
  MessageCircle, 
  FileText, 
  Bot,
  User,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface ChatSession {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export default function QA() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessions = [] } = useQuery({
    queryKey: ["/api/chat/sessions"],
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/chat/sessions", currentSessionId, "messages"],
    enabled: !!currentSessionId,
  });

  const createSessionMutation = useMutation({
    mutationFn: async (title: string) => {
      return await apiRequest("/api/chat/sessions", {
        method: "POST",
        body: JSON.stringify({ title }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions"] });
      setCurrentSessionId(session.id);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ sessionId, content }: { sessionId: number; content: string }) => {
      // Send user message first
      await apiRequest(`/api/chat/sessions/${sessionId}/messages`, {
        method: "POST",
        body: JSON.stringify({ role: "user", content }),
        headers: { "Content-Type": "application/json" },
      });

      // Simulate AI response (replace with actual OpenAI integration)
      const aiResponse = generateAIResponse(content);
      return await apiRequest(`/api/chat/sessions/${sessionId}/messages`, {
        method: "POST",
        body: JSON.stringify({ role: "assistant", content: aiResponse }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions", currentSessionId, "messages"] });
      setMessageInput("");
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Simulate AI response for real estate document analysis
  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("hoa") || lowerMessage.includes("homeowner")) {
      return `📋 **HOA Document Analysis**

Based on typical HOA documents, here are key areas to review:

**🔍 Key Findings:**
• **Monthly Fees**: Review current HOA fees and any scheduled increases
• **Special Assessments**: Check for any upcoming or recent special assessments
• **Rules & Restrictions**: Understand pet policies, rental restrictions, and architectural guidelines
• **Financial Health**: Review the HOA's reserve fund and budget

**⚠️ Potential Risks:**
• Low reserve funds (should be 25-30% of annual budget)
• High delinquency rates
• Recent litigation or pending lawsuits
• Significant upcoming repairs or improvements

**📝 Recommended Actions:**
1. Request the most recent financial statements
2. Review meeting minutes for the past 12 months
3. Check for any pending assessments or fee increases
4. Verify insurance coverage details

Would you like me to analyze specific sections of your HOA documents in more detail?`;
    }

    if (lowerMessage.includes("contract") || lowerMessage.includes("purchase") || lowerMessage.includes("agreement")) {
      return `📄 **Purchase Contract Analysis**

**🔍 Key Contract Elements:**
• **Contingencies**: Inspection, financing, and appraisal contingencies
• **Timeline**: Important deadlines and closing dates
• **Price Terms**: Purchase price, earnest money, and financing details
• **Property Condition**: As-is clauses and seller disclosures

**⚠️ Critical Risk Areas:**
• Missing or weak inspection contingencies
• Unrealistic financing deadlines
• Unclear property boundaries or easements
• Limited seller disclosure information

**✅ Recommended Review Points:**
1. Verify all contingency periods are reasonable
2. Confirm financing pre-approval aligns with timeline
3. Review property survey and title requirements
4. Understand penalty clauses and remedies

I can help analyze specific contract clauses if you upload your purchase agreement.`;
    }

    if (lowerMessage.includes("risk") || lowerMessage.includes("problem") || lowerMessage.includes("issue")) {
      return `🚨 **Risk Assessment Summary**

**High Priority Risks:**
• **Financial**: Unusual payment terms or hidden costs
• **Legal**: Missing disclosures or non-standard clauses
• **Property**: Structural issues or environmental concerns
• **Timeline**: Aggressive deadlines that may be difficult to meet

**Medium Priority Concerns:**
• Market conditions affecting valuation
• HOA restrictions that may impact intended use
• Financing terms that could change

**🛡️ Risk Mitigation Strategies:**
1. **Document Review**: Ensure all paperwork is complete and accurate
2. **Professional Inspections**: Schedule thorough property inspections
3. **Legal Consultation**: Consider attorney review for complex terms
4. **Financial Verification**: Confirm all financial aspects with lender

What specific risks or concerns would you like me to analyze in more detail?`;
    }

    if (lowerMessage.includes("summary") || lowerMessage.includes("report")) {
      return `📊 **Transaction Summary Report**

**📋 Document Categories Analyzed:**
• **Contracts**: Purchase agreements, amendments
• **HOA Documents**: Bylaws, financial statements, meeting minutes
• **Inspections**: Property condition reports
• **Financial**: Loan documents, insurance policies
• **Legal**: Title reports, surveys, disclosures

**✅ Compliance Status:**
• All required disclosures: ✓ Complete
• Financing documents: ⚠️ Pending review
• Property inspections: ✓ Scheduled
• Title requirements: ✓ In progress

**🎯 Next Steps:**
1. Complete final walkthrough
2. Review closing disclosure
3. Confirm insurance coverage
4. Schedule closing appointment

**💡 Key Recommendations:**
- Monitor financing deadline closely
- Verify HOA transfer requirements
- Confirm all contingencies are satisfied

Would you like a detailed breakdown of any specific category?`;
    }

    // Default response
    return `Hello! I'm your AI real estate document assistant. I can help you analyze and understand your real estate documents including:

🏠 **What I can help with:**
• **HOA Documents**: Analyze bylaws, fees, restrictions, and financial health
• **Purchase Contracts**: Review terms, contingencies, and deadlines
• **Risk Assessment**: Identify potential issues and red flags
• **Document Summaries**: Provide categorized breakdowns of key information
• **Q&A**: Answer specific questions about clauses and terms

📝 **How to get the best help:**
- Ask specific questions about document sections
- Upload documents through the "Create" section first
- Request summaries for comprehensive overviews
- Ask about potential risks or concerns

What specific aspect of your real estate transaction would you like me to help you with today?`;
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    if (!currentSessionId) {
      // Create a new session first
      const title = messageInput.substring(0, 50) + (messageInput.length > 50 ? "..." : "");
      createSessionMutation.mutate(title);
      // The message will be sent after the session is created
      return;
    }

    sendMessageMutation.mutate({
      sessionId: currentSessionId,
      content: messageInput,
    });
  };

  const createNewChat = () => {
    setCurrentSessionId(null);
    setMessageInput("");
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-send message after session creation
  useEffect(() => {
    if (currentSessionId && messageInput && createSessionMutation.isSuccess) {
      sendMessageMutation.mutate({
        sessionId: currentSessionId,
        content: messageInput,
      });
    }
  }, [currentSessionId, createSessionMutation.isSuccess]);

  return (
    <div className="flex h-screen bg-white">
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex flex-1">
        {/* Chat Sessions Sidebar */}
        <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <Button onClick={createNewChat} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {sessions.map((session: ChatSession) => (
                <Button
                  key={session.id}
                  variant={currentSessionId === session.id ? "default" : "ghost"}
                  className="w-full justify-start h-auto p-3 text-left"
                  onClick={() => setCurrentSessionId(session.id)}
                >
                  <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <div className="truncate">
                    <div className="font-medium truncate">{session.title}</div>
                    <div className="text-xs opacity-70">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200">
            <h1 className="text-xl font-semibold text-slate-900">Document Q&A Assistant</h1>
            <p className="text-sm text-slate-600">Ask questions about your real estate documents</p>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.length === 0 && !currentSessionId ? (
                <div className="text-center py-12">
                  <Bot className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">
                    Welcome to DocuAI Assistant
                  </h2>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    I'm here to help you analyze and understand your real estate documents. 
                    Ask me anything about contracts, HOA documents, risks, or get summaries.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <Card className="cursor-pointer hover:bg-slate-50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-medium">Analyze HOA Documents</h3>
                            <p className="text-sm text-slate-500">Review fees, rules, and financial health</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:bg-slate-50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-medium">Contract Review</h3>
                            <p className="text-sm text-slate-500">Check terms, contingencies, and deadlines</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:bg-slate-50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-medium">Risk Assessment</h3>
                            <p className="text-sm text-slate-500">Identify potential issues and concerns</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:bg-slate-50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Info className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-medium">Document Summary</h3>
                            <p className="text-sm text-slate-500">Get comprehensive overviews</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message: ChatMessage) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          {message.role === 'user' ? (
                            <>
                              <AvatarImage src={user?.profileImageUrl || ""} />
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {getInitials(user?.firstName, user?.lastName)}
                              </AvatarFallback>
                            </>
                          ) : (
                            <AvatarFallback className="bg-slate-200">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className={`mx-3 p-4 rounded-2xl ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-slate-100 text-slate-900'
                        }`}>
                          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="bg-slate-200">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="mx-3 p-4 rounded-2xl bg-slate-100">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-slate-200">
            <div className="max-w-4xl mx-auto">
              <div className="flex space-x-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Ask about your documents..."
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={sendMessageMutation.isPending || createSessionMutation.isPending}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendMessageMutation.isPending || createSessionMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-center">
                AI assistant can analyze uploaded documents and provide insights on real estate transactions
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}