import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthSimple as useAuth } from "@/hooks/useAuthSimple";
import type { User } from "@shared/schema";
import {
  Plus,
  Home,
  FileText,
  BarChart3,
  MessageCircleQuestion,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Code,
  Users,
  Bot,
} from "lucide-react";
import altoseraLogo from "@assets/Altosera_Two_Toned_Logo (1)_1753162846233.png";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const navigationItems = [
    {
      icon: Plus,
      label: "Create",
      href: "/create",
      color: "bg-emerald-500 hover:bg-emerald-600 text-white",
      special: true,
    },
    {
      icon: Home,
      label: "Home",
      href: "/",
      special: false,
    },
    {
      icon: FileText,
      label: "Documents",
      href: "/documents",
      special: false,
    },
    {
      icon: BarChart3,
      label: "Dashboard",
      href: "/dashboard",
      special: false,
    },
    {
      icon: MessageCircleQuestion,
      label: "Q&A",
      href: "/qa",
      special: false,
    },
    {
      icon: Bot,
      label: "Agent Q&A",
      href: "/agent-qa",
      special: false,
    },
    {
      icon: Settings,
      label: "Setting",
      href: "/manage",
      special: false,
    },
  ];

  // Add admin-only navigation items
  const adminItems = user?.role === 'admin' ? [
    {
      icon: Users,
      label: "User Management",
      href: "/admin-users",
      color: "text-purple-600 hover:text-purple-900 hover:bg-purple-50",
      special: false,
    },
    {
      icon: Code,
      label: "Test API",
      href: "/test-api",
      color: "text-orange-600 hover:text-orange-900 hover:bg-orange-50",
      special: false,
    },
  ] : [];

  // Combine regular and admin navigation items
  const allNavigationItems = [...navigationItems, ...adminItems];

  return (
    <div className={cn(
      "h-screen bg-slate-50 border-r border-slate-200 flex flex-col transition-all duration-300",
      "hidden md:flex", // Hide sidebar on mobile, show on medium screens and up
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Header with toggle */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <img 
              src={altoseraLogo} 
              alt="Altosera Logo" 
              className="h-8 w-auto object-contain" 
            />
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center w-full">
            <img 
              src={altoseraLogo} 
              alt="Altosera Logo" 
              className="h-6 w-auto object-contain" 
            />
          </div>
        )}
        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {allNavigationItems.map((item) => {
          const isActive = location === item.href;
          const IconComponent = item.icon;

          if (item.special) {
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  className={cn(
                    "w-full justify-start h-12 rounded-xl shadow-sm",
                    item.color
                  )}
                >
                  <IconComponent className={cn(
                    "h-5 w-5",
                    collapsed ? "mx-auto" : "mr-3"
                  )} />
                  {!collapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Button>
              </Link>
            );
          }

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-12 rounded-xl",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <IconComponent className={cn(
                  "h-5 w-5",
                  collapsed ? "mx-auto" : "mr-3"
                )} />
                {!collapsed && (
                  <span>{item.label}</span>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-slate-200">
        {!collapsed ? (
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || "User"} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(user?.firstName, user?.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.email}
              </p>
              <p className="text-xs text-slate-500">
                {user?.email}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || "User"} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(user?.firstName, user?.lastName)}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
        
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full text-slate-600 hover:text-slate-900 hover:bg-slate-100",
            collapsed ? "h-10 w-10 p-0" : "justify-start"
          )}
        >
          <LogOut className={cn("h-4 w-4", !collapsed && "mr-2")} />
          {!collapsed && "Sign Out"}
        </Button>
      </div>
    </div>
  );
}

export default Sidebar;