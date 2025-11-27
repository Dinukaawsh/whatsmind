"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageCircle,
  Users,
  Menu,
  X,
  LogOut,
  HelpCircle,
  Settings,
} from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Campaigns", href: "/campaigns", icon: MessageCircle },
  { name: "Contacts", href: "/contacts", icon: Users },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    email: string;
    username: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (isLoginPage) {
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
          } else {
            window.location.href = "/login";
          }
        } else {
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        window.location.href = "/login";
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [isLoginPage]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Logged out successfully");
        window.location.href = "/login";
      } else {
        toast.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred during logout");
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-green-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-blue-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <Link href="/" className="flex items-center space-x-2">
              <MessageCircle className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">WhatsMind</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? "bg-green-50 text-green-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon
                    className={`h-5 w-5 mr-3 ${
                      isActive ? "text-green-600" : "text-gray-500"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-200 p-4">
            {user && (
              <div className="mb-3 px-3 py-2 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500">
                  Logged in as
                </p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.username}
                </p>
              </div>
            )}
            <div className="space-y-1">
              <Link
                href="/help"
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HelpCircle className="h-5 w-5 mr-3 text-gray-500" />
                Help
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1 lg:flex lg:items-center lg:justify-between">
              <h1 className="text-xl font-semibold text-gray-900 ml-4 lg:ml-0">
                {navigation.find((item) => item.href === pathname)?.name ||
                  "WhatsMind"}
              </h1>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
