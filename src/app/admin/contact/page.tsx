"use client";

import { useState, useEffect } from "react";
import { STORE } from "@/lib/format";
import { useAdmin } from "@/context/AdminContext";
import {
  PhoneIcon,
  WhatsAppIcon,
  LocationIcon,
  CheckCircleIcon,
  CloseIcon,
  TrashIcon,
  SearchIcon,
  ClockIcon,
} from "@/components/icons";

interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: "pending" | "contacted" | "resolved";
  createdAt: string;
}

const DEFAULT_INQUIRIES: Inquiry[] = [
  {
    id: "inq-1",
    name: "Srikanth Reddy",
    phone: "9848022334",
    email: "srikanth.reddy@gmail.com",
    subject: "Custom PC Quotation",
    message: "Looking for an RTX 5060 Ti + Ryzen 5 5600G gaming PC build with 32GB RAM under ₹85,000 budget for 1440p gaming & video editing.",
    status: "pending",
    createdAt: "2026-09-06T10:30:00.000Z",
  },
  {
    id: "inq-2",
    name: "Venkatesh Rao",
    phone: "9440123890",
    email: "venkatesh.r@outlook.com",
    subject: "Corporate / Bulk Orders",
    message: "Need quote for 10x Office Desktop rigs with Intel Core i5, 16GB RAM, 512GB NVMe SSD and 24-inch monitors with GST invoice.",
    status: "contacted",
    createdAt: "2026-09-05T14:15:00.000Z",
  },
  {
    id: "inq-3",
    name: "Praveen Kumar",
    phone: "9989012345",
    email: "praveen.k@gmail.com",
    subject: "Hardware Repair / Bench Service",
    message: "My custom liquid cooled PC is overheating on load. Need thermal repaste and diagnostic bench service slot this week.",
    status: "resolved",
    createdAt: "2026-09-04T16:45:00.000Z",
  },
  {
    id: "inq-4",
    name: "Kavitha Sharma",
    phone: "9701234567",
    email: "kavitha.s@gmail.com",
    subject: "Warranty / RMA Assistance",
    message: "ASUS Motherboard ordered last month having RAM slot dual channel detection issue. Invoice CC-2026-0812.",
    status: "pending",
    createdAt: "2026-09-04T09:20:00.000Z",
  },
];

export default function AdminContactPage() {
  const { showToast } = useAdmin();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // Store contact info settings
  const [storeInfo, setStoreInfo] = useState({
    name: STORE.name,
    phonePrimary: STORE.phonePrimary,
    phoneSecondary: STORE.phoneSecondary,
    helplinePhone: STORE.helplinePhone,
    whatsapp: STORE.whatsapp,
    email: STORE.email,
    address: STORE.address,
    gstin: STORE.gstin,
    facebook: STORE.social.facebook,
    twitter: STORE.social.twitter,
    instagram: STORE.social.instagram,
  });

  const [activeTab, setActiveTab] = useState<"inquiries" | "settings">("inquiries");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("charmila_admin_inquiries");
      if (saved) {
        setInquiries(JSON.parse(saved));
      } else {
        setInquiries(DEFAULT_INQUIRIES);
        localStorage.setItem("charmila_admin_inquiries", JSON.stringify(DEFAULT_INQUIRIES));
      }

      const savedStore = localStorage.getItem("charmila_store_contact_info");
      if (savedStore) {
        setStoreInfo(JSON.parse(savedStore));
      }
    } catch {
      setInquiries(DEFAULT_INQUIRIES);
    }
  }, []);

  function saveInquiries(updated: Inquiry[]) {
    setInquiries(updated);
    try {
      localStorage.setItem("charmila_admin_inquiries", JSON.stringify(updated));
    } catch {}
  }

  function handleStatusChange(id: string, newStatus: "pending" | "contacted" | "resolved") {
    const updated = inquiries.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq));
    saveInquiries(updated);
    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry({ ...selectedInquiry, status: newStatus });
    }
    showToast(`Inquiry marked as ${newStatus}`);
  }

  function handleDeleteInquiry(id: string) {
    if (!confirm("Are you sure you want to remove this inquiry?")) return;
    const updated = inquiries.filter((inq) => inq.id !== id);
    saveInquiries(updated);
    if (selectedInquiry?.id === id) setSelectedInquiry(null);
    showToast("Inquiry deleted");
  }

  function handleSaveStoreInfo(e: React.FormEvent) {
    e.preventDefault();
    try {
      localStorage.setItem("charmila_store_contact_info", JSON.stringify(storeInfo));
      showToast("✓ Store contact information saved successfully!");
    } catch {
      showToast("Error saving contact information");
    }
  }

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.name.toLowerCase().includes(search.toLowerCase()) ||
      inq.phone.includes(search) ||
      inq.email.toLowerCase().includes(search.toLowerCase()) ||
      inq.subject.toLowerCase().includes(search.toLowerCase()) ||
      inq.message.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = inquiries.filter((i) => i.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D7] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              activeTab === "inquiries"
                ? "bg-[#D1121B] text-white shadow-sm"
                : "bg-white text-zinc-700 hover:bg-zinc-100 border border-[#E5E0D7]"
            }`}
          >
            Customer Inquiries &amp; Leads
            {pendingCount > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-black ${activeTab === "inquiries" ? "bg-white text-[#D1121B]" : "bg-red-100 text-[#D1121B]"}`}>
                {pendingCount} new
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              activeTab === "settings"
                ? "bg-[#D1121B] text-white shadow-sm"
                : "bg-white text-zinc-700 hover:bg-zinc-100 border border-[#E5E0D7]"
            }`}
          >
            Store Contact Settings
          </button>
        </div>
      </div>

      {activeTab === "inquiries" ? (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E5E0D7] shadow-2xs">
            <div className="relative flex-1 w-full">
              <SearchIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by customer name, phone, email, or message..."
                className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#D1121B]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-zinc-500 shrink-0">Filter:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-zinc-200 rounded-xl text-xs font-bold bg-white focus:outline-none focus:border-[#D1121B]"
              >
                <option value="all">All Inquiries ({inquiries.length})</option>
                <option value="pending">Pending ({inquiries.filter((i) => i.status === "pending").length})</option>
                <option value="contacted">Contacted ({inquiries.filter((i) => i.status === "contacted").length})</option>
                <option value="resolved">Resolved ({inquiries.filter((i) => i.status === "resolved").length})</option>
              </select>
            </div>
          </div>

          {/* Inquiries Grid & Detail Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* List (7 cols or full if no selection) */}
            <div className={`${selectedInquiry ? "lg:col-span-7" : "lg:col-span-12"} space-y-3`}>
              {filteredInquiries.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-[#E5E0D7] text-center space-y-2">
                  <p className="text-sm font-bold text-zinc-700">No inquiries match your criteria.</p>
                  <p className="text-xs text-zinc-400">All customer messages submitted from the storefront contact form appear here.</p>
                </div>
              ) : (
                filteredInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    onClick={() => setSelectedInquiry(inq)}
                    className={`p-5 bg-white rounded-2xl border transition-all cursor-pointer space-y-3 ${
                      selectedInquiry?.id === inq.id
                        ? "border-[#D1121B] shadow-md ring-2 ring-[#D1121B]/10"
                        : "border-[#E5E0D7] hover:border-zinc-300 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-zinc-900">{inq.name}</span>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              inq.status === "pending"
                                ? "bg-amber-100 text-amber-900"
                                : inq.status === "contacted"
                                ? "bg-blue-100 text-blue-900"
                                : "bg-emerald-100 text-emerald-900"
                            }`}
                          >
                            {inq.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#D1121B] font-bold mt-0.5">{inq.subject}</p>
                      </div>

                      <span className="text-[11px] text-zinc-400 shrink-0 flex items-center gap-1 font-medium">
                        <ClockIcon className="w-3.5 h-3.5" />
                        {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed bg-[#FAF7F2] p-3 rounded-xl border border-zinc-100">
                      {inq.message}
                    </p>

                    <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                      <span className="font-medium">📞 {inq.phone} • ✉️ {inq.email}</span>
                      <div className="flex gap-2">
                        <a
                          href={`https://wa.me/91${inq.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `Hi ${inq.name}, regarding your inquiry about "${inq.subject}" at Charmila Computers:`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1 text-[11px]"
                        >
                          <WhatsAppIcon className="w-3 h-3" /> WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Inquiry Detail Inspector (5 cols) */}
            {selectedInquiry && (
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E5E0D7] shadow-sm space-y-5 sticky top-28 h-fit">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <h3 className="font-extrabold text-sm text-zinc-900 uppercase tracking-wider">
                    Inquiry Details
                  </h3>
                  <button
                    onClick={() => setSelectedInquiry(null)}
                    className="p-1 text-zinc-400 hover:text-zinc-700 rounded"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Customer Name</span>
                    <span className="font-bold text-sm text-zinc-900">{selectedInquiry.name}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Phone / WhatsApp</span>
                      <a href={`tel:${selectedInquiry.phone}`} className="font-bold text-[#D1121B] hover:underline">
                        {selectedInquiry.phone}
                      </a>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Email Address</span>
                      <a href={`mailto:${selectedInquiry.email}`} className="font-bold text-zinc-800 hover:underline truncate block">
                        {selectedInquiry.email}
                      </a>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Inquiry Topic</span>
                    <span className="font-bold text-zinc-900">{selectedInquiry.subject}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Message Content</span>
                    <div className="p-3 bg-[#FAF7F2] rounded-xl border border-zinc-200 text-zinc-800 leading-relaxed font-medium">
                      {selectedInquiry.message}
                    </div>
                  </div>

                  {/* Actions Strip */}
                  <div className="pt-3 border-t border-zinc-100 space-y-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Update Status</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleStatusChange(selectedInquiry.id, "pending")}
                        className={`py-2 text-[11px] font-bold rounded-xl border transition-colors ${
                          selectedInquiry.status === "pending"
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : "bg-white hover:bg-zinc-50 text-zinc-600 border-zinc-200"
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedInquiry.id, "contacted")}
                        className={`py-2 text-[11px] font-bold rounded-xl border transition-colors ${
                          selectedInquiry.status === "contacted"
                            ? "bg-blue-100 text-blue-900 border-blue-300"
                            : "bg-white hover:bg-zinc-50 text-zinc-600 border-zinc-200"
                        }`}
                      >
                        Contacted
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedInquiry.id, "resolved")}
                        className={`py-2 text-[11px] font-bold rounded-xl border transition-colors ${
                          selectedInquiry.status === "resolved"
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                            : "bg-white hover:bg-zinc-50 text-zinc-600 border-zinc-200"
                        }`}
                      >
                        Resolved
                      </button>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <a
                        href={`https://wa.me/91${selectedInquiry.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `Hi ${selectedInquiry.name}, regarding your inquiry about "${selectedInquiry.subject}" at Charmila Computers:`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <WhatsAppIcon className="w-4 h-4" /> Chat on WhatsApp
                      </a>
                      <button
                        onClick={() => handleDeleteInquiry(selectedInquiry.id)}
                        className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200"
                        title="Delete Inquiry"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Store Contact Settings Form */
        <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D7] shadow-sm">
          <form onSubmit={handleSaveStoreInfo} className="space-y-6 text-xs">
            <div>
              <h2 className="font-extrabold text-base text-zinc-900">Official Store Contact Channels</h2>
              <p className="text-zinc-500 mt-0.5">These contact details appear on the footer, contact page, and structured data.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Primary Phone</label>
                <input
                  type="text"
                  value={storeInfo.phonePrimary}
                  onChange={(e) => setStoreInfo({ ...storeInfo, phonePrimary: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl font-semibold focus:outline-none focus:border-[#D1121B]"
                />
              </div>
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Secondary Phone</label>
                <input
                  type="text"
                  value={storeInfo.phoneSecondary}
                  onChange={(e) => setStoreInfo({ ...storeInfo, phoneSecondary: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl font-semibold focus:outline-none focus:border-[#D1121B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Helpline Phone (Formatted)</label>
                <input
                  type="text"
                  value={storeInfo.helplinePhone}
                  onChange={(e) => setStoreInfo({ ...storeInfo, helplinePhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl font-semibold focus:outline-none focus:border-[#D1121B]"
                />
              </div>
              <div>
                <label className="block font-bold text-zinc-700 mb-1">WhatsApp Business Number</label>
                <input
                  type="text"
                  value={storeInfo.whatsapp}
                  onChange={(e) => setStoreInfo({ ...storeInfo, whatsapp: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl font-semibold focus:outline-none focus:border-[#D1121B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Support Email</label>
                <input
                  type="email"
                  value={storeInfo.email}
                  onChange={(e) => setStoreInfo({ ...storeInfo, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl font-semibold focus:outline-none focus:border-[#D1121B]"
                />
              </div>
              <div>
                <label className="block font-bold text-zinc-700 mb-1">GSTIN</label>
                <input
                  type="text"
                  value={storeInfo.gstin}
                  onChange={(e) => setStoreInfo({ ...storeInfo, gstin: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl font-mono uppercase font-semibold focus:outline-none focus:border-[#D1121B]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1">Physical Store Address</label>
              <input
                type="text"
                value={storeInfo.address}
                onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl font-semibold focus:outline-none focus:border-[#D1121B]"
              />
            </div>

            <div className="pt-3 border-t border-zinc-100">
              <h3 className="font-bold text-zinc-900 mb-3">Official Social Media Profiles</h3>
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-zinc-500 mb-1">Facebook URL</label>
                  <input
                    type="url"
                    value={storeInfo.facebook}
                    onChange={(e) => setStoreInfo({ ...storeInfo, facebook: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-300 rounded-xl focus:outline-none focus:border-[#D1121B]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-500 mb-1">Instagram URL</label>
                  <input
                    type="url"
                    value={storeInfo.instagram}
                    onChange={(e) => setStoreInfo({ ...storeInfo, instagram: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-300 rounded-xl focus:outline-none focus:border-[#D1121B]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-500 mb-1">Twitter / X URL</label>
                  <input
                    type="url"
                    value={storeInfo.twitter}
                    onChange={(e) => setStoreInfo({ ...storeInfo, twitter: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-300 rounded-xl focus:outline-none focus:border-[#D1121B]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-[#D1121B] hover:bg-[#7A1118] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98"
            >
              Save Contact Settings
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
