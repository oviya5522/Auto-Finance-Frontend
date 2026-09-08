// src/SideBar.jsx

import { useState } from "react";

import {
  LayoutDashboard,
  Users,
  HandCoins,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Wallet,
  Receipt,
  ReceiptText,
  CarFront,
  Repeat2,
  Bell,
  BarChart3,
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

  {
    id: "reloan",
    label: "Re-loan",
    icon: Repeat2,
  },

  {
    id: "collections",
    label: "Collections",
    icon: ReceiptText,
  },

  {
    id: "reminders",
    label: "Reminders",
    icon: Bell,
  },

  {
    id: "control-center",
    label: "Control Center",
    icon: BarChart3,
  },

  {
    id: "expense-control",
    label: "Expense Control",
    icon: Receipt,
  },

  {
    id: "vehicles",
    label: "Vehicles",
    icon: CarFront,

    children: [
      {
        id: "vehicles-all",
        label: "All Vehicles",
      },

      {
        id: "vehicles-seized",
        label: "Seized Vehicles",
      },

      {
        id: "vehicles-released",
        label: "Released Vehicles",
      },

      {
        id: "vehicles-sold",
        label: "Sold Vehicles",
      },
    ],
  },
];

/* =========================================================
   SETTINGS
========================================================= */

const SETTINGS_ITEM = {
  id: "settings",
  label: "Settings",
  icon: Settings,
};

/* =========================================================
   SIDEBAR
========================================================= */

const SideBar = ({
  activeItem,
  onNavigate,
}) => {
  const [
    collapsed,
    setCollapsed,
  ] = useState(false);

  const [
    openMenu,
    setOpenMenu,
  ] = useState(
    activeItem?.startsWith?.(
      "vehicles-"
    )
      ? "vehicles"
      : null
  );

  /* =====================================================
     NAVIGATION
  ====================================================== */

  const handleItemClick = (
    item
  ) => {
    if (
      item.children?.length
    ) {
      setOpenMenu(
        (previous) =>
          previous ===
          item.id
            ? null
            : item.id
      );

      return;
    }

    onNavigate(
      item.id
    );
  };

  /* =====================================================
     CHILD NAVIGATION
  ====================================================== */

  const handleChildClick = (
    child
  ) => {
    onNavigate(
      child.id
    );
  };

  /* =====================================================
     NAV BUTTON
  ====================================================== */

  const renderNavButton = (
    item
  ) => {
    const Icon =
      item.icon;

    const hasChildren =
      Array.isArray(
        item.children
      ) &&
      item.children.length >
        0;

    const childActive =
      hasChildren
        ? item.children.some(
            (child) =>
              activeItem ===
              child.id
          )
        : false;

    const isActive =
      activeItem ===
        item.id ||
      childActive;

    const isOpen =
      openMenu ===
      item.id;

    return (
      <div
        key={
          item.id
        }
        className="w-full"
      >
        {/* =================================================
            PARENT BUTTON
        ================================================== */}

        <button
          type="button"
          title={
            collapsed
              ? item.label
              : undefined
          }
          onClick={() =>
            handleItemClick(
              item
            )
          }
          className={`
            group
            relative
            flex
            w-full
            items-center
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
            <>
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

              {/* CHEVRON */}

              {hasChildren && (
                <span
                  className="
                    ml-2
                    flex
                    h-5
                    w-5
                    shrink-0
                    items-center
                    justify-center
                    text-[#A8C2B3]
                  "
                >
                  {isOpen ? (
                    <ChevronDown
                      size={15}
                      strokeWidth={2}
                    />
                  ) : (
                    <ChevronRight
                      size={15}
                      strokeWidth={2}
                    />
                  )}
                </span>
              )}
            </>
          )}
        </button>

        {/* =================================================
            CHILDREN
        ================================================== */}

        {!collapsed &&
          hasChildren &&
          isOpen && (
            <div
              className="
                relative
                ml-4
                mt-1
                space-y-0.5
                border-l
                border-[#2A5A47]
                pl-2.5
              "
            >
              {item.children.map(
                (child) => {
                  const childIsActive =
                    activeItem ===
                    child.id;

                  return (
                    <button
                      key={
                        child.id
                      }
                      type="button"
                      onClick={() =>
                        handleChildClick(
                          child
                        )
                      }
                      className={`
                        relative
                        flex
                        w-full
                        items-center
                        rounded-md
                        px-3
                        py-2
                        text-left
                        text-[11px]
                        font-medium
                        transition
                        duration-150

                        ${
                          childIsActive
                            ? "bg-[#174D38] text-white"
                            : "text-[#A8C2B3] hover:bg-[#174D38] hover:text-white"
                        }
                      `}
                    >
                      {/* CHILD ACTIVE LINE */}

                      {childIsActive && (
                        <span
                          className="
                            absolute
                            -left-[13px]
                            top-1/2
                            h-5
                            w-[2px]
                            -translate-y-1/2
                            rounded-full
                            bg-[#72D3A2]
                          "
                        />
                      )}

                      <span className="truncate">
                        {
                          child.label
                        }
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          )}
      </div>
    );
  };

  /* =====================================================
     SIDEBAR
  ====================================================== */

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
          {/* LOGO */}

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
              className="
                h-full
                w-full
                object-contain
              "
            />
          </div>

          {/* PRODUCT NAME */}

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
                  text-[15px]
                  font-bold
                  tracking-[-0.02em]
                  text-white
                "
              >
                Moto
                <span className="text-[#78D6A4]">
                  Lend
                </span>
              </p>

              <p
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.06em]
                  text-white
                "
              >
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