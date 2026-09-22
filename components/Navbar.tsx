"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Users,
  CheckSquare,
  ArrowRightLeft,
  LayoutDashboard,
  Building2,
  Menu,
  X,
  Target,
  KanbanSquare,
  MessageSquare,
} from "lucide-react";

const navItems = [
  { label: "Visão Geral", href: "/", icon: LayoutDashboard },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Oportunidades", href: "/oportunidades", icon: Target },
  { label: "Tarefas", href: "/tarefas", icon: CheckSquare },
  { label: "Kanban", href: "/kanban", icon: KanbanSquare },
  { label: "Handoffs", href: "/handoffs", icon: ArrowRightLeft },
  { label: "Conversas", href: "/mensagens", icon: MessageSquare },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0B0F17]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8 lg:px-10">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-blue-900/40 transition group-hover:from-sky-300 group-hover:to-blue-500">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="hidden sm:block">
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-sky-400">
                Quadra
              </span>
              <span className="block -mt-0.5 text-sm font-semibold leading-none text-slate-100">
                Pós-Atendimento
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative rounded-full px-4 py-2 text-sm font-medium transition-colors"
                >
                  <span
                    className={
                      isActive
                        ? "text-white"
                        : "text-slate-400 hover:text-slate-100"
                    }
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-sky-400 to-blue-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            {/* Profile */}
            <div className="flex items-center rounded-full border border-slate-800 bg-[#131B2E] p-1.5 pl-3 transition hover:border-slate-700">
              <span className="hidden pr-2 text-sm font-medium text-slate-300 lg:block">
                Equipe
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-xs font-bold text-white">
                ES
              </span>
            </div>

            {/* Mobile menu button */}
            <button
              className="rounded-full border border-slate-800 p-2 text-slate-300 md:hidden hover:border-slate-700"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Abrir menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav dropdown */}
        {mobileOpen && (
          <div className="border-t border-slate-800 bg-[#0B0F17] px-4 py-3 md:hidden">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                      isActive
                        ? "border border-slate-700/60 bg-gradient-to-r from-sky-500/15 to-blue-600/10 text-white"
                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>
  );
}
