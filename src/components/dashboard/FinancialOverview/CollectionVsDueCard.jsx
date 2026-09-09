// src/components/dashboard/FinancialOverview/CollectionVsDueCard.jsx

import { useState } from "react";
import {
  ArrowLeftRight,
  TrendingUp,
} from "lucide-react";

const CollectionVsDueCard = ({
  collectionVsDue = {},
}) => {
  const [showOverdue, setShowOverdue] =
    useState(false);

  const todayData =
    collectionVsDue?.today || {
      due: 0,
      collected: 0,
      accuracy: 0,
    };

  const overdueData =
    collectionVsDue?.overdue || {
      due: 0,
      collected: 0,
      accuracy: 0,
    };

  const activeData = showOverdue
    ? overdueData
    : todayData;

  const collected = Number(
    activeData?.collected || 0
  );

  const due = Number(
    activeData?.due || 0
  );

  const accuracy = Math.min(
    Number(activeData?.accuracy || 0),
    100
  );

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    );
  };

  return (
    <div
      className="
        flex
        min-h-[150px]
        h-full
        w-full
        flex-col
        rounded-xl
        border
        border-slate-200
        bg-white
        p-2.5
        sm:p-3
        lg:p-3.5
      "
    >
      {/* =================================================
          HEADER
      ================================================== */}

      <div className="flex items-start justify-between gap-2">
        {/* LEFT */}

        <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-[#EAF5EF]
              sm:h-9
              sm:w-9
            "
          >
            <TrendingUp
              size={16}
              strokeWidth={2}
              className="text-[#0B5D3B] sm:hidden"
            />
            <TrendingUp
              size={17}
              strokeWidth={2}
              className="hidden text-[#0B5D3B] sm:block"
            />
          </div>

          <div className="min-w-0">
            <p
              className="
                truncate
                text-[10.5px]
                font-semibold
                text-[#17221D]
                sm:text-[11px]
              "
            >
              Collection vs Due
            </p>

            <p
              className="
                mt-0.5
                text-[8px]
                text-slate-400
              "
            >
              {showOverdue
                ? "Overdue"
                : "Today"}
            </p>
          </div>
        </div>

        {/* SWITCH */}

        <button
          type="button"
          onClick={() =>
            setShowOverdue(
              (previous) =>
                !previous
            )
          }
          className={`
            inline-flex
            shrink-0
            items-center
            gap-1
            rounded-full
            border
            px-1.5
            py-1
            text-[7.5px]
            font-bold
            transition
            sm:px-2
            sm:text-[8px]
            ${
              showOverdue
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-[#B9DEC9] bg-[#F4FAF6] text-[#0B6B43]"
            }
          `}
          title={
            showOverdue
              ? "Show today's collection"
              : "Show overdue collection"
          }
        >
          <ArrowLeftRight
            size={10}
            strokeWidth={2}
          />

          {showOverdue
            ? "Today"
            : "Overdue"}
        </button>
      </div>

      {/* =================================================
          AMOUNT
      ================================================== */}

      <div className="mt-3 sm:mt-4">
        <div className="flex flex-wrap items-end gap-1.5 sm:gap-2">
          <span
            className={`
              text-[20px]
              font-extrabold
              leading-none
              tracking-tight
              sm:text-[24px]
              lg:text-[22px]
              xl:text-[24px]
              ${
                showOverdue
                  ? "text-red-600"
                  : "text-[#0B6B43]"
              }
            `}
          >
            ₹{formatMoney(collected)}
          </span>

          <span
            className="
              pb-0.5
              text-[12px]
              font-semibold
              text-slate-300
              sm:text-[13px]
            "
          >
            /
          </span>

          <span
            className="
              pb-0.5
              text-[12px]
              font-semibold
              text-slate-400
              sm:text-[13px]
            "
          >
            ₹{formatMoney(due)}
          </span>
        </div>

        <p
          className="
            mt-1
            text-[7.5px]
            font-medium
            text-slate-400
            sm:text-[8px]
          "
        >
          {showOverdue
            ? "Collected / remaining overdue"
            : "Collected / today's due"}
        </p>
      </div>

      {/* =================================================
          ACCURACY
      ================================================== */}

      <div className="mt-2.5 sm:mt-3">
        <div className="mb-1 flex items-center justify-between">
          <span
            className="
              text-[7.5px]
              font-medium
              text-slate-400
              sm:text-[8px]
            "
          >
            Collection accuracy
          </span>

          <span
            className={`
              text-[8.5px]
              font-extrabold
              sm:text-[9px]
              ${
                showOverdue
                  ? "text-red-600"
                  : "text-[#0B6B43]"
              }
            `}
          >
            {accuracy.toFixed(1)}%
          </span>
        </div>

        <div
          className="
            h-1.5
            w-full
            overflow-hidden
            rounded-full
            bg-slate-100
            sm:h-2
          "
        >
          <div
            className={`
              h-full
              rounded-full
              transition-all
              duration-300
              ${
                showOverdue
                  ? "bg-red-500"
                  : "bg-[#0B6B43]"
              }
            `}
            style={{
              width: `${accuracy}%`,
            }}
          />
        </div>
      </div>

      {/* NO EXTRA BOTTOM MESSAGE */}
    </div>
  );
};

export default CollectionVsDueCard;