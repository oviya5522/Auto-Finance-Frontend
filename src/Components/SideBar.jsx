import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  HandCoins,
  WalletCards,
  PhoneCall,
  CarFront,
  Receipt,
  Landmark,
  BarChart3,
  Database,
  FileText,
  Smartphone,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from "lucide-react";

// Keep nav items in a single array and render with .map() — no duplicated JSX
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "customers", label: "Customers", icon: Users },
  { id: "loan-management", label: "Loan Management", icon: HandCoins },
  // { id: "collections", label: "Collections", icon: WalletCards },
  // { id: "follow-up", label: "Follow-up", icon: PhoneCall },
  // { id: "vehicles", label: "Vehicles", icon: CarFront },
  // { id: "expenses", label: "Expenses", icon: Receipt },
  // { id: "accounts", label: "Accounts", icon: Landmark },
  // { id: "reports", label: "Reports", icon: BarChart3 },
  // { id: "masters", label: "Masters", icon: Database },
  // { id: "notices-prints", label: "Notices & Prints", icon: FileText },
  // { id: "mobile-app", label: "Mobile App", icon: Smartphone },
];

const SETTINGS_ITEM = { id: "settings", label: "Settings", icon: Settings };

export default function Sidebar({ activeItem, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false); // this one can stay local

  const renderNavButton = (item) => {
    const Icon = item.icon;
    const isActive = activeItem === item.id;

    return (
      <button
        key={item.id}
        type="button"
        title={collapsed ? item.label : undefined}
        onClick={() => onNavigate(item.id)} 
        className={`
          relative flex items-center w-full rounded-lg
          transition-colors duration-150 ease-out
          ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}
          ${
            isActive
              ? "bg-slate-700/50 text-white"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          }
        `}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-indigo-400" />
        )}
        <Icon
          size={19}
          strokeWidth={2}
          className={`shrink-0 ${isActive ? "text-white" : "text-slate-400"}`}
        />
        {!collapsed && (
          <span className="text-[14px] font-medium truncate">{item.label}</span>
        )}
      </button>
    );
  };

  return (
    <aside
      className={`
        h-screen shrink-0 flex flex-col
        bg-[#0F172A] border-r border-slate-800/60
        transition-all duration-200 ease-out
        ${collapsed ? "w-[70px]" : "w-[230px]"}
      `}
    >
      {/* Brand */}
      <div
        className={`flex items-center border-b border-slate-800/60 ${
          collapsed ? "justify-center px-0 py-4" : "gap-2.5 px-4 py-4"
        }`}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-indigo-500/15 shrink-0">
          <Wallet size={18} className="text-indigo-400" strokeWidth={2} />
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="text-white text-[14px] font-semibold tracking-wide truncate">
              YAZH VAHANA
            </p>
            <p className="text-slate-400 text-[10.5px] font-medium tracking-widest truncate">
              AUTO FINANCE
            </p>
          </div>
        )}
      </div>

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
        {NAV_ITEMS.map(renderNavButton)}
      </nav>

      {/* Settings, separated at the bottom */}
      <div className="px-2.5 py-3 border-t border-slate-800/60 space-y-1">
        {renderNavButton(SETTINGS_ITEM)}
      </div>

      {/* Collapse / expand toggle */}
      <div className="px-2.5 pb-3">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="
            flex items-center justify-center w-full gap-2 rounded-lg
            py-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100
            transition-colors duration-150 ease-out
          "
        >
          {collapsed ? (
            <ChevronRight size={18} strokeWidth={2} />
          ) : (
            <>
              <ChevronLeft size={18} strokeWidth={2} />
              <span className="text-[13px] font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
