import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Shield, UserCheck, UserX, Calendar, Mail, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

export default function AdminUsers() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/';
      return;
    }
    
    if (currentUser && currentUser.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "This page is only accessible to administrators.",
        variant: "destructive",
      });
      window.location.href = '/';
      return;
    }
  }, [currentUser, isAuthenticated, toast]);

  // Fetch all users (admin only)
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: currentUser?.role === 'admin',
  });

  // Role update mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'user' | 'admin' }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('docuai_token')}`
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Role Updated",
        description: "User role has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Show loading or access denied
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Access Restricted</h2>
            <p className="text-slate-600">This page requires administrator privileges.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.userStatus === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleRoleUpdate = (userId: string, newRole: 'user' | 'admin') => {
    updateRoleMutation.mutate({ userId, newRole });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-64"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          </div>
          <p className="text-slate-600">
            Manage all users in the system. You can update roles and view user details.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Users</p>
                  <p className="text-2xl font-bold text-slate-900">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-slate-600">Admins</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-slate-600">Active</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {users.filter(u => u.userStatus === 'Active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <UserX className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-slate-600">Locked</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {users.filter(u => u.userStatus === 'Locked').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Locked">Locked</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {user.firstName?.[0] || user.email?.[0] || 'U'}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-slate-900">
                          {user.firstName || user.lastName 
                            ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                            : 'No Name'
                          }
                        </h3>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        <Badge variant={
                          user.userStatus === 'Active' ? 'default' :
                          user.userStatus === 'Locked' ? 'destructive' : 'secondary'
                        }>
                          {user.userStatus}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span>{user.email || 'No email'}</span>
                        </div>
                        
                        {user.region && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{user.region}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {user.role === 'admin' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRoleUpdate(user.id, 'user')}
                        disabled={updateRoleMutation.isPending || user.id === currentUser.id}
                      >
                        Make User
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleRoleUpdate(user.id, 'admin')}
                        disabled={updateRoleMutation.isPending}
                      >
                        Make Admin
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No users found</h3>
                  <p className="text-slate-600">
                    {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                      ? "Try adjusting your search or filters."
                      : "No users in the system yet."
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}