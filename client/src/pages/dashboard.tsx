import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/Sidebar";
import { 
  TrendingUp, 
  FileText, 
  AlertTriangle, 
  DollarSign, 
  Shield, 
  Home,
  BarChart3,
  Activity,
  Calendar,
  Clock,
  Plus,
  MessageCircleQuestion
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface AnalyticsData {
  overview: {
    transactionCount: number;
    documentCount: number;
    avgRiskScore: number;
    highRiskDocs: number;
    activeTransactions: number;
  };
  documentTypes: Record<string, number>;
  commonRisks: Array<{ risk: string; count: number }>;
  recentDocs: Array<{
    id: number;
    fileName: string;
    category: string;
    riskScore?: number;
    createdAt: string;
  }>;
  monthlyUploads: Array<{
    month: string;
    uploads: number;
  }>;
}

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();

  // Fetch analytics data from backend
  const { data: analytics, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics/dashboard"],
    retry: false,
  });

  // Handle authentication errors
  if (error && isUnauthorizedError(error)) {
    toast({
      title: "Unauthorized", 
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        <div className={`flex-1 flex items-center justify-center transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  // Transform document types data for pie chart
  const documentTypesData = analytics ? Object.entries(analytics.documentTypes).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
    color: {
      hoa: '#3B82F6',
      contract: '#10B981',
      inspection: '#F59E0B',
      financial: '#8B5CF6',
      legal: '#EF4444',
      other: '#6B7280'
    }[type] || '#6B7280'
  })) : [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280'];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className="flex-1 w-full min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-gray-900">DocuAI</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Dashboard</span>
          </div>
        </div>
        
        <div className="p-4 md:p-6 space-y-6 overflow-y-auto h-full pb-20 md:pb-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-sm md:text-base text-gray-600">Monitor your real estate document portfolio and transaction insights</p>
          </div>

          {/* Key Metrics - Mobile Responsive Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6">
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Transactions</CardTitle>
                <Home className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold text-gray-900">
                  {analytics?.overview.transactionCount || 0}
                </div>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {analytics?.overview.activeTransactions || 0} active
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Documents</CardTitle>
                <FileText className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold text-gray-900">
                  {analytics?.overview.documentCount || 0}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  reviewed
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Avg Risk</CardTitle>
                <Shield className="h-3 w-3 md:h-4 md:w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold text-gray-900">
                  {analytics?.overview.avgRiskScore || 0}/100
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  {(analytics?.overview.avgRiskScore || 0) > 70 ? 'High' : 
                   (analytics?.overview.avgRiskScore || 0) > 40 ? 'Medium' : 'Low'} risk
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600">High Risk</CardTitle>
                <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold text-gray-900">
                  {analytics?.overview.highRiskDocs || 0}
                </div>
                <p className="text-xs text-red-600 mt-1">
                  need attention
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600">This Month</CardTitle>
                <Calendar className="h-3 w-3 md:h-4 md:w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold text-gray-900">
                  {analytics?.monthlyUploads.slice(-1)[0]?.uploads || 0}
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  uploads
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section - Mobile Responsive */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Upload Trend Chart */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-base md:text-lg font-semibold text-gray-900">Upload Trend</CardTitle>
                <CardDescription className="text-sm">Document uploads over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 md:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics?.monthlyUploads || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        stroke="#666"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        stroke="#666"
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="uploads" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Document Types Pie Chart */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-base md:text-lg font-semibold text-gray-900">Document Types</CardTitle>
                <CardDescription className="text-sm">Distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 md:h-64">
                  {documentTypesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={documentTypesData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {documentTypesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                      No documents uploaded yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Analysis and Recent Activity */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Common Risks */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-base md:text-lg font-semibold text-gray-900">Common Risks Found</CardTitle>
                <CardDescription className="text-sm">Most frequent compliance issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(analytics?.commonRisks || []).map((item, index) => (
                    <div key={item.risk} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={item.count > 5 ? 'destructive' : 
                                  item.count > 2 ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {item.count > 5 ? 'High' : item.count > 2 ? 'Med' : 'Low'}
                        </Badge>
                        <span className="text-xs md:text-sm text-gray-700 font-medium">{item.risk}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{item.count}</span>
                    </div>
                  ))}
                  {(analytics?.commonRisks || []).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No risk patterns detected yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-base md:text-lg font-semibold text-gray-900">Recent Documents</CardTitle>
                <CardDescription className="text-sm">Latest uploads and analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(analytics?.recentDocs || []).map((doc) => (
                    <div key={doc.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs md:text-sm font-medium text-gray-900 truncate">
                          {doc.fileName}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center space-x-2">
                          <span className="capitalize">{doc.category}</span>
                          {doc.riskScore && (
                            <>
                              <span>•</span>
                              <span className={`font-medium ${
                                doc.riskScore > 70 ? 'text-red-600' : 
                                doc.riskScore > 40 ? 'text-orange-600' : 'text-green-600'
                              }`}>
                                Risk: {doc.riskScore}/100
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {(analytics?.recentDocs || []).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No documents uploaded yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex justify-around items-center">
            <Link href="/" className="flex flex-col items-center py-1 px-2">
              <Home className="h-5 w-5 text-gray-600" />
              <span className="text-xs text-gray-600 mt-1">Home</span>
            </Link>
            <Link href="/create" className="flex flex-col items-center py-1 px-2">
              <Plus className="h-5 w-5 text-blue-600" />
              <span className="text-xs text-blue-600 mt-1">Create</span>
            </Link>
            <Link href="/dashboard" className="flex flex-col items-center py-1 px-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span className="text-xs text-blue-600 mt-1 font-medium">Dashboard</span>
            </Link>
            <Link href="/qa" className="flex flex-col items-center py-1 px-2">
              <MessageCircleQuestion className="h-5 w-5 text-gray-600" />
              <span className="text-xs text-gray-600 mt-1">Q&A</span>
            </Link>
            <Link href="/documents" className="flex flex-col items-center py-1 px-2">
              <FileText className="h-5 w-5 text-gray-600" />
              <span className="text-xs text-gray-600 mt-1">Docs</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}