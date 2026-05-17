"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Search, Menu, X, Target, Trophy, BrainCircuit, BarChart3, Shield, CheckSquare, Zap } from "lucide-react";

const NAV_LINKS = ["Features", "Solutions", "Pricing", "Blog", "Contact"];

const STATS = [
  { value: "10K+", label: "Goals Completed" },
  { value: "500+", label: "Teams Onboarded" },
  { value: "94%",  label: "Prediction Accuracy" },
  { value: "100%", label: "Client Satisfaction" },
];

const FEATURES = [
  { icon: Target,       title: "SMART Goal Engine",      desc: "AI converts vague objectives into precise, measurable goals with KPIs and timelines automatically.",       color: "text-amber-600",  bg: "bg-amber-50" },
  { icon: BrainCircuit, title: "AI Risk Prediction",     desc: "Predict goal delays and team risks before they happen with 94% accuracy using machine learning.",          color: "text-blue-600",   bg: "bg-blue-50" },
  { icon: Trophy,       title: "Gamification & XP",      desc: "Keep teams motivated with XP points, badges, streaks, and leaderboards that make work rewarding.",         color: "text-purple-600", bg: "bg-purple-50" },
  { icon: BarChart3,    title: "Executive Intelligence", desc: "Real-time org-wide KPIs, AI-powered forecasting, and strategic insights for leadership teams.",            color: "text-green-700",  bg: "bg-green-50" },
  { icon: CheckSquare,  title: "Manager Workflows",      desc: "Streamlined approval queues, team analytics, and risk alerts keep managers in full control.",              color: "text-rose-600",   bg: "bg-rose-50" },
  { icon: Zap,          title: "Real-time Activity",     desc: "Live activity feeds, instant notifications, and WebSocket updates keep everyone aligned.",                 color: "text-cyan-600",   bg: "bg-cyan-50" },
];

const ROLES = [
  { role: "Employee",  href: "/login", desc: "Track goals, earn XP, and grow your career",          color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-100" },
  { role: "Manager",   href: "/login", desc: "Approve goals and track team performance",             color: "text-green-700",  bg: "bg-green-50",  border: "border-green-100" },
  { role: "Admin",     href: "/login", desc: "Manage users, audit logs, and org security",           color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-100" },
  { role: "Executive", href: "/login", desc: "Org-wide KPIs, AI forecasting, and strategic insights",color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-100" },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-gray-900">

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1">
            <span className="text-xl font-bold tracking-tight text-gray-900">Atom</span>
            <span className="text-xl font-light tracking-widest text-[#c9a84c]">QUEST</span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">{l}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden md:inline-flex text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5">
              Sign In
            </Link>
            <Link href="/signup"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              style={{ background: "linear-gradient(135deg, #c9a84c, #e8c97a)" }}>
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-700">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3">
            {NAV_LINKS.map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="block text-sm text-gray-700 py-1" onClick={() => setMenuOpen(false)}>{l}</a>
            ))}
            <div className="flex gap-3 pt-2">
              <Link href="/login" className="flex-1 text-center py-2 border border-gray-200 rounded-full text-sm font-medium">Sign In</Link>
              <Link href="/signup" className="flex-1 text-center py-2 rounded-full text-white text-sm font-semibold" style={{ background: "#c9a84c" }}>Sign Up</Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=85" alt="Office"
            className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 mb-6">
              <div className="h-1.5 w-1.5 rounded-full bg-[#c9a84c]" />
              <span className="text-white text-xs font-medium tracking-wider">AI-Powered Goal Management</span>
            </div>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Transforming Goals<br />
              Into Extraordinary<br />
              <span style={{ color: "#e8c97a" }}>Achievements</span>
            </h1>

            <p className="text-white/75 text-base leading-relaxed mb-8 max-w-lg">
              Enterprise-grade AI goal management platform that converts vague objectives into SMART goals,
              predicts risks, and keeps teams aligned — all in real time.
            </p>

            <div className="flex gap-4 flex-wrap">
              <Link href="/signup"
                className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
                style={{ background: "linear-gradient(135deg, #c9a84c, #e8c97a)" }}>
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login"
                className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium border border-white/40 hover:bg-white/10 transition-all text-sm">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <span className="text-white/40 text-[10px] tracking-widest uppercase">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="h-4 w-px bg-white/30" />
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <p className="text-4xl font-bold font-serif text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="atelier-divider mx-auto mb-4" />
            <p className="text-[#c9a84c] text-xs font-semibold uppercase tracking-widest mb-3">Platform Features</p>
            <h2 className="font-serif text-4xl font-bold text-gray-900">Everything Your Team Needs</h2>
            <p className="text-gray-500 text-sm mt-3 max-w-md mx-auto">
              From AI goal generation to executive dashboards — one platform for the entire organization.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl p-7 border border-gray-100 hover:border-[#c9a84c]/30 hover:shadow-md transition-all group">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 ${f.bg}`}>
                    <Icon className={`h-5 w-5 ${f.color}`} />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ROLE PORTALS ───────────────────────────────────────────────────── */}
      <section id="solutions" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="atelier-divider mx-auto mb-4" />
            <p className="text-[#c9a84c] text-xs font-semibold uppercase tracking-widest mb-3">Role-Based Dashboards</p>
            <h2 className="font-serif text-4xl font-bold text-gray-900">Built for Every Role</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {ROLES.map((r, i) => (
              <motion.div key={r.role}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link href={r.href}>
                  <div className={`rounded-2xl p-6 border ${r.border} ${r.bg} hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group`}>
                    <h3 className={`font-serif text-xl font-bold mb-2 ${r.color}`}>{r.role}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{r.desc}</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${r.color}`}>
                      Access Portal <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="relative py-28 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80" alt="Team"
          className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="atelier-divider mx-auto mb-5" />
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-5">
              Ready to Transform<br />Your Team&apos;s Performance?
            </h2>
            <p className="text-white/70 text-sm mb-8 max-w-md mx-auto">
              Join 500+ teams using AtomQuest to set smarter goals, reduce risk, and achieve more.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/signup"
                className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold shadow-lg hover:-translate-y-0.5 transition-all text-sm"
                style={{ background: "linear-gradient(135deg, #c9a84c, #e8c97a)" }}>
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login"
                className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium border border-white/40 hover:bg-white/10 transition-all text-sm">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-lg font-bold">Atom</span>
                <span className="text-lg font-light tracking-widest text-[#c9a84c]">QUEST</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                AI-powered enterprise goal management platform for high-performing teams.
              </p>
            </div>
            {[
              { title: "Product",  links: ["Features", "Pricing", "Changelog", "Roadmap"] },
              { title: "Company",  links: ["About", "Blog", "Careers", "Press"] },
              { title: "Support",  links: ["Documentation", "API Reference", "Status", "Contact"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-300 mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}><a href="#" className="text-gray-400 text-xs hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-gray-500 text-xs">© 2026 AtomQuest. All rights reserved.</p>
            <div className="flex gap-5">
              {["Privacy Policy", "Terms of Service"].map((l) => (
                <a key={l} href="#" className="text-gray-500 text-xs hover:text-white transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
