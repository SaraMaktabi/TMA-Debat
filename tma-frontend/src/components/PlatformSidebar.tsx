import { Link, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Bot, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import type { SessionUser } from "../utils/auth";

export type SidebarItem = {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string | null;
};

type PlatformSidebarProps = {
  currentUser: SessionUser | null;
  menuItems: SidebarItem[];
  onLogout: () => void;
};

export default function PlatformSidebar({ currentUser, menuItems, onLogout }: PlatformSidebarProps) {
  const location = useLocation();
  const [activeKey, setActiveKey] = useState<string>("");

  useEffect(() => {
    const currentItem = menuItems.find((item) => item.href !== "#" && location.pathname === item.href);
    if (currentItem) {
      setActiveKey(`${currentItem.href}:${currentItem.label}`);
    }
  }, [location.pathname, menuItems]);

  const avatarText = (currentUser?.name || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <aside className="w-72 bg-[#d7cdfb] border-r border-white/60 shadow-sm sticky top-0 h-screen overflow-y-auto shrink-0">
      <div className="p-6 border-b border-white/50 bg-[linear-gradient(180deg,#dbe5ff_0%,#d7cdfb_100%)]">
        <Link to="/" className="flex items-center gap-3 group hover:opacity-90 transition-all duration-300">
          <div className="w-11 h-11 rounded-2xl shadow-md flex items-center justify-center text-white" style={{ backgroundColor: "#08052e" }}>
            <Bot className="w-6 h-6" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-lg text-gray-900">TMA System</span>
            <span className="text-xs text-gray-600">Gestion intelligente</span>
          </div>
        </Link>
      </div>

      <nav className="p-4 space-y-2 mt-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const itemKey = `${item.href}:${item.label}`;
          const routeActive = item.href !== "#" && location.pathname === item.href;
          const isActive = routeActive || activeKey === itemKey;

          const itemClassName = [
            "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200",
            isActive
              ? "bg-white text-[#23233a] shadow-[0_8px_22px_rgba(34,33,66,0.10)]"
              : "text-[#2c2b44] hover:bg-white/70 hover:text-[#23233a]",
          ].join(" ");

          if (item.href === "#") {
            return (
              <button key={item.label} className={itemClassName} type="button" onClick={() => setActiveKey(itemKey)}>
                <Icon className="w-5 h-5" />
                <span className="text-[15px] font-semibold">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto px-2.5 py-1 text-xs font-bold rounded-full text-white shadow-md" style={{ backgroundColor: "#08052e" }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          }

          return (
            <Link key={item.label} to={item.href} className={itemClassName} onClick={() => setActiveKey(itemKey)}>
              <Icon className="w-5 h-5" />
              <span className="text-[15px] font-semibold">{item.label}</span>
              {item.badge && (
                <span className="ml-auto px-2.5 py-1 text-xs font-bold rounded-full text-white shadow-md" style={{ backgroundColor: "#08052e" }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 my-6 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/60 bg-[#d7cdfb]">
        <div className="rounded-2xl p-4 border border-white/60 bg-white/65 backdrop-blur-sm mb-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl text-white font-bold shadow-md flex items-center justify-center" style={{ backgroundColor: "#0f0745" }}>
              {avatarText || "US"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{currentUser?.name ?? "Utilisateur"}</p>
              <p className="text-xs font-medium text-gray-600">{currentUser?.role ?? "User"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl text-white transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: "#0f0745" }}
            >
              Profile
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="p-2 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
