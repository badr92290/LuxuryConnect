import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export interface NavItem {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
}

export function AppShell({ navItems, title }: { navItems: NavItem[]; title: string }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-white md:flex">
      {/* Sidebar (desktop / tablette) */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border md:bg-surface md:p-4">
        <div className="mb-8 px-2 pt-2">
          <span className="text-lg font-bold">🚗 CarCare Connect</span>
          <p className="mt-1 text-xs text-muted">{title}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-primary/15 text-primary" : "text-muted hover:bg-surfaceAlt hover:text-white"
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 border-t border-border pt-4">
          <p className="px-2 text-sm font-semibold">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="px-2 text-xs text-muted">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-3 w-full rounded-xl border border-border px-3 py-2 text-sm text-muted hover:bg-surfaceAlt hover:text-white"
          >
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Header mobile */}
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
        <span className="text-base font-bold">🚗 CarCare Connect</span>
        <button onClick={logout} className="text-xs text-muted">
          Déconnexion
        </button>
      </header>

      <div className="flex-1 pb-16 md:pb-0">
        <main className="mx-auto w-full max-w-4xl px-4 py-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom tab bar (mobile / tablette) */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-border bg-surface md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
                isActive ? "text-primary" : "text-muted"
              }`
            }
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
