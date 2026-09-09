// src/components/dashboard/DashboardHeader.jsx

import {
  Bell,
  CalendarDays,
  ChevronDown,
} from "lucide-react";
import { LogOut } from "lucide-react";

const DashboardHeader = ({
  customerCount = 0,
  loanCount = 0,
   onLogout,
}) => {
  const today = new Date();

  const formattedDate =
    today.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      weekday: "short",
    });

  const formattedMonth =
    today.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });

  return (
    <header
      className="
        shrink-0
        border-b
        border-slate-200
        bg-white
      "
    >
      <div
        className="
          flex
          min-h-[60px]
          flex-wrap
          items-center
          justify-between
          gap-x-4
          gap-y-2
          px-3
          py-2
          sm:min-h-[68px]
          sm:flex-nowrap
          sm:px-5
          sm:py-2.5
          lg:px-6
        "
      >
        {/* =================================================
            LEFT
        ================================================== */}

        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <h1
              className="
                truncate
                text-[18px]
                font-semibold
                tracking-tight
                text-[#17221D]
                sm:text-[21px]
                lg:text-[23px]
              "
            >
              Dashboard
            </h1>

            <span
              className="
                shrink-0
                rounded-full
                bg-[#EAF5EF]
                px-2
                py-0.5
                text-[8.5px]
                font-semibold
                text-[#0B5D3B]
                sm:text-[9px]
              "
            >
              Live
            </span>
          </div>

          <div
            className="
              mt-1
              flex
              min-w-0
              flex-wrap
              items-center
              gap-x-3
              gap-y-1
              text-[9px]
              text-slate-400
              sm:text-[10px]
            "
          >
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays
                size={12}
                className="shrink-0 text-[#0B5D3B]"
              />

              {formattedDate}
            </span>

            <span className="hidden h-3.5 w-px bg-slate-200 sm:block" />

            <span>
              <strong className="font-semibold text-slate-600">
                {customerCount.toLocaleString("en-IN")}
              </strong>{" "}
              Customers
            </span>

            <span className="hidden h-3.5 w-px bg-slate-200 sm:block" />

            <span>
              <strong className="font-semibold text-slate-600">
                {loanCount.toLocaleString("en-IN")}
              </strong>{" "}
              Loans
            </span>
          </div>
        </div>

        {/* =================================================
            RIGHT CONTROLS
        ================================================== */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-1.5
            sm:gap-2
          "
        >
          {/* PERIOD / MONTH — hidden on phones to keep the header on one line, shown from tablet up */}

          <div
            className="
              hidden
              items-center
              gap-2
              md:flex
            "
          >
            <HeaderSelect
              label="Period"
              value="Today"
            />

            <HeaderSelect
              label="Month"
              value={formattedMonth}
            />
          </div>

          <button
            type="button"
            className="
              relative
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              border
              border-slate-200
              bg-white
              text-slate-600
              transition
              hover:border-slate-300
              hover:bg-slate-50
              hover:text-[#17221D]
              sm:h-9
              sm:w-9
            "
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell
              size={16}
              strokeWidth={2}
            />

            <span
              className="
                absolute
                right-1.5
                top-1.5
                h-1.5
                w-1.5
                rounded-full
                bg-slate-300
              "
            />
          </button>
          <button
  type="button"
  onClick={onLogout}
  aria-label="Logout"
  className="
    inline-flex
    h-8
    items-center
    gap-1.5
    rounded-lg
    border
    border-slate-200
    bg-white
    px-2
    text-[10px]
    font-semibold
    text-slate-600
    transition
    hover:border-red-200
    hover:bg-red-50
    hover:text-red-600
    sm:h-9
    sm:px-3
  "
>
  <LogOut
    size={14}
    strokeWidth={2}
  />

  <span className="hidden sm:inline">
    Logout
  </span>
</button>
        </div>
      </div>
    </header>
  );
};

/* =========================================================
   HEADER SELECT
========================================================= */

const HeaderSelect = ({
  label,
  value,
}) => {
  return (
    <button
      type="button"
      className="
        flex
        h-9
        min-w-[90px]
        items-center
        justify-between
        gap-3
        rounded-lg
        border
        border-slate-200
        bg-white
        px-3
        text-left
        transition
        hover:border-slate-300
        hover:bg-slate-50
        lg:min-w-[100px]
      "
    >
      <div className="min-w-0">
        <p className="text-[8px] font-medium text-slate-400">
          {label}
        </p>

        <p className="truncate text-[10px] font-semibold text-[#17221D]">
          {value}
        </p>
      </div>

      <ChevronDown
        size={12}
        className="shrink-0 text-slate-400"
      />
    </button>
  );
};

export default DashboardHeader;