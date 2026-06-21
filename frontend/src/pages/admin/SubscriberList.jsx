import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Download, Mail, Loader, Trash2 } from "lucide-react";
import { listSubscribers } from "../../services/subscriberService";

// const MOCK_SUBSCRIBERS = [
//   { id: 1, name: "Alistair Pemberton", email: "a.pemberton@gmail.com", created_at: "2026-05-28T08:12:00Z" },
//   { id: 2, name: "Priya Nair", email: "priya.nair@email.com", created_at: "2026-05-29T11:44:00Z" },
//   { id: 3, name: "Jean-Luc Moreau", email: "jl.moreau@outlook.com", created_at: "2026-05-30T14:22:00Z" },
//   { id: 4, name: "Fatima Al-Rashid", email: "f.alrashid@icloud.com", created_at: "2026-06-01T09:05:00Z" },
//   { id: 5, name: "Marcus Webb", email: "m.webb@proton.me", created_at: "2026-06-02T16:30:00Z" },
//   { id: 6, name: "Ananya Krishnamurthy", email: "ananya.k@gmail.com", created_at: "2026-06-03T07:18:00Z" },
//   { id: 7, name: "Sebastian Clarke", email: "s.clarke@icloud.com", created_at: "2026-06-04T12:55:00Z" },
// ];

export default function SubscriberList() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const subs = await listSubscribers();
        if (!cancelled) setSubscribers(subs);
      } catch {
        if (!cancelled) setSubscribers([]); // show the empty state instead of mock data
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRemove = async (id) => {
    setRemovingId(id);
    try {
      await axios.delete(`http://localhost:5000/api/subscribers/${id}`);
    } catch {
      // Proceed with local removal
    }
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
    setRemovingId(null);
  };

  const handleExportCSV = () => {
    const header = "Name,Email,Date Registered";
    const rows = subscribers.map(
      (s) =>
        `"${s.name}","${s.email}","${new Date(s.created_at).toLocaleDateString("en-GB")}"`,
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chabua-waitlist-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = subscribers.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-brand-muted">
        <Loader className="w-5 h-5 animate-spin mr-2 stroke-[1.5]" />
        <span className="font-sans text-xs uppercase tracking-widest">
          Accessing Waitlist Vault...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-brand-charcoal/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="font-sans text-xs tracking-widest uppercase text-brand-gold font-semibold mb-1">
            Private Allocation Registry
          </p>
          <h1 className="font-serif text-3xl text-brand-forest tracking-wide">
            Waitlist Vault
          </h1>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 font-sans text-xs uppercase tracking-widest border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-charcoal transition-all duration-300 px-5 py-3 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Total Registrants", value: subscribers.length },
          {
            label: "This Week",
            value: subscribers.filter((s) => {
              const d = new Date(s.created_at);
              const week = new Date();
              week.setDate(week.getDate() - 7);
              return d >= week;
            }).length,
          },
          {
            label: "This Month",
            value: subscribers.filter((s) => {
              const d = new Date(s.created_at);
              const now = new Date();
              return (
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear()
              );
            }).length,
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="bg-white border border-brand-forest/5 p-5 shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <p className="font-sans text-[10px] uppercase tracking-widest text-brand-muted font-bold mb-1">
              {stat.label}
            </p>
            <p className="font-serif text-2xl font-semibold text-brand-forest">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted stroke-[1.5]" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-3 border border-brand-forest/10 bg-white font-sans text-sm text-brand-charcoal focus:outline-none focus:border-brand-gold placeholder-brand-muted/50 tracking-wide"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-brand-forest/5 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-charcoal/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-brand-gold stroke-[1.5]" />
            <h3 className="font-serif text-base text-brand-forest tracking-wide">
              {filtered.length} Collector{filtered.length !== 1 ? "s" : ""}{" "}
              Registered
            </h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-charcoal/5 bg-brand-cream/30">
                {[
                  "#",
                  "Name",
                  "Email Address",
                  "Registration Date",
                  "Action",
                ].map((col) => (
                  <th
                    key={col}
                    className="text-left px-6 py-3 font-sans text-[10px] uppercase tracking-widest text-brand-muted font-bold"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center font-serif italic text-brand-muted"
                  >
                    No subscribers match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((sub, i) => (
                  <motion.tr
                    key={sub.id}
                    className="border-b border-brand-charcoal/5 hover:bg-brand-cream/20 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <td className="px-6 py-4">
                      <span className="font-sans text-xs text-brand-muted">
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-sans text-sm font-medium text-brand-charcoal">
                        {sub.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-sans text-sm text-brand-muted">
                        {sub.email}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-sans text-xs text-brand-muted">
                        {new Date(sub.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {removingId === sub.id ? (
                        <Loader className="w-4 h-4 animate-spin text-brand-muted" />
                      ) : (
                        <button
                          onClick={() => handleRemove(sub.id)}
                          className="p-1.5 text-brand-muted/40 hover:text-red-500 transition-colors cursor-pointer"
                          title="Remove subscriber"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
