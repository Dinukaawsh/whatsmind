"use client";

import { Campaign } from "../types";

interface CampaignEditModalProps {
  isOpen: boolean;
  campaign: Campaign | null;
  name: string;
  description: string;
  messageTemplate: string;
  isSaving: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function CampaignEditModal({
  isOpen,
  campaign,
  name,
  description,
  messageTemplate,
  isSaving,
  onNameChange,
  onDescriptionChange,
  onMessageChange,
  onClose,
  onSave,
}: CampaignEditModalProps) {
  if (!isOpen || !campaign) return null;

  const canSave = name.trim() && messageTemplate.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col text-[#05112b]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-[#05112b]">
              Edit Campaign
            </h2>
            <p className="text-sm text-[#05112b]/70">
              Update basic details of this campaign.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#05112b]/50 hover:text-[#05112b]"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-4 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-[#05112b] mb-1">
              Campaign Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-[#05112b] placeholder:text-[#05112b]/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#05112b] mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-[#05112b] placeholder:text-[#05112b]/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#05112b] mb-1">
              Message Template
            </label>
            <textarea
              value={messageTemplate}
              onChange={(e) => onMessageChange(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none text-[#05112b] placeholder:text-[#05112b]/40"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isSaving || !canSave}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

