import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IconLogout } from "../components/icons";
import type { IconProps } from "../components/icons";
import { LogoMark } from "../components/logo";

export interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<IconProps>;
  end?: boolean;
}

function Wordmark({ subtitle }: { subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark className="h-9 w-9 text-gold" />
      <div>
        <span className="font-display text-xl tracking-wide text-ivory">
          Luxury<span className="text-gold-gradient italic">Connect</span>
        </span>
        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider2 text-mutedDark">{subtitle}</p>
      </div>
    </div>
  );
}

export function AppShell({ navItems, title }: { navItems: NavItem[]; title: string }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-ivory md:flex">
      {/* Sidebar (desktop / tablette) */}
      <aside className="hidden md:flex md:w-72 md:flex-col md:border-r md:border-hairline md:bg-surface md:p-6">
        <div className="mb-10 px-1 pt-1">
          <Wordmark subtitle={title} />
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gold/10 text-gold-200"
                      : "text-muted hover:bg-surfaceAlt hover:text-ivory"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-[18px] w-[18px] ${isActive ? "text-gold" : "text-mutedDark group-hover:text-ivory"}`} />
                    {item.label}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
        <div className="mt-4 border-t border-hairline pt-4">
          <p className="px-1 text-sm font-semibold text-ivory">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="px-1 text-xs text-mutedDark">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-gold/40 hover:text-gold"
          >
            <IconLogout className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Header mobile */}
      <header className="flex items-center justify-between border-b border-hairline bg-surface px-5 py-4 md:hidden">
        <span className="flex items-center gap-2 font-display text-lg tracking-wide text-ivory">
          <LogoMark className="h-7 w-7 text-gold" />
          Luxury<span className="text-gold-gradient italic">Connect</span>
        </span>
        <button onClick={logout} className="flex items-center gap-1.5 text-xs text-mutedDark">
          <IconLogout className="h-4 w-4" />
        </button>
      </header>

      <div className="flex-1 pb-20 md:pb-0">
        <main className="mx-auto w-full max-w-4xl px-5 py-8 md:px-10 md:py-10">
          <Outlet />
        </main>
      </div>

      {/* Bottom tab bar (mobile / tablette) */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-hairline bg-surface/95 backdrop-blur md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium tracking-wide ${
                  isActive ? "text-gold" : "text-mutedDark"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
