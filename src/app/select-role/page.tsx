"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, CheckSquare, Shield, BarChart3, ArrowRight, Loader2, Building2 } from "lucide-react";
import { clearSessionCache } from "@/hooks/use-session";

type Role = "EMPLOYEE" | "MANAGER" | "ADMIN" | "EXECUTIVE";

const ROLES: {
  value: Role;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  activeBorder: string;
}[] = [
  {
    value: "EMPLOYEE",
    label: "Employee",
    description: "Track personal goals, earn XP, and grow your career",
    icon: LayoutDashboard,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-gray-200",
    activeBorder: "border-blue-400 ring-2 ring-blue-100",
  },
  {
    value: "MANAGER",
    label: "Manager",
    description: "Approve team goals, track performance & analytics",
    icon: CheckSquare,
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-gray-200",
    activeBorder: "border-green-400 ring-2 ring-green-100",
  },
  {
    value: "ADMIN",
    label: "Admin",
    description: "Manage users, audit logs, security & org KPIs",
    icon: Shield,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-gray-200",
    activeBorder: "border-amber-400 ring-2 ring-amber-100",
  },
  {
    value: "EXECUTIVE",
    label: "Executive",
    description: "Org-wide KPIs, AI forecasting & strategic insights",
    icon: BarChart3,
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-gray-200",
    activeBorder: "border-purple-400 ring-2 ring-purple-100",
  },
];

export default function SelectRolePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    if (!selectedRole) { setError("Please select a role to continue"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/google/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole, department: department || selectedRole }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to complete setup"); return; }
      clearSessionCache();
      router.push(data.redirectTo ?? "/employee");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, #c9a84c, transparent)" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-8 h-0.5 bg-[#c9a84c] mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
            Welcome to AtomQuest
          </h1>
          <p className="text-sm text-gray-500">
            You&apos;re signed in with Google. Select your role to get started.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {ROLES.map((r, i) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.value;
            return (
              <motion.button
                key={r.value}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => setSelectedRole(r.value)}
                className={`text-left p-5 bg-white rounded-2xl border-2 transition-all duration-200 hover:shadow-md ${
                  isSelected ? r.activeBorder : r.border + " hover:border-gray-300"
                }`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${r.bg}`}>
                  <Icon className={`h-5 w-5 ${r.color}`} />
                </div>
                <h3 className={`font-semibold text-sm mb-1 ${isSelected ? r.color : "text-gray-900"}`}>
                  {r.label}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">{r.description}</p>
                {isSelected && (
                  <div className={`mt-2 inline-flex items-center gap-1 text-[10px] font-semibold ${r.color}`}>
                    ✓ Selected
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Department field */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
            Department <span className="text-gray-400 font-normal normal-case">(optional)</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Engineering, Sales, Marketing..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#c9a84c] focus:ring-2 focus:ring-[#c9a84c]/20 placeholder:text-gray-400 transition-all"
            />
          </div>
        </div>

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 mb-4">
            ⚠️ {error}
          </motion.p>
        )}

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={!selectedRole || loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          style={{ background: selectedRole ? "linear-gradient(135deg, #c9a84c, #e8c97a)" : "#d1d5db" }}
        >
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Setting up your account...</>
            : <><span>Continue to Dashboard</span><ArrowRight className="h-4 w-4" /></>}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          You can change your role later from account settings
        </p>
      </motion.div>
    </div>
  );
}
