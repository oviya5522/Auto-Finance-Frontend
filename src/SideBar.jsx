// src/SideBar.jsx

import { useState } from "react";

import {
  LayoutDashboard,
  Users,
  HandCoins,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wallet,
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
    id: "loan-management",
    label: "Loan Management",
    icon: HandCoins,
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
          items-center
          rounded-lg
          text-left
          transition-colors
          duration-150
          ease-out

          ${
            collapsed
              ? "justify-center px-2.5"
              : "justify-start px-3"
          }

          py-2.5

          ${
            isActive
              ? "bg-slate-700/50 text-white"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
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
              h-5
              w-[3px]
              -translate-y-1/2
              rounded-r-full
              bg-indigo-400
            "
          />
        )}

        {/* ICON
            IMPORTANT:
            fixed width keeps every icon
            perfectly aligned.
        */}

        <span
          className="
            flex
            h-5
            w-5
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
                : "text-slate-400"
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
              text-[14px]
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
        border-slate-800/60
        bg-[#0F172A]
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
          border-slate-800/60
          py-3

          ${
            collapsed
              ? "px-2"
              : "px-3"
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
          {/* LOGO ICON */}

          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-indigo-500/15
            "
          >
            <Wallet
              size={18}
              className="text-indigo-400"
              strokeWidth={2}
            />
          </div>

          {/* BRAND TEXT */}

          {!collapsed && (
            <div
              className="
                ml-2.5
                min-w-0
                leading-tight
              "
            >
              <p
                className="
                  truncate
                  text-[14px]
                  font-semibold
                  tracking-wide
                  text-white
                "
              >
                YAZH VAHANA
              </p>

              <p
                className="
                  truncate
                  text-[10px]
                  font-medium
                  tracking-[0.16em]
                  text-slate-400
                "
              >
                AUTO FINANCE
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
          SETTINGS
      ================================================== */}

      <div
        className="
          shrink-0
          border-t
          border-slate-800/60
          px-2
          py-3
        "
      >
        {renderNavButton(
          SETTINGS_ITEM
        )}
      </div>

      {/* =================================================
          COLLAPSE / EXPAND
      ================================================== */}

      <div
        className="
          shrink-0
          border-t
          border-slate-800/60
          px-2
          pb-3
          pt-2
        "
      >
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
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-lg
            px-2
            py-2
            text-slate-400
            transition-colors
            duration-150
            hover:bg-slate-800
            hover:text-slate-100
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

              <span className="text-[13px] font-medium">
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