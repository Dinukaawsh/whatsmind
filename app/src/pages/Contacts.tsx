"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  RefreshCw,
  MessageCircle,
  Phone,
  Mail,
  Eye,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { Contact } from "../types";
import { CONTACTS_TABLE_DEFAULT_COLUMNS } from "../../contacts/contactsTableDefaults";
import ColumnSelector, { ColumnConfig } from "../components/ColumnSelector";
import Checkbox from "../components/Checkbox";
import CustomDropdown from "../components/CustomDropdown";
import LoadingSpinner from "../components/Loading/LoadingSpinner";
import Pagination from "../components/Pagination";
import InputBox from "../components/InputBox";
import ViewLeadModal from "../components/ViewLeadModal";

interface Company {
  _id: string;
  name: string;
  location?: string;
  industry?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function Contacts() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Column configuration with localStorage persistence
  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("contacts-column-config");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Error loading column config:", e);
        }
      }
    }
    return CONTACTS_TABLE_DEFAULT_COLUMNS as ColumnConfig[];
  });

  // Save column config to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "contacts-column-config",
        JSON.stringify(columnConfig)
      );
    }
  }, [columnConfig]);

  // Pagination
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 100,
    totalCount: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
    loadContacts();
  }, [pagination.page, pagination.limit]);

  // Auto-search with debounce when typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        loadContacts();
      } else {
        setPagination((prev) => ({ ...prev, page: 1 }));
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCompany]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }
      if (selectedCompany && selectedCompany !== "all") {
        params.append("companyId", selectedCompany);
      }

      const url = `/api/contacts?${params.toString()}`;
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
      if (data.companies) {
        setCompanies(data.companies || []);
      }
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleStartWhatsAppConversation = async (contact: Contact) => {
    try {
      // Call API to start chat and trigger n8n webhook
      const response = await fetch("/api/chat/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId: contact._id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Chat initiated successfully!");
        // Optionally open WhatsApp after successful initiation
        const cleanNumber = contact.phoneNumber.replace(/[^0-9+]/g, "");
        const whatsappUrl = `https://wa.me/${cleanNumber}`;
        window.open(whatsappUrl, "_blank");
      } else {
        toast.error(data.error || "Failed to start chat");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("An error occurred while starting the chat");
    }
  };

  const toggleColumnVisibility = (accessor: string) => {
    setColumnConfig((prev) => {
      const updated = prev.map((col) =>
        col.accessor === accessor ? { ...col, visible: !col.visible } : col
      );
      // Save to localStorage immediately
      if (typeof window !== "undefined") {
        localStorage.setItem("contacts-column-config", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const toggleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map((c) => c._id));
    }
  };

  const toggleSelectContact = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const visibleColumns = useMemo(
    () =>
      columnConfig
        .filter((col) => col.visible)
        .sort((a, b) => a.order - b.order),
    [columnConfig]
  );

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Contacts from CRM
          </h1>
          <p className="text-gray-600 mt-1">
            {pagination.totalCount > 0
              ? `${pagination.totalCount} leads from your CRM database`
              : "Manage leads from your CRM and start WhatsApp conversations"}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadContacts}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowColumnSelector(!showColumnSelector)}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="h-5 w-5 mr-2" />
            Columns
          </button>
        </div>
      </div>

      {/* Search Bar with Company Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <InputBox
              type="text"
              placeholder="Search by name, email, phone, source, campaign..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-5 w-5 text-gray-400" />}
              clearButton={true}
              onClear={handleClearSearch}
            />
          </div>
          <div className="sm:w-64">
            <CustomDropdown
              options={[
                { value: "all", label: "All Companies" },
                ...companies.map((company) => ({
                  value: company._id,
                  label: company.name,
                })),
              ]}
              value={selectedCompany}
              onChange={(value) => {
                setSelectedCompany(value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              placeholder="All Companies"
              allowClear={false}
              allowSearch={true}
              searchPlaceholder="Search companies..."
              className="w-full"
            />
          </div>
        </div>
        {selectedContacts.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              {selectedContacts.length} contact
              {selectedContacts.length !== 1 ? "s" : ""} selected
            </p>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {visibleColumns.map((column) => (
                  <th
                    key={column.accessor}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: column.width }}
                  >
                    {column.accessor === "_id" ? (
                      <Checkbox
                        checked={
                          selectedContacts.length === contacts.length &&
                          contacts.length > 0
                        }
                        onChange={toggleSelectAll}
                      />
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {searchTerm || selectedCompany !== "all"
                      ? "No contacts found matching your filters."
                      : "No leads available from CRM."}
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr
                    key={contact._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedContact(contact);
                      setShowViewModal(true);
                    }}
                  >
                    {visibleColumns.map((column) => {
                      if (column.accessor === "_id") {
                        return (
                          <td
                            key={column.accessor}
                            className="px-6 py-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Checkbox
                              checked={selectedContacts.includes(contact._id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleSelectContact(contact._id);
                              }}
                            />
                          </td>
                        );
                      }

                      if (column.accessor === "name") {
                        return (
                          <td key={column.accessor} className="px-6 py-4">
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
                        );
                      }

                      if (column.accessor === "email") {
                        return (
                          <td key={column.accessor} className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {contact.email ? (
                                <>
                                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <span className="text-sm text-gray-900 truncate">
                                    {contact.email}
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </div>
                          </td>
                        );
                      }

                      if (column.accessor === "phoneNumber") {
                        return (
                          <td key={column.accessor} className="px-6 py-4">
                            <div>
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="text-sm text-gray-900">
                                  {contact.phoneNumber}
                                </span>
                              </div>
                              {contact.allPhones &&
                                contact.allPhones.length > 1 && (
                                  <p className="text-xs text-gray-500 mt-1 ml-6">
                                    +{contact.allPhones.length - 1} more
                                  </p>
                                )}
                            </div>
                          </td>
                        );
                      }

                      if (column.accessor === "status") {
                        return (
                          <td key={column.accessor} className="px-6 py-4">
                            {contact.status ? (
                              <span
                                className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor:
                                    contact.status.color || "#059669",
                                  color: "#ffffff",
                                }}
                              >
                                {contact.status.name || "active"}
                              </span>
                            ) : (
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium`}
                                style={{
                                  backgroundColor: "#059669",
                                  color: "#ffffff",
                                }}
                              >
                                active
                              </span>
                            )}
                          </td>
                        );
                      }

                      if (column.accessor === "assignedTo") {
                        return (
                          <td key={column.accessor} className="px-6 py-4">
                            {contact.assignedTo ? (
                              <span className="text-sm text-gray-900">
                                {contact.assignedTo.name}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">
                                Unassigned
                              </span>
                            )}
                          </td>
                        );
                      }

                      if (column.accessor === "source") {
                        return (
                          <td key={column.accessor} className="px-6 py-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {contact.source || "CRM"}
                            </span>
                          </td>
                        );
                      }

                      if (column.accessor === "campaign") {
                        return (
                          <td key={column.accessor} className="px-6 py-4">
                            <span className="text-sm text-gray-700">
                              {contact.campaign || "-"}
                            </span>
                          </td>
                        );
                      }

                      if (column.accessor === "project") {
                        return (
                          <td key={column.accessor} className="px-6 py-4">
                            <span className="text-sm text-gray-700">
                              {contact.project || "-"}
                            </span>
                          </td>
                        );
                      }

                      if (column.accessor === "company") {
                        return (
                          <td key={column.accessor} className="px-6 py-4">
                            <span className="text-sm text-gray-900">
                              {(contact as any).company?.name || "-"}
                            </span>
                          </td>
                        );
                      }

                      if (column.accessor === "dateInscription") {
                        return (
                          <td key={column.accessor} className="px-6 py-4">
                            <span className="text-sm text-gray-700">
                              {formatDate(contact.dateInscription)}
                            </span>
                          </td>
                        );
                      }

                      if (column.accessor === "whatsapp") {
                        return (
                          <td
                            key={column.accessor}
                            className="px-6 py-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() =>
                                handleStartWhatsAppConversation(contact)
                              }
                              className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                              title="Start WhatsApp Conversation"
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Chat
                            </button>
                          </td>
                        );
                      }

                      return (
                        <td key={column.accessor} className="px-6 py-4">
                          <span className="text-sm text-gray-700">-</span>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {contacts.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.totalCount
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{pagination.totalCount}</span>{" "}
                  results
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <CustomDropdown
                  options={[
                    { value: "25", label: "25 per page" },
                    { value: "50", label: "50 per page" },
                    { value: "100", label: "100 per page" },
                    { value: "200", label: "200 per page" },
                  ]}
                  value={pagination.limit.toString()}
                  onChange={(value) =>
                    setPagination({
                      ...pagination,
                      limit: parseInt(value),
                      page: 1,
                    })
                  }
                  placeholder="Select rows per page"
                  allowClear={false}
                  allowSearch={false}
                  className="w-40"
                  maxHeight={150}
                  placement="top"
                />
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) =>
                    setPagination({ ...pagination, page })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Column Selector Popup Modal */}
      <ColumnSelector
        isOpen={showColumnSelector}
        onClose={() => setShowColumnSelector(false)}
        columns={columnConfig}
        onToggleColumn={toggleColumnVisibility}
        onResetToDefault={() => {
          const defaultConfig =
            CONTACTS_TABLE_DEFAULT_COLUMNS as ColumnConfig[];
          setColumnConfig(defaultConfig);
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "contacts-column-config",
              JSON.stringify(defaultConfig)
            );
          }
        }}
        title="Column Settings"
        description="Show or hide columns to customize your view. Your preferences will be saved."
        excludeAccessors={["_id"]}
      />

      {/* View Lead Modal */}
      <ViewLeadModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedContact(null);
        }}
        contact={selectedContact}
        onStartWhatsApp={handleStartWhatsAppConversation}
      />
    </div>
  );
}
