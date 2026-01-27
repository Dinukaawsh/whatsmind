"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, Play, Pause, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Campaign, Contact } from "../types";
import LoadingSpinner from "../components/Loading/LoadingSpinner";
import Checkbox from "../components/Checkbox";
import CampaignViewModal from "../components/CampaignViewModal";
import CampaignEditModal from "../components/CampaignEditModal";
import ConfirmDialog from "../components/ConfirmDialog";

// Helper to create a soft background from a hex color
const hexToRgba = (hex: string, alpha: number) => {
  if (!hex || typeof hex !== "string") return `rgba(5, 17, 43, ${alpha})`;
  const cleaned = hex.replace("#", "");
  if (cleaned.length !== 6) return `rgba(5, 17, 43, ${alpha})`;
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return `rgba(5, 17, 43, ${alpha})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function CampaignPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  // Lead selection & filters for campaign creation
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [leads, setLeads] = useState<Contact[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadSearchTerm, setLeadSearchTerm] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>("all");
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignDescription, setNewCampaignDescription] = useState("");
  const [newCampaignMessage, setNewCampaignMessage] = useState("");
  // View / edit campaign
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, [statusFilter]);

  useEffect(() => {
    if (isCreateModalOpen) {
      // Load leads from CRM when the modal is opened
      loadLeads();
    } else {
      // Reset state when modal is closed
      setSelectedLeadIds([]);
      setLeadSearchTerm("");
      setLeadStatusFilter("all");
      setNewCampaignName("");
      setNewCampaignDescription("");
      setNewCampaignMessage("");
    }
  }, [isCreateModalOpen]);

  useEffect(() => {
    if (selectedCampaign) {
      setEditName(selectedCampaign.name || "");
      setEditDescription(selectedCampaign.description || "");
      setEditMessage(selectedCampaign.messageTemplate || "");
    }
  }, [selectedCampaign]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const url =
        statusFilter === "all"
          ? "/api/campaigns"
          : `/api/campaigns?status=${statusFilter}`;

      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to load campaigns");
      }
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error("Error loading campaigns:", error);
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const loadLeads = async () => {
    try {
      setLeadsLoading(true);
      const params = new URLSearchParams({
        page: "1",
        limit: "500", // fetch up to 500 leads for campaign creation
      });

      if (leadSearchTerm) {
        params.append("search", leadSearchTerm);
      }

      const url = `/api/contacts?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to load leads from CRM");
      }

      const data = await response.json();
      setLeads(data.contacts || []);
    } catch (error) {
      console.error("Error loading leads:", error);
      toast.error("Failed to load leads from CRM");
    } finally {
      setLeadsLoading(false);
    }
  };

  const uniqueLeadStatuses = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    leads.forEach((lead) => {
      if (lead.status) {
        map.set(lead.status._id, {
          id: lead.status._id,
          name: lead.status.name || "active",
        });
      }
    });
    return Array.from(map.values());
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        !leadSearchTerm ||
        lead.name.toLowerCase().includes(leadSearchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(leadSearchTerm.toLowerCase()) ||
        lead.phoneNumber
          .toLowerCase()
          .includes(leadSearchTerm.toLowerCase());

      const matchesStatus =
        leadStatusFilter === "all" ||
        (lead.status && lead.status._id === leadStatusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [leads, leadSearchTerm, leadStatusFilter]);

  const toggleSelectAllLeads = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l._id));
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((lid) => lid !== id) : [...prev, id]
    );
  };

  const handleUpdateCampaignStatus = async (
    campaignId: string,
    nextStatus: Campaign["status"]
  ) => {
    try {
      const response = await fetch("/api/campaigns", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId,
          status: nextStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to update campaign");
        return;
      }

      toast.success(`Campaign ${nextStatus === "running" ? "launched" : nextStatus}.`);
      // Update local state optimistically
      setCampaigns((prev) =>
        prev.map((c) => (c._id === data.campaign._id ? data.campaign : c))
      );
    } catch (error) {
      console.error("Error updating campaign status:", error);
      toast.error("An error occurred while updating the campaign");
    }
  };

  const handleDeleteCampaign = async () => {
    if (!deleteTargetId) return;

    try {
      const response = await fetch(`/api/campaigns?id=${deleteTargetId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to delete campaign");
        return;
      }

      toast.success("Campaign deleted successfully");
      setCampaigns((prev) => prev.filter((c) => c._id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (error) {
      console.error("Error deleting campaign:", error);
      toast.error("An error occurred while deleting the campaign");
    }
  };

  const handleOpenViewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsViewModalOpen(true);
  };

  const handleOpenEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsEditModalOpen(true);
  };

  const handleSaveEditCampaign = async () => {
    if (!selectedCampaign) return;
    if (!editName.trim() || !editMessage.trim()) {
      toast.error("Campaign name and message template are required.");
      return;
    }

    try {
      setEditSaving(true);
      const response = await fetch("/api/campaigns", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId: selectedCampaign._id,
          name: editName.trim(),
          description: editDescription.trim(),
          messageTemplate: editMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to update campaign");
        return;
      }

      toast.success("Campaign updated successfully");
      setCampaigns((prev) =>
        prev.map((c) => (c._id === data.campaign._id ? data.campaign : c))
      );
      setSelectedCampaign(data.campaign);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating campaign:", error);
      toast.error("An error occurred while updating the campaign");
    } finally {
      setEditSaving(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!newCampaignName.trim() || !newCampaignMessage.trim()) {
      toast.error("Please fill in campaign name and message template.");
      return;
    }

    if (selectedLeadIds.length === 0) {
      toast.error("Please select at least one lead.");
      return;
    }

    try {
      setCreatingCampaign(true);
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCampaignName.trim(),
          description: newCampaignDescription.trim() || undefined,
          messageTemplate: newCampaignMessage,
          targetContactIds: selectedLeadIds,
          // new campaigns from CRM leads start in paused state
          initialStatus: "paused",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to create campaign");
        return;
      }

      toast.success("Campaign created successfully (status: paused)");
      // Optimistically add to list
      setCampaigns((prev) => [data.campaign, ...prev]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error("An error occurred while creating the campaign");
    } finally {
      setCreatingCampaign(false);
    }
  };

  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-[#05112b]">Campaigns</h1>
          <p className="text-sm text-[#05112b]/70 mt-1">
            Manage your WhatsApp campaigns
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Campaign
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#05112b]/40" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-[#05112b] placeholder:text-[#05112b]/40"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-[#05112b] bg-white"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="running">Running</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#05112b]/70 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#05112b]/70 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#05112b]/70 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#05112b]/70 uppercase tracking-wider">
                  Delivered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#05112b]/70 uppercase tracking-wider">
                  Replied
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#05112b]/70 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No campaigns found. Create your first campaign to get
                    started!
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((campaign) => (
                  <tr
                    key={campaign._id}
                    className="hover:bg-gray-50 cursor-pointer text-[#05112b]"
                    onClick={() => handleOpenViewCampaign(campaign)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-[#05112b]">
                          {campaign.name}
                        </p>
                        <p className="text-xs text-[#05112b]/70">
                          {campaign.description || "No description"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
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
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${
                                campaign.totalContacts > 0
                                  ? (campaign.sentCount /
                                      campaign.totalContacts) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-[#05112b]/70">
                          {campaign.sentCount}/{campaign.totalContacts}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#05112b]">
                        {campaign.deliveredCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#05112b]">
                        {campaign.repliedCount}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end space-x-2">
                        {campaign.status === "paused" ||
                        campaign.status === "draft" ? (
                          <button
                            onClick={() =>
                              handleUpdateCampaignStatus(
                                campaign._id,
                                "running"
                              )
                            }
                            className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Launch
                          </button>
                        ) : null}
                        {campaign.status === "running" ||
                        campaign.status === "scheduled" ? (
                          <button
                            onClick={() =>
                              handleUpdateCampaignStatus(
                                campaign._id,
                                "paused"
                              )
                            }
                            className="flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors"
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </button>
                        ) : null}
                        <button
                          onClick={() => handleOpenEditCampaign(campaign)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(campaign._id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Create Campaign Modal - leads from CRM with status filter */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 text-[#05112b]">
              <div>
                <h2 className="text-lg font-semibold text-[#05112b]">
                  Create Campaign from CRM Leads
                </h2>
                <p className="text-sm text-[#05112b]/70">
                  Search and filter leads by status, select multiple, and
                  launch a WhatsApp campaign.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#05112b]/50 hover:text-[#05112b]"
              >
                ✕
              </button>
            </div>

            {/* Campaign details */}
            <div className="px-6 pt-4 pb-2 border-b border-gray-200 space-y-4 text-[#05112b]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#05112b] mb-1">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                    placeholder="Spring Promo - Warm Leads"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-[#05112b] placeholder:text-[#05112b]/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#05112b] mb-1">
                    Short Description (optional)
                  </label>
                  <input
                    type="text"
                    value={newCampaignDescription}
                    onChange={(e) => setNewCampaignDescription(e.target.value)}
                    placeholder="Follow-up campaign for CRM leads with warm status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-[#05112b] placeholder:text-[#05112b]/40"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#05112b] mb-1">
                  Message Template
                </label>
                <textarea
                  value={newCampaignMessage}
                  onChange={(e) => setNewCampaignMessage(e.target.value)}
                  placeholder="Hi {{firstName}}, we have a special update for you..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none text-[#05112b] placeholder:text-[#05112b]/40"
                />
                <p className="mt-1 text-xs text-[#05112b]/60">
                  You can use placeholders like &#123;&#123;firstName&#125;&#125;
                  which will be replaced per lead if supported by your workflow.
                </p>
              </div>
            </div>

            {/* Leads table & filters */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 py-3 border-b border-gray-200 flex flex-col md:flex-row gap-3 md:items-center md:justify-between text-[#05112b]">
                <div className="flex-1 relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#05112b]/40" />
                  <input
                    type="text"
                    placeholder="Search leads by name, email, phone..."
                    value={leadSearchTerm}
                    onChange={(e) => setLeadSearchTerm(e.target.value)}
                    onBlur={loadLeads}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-[#05112b] placeholder:text-[#05112b]/40"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={leadStatusFilter}
                    onChange={(e) => setLeadStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-[#05112b] bg-white"
                  >
                    <option value="all">All Statuses</option>
                    {uniqueLeadStatuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={loadLeads}
                    className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg text-[#05112b] hover:bg-gray-50"
                  >
                    <Filter className="h-4 w-4 mr-1" />
                    Refresh Leads
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {leadsLoading ? (
                  <div className="flex items-center justify-center min-h-[200px]">
                    <LoadingSpinner />
                  </div>
                ) : filteredLeads.length === 0 ? (
                  <div className="flex items-center justify-center min-h-[200px] text-sm text-gray-500">
                    No leads found from CRM for the current filters.
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 w-10">
                          <Checkbox
                            checked={
                              selectedLeadIds.length === filteredLeads.length &&
                              filteredLeads.length > 0
                            }
                            onChange={toggleSelectAllLeads}
                          />
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lead
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredLeads.map((lead) => (
                        <tr key={lead._id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <Checkbox
                              checked={selectedLeadIds.includes(lead._id)}
                              onChange={() => toggleSelectLead(lead._id)}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <div className="font-medium text-[#05112b]">
                              {lead.name}
                            </div>
                            {lead.source && (
                              <div className="text-xs text-[#05112b]/60 mt-0.5">
                                {lead.source}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-2 text-[#05112b]">
                            {lead.phoneNumber || "-"}
                          </td>
                          <td className="px-4 py-2 text-[#05112b]">
                            {lead.email || "-"}
                          </td>
                          <td className="px-4 py-2">
                            {lead.status ? (
                              <span
                                className="px-2 py-1 rounded-full text-xs font-medium border"
                                style={{
                                  backgroundColor: hexToRgba(
                                    lead.status.color || "#10b981",
                                    0.35
                                  ),
                                  color: "#05112b",
                                  borderColor: lead.status.color || "#10b981",
                                }}
                              >
                                {lead.status.name || "active"}
                              </span>
                            ) : (
                              <span
                                className="px-2 py-1 rounded-full text-xs font-medium border border-emerald-500 text-[#05112b]"
                                style={{
                                  backgroundColor: hexToRgba("#10b981", 0.35),
                                }}
                              >
                                active
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Modal footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="text-xs text-gray-600">
                  {selectedLeadIds.length > 0 ? (
                    <>
                      <span className="font-medium">
                        {selectedLeadIds.length}
                      </span>{" "}
                      lead
                      {selectedLeadIds.length !== 1 ? "s" : ""} selected for this
                      campaign.
                    </>
                  ) : (
                    "Select one or more leads to include in the campaign."
                  )}
                </div>
                <div className="flex items-center gap-3 justify-end">
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                    disabled={creatingCampaign}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCampaign}
                    disabled={
                      creatingCampaign ||
                      !newCampaignName.trim() ||
                      !newCampaignMessage.trim() ||
                      selectedLeadIds.length === 0
                    }
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg"
                  >
                    {creatingCampaign ? (
                      <span>Creating...</span>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        <span>Create Campaign</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <CampaignViewModal
        isOpen={isViewModalOpen}
        campaign={selectedCampaign}
        onClose={() => setIsViewModalOpen(false)}
        onEdit={() => {
          setIsViewModalOpen(false);
          setIsEditModalOpen(true);
        }}
      />
      <CampaignEditModal
        isOpen={isEditModalOpen}
        campaign={selectedCampaign}
        name={editName}
        description={editDescription}
        messageTemplate={editMessage}
        isSaving={editSaving}
        onNameChange={setEditName}
        onDescriptionChange={setEditDescription}
        onMessageChange={setEditMessage}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEditCampaign}
      />
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Delete campaign?"
        description="Are you sure you want to delete this campaign? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteCampaign}
      />
    </div>
  );
}
