"use client";

import { Edit } from "lucide-react";
import { Campaign } from "../types";

interface CampaignViewModalProps {
  isOpen: boolean;
  campaign: Campaign | null;
  onClose: () => void;
  onEdit?: () => void;
}

export default function CampaignViewModal({
  isOpen,
  campaign,
  onClose,
  onEdit,
}: CampaignViewModalProps) {
  if (!isOpen || !campaign) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 text-[#05112b]">
          <div>
            <h2 className="text-lg font-semibold text-[#05112b]">
              Campaign Details
            </h2>
            <p className="text-sm text-[#05112b]/70">
              View summary and performance of this campaign.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#05112b]/50 hover:text-[#05112b]"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-4 space-y-4 overflow-y-auto text-[#05112b]">
          <div>
            <p className="text-xs font-semibold text-[#05112b]/70 uppercase">
              Name
            </p>
            <p className="mt-1 text-sm text-[#05112b]">{campaign.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#05112b]/70 uppercase">
              Description
            </p>
            <p className="mt-1 text-sm text-[#05112b]">
              {campaign.description || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#05112b]/70 uppercase">
              Status
            </p>
            <span
              className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-medium border ${
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
          </div>
          <div>
            <p className="text-xs font-semibold text-[#05112b]/70 uppercase">
              Message Template
            </p>
            <pre className="mt-1 text-sm text-[#05112b] bg-gray-50 border border-gray-200 rounded-lg p-3 whitespace-pre-wrap">
              {campaign.messageTemplate}
            </pre>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-[#05112b]/70 uppercase">
                Total Contacts
              </p>
              <p className="mt-1 text-sm text-[#05112b]">
                {campaign.totalContacts}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#05112b]/70 uppercase">
                Sent
              </p>
              <p className="mt-1 text-sm text-[#05112b]">
                {campaign.sentCount}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#05112b]/70 uppercase">
                Delivered
              </p>
              <p className="mt-1 text-sm text-[#05112b]">
                {campaign.deliveredCount}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#05112b]/70 uppercase">
                Replied
              </p>
              <p className="mt-1 text-sm text-[#05112b]">
                {campaign.repliedCount}
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3 text-[#05112b]">
          {onEdit && (
            <button
              onClick={onEdit}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit Campaign
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

