"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Users,
  Send,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { DashboardStats, Campaign } from "../types";

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to load dashboard");
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor your WhatsApp campaigns performance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Campaigns
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.totalCampaigns || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Campaigns
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.activeCampaigns || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Contacts
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.totalContacts || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Messages Sent</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.totalMessagesSent || 0}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Send className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.deliveryRate || 0}%
              </p>
            </div>
            <div className="p-3 bg-teal-100 rounded-lg">
              <CheckCircle className="h-8 w-8 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reply Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.replyRate || 0}%
              </p>
            </div>
            <div className="p-3 bg-pink-100 rounded-lg">
              <TrendingUp className="h-8 w-8 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      {stats?.recentCampaigns && stats.recentCampaigns.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Campaigns
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentCampaigns.map((campaign) => (
              <div
                key={campaign._id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {campaign.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {campaign.description || "No description"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        campaign.status === "running"
                          ? "bg-green-100 text-green-700"
                          : campaign.status === "completed"
                          ? "bg-blue-100 text-blue-700"
                          : campaign.status === "scheduled"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {campaign.status}
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {campaign.sentCount}/{campaign.totalContacts}
                      </p>
                      <p className="text-xs text-gray-500">sent</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
