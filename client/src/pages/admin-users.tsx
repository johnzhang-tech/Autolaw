import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuthSimple as useAuth } from "@/hooks/useAuthSimple";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, Search, Shield, UserCheck, UserX, Calendar, Mail, MapPin, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/Sidebar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { User } from "@shared/schema";

// Form schemas
const createUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(['user', 'admin']),
  userStatus: z.enum(['Active', 'Locked', 'Expired']),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const editUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(['user', 'admin']),
  userStatus: z.enum(['Active', 'Locked', 'Expired']),
});

type CreateUserForm = z.infer<typeof createUserSchema>;
type EditUserForm = z.infer<typeof editUserSchema>;

export default function AdminUsers() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Note: Authentication and role checks are handled in the render logic below

  // Fetch all users (admin sees all, regular users see only themselves)
  const { data: users = [], isLoading, error, refetch } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!currentUser,
    retry: false,
  });

  // Debug log for users data
  console.log('Admin Users Debug:', { 
    currentUser: currentUser?.role, 
    users: users,
    usersType: typeof users,
    isArray: Array.isArray(users),
    usersLength: users?.length, 
    isLoading, 
    error: error?.message 
  });

  // Form instances
  const createForm = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "user",
      userStatus: "Active",
      password: "",
    },
  });

  const editForm = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      role: "user",
      userStatus: "Active",
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserForm) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('docuai_token')}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User Created",
        description: "User has been created successfully.",
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: EditUserForm }) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('docuai_token')}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User Updated",
        description: "User has been updated successfully.",
      });
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('docuai_token')}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User Deleted",
        description: "User has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Show loading while checking authentication
  if (!currentUser) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="p-8">
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading user data...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show access denied if not admin
  if (currentUser.role !== 'admin') {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="p-8">
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Access Restricted</h2>
                <p className="text-slate-600">This page requires administrator privileges.</p>
              </div>
            </div>
          </div>
        </main>
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

  // Handler functions
  const handleCreateUser = (data: CreateUserForm) => {
    createUserMutation.mutate(data);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    editForm.reset({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      role: user.role as 'user' | 'admin',
      userStatus: user.userStatus as 'Active' | 'Locked' | 'Expired',
    });
  };

  const handleUpdateUser = (data: EditUserForm) => {
    if (editingUser) {
      updateUserMutation.mutate({ userId: editingUser.id, data });
    }
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                  <p className="text-gray-600 mt-1">
                    Manage all users in the system. You can create, edit, and delete users.
                  </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Create User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New User</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={createForm.handleSubmit(handleCreateUser)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            {...createForm.register("firstName")}
                            placeholder="First name"
                          />
                          {createForm.formState.errors.firstName && (
                            <p className="text-sm text-red-500 mt-1">{createForm.formState.errors.firstName.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            {...createForm.register("lastName")}
                            placeholder="Last name"
                          />
                          {createForm.formState.errors.lastName && (
                            <p className="text-sm text-red-500 mt-1">{createForm.formState.errors.lastName.message}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          {...createForm.register("email")}
                          placeholder="Email address"
                        />
                        {createForm.formState.errors.email && (
                          <p className="text-sm text-red-500 mt-1">{createForm.formState.errors.email.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          {...createForm.register("password")}
                          placeholder="Password"
                        />
                        {createForm.formState.errors.password && (
                          <p className="text-sm text-red-500 mt-1">{createForm.formState.errors.password.message}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Select value={createForm.watch("role")} onValueChange={(value: 'user' | 'admin') => createForm.setValue("role", value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="userStatus">Status</Label>
                          <Select value={createForm.watch("userStatus")} onValueChange={(value: 'Active' | 'Locked' | 'Expired') => createForm.setValue("userStatus", value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Locked">Locked</SelectItem>
                              <SelectItem value="Expired">Expired</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createUserMutation.isPending}>
                          {createUserMutation.isPending ? "Creating..." : "Create User"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
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

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mb-4 bg-yellow-50 border-yellow-200">
            <CardContent className="pt-4">
              <p className="text-sm text-yellow-800">
                <strong>Debug Info:</strong> Current User Role: {currentUser?.role} | 
                Users Count: {users.length} | 
                Loading: {isLoading ? 'Yes' : 'No'} |
                Error: {error?.message || 'None'}
              </p>
            </CardContent>
          </Card>
        )}

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
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user account for {user.email}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(user.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete User
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

        {/* Edit User Dialog */}
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            {editingUser && (
              <form onSubmit={editForm.handleSubmit(handleUpdateUser)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editFirstName">First Name</Label>
                    <Input
                      id="editFirstName"
                      {...editForm.register("firstName")}
                      placeholder="First name"
                    />
                    {editForm.formState.errors.firstName && (
                      <p className="text-sm text-red-500 mt-1">{editForm.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="editLastName">Last Name</Label>
                    <Input
                      id="editLastName"
                      {...editForm.register("lastName")}
                      placeholder="Last name"
                    />
                    {editForm.formState.errors.lastName && (
                      <p className="text-sm text-red-500 mt-1">{editForm.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editRole">Role</Label>
                    <Select value={editForm.watch("role")} onValueChange={(value: 'user' | 'admin') => editForm.setValue("role", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editUserStatus">Status</Label>
                    <Select value={editForm.watch("userStatus")} onValueChange={(value: 'Active' | 'Locked' | 'Expired') => editForm.setValue("userStatus", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Locked">Locked</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateUserMutation.isPending}>
                    {updateUserMutation.isPending ? "Updating..." : "Update User"}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
          </div>
        </div>
      </main>
    </div>
  );
}