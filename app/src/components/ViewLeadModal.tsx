"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Phone,
  Mail,
  Building2,
  User,
  Calendar,
  Tag,
  MessageCircle,
  Rocket,
} from "lucide-react";
import { Contact } from "../types";

interface ViewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onStartWhatsApp?: (contact: Contact) => void;
  onLaunchCampaign?: (contact: Contact) => void;
}

export default function ViewLeadModal({
  isOpen,
  onClose,
  contact,
  onStartWhatsApp,
  onLaunchCampaign,
}: ViewLeadModalProps) {
  if (!contact) return null;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && contact && (
        <>
          {/* Invisible overlay for outside click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-200/50 pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                <motion.h3
                  className="text-xl font-semibold text-gray-900"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Lead Details
                </motion.h3>
                <motion.button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100/80 rounded-lg transition-colors"
                  title="Close"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5 text-gray-500" />
                </motion.button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Name Section */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-5 w-5 text-gray-400" />
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        Name
                      </h4>
                    </div>
                    <p className="text-lg font-medium text-gray-900">
                      {contact.name}
                    </p>
                    {contact.firstName && contact.lastName && (
                      <p className="text-sm text-gray-600 mt-1">
                        {contact.firstName} {contact.lastName}
                      </p>
                    )}
                  </div>

                  {/* Phone Numbers Section */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        Phone Numbers
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {contact.phoneNumber && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {contact.phoneNumber}
                              </p>
                              <p className="text-xs text-gray-500">
                                {contact.phoneType || "Primary"} Number
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      {contact.allPhones && contact.allPhones.length > 0 && (
                        <>
                          {contact.allPhones
                            .filter(
                              (phone) => phone.number !== contact.phoneNumber
                            )
                            .map((phone, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {phone.number}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">
                                      {phone.type} Number
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Email Section */}
                  {contact.email && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Email
                        </h4>
                      </div>
                      <p className="text-sm text-gray-900 break-all">
                        {contact.email}
                      </p>
                    </div>
                  )}

                  {/* Company Section */}
                  {(contact as any).company && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Building2 className="h-5 w-5 text-gray-400" />
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Company
                        </h4>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">
                          {(contact as any).company.name}
                        </p>
                        {(contact as any).company.location && (
                          <p className="text-sm text-gray-600">
                            Location: {(contact as any).company.location}
                          </p>
                        )}
                        {(contact as any).company.industry && (
                          <p className="text-sm text-gray-600">
                            Industry: {(contact as any).company.industry}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status Section */}
                  {contact.status && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Tag className="h-5 w-5 text-gray-400" />
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Status
                        </h4>
                      </div>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium inline-block border"
                        style={{
                          backgroundColor: `${(contact.status.color ||
                            "#059669") + "26"}`,
                          color: "#05112b",
                          borderColor: contact.status.color || "#059669",
                        }}
                      >
                        {contact.status.name || "active"}
                      </span>
                    </div>
                  )}

                  {/* Source Section */}
                  {contact.source && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Tag className="h-5 w-5 text-gray-400" />
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Source
                        </h4>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {contact.source}
                      </span>
                    </div>
                  )}

                  {/* Campaign Section */}
                  {contact.campaign && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <MessageCircle className="h-5 w-5 text-gray-400" />
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Campaign
                        </h4>
                      </div>
                      <p className="text-sm text-gray-900">
                        {contact.campaign}
                      </p>
                    </div>
                  )}

                  {/* Project Section */}
                  {contact.project && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Building2 className="h-5 w-5 text-gray-400" />
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Project
                        </h4>
                      </div>
                      <p className="text-sm text-gray-900">{contact.project}</p>
                    </div>
                  )}

                  {/* Assigned To Section */}
                  {contact.assignedTo && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-5 w-5 text-gray-400" />
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Assigned To
                        </h4>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {contact.assignedTo.name}
                        </p>
                        {contact.assignedTo.email && (
                          <p className="text-sm text-gray-600">
                            {contact.assignedTo.email}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Date Inscription Section */}
                  {contact.dateInscription && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Date Inscription
                        </h4>
                      </div>
                      <p className="text-sm text-gray-900">
                        {formatDate(contact.dateInscription)}
                      </p>
                    </div>
                  )}

                  {/* Tags Section */}
                  {contact.tags && contact.tags.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Tag className="h-5 w-5 text-gray-400" />
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Tags
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {contact.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200/50 flex items-center justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Close
                </button>
                {!contact.whatsappCampaignLaunched && onLaunchCampaign && (
                  <button
                    onClick={() => {
                      onLaunchCampaign(contact);
                      onClose();
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Rocket className="h-4 w-4" />
                    <span>Launch Campaign</span>
                  </button>
                )}
                {contact.whatsappCampaignLaunched && onStartWhatsApp && (
                  <button
                    onClick={() => {
                      onStartWhatsApp(contact);
                      onClose();
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Start WhatsApp Chat</span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
