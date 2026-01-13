"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/Loading/LoadingSpinner";
import InputBox from "../components/InputBox";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingCrm, setCheckingCrm] = useState(true);

  // Check for CRM session on component mount
  useEffect(() => {
    const checkCrmSession = async () => {
      try {
        const response = await fetch("/api/auth/sync-crm", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            // CRM session exists and user is Admin, auto-login
            toast.success("Logged in with CRM session");
            setTimeout(() => {
              window.location.href = "/";
            }, 500);
            return;
          }
        }
      } catch (error) {
        // No CRM session or error, continue to login form
        console.log("No CRM session found, showing login form");
      } finally {
        setCheckingCrm(false);
      }
    };

    checkCrmSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Login successful!");
        // Use window.location for hard redirect to ensure cookies are loaded
        // Add a longer delay to ensure cookie is set
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        toast.error(data.error || "Login failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
      setLoading(false);
    }
  };

  // Show loading while checking CRM session
  if (checkingCrm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <LoadingSpinner className="mb-4" />
          <p className="text-gray-600">Checking CRM session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-green-100 rounded-full mb-4">
            <MessageCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">WhatsMind</h1>
          <p className="text-gray-600 mt-2">WhatsApp Automation Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <InputBox
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
              icon={<Mail className="h-5 w-5 text-gray-400" />}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <InputBox
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              icon={<Lock className="h-5 w-5 text-gray-400" />}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Need help? Contact your administrator
        </p>
      </div>
    </div>
  );
}
