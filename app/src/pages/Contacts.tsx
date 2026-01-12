"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Upload, MessageCircle, Phone, Mail, X } from "lucide-react";
import toast from "react-hot-toast";
import { Contact } from "../types";

export default function Contacts() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadContacts();
  }, []);

  // Auto-search with debounce when typing
  useEffect(() => {
    const timer = setTimeout(() => {
      loadContacts();
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const url = `/api/contacts${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to load contacts");
      }
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error("Error loading contacts:", error);
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleStartWhatsAppConversation = (contact: Contact) => {
    // Format phone number for WhatsApp (remove spaces, dashes, etc.)
    const cleanNumber = contact.phoneNumber.replace(/[^0-9+]/g, "");

    // Open WhatsApp Web with the contact's number
    const whatsappUrl = `https://wa.me/${cleanNumber}`;
    window.open(whatsappUrl, "_blank");

    toast.success(`Opening WhatsApp chat with ${contact.name}`);
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
          <h1 className="text-2xl font-bold text-gray-900">
            Contacts from CRM
          </h1>
          <p className="text-gray-600 mt-1">
            Manage leads from your CRM and start WhatsApp conversations
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadContacts}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="h-5 w-5 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black ${
                searchTerm ? "pr-10" : "pr-4"
              }`}
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {searchTerm
                      ? "No contacts found matching your search."
                      : "No leads available. Leads from your CRM will appear here."}
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {contact.name}
                        </p>
                        {contact.phoneType && (
                          <p className="text-xs text-gray-500 mt-1">
                            {contact.phoneType} number
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-900">
                          {contact.phoneNumber}
                        </p>
                      </div>
                      {contact.allPhones && contact.allPhones.length > 1 && (
                        <p className="text-xs text-gray-500 mt-1">
                          +{contact.allPhones.length - 1} more
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {contact.email ? (
                          <>
                            <Mail className="h-4 w-4 text-gray-400" />
                            <p className="text-sm text-gray-600">
                              {contact.email}
                            </p>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {contact.source || "CRM"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          contact.status === "active"
                            ? "bg-green-100 text-green-700"
                            : contact.status === "unsubscribed"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() =>
                            handleStartWhatsAppConversation(contact)
                          }
                          className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          title="Start WhatsApp Conversation"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm">WhatsApp</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary footer */}
        {contacts.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{contacts.length}</span>{" "}
              lead
              {contacts.length !== 1 ? "s" : ""} from CRM
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
