"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Users,
  Send,
  TrendingUp,
  Clock,
  CheckCircle,
  Building2,
  UserPlus,
} from "lucide-react";
import toast from "react-hot-toast";
import { DashboardStats, Campaign } from "../types";
import LoadingSpinner from "../components/Loading/LoadingSpinner";
import CampaignViewModal from "../components/CampaignViewModal";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

  // Derived datasets for charts
  const campaignStatusData = useMemo(() => {
    if (!stats?.recentCampaigns) return [];
    const counts: Record<string, number> = {};
    stats.recentCampaigns.forEach((c) => {
      const key = c.status || "unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([status, value]) => ({
      name: status,
      value,
    }));
  }, [stats]);

  const recentCampaignPerformance = useMemo(() => {
    if (!stats?.recentCampaigns) return [];
    // Sort by createdAt if present, otherwise keep order
    const campaigns = [...stats.recentCampaigns];
    campaigns.sort((a: any, b: any) => {
      if (a.createdAt && b.createdAt) {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return 0;
    });
    return campaigns.map((c) => ({
      name: c.name,
      Sent: c.sentCount,
      Delivered: c.deliveredCount,
      Replied: c.repliedCount,
    }));
  }, [stats]);

  const leadsByStatusData = useMemo(() => {
    if (!stats?.recentLeads) return [];
    const counts: Record<string, number> = {};
    stats.recentLeads.forEach((lead) => {
      const key = lead.status?.name || "No status";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([status, value]) => ({
      name: status,
      value,
    }));
  }, [stats]);

  const STATUS_COLORS: Record<string, string> = {
    running: "#22c55e",
    completed: "#3b82f6",
    scheduled: "#eab308",
    paused: "#f97316",
    draft: "#6b7280",
    failed: "#ef4444",
    unknown: "#94a3b8",
  };

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
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#05112b]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#05112b]">Dashboard</h1>
          <p className="text-sm text-[#05112b]/70 mt-1">
            Monitor your WhatsApp campaigns performance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#05112b]/70">
                Total Campaigns
              </p>
              <p className="text-3xl font-bold text-[#05112b] mt-2">
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
              <p className="text-sm font-medium text-[#05112b]/70">
                Active Campaigns
              </p>
              <p className="text-3xl font-bold text-[#05112b] mt-2">
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
              <p className="text-sm font-medium text-[#05112b]/70">
                Total Leads
              </p>
              <p className="text-3xl font-bold text-[#05112b] mt-2">
                {stats?.totalLeads || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <UserPlus className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#05112b]/70">
                Active Leads
              </p>
              <p className="text-3xl font-bold text-[#05112b] mt-2">
                {stats?.activeLeads || 0}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Users className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {stats?.totalCompanies !== undefined && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#05112b]/70">
                  Companies
                </p>
                <p className="text-3xl font-bold text-[#05112b] mt-2">
                  {stats.totalCompanies}
                </p>
              </div>
              <div className="p-3 bg-cyan-100 rounded-lg">
                <Building2 className="h-8 w-8 text-cyan-600" />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#05112b]/70">
                Messages Sent
              </p>
              <p className="text-3xl font-bold text-[#05112b] mt-2">
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
              <p className="text-sm font-medium text-[#05112b]/70">
                Delivery Rate
              </p>
              <p className="text-3xl font-bold text-[#05112b] mt-2">
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
              <p className="text-sm font-medium text-[#05112b]/70">
                Reply Rate
              </p>
              <p className="text-3xl font-bold text-[#05112b] mt-2">
                {stats?.replyRate || 0}%
              </p>
            </div>
            <div className="p-3 bg-pink-100 rounded-lg">
              <TrendingUp className="h-8 w-8 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
          <h2 className="text-sm font-semibold text-[#05112b]">
            Campaign Status Distribution
          </h2>
          <div className="h-64">
            {campaignStatusData.length === 0 ? (
              <p className="text-xs text-[#05112b]/60 flex items-center justify-center h-full">
                Not enough campaign data to display.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={campaignStatusData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    label={(entry) => `${entry.name} (${entry.value})`}
                  >
                    {campaignStatusData.map((entry, index) => {
                      const base =
                        STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] ||
                        STATUS_COLORS.unknown;
                      return <Cell key={`cell-${index}`} fill={base} />;
                    })}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
          <h2 className="text-sm font-semibold text-[#05112b]">
            Recent Campaign Performance
          </h2>
          <div className="h-64">
            {recentCampaignPerformance.length === 0 ? (
              <p className="text-xs text-[#05112b]/60 flex items-center justify-center h-full">
                Not enough campaign data to display.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recentCampaignPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Sent"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Delivered"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Replied"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
          <h2 className="text-sm font-semibold text-[#05112b]">
            Recent Leads by Status
          </h2>
          <div className="h-64">
            {leadsByStatusData.length === 0 ? (
              <p className="text-xs text-[#05112b]/60 flex items-center justify-center h-full">
                Not enough lead data to display.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadsByStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0f766e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Campaigns */}
        {stats?.recentCampaigns && stats.recentCampaigns.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-[#05112b]">
                Recent Campaigns
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {stats.recentCampaigns.map((campaign) => (
                <div
                  key={campaign._id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedCampaign(campaign);
                    setIsCampaignModalOpen(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-[#05112b]">
                        {campaign.name}
                      </h3>
                      <p className="text-xs text-[#05112b]/70 mt-1">
                        {campaign.description || "No description"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          campaign.status === "running"
                            ? "bg-green-100 border-green-300"
                            : campaign.status === "completed"
                            ? "bg-blue-100 border-blue-300"
                            : campaign.status === "scheduled"
                            ? "bg-yellow-100 border-yellow-300"
                            : campaign.status === "paused"
                            ? "bg-orange-100 border-orange-300"
                            : "bg-gray-100 border-gray-300"
                        } text-[#05112b]`}
                      >
                        {campaign.status}
                      </span>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#05112b]">
                          {campaign.sentCount}/{campaign.totalContacts}
                        </p>
                        <p className="text-xs text-[#05112b]/70">sent</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Leads */}
        {stats?.recentLeads && stats.recentLeads.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-[#05112b]">
                Recent Leads
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {stats.recentLeads.map((lead) => (
                <div
                  key={lead._id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-[#05112b]">
                        {lead.name}
                      </h3>
                      <div className="flex items-center space-x-3 mt-1">
                        {lead.email && (
                          <p className="text-xs text-[#05112b]/70">
                            {lead.email}
                          </p>
                        )}
                        {lead.phone && (
                          <p className="text-xs text-[#05112b]/70">
                            {lead.phone}
                          </p>
                        )}
                      </div>
                      {lead.company && (
                        <p className="text-xs text-[#05112b]/60 mt-1">
                          {lead.company}
                        </p>
                      )}
                    </div>
                    {lead.status && (
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium ml-3 border"
                        style={{
                          backgroundColor: `${lead.status.color}26`,
                          color: "#05112b",
                          borderColor: lead.status.color,
                        }}
                      >
                        {lead.status.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <CampaignViewModal
        isOpen={isCampaignModalOpen}
        campaign={selectedCampaign}
        onClose={() => setIsCampaignModalOpen(false)}
      />
    </div>
  );
}
