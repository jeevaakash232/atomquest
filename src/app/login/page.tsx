"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { clearSessionCache } from "@/hooks/use-session";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

const ROLE_REDIRECTS: Record<string, string> = {
  EMPLOYEE: "/employee", MANAGER: "/manager/approvals", ADMIN: "/admin", EXECUTIVE: "/executive",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Invalid credentials"); return; }
      clearSessionCache();
      router.push(data.redirectTo ?? ROLE_REDIRECTS[data.role] ?? "/employee");
      router.refresh();
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — image panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=85"
          alt="Office" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/20" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <Link href="/" className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">Atom</span>
            <span className="text-2xl font-light tracking-widest text-[#e8c97a]">QUEST</span>
          </Link>
          <div>
            <h2 className="font-serif text-4xl font-bold text-white mb-3 leading-tight">
              Transform Goals Into<br />Extraordinary Results
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              AI-powered goal management for high-performing enterprise teams.
            </p>
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#faf8f5]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="w-full max-w-sm">

          {/* Mobile logo */}
          <Link href="/" className="flex items-baseline gap-1 mb-8 lg:hidden">
            <span className="text-xl font-bold text-gray-900">Atom</span>
            <span className="text-xl font-light tracking-widest text-[#c9a84c]">QUEST</span>
          </Link>

          <div className="mb-8">
            <div className="w-8 h-0.5 bg-[#c9a84c] mb-4" />
            <h1 className="font-serif text-3xl font-bold text-gray-900 mb-1">Welcome back</h1>
            <p className="text-sm text-gray-500">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Email</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#c9a84c] focus:ring-2 focus:ring-[#c9a84c]/20 placeholder:text-gray-400 transition-all"
                  required />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                <button type="button" className="text-xs text-[#c9a84c] hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#c9a84c] focus:ring-2 focus:ring-[#c9a84c]/20 placeholder:text-gray-400 transition-all"
                  required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                ⚠️ {error}
              </motion.p>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #c9a84c, #e8c97a)" }}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Sign In</span><ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          {/* Social */}
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">or continue with</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <button onClick={() => window.location.href = "/api/auth/google"}
              className="w-full flex items-center justify-center gap-2.5 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
              <GoogleIcon /> Continue with Google
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-[#c9a84c] hover:underline">Sign up free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
