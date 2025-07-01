import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/Sidebar";
import { Send, MessageCircle, Plus, Trash2, FileText, Bot, User, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";

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
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch chat sessions
  const { data: sessions = [], isLoading: sessionsLoading, error: sessionsError } = useQuery<ChatSession[]>({
    queryKey: ["/api/chat-sessions"],
  });

  // Fetch messages for selected session
  const { data: messages = [], isLoading: messagesLoading, error: messagesError } = useQuery<ChatMessage[]>({
    queryKey: [`/api/chat-sessions/${selectedSession}/messages`],
    enabled: !!selectedSession,
  });

  // Handle errors with useEffect
  useEffect(() => {
    if (sessionsError && isUnauthorizedError(sessionsError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [sessionsError, toast]);

  useEffect(() => {
    if (messagesError && isUnauthorizedError(messagesError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [messagesError, toast]);

  // Create new chat session
  const createSessionMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest('POST', '/api/chat-sessions', { title });
      return await response.json();
    },
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat-sessions"] });
      setSelectedSession(newSession.id);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create new chat session",
        variant: "destructive",
      });
    },
  });

  // Send message with OpenAI
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, sessionId }: { message: string; sessionId: number }) => {
      setIsTyping(true);
      const response = await apiRequest('POST', `/api/chat-sessions/${sessionId}/messages`, { 
        content: message, 
        role: 'user' 
      });
      return await response.json();
    },
    onSuccess: () => {
      setMessage("");
      setIsTyping(false);
      if (selectedSession) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/chat-sessions/${selectedSession}/messages`] 
        });
      }
    },
    onError: (error: Error) => {
      setIsTyping(false);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    let sessionId: number;

    // If no session selected, create new one
    if (!selectedSession) {
      const title = message.slice(0, 30) + (message.length > 30 ? "..." : "");
      const newSession = await createSessionMutation.mutateAsync(title);
      sessionId = newSession.id;
      setSelectedSession(sessionId);
    } else {
      sessionId = selectedSession;
    }

    sendMessageMutation.mutate({ message, sessionId });
  };

  const handleNewChat = () => {
    const title = "New HOA Question";
    createSessionMutation.mutate(title);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Sample questions for new users
  const sampleQuestions = [
    "What are the typical HOA fees I should expect?",
    "How do I check for compliance violations?",
    "What insurance requirements should I look for?",
    "How are maintenance responsibilities divided?",
  ];

  return (
    <div className="flex h-screen bg-white">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className="flex-1 flex">
        {/* Chat Sessions Sidebar */}
        <div className="w-80 bg-gray-50 hidden md:flex flex-col border-r border-gray-200">
          <div className="px-2 py-3 border-b border-gray-200">
            <Button 
              onClick={handleNewChat}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-center"
              disabled={createSessionMutation.isPending}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-2 py-3">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Chats</h3>
            {sessionsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : sessions.length > 0 ? (
              <div className="space-y-2">
                {sessions.map((session: ChatSession) => (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSession(session.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedSession === session.id
                        ? 'bg-blue-100 border border-blue-200'
                        : 'bg-white hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-800 truncate">
                      {session.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 text-sm">
                No conversations yet. Start a new chat!
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="border-b border-gray-200 p-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  HOA Document Q&A
                </h1>
                <p className="text-sm text-gray-600">
                  Ask questions about your HOA documents and compliance
                </p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                AI Powered
              </Badge>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {!selectedSession ? (
              // Welcome screen
              <div className="max-w-2xl mx-auto text-center py-12">
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  <Bot className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Welcome to DocuAI Chat
                  </h2>
                  <p className="text-gray-600 mb-8">
                    I'm your HOA document expert. Ask me anything about fees, violations, 
                    compliance, insurance requirements, or maintenance responsibilities.
                  </p>
                  
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Try asking:
                    </h3>
                    {sampleQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setMessage(question)}
                        className="block w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-sm"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : messagesLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              // Messages
              <div className="max-w-4xl mx-auto space-y-4">
                {messages.map((message: ChatMessage) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-3xl p-4 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white ml-12'
                          : 'bg-white border border-gray-200 mr-12'
                      }`}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <div className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                    
                    {message.role === 'user' && user && (
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                        {user.profileImageUrl ? (
                          <img 
                            src={user.profileImageUrl} 
                            alt={user.firstName || 'User'} 
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 mr-12">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <div className="flex-1 relative">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about HOA fees, violations, compliance..."
                  className="pr-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={sendMessageMutation.isPending}
                />
              </div>
              <Button
                type="submit"
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
            
            <div className="mt-2 text-xs text-gray-500 text-center">
              AI responses are generated based on general HOA knowledge and your document analysis
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}