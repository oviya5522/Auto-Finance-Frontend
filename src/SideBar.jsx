// src/SideBar.jsx

import { useState } from "react";

import {
  LayoutDashboard,
  Users,
  HandCoins,
  Settings,
  ChevronLeft,
  ChevronRight,Wallet
} from "lucide-react";

/* =========================================================
   NAVIGATION
========================================================= */

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
  },
  {
    id: "loans",
    label: "Loans",
    icon: HandCoins,
  },
  {
    id: "loan-management",
    label: "Loan Management",
    icon: Wallet,
  },
];

const SETTINGS_ITEM = {
  id: "settings",
  label: "Settings",
  icon: Settings,
};

const SideBar = ({
  activeItem,
  onNavigate,
}) => {
  const [collapsed, setCollapsed] =
    useState(true);

  /* =====================================================
     NAV BUTTON
  ====================================================== */

  const renderNavButton = (item) => {
    const Icon = item.icon;

    const isActive =
      activeItem === item.id;

    return (
      <button
        key={item.id}
        type="button"
        title={
          collapsed
            ? item.label
            : undefined
        }
        onClick={() =>
          onNavigate(item.id)
        }
        className={`
          group
          relative
          flex
          w-full
          items-start
          rounded-lg
          text-left
          transition-all
          duration-200
          ease-out

          ${
            collapsed
              ? "justify-center px-2.5"
              : "justify-start px-3"
          }

          py-2.5

          ${
            isActive
              ? "bg-[#1C6848] text-white shadow-sm"
              : "text-[#A8C2B3] hover:bg-[#174D38] hover:text-white"
          }
        `}
      >
        {/* ACTIVE INDICATOR */}

        {isActive && (
          <span
            className="
              absolute
              left-0
              top-1/2
              h-6
              w-[3px]
              -translate-y-1/2
              rounded-r-full
              bg-[#72D3A2]
            "
          />
        )}

        {/* ICON */}

        <span
          className="
            flex
            h-6
            w-6
            shrink-0
            items-center
            justify-center
          "
        >
          <Icon
            size={19}
            strokeWidth={2}
            className={
              isActive
                ? "text-white"
                : "text-[#A8C2B3]"
            }
          />
        </span>

        {/* LABEL */}

        {!collapsed && (
          <span
            className="
              ml-3
              min-w-0
              flex-1
              whitespace-normal
              break-words
              text-[13px]
              font-medium
              leading-5
              text-inherit
            "
          >
            {item.label}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside
      className={`
        flex
        h-screen
        shrink-0
        flex-col
        overflow-hidden
        border-r
        border-[#174D38]
        bg-[#0D2F24]
        transition-[width]
        duration-200
        ease-out

        ${
          collapsed
            ? "w-[68px]"
            : "w-[220px]"
        }
      `}
    >
      {/* =================================================
          BRAND
      ================================================== */}

      <div
        className={`
          shrink-0
          border-b
          border-[#174D38]
          ${
            collapsed
              ? "px-2 py-3"
              : "px-3.5 py-3"
          }
        `}
      >
        <div
          className={`
            flex
            min-w-0
            items-center
            ${
              collapsed
                ? "justify-center"
                : "justify-start"
            }
          `}
        >
          {/* LOGO PLACEHOLDER */}

          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-lg
              bg-[#174D38]
              ring-1
              ring-[#2B7655]
            "
            title="MotoLend logo"
          >
            <img
    src="/Auto-Finance-Logo.png"
    alt="MotoLend"
    className="h-full w-full object-contain"
  />
          </div>

          {/* PRODUCT NAME */}

          {!collapsed && (
           <div className="ml-2.5 min-w-0 leading-tight">
  <p className="truncate text-[15px] font-bold tracking-[-0.02em] text-white">
  Moto<span className="text-[#78D6A4]">Lend</span>
</p>

<p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-white">
  POWERING{" "}
  <span className="text-[#78D6A4]">
    SMARTER
  </span>{" "}
  FINANCE
</p>
</div>
          )}
        </div>
      </div>

      {/* =================================================
          MAIN NAVIGATION
      ================================================== */}

      <nav
        className="
          min-h-0
          flex-1
          overflow-y-auto
          overflow-x-hidden
          px-2
          py-3
        "
      >
        <div className="space-y-1">
          {NAV_ITEMS.map(
            renderNavButton
          )}
        </div>
      </nav>

      {/* =================================================
          BOTTOM AREA
      ================================================== */}

      <div
        className="
          shrink-0
          border-t
          border-[#174D38]
          px-2
          py-2.5
        "
      >
        {/* SETTINGS */}

        {renderNavButton(
          SETTINGS_ITEM
        )}

        {/* COLLAPSE */}

        <button
          type="button"
          onClick={() =>
            setCollapsed(
              (previous) =>
                !previous
            )
          }
          title={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          className="
            mt-1
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-lg
            px-2
            py-2
            text-[#8EAF9E]
            transition-all
            duration-200
            hover:bg-[#174D38]
            hover:text-white
          "
        >
          {collapsed ? (
            <ChevronRight
              size={18}
              strokeWidth={2}
            />
          ) : (
            <>
              <ChevronLeft
                size={18}
                strokeWidth={2}
              />

              <span className="text-[12px] font-medium">
                Collapse
              </span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default SideBar;