// src/pages/control-center/ControlCenter.jsx

import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  Database,
  Eye,
  Laptop2,
  LogIn,
  LogOut,
  MonitorCheck,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Users,
  Wifi,
  X,
} from "lucide-react";

import { useState } from "react";

/* =========================================================
   STATIC DEMO DATA
========================================================= */

const STAFF_DATA = [
  {
    id: "STF-001",
    name: "Arun Kumar",
    role: "Staff",
    status: "ONLINE",
    accountStatus: "ACTIVE",
    todayLogin: "06h 42m",
    currentSession: "02h 14m",
    yesterdayLogin: "07h 48m",
    lastLogin: "08 Sep 2026, 08:56 AM",
    lastLogout: "—",
    openTime: "08:56 AM",
    closeTime: "—",
    device: "Chrome / Windows",
    browser: "Chrome",
    location: "Dindigul",
    currentSessionId:
      "SES-20260908-004",
    activity: [
      "08:56 AM — Logged in",
      "10:12 AM — Accessed Collection",
      "10:48 AM — Viewed Customer",
    ],
  },
  {
    id: "STF-002",
    name: "Priya",
    role: "Staff",
    status: "OFFLINE",
    accountStatus: "ACTIVE",
    todayLogin: "07h 12m",
    currentSession: "—",
    yesterdayLogin: "08h 02m",
    lastLogin: "08 Sep 2026, 09:04 AM",
    lastLogout:
      "08 Sep 2026, 04:16 PM",
    openTime: "09:04 AM",
    closeTime: "04:16 PM",
    device: "Chrome / Windows",
    browser: "Chrome",
    location: "Dindigul",
    currentSessionId:
      "SES-20260908-005",
    activity: [
      "09:04 AM — Logged in",
      "11:05 AM — Accessed Customer",
      "04:16 PM — Logged out",
    ],
  },
];

const TODAY_ACTIVITY = [
  {
    time: "08:42 AM",
    staff: "Arun Kumar",
    action: "logged in",
    module: "Authentication",
    icon: LogIn,
  },
  {
    time: "10:12 AM",
    staff: "Arun Kumar",
    action: "accessed Collection",
    module: "Collection",
    icon: Activity,
  },
  {
    time: "11:05 AM",
    staff: "Priya",
    action: "accessed Customer",
    module: "Customer",
    icon: UserRound,
  },
  {
    time: "04:16 PM",
    staff: "Priya",
    action: "logged out",
    module: "Authentication",
    icon: LogOut,
  },
];

const SUSPENDED_ACCOUNT = {
  name: "Demo Suspended User",
  id: "STF-009",
  status: "SUSPENDED",
  reason: "Account temporarily suspended",
  date: "07 Sep 2026",
};

const SYSTEM_STATUS = [
  {
    label: "Application",
    value: "Operational",
    icon: MonitorCheck,
    tone: "green",
  },
  {
    label: "Database",
    value: "Connected",
    icon: Database,
    tone: "blue",
  },
  {
    label: "Authentication",
    value: "Operational",
    icon: ShieldCheck,
    tone: "green",
  },
  {
    label: "Notifications",
    value: "Operational",
    icon: Bell,
    tone: "purple",
  },
  {
    label: "Backup",
    value: "Healthy",
    icon: CheckCircle2,
    tone: "green",
  },
];

const STAFF_SESSIONS = {
  "STF-001": {
    sessionId: "SES-20260908-004",
    staff: "Arun Kumar",
    login: "08:56 AM",
    logout: "Active",
    duration: "02h 14m",
    status: "Active",
    device: "Chrome / Windows",
    browser: "Chrome",
    network: "192.168.1.104",
    modules: [
      "Customer",
      "Loan",
      "Collection",
    ],
  },
  "STF-002": {
    sessionId: "SES-20260908-005",
    staff: "Priya",
    login: "09:04 AM",
    logout: "04:16 PM",
    duration: "07h 12m",
    status: "Completed",
    device: "Chrome / Windows",
    browser: "Chrome",
    network: "192.168.1.108",
    modules: [
      "Customer",
      "Loan",
      "Vehicle",
    ],
  },
};

const KPI_DATA = [
  {
    label: "Total Staff",
    value: "2",
    note: "Active demo staff",
    icon: Users,
    tone: "green",
  },
  {
    label: "Online Now",
    value: "1",
    note: "+1 from yesterday",
    icon: Wifi,
    tone: "blue",
  },
  {
    label: "Active Sessions",
    value: "1",
    note: "Currently active",
    icon: MonitorCheck,
    tone: "purple",
  },
  {
    label: "Today's Login Time",
    value: "13h 54m",
    note: "Combined staff time",
    icon: Clock3,
    tone: "amber",
  },
  {
    label: "Today's Sessions",
    value: "2",
    note: "Demo sessions",
    icon: LogIn,
    tone: "green",
  },
];

const DEMO_REFRESH_TIMES = [
  "Today, 10:42 AM",
  "Today, 10:44 AM",
  "Today, 10:46 AM",
  "Today, 10:48 AM",
];

/* =========================================================
   MAIN
========================================================= */

const ControlCenter = () => {
  const [selectedStaff, setSelectedStaff] =
    useState(null);

  const [selectedSession, setSelectedSession] =
    useState(null);

  const [refreshIndex, setRefreshIndex] =
    useState(0);

  const [toast, setToast] = useState("");

  const lastUpdated =
    DEMO_REFRESH_TIMES[
      Math.min(
        refreshIndex,
        DEMO_REFRESH_TIMES.length - 1
      )
    ];

  const handleRefresh = () => {
    setRefreshIndex(
      (current) =>
        current + 1
    );

    setToast(
      "Demo data refreshed successfully."
    );

    window.setTimeout(() => {
      setToast("");
    }, 2500);
  };

  const openStaffDetails = (staff) => {
    setSelectedStaff(staff);
  };

  const openSessionDetails = (staff) => {
    const session =
      STAFF_SESSIONS[staff.id];

    if (session) {
      setSelectedSession(session);
    }
  };

  return (
    <div
      className="
        min-h-full
        bg-[#F6F8F7]
        px-4
        py-4
        sm:px-5
        sm:py-5
        lg:px-6
        lg:py-6
      "
    >
      {/* =================================================
          HEADER
      ================================================== */}

      <header
        className="
          mb-5
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[#EAF5EF]
              text-[#0B5D3B]
            "
          >
            <MonitorCheck
              size={22}
              strokeWidth={2}
            />
          </div>

          <div className="min-w-0">
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2.5
              "
            >
              <h1
                className="
                  text-[26px]
                  font-extrabold
                  leading-tight
                  tracking-tight
                  text-[#17221D]
                  sm:text-[30px]
                "
              >
                Control Center
              </h1>

              <span
                className="
                  rounded-full
                  bg-[#EAF5EF]
                  px-2.5
                  py-1
                  text-[9px]
                  font-extrabold
                  uppercase
                  tracking-wide
                  text-[#0B5D3B]
                "
              >
                Admin
              </span>
            </div>

            <p
              className="
                mt-1
                text-[12px]
                font-medium
                leading-5
                text-slate-500
                sm:text-[13px]
              "
            >
              Monitor staff activity, system
              usage and application access.
            </p>
          </div>
        </div>

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2
          "
        >
          <div
            className="
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
            "
          >
            <p
              className="
                text-[8px]
                font-bold
                uppercase
                tracking-wide
                text-slate-400
              "
            >
              Last Updated
            </p>

            <p
              className="
                mt-1
                text-[11px]
                font-extrabold
                text-[#253252]
              "
            >
              {lastUpdated}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="
              inline-flex
              h-11
              items-center
              gap-2
              rounded-xl
              border
              border-[#CFE3D8]
              bg-white
              px-4
              text-[11px]
              font-extrabold
              text-[#0B5D3B]
              transition
              hover:bg-[#F4FAF6]
            "
          >
            <RefreshCw
              size={15}
              strokeWidth={2.1}
            />
            Refresh
          </button>
        </div>
      </header>

      {/* =================================================
          TOAST
      ================================================== */}

      {toast && (
        <div
          className="
            mb-4
            flex
            items-center
            gap-2.5
            rounded-xl
            border
            border-[#CFE8D9]
            bg-[#F0FAF4]
            px-4
            py-3
          "
        >
          <CheckCircle2
            size={17}
            className="shrink-0 text-[#0B6B43]"
          />

          <p
            className="
              text-[10px]
              font-bold
              text-[#0B6B43]
              sm:text-[11px]
            "
          >
            {toast}
          </p>
        </div>
      )}

      {/* =================================================
          KPI
      ================================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-2
          lg:grid-cols-3
          2xl:grid-cols-5
        "
      >
        {KPI_DATA.map((item) => (
          <StatCard
            key={item.label}
            {...item}
          />
        ))}
      </div>

      {/* =================================================
          TODAY LOGIN
      ================================================== */}

      <div
        className="
          mt-4
          grid
          grid-cols-1
          gap-4
          xl:grid-cols-[minmax(0,1.7fr)_minmax(330px,0.8fr)]
        "
      >
        <section
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >
          <SectionHeader
            icon={LogIn}
            title="Today's Staff Login"
            subtitle="Current opening and closing time for today's staff activity."
          />

          <div
            className="
              grid
              grid-cols-1
              gap-3
              p-4
              sm:grid-cols-2
            "
          >
            {STAFF_DATA.map(
              (staff) => (
                <div
                  key={staff.id}
                  className="
                    rounded-xl
                    border
                    border-slate-100
                    bg-[#FAFCFB]
                    px-4
                    py-4
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-3
                      "
                    >
                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          bg-[#EAF5EF]
                          text-[#0B5D3B]
                        "
                      >
                        <UserRound
                          size={17}
                        />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            truncate
                            text-[13px]
                            font-extrabold
                            text-[#17221D]
                          "
                        >
                          {staff.name}
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-[9px]
                            font-semibold
                            text-slate-400
                          "
                        >
                          {staff.id}
                        </p>
                      </div>
                    </div>

                    <StatusBadge
                      status={
                        staff.status
                      }
                    />
                  </div>

                  <div
                    className="
                      mt-4
                      grid
                      grid-cols-2
                      gap-3
                    "
                  >
                    <CompactInfo
                      label="Open Time"
                      value={
                        staff.openTime
                      }
                    />

                    <CompactInfo
                      label="Close Time"
                      value={
                        staff.closeTime
                      }
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* =================================================
            SUSPENDED
        ================================================== */}

        <section
          className="
            overflow-hidden
            rounded-2xl
            border
            border-red-100
            bg-white
            shadow-sm
          "
        >
          <div
            className="
              border-b
              border-red-100
              bg-red-50/60
              px-5
              py-4
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-lg
                  bg-red-100
                  text-red-600
                "
              >
                <AlertTriangle
                  size={18}
                />
              </div>

              <div>
                <h2
                  className="
                    text-[13px]
                    font-extrabold
                    text-[#17221D]
                  "
                >
                  Suspended Account
                </h2>

                <p
                  className="
                    mt-0.5
                    text-[9px]
                    font-medium
                    text-slate-400
                  "
                >
                  Account requiring admin attention.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >
              <div className="min-w-0">
                <p
                  className="
                    truncate
                    text-[13px]
                    font-extrabold
                    text-[#17221D]
                  "
                >
                  {
                    SUSPENDED_ACCOUNT.name
                  }
                </p>

                <p
                  className="
                    mt-1
                    text-[9px]
                    font-semibold
                    text-slate-400
                  "
                >
                  {
                    SUSPENDED_ACCOUNT.id
                  }
                </p>
              </div>

              <span
                className="
                  shrink-0
                  rounded-full
                  bg-red-100
                  px-2.5
                  py-1
                  text-[8px]
                  font-extrabold
                  text-red-600
                "
              >
                SUSPENDED
              </span>
            </div>

            <div
              className="
                mt-4
                rounded-xl
                border
                border-red-100
                bg-red-50/40
                px-4
                py-3
              "
            >
              <p
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-red-400
                "
              >
                Reason
              </p>

              <p
                className="
                  mt-1.5
                  text-[10px]
                  font-semibold
                  leading-5
                  text-red-700
                "
              >
                {
                  SUSPENDED_ACCOUNT.reason
                }
              </p>

              <p
                className="
                  mt-1.5
                  text-[9px]
                  font-medium
                  text-red-500
                "
              >
                Suspended:{" "}
                {
                  SUSPENDED_ACCOUNT.date
                }
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* =================================================
          STAFF OVERVIEW
      ================================================== */}

      <section
        className="
          mt-4
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >
        <SectionHeader
          icon={Users}
          title="Staff Overview"
          subtitle="Current staff availability and account status."
        />

        <div className="overflow-x-auto">
          <table
            className="
              w-full
              min-w-[820px]
              border-collapse
            "
          >
            <thead className="bg-[#F8FAF9]">
              <tr>
                <TableHead>
                  Staff
                </TableHead>

                <TableHead>
                  Role
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead>
                  Today's Login
                </TableHead>

                <TableHead>
                  Current Session
                </TableHead>

                <TableHead align="center">
                  Action
                </TableHead>
              </tr>
            </thead>

            <tbody>
              {STAFF_DATA.map(
                (staff) => (
                  <tr
                    key={staff.id}
                    className="
                      border-b
                      border-slate-100
                      transition
                      hover:bg-[#FAFCFB]
                    "
                  >
                    <td className="px-5 py-4">
                      <div
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >
                        <div
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            bg-[#EAF5EF]
                            text-[#0B5D3B]
                          "
                        >
                          <UserRound
                            size={15}
                          />
                        </div>

                        <div>
                          <p
                            className="
                              text-[11px]
                              font-extrabold
                              text-[#253252]
                            "
                          >
                            {staff.name}
                          </p>

                          <p
                            className="
                              mt-0.5
                              text-[9px]
                              font-semibold
                              text-slate-400
                            "
                          >
                            {staff.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p
                        className="
                          text-[10px]
                          font-semibold
                          text-[#253252]
                        "
                      >
                        {staff.role}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        status={
                          staff.status
                        }
                      />
                    </td>

                    <td className="px-5 py-4">
                      <p
                        className="
                          text-[11px]
                          font-extrabold
                          text-[#253252]
                        "
                      >
                        {
                          staff.todayLogin
                        }
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p
                        className="
                          text-[11px]
                          font-extrabold
                          text-[#253252]
                        "
                      >
                        {
                          staff.currentSession
                        }
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div
                        className="
                          flex
                          items-center
                          justify-center
                          gap-2
                        "
                      >
                        <button
                          type="button"
                          onClick={() =>
                            openStaffDetails(
                              staff
                            )
                          }
                          className="
                            inline-flex
                            h-9
                            items-center
                            gap-1.5
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-3
                            text-[9px]
                            font-bold
                            text-slate-600
                            transition
                            hover:bg-slate-50
                          "
                        >
                          <Eye
                            size={13}
                          />
                          View
                        </button>

                        {staff.currentSession !==
                          "—" && (
                          <button
                            type="button"
                            onClick={() =>
                              openSessionDetails(
                                staff
                              )
                            }
                            className="
                              inline-flex
                              h-9
                              items-center
                              gap-1.5
                              rounded-lg
                              bg-[#EAF5EF]
                              px-3
                              text-[9px]
                              font-bold
                              text-[#0B5D3B]
                              transition
                              hover:bg-[#DFF3E8]
                            "
                          >
                            <MonitorCheck
                              size={13}
                            />
                            Session
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* =================================================
          ACTIVITY + SYSTEM
      ================================================== */}

      <div
        className="
          mt-4
          grid
          grid-cols-1
          gap-4
          xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]
        "
      >
        {/* ACTIVITY */}

        <section
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >
          <SectionHeader
            icon={Activity}
            title="Today's Activity"
            subtitle="Recent staff activity across the application."
          />

          <div className="p-4">
            <div className="space-y-3">
              {TODAY_ACTIVITY.map(
                (
                  item,
                  index
                ) => {
                  const Icon =
                    item.icon;

                  const isLast =
                    index ===
                    TODAY_ACTIVITY.length -
                      1;

                  return (
                    <div
                      key={`${item.time}-${item.staff}`}
                      className="
                        relative
                        flex
                        items-start
                        gap-3
                      "
                    >
                      {!isLast && (
                        <span
                          className="
                            absolute
                            left-[16px]
                            top-9
                            h-[calc(100%-6px)]
                            w-px
                            bg-slate-200
                          "
                        />
                      )}

                      <div
                        className="
                          relative
                          z-10
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          bg-[#EAF5EF]
                          text-[#0B5D3B]
                        "
                      >
                        <Icon
                          size={14}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div
                          className="
                            flex
                            flex-wrap
                            items-center
                            gap-2
                          "
                        >
                          <span
                            className="
                              text-[10px]
                              font-extrabold
                              text-[#253252]
                            "
                          >
                            {item.time}
                          </span>

                          <span
                            className="
                              text-[10px]
                              font-extrabold
                              text-[#17221D]
                            "
                          >
                            {item.staff}
                          </span>

                          <span
                            className="
                              text-[10px]
                              font-medium
                              text-slate-500
                            "
                          >
                            {item.action}
                          </span>
                        </div>

                        <p
                          className="
                            mt-1
                            text-[9px]
                            font-medium
                            text-slate-400
                          "
                        >
                          {item.module}
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </section>

        {/* SYSTEM STATUS */}

        <section
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >
          <SectionHeader
            icon={ShieldCheck}
            title="System Status"
            subtitle="Static demo indicators for the application environment."
          />

          <div
            className="
              grid
              grid-cols-1
              gap-3
              p-4
              sm:grid-cols-2
            "
          >
            {SYSTEM_STATUS.map(
              (item) => (
                <SystemStatusCard
                  key={item.label}
                  {...item}
                />
              )
            )}
          </div>
        </section>
      </div>

      {/* =================================================
          DEMO NOTE
      ================================================== */}

      <div
        className="
          mt-4
          rounded-xl
          border
          border-blue-100
          bg-blue-50/70
          px-4
          py-3
        "
      >
        <div
          className="
            flex
            items-start
            gap-2.5
          "
        >
          <Laptop2
            size={15}
            className="
              mt-0.5
              shrink-0
              text-blue-600
            "
          />

          <p
            className="
              text-[9px]
              font-medium
              leading-5
              text-blue-700/80
              sm:text-[10px]
            "
          >
            Control Center currently displays
            static demonstration information only.
            Staff sessions, activity and system
            indicators are not connected to live
            application services.
          </p>
        </div>
      </div>

      {/* =================================================
          STAFF DETAIL DRAWER
      ================================================== */}

      {selectedStaff && (
        <StaffDetailDrawer
          staff={selectedStaff}
          onClose={() =>
            setSelectedStaff(null)
          }
          onViewSession={() =>
            openSessionDetails(
              selectedStaff
            )
          }
        />
      )}

      {/* =================================================
          SESSION MODAL
      ================================================== */}

      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() =>
            setSelectedSession(null)
          }
        />
      )}
    </div>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  label,
  value,
  note,
  icon: Icon,
  tone = "green",
}) => {
  const styles = {
    green: {
      bg: "bg-[#F1FAF4]",
      icon: "bg-[#DDF1E5] text-[#0B6B43]",
      value: "text-[#0B6B43]",
    },
    blue: {
      bg: "bg-[#F1F6FE]",
      icon: "bg-[#E1ECFD] text-[#4779D8]",
      value: "text-[#4779D8]",
    },
    purple: {
      bg: "bg-[#F5F2FF]",
      icon: "bg-[#E9E2FF] text-[#7252F5]",
      value: "text-[#7252F5]",
    },
    amber: {
      bg: "bg-[#FFF8ED]",
      icon: "bg-[#FFF0CE] text-[#D88B12]",
      value: "text-[#B86D00]",
    },
  };

  const current =
    styles[tone] ||
    styles.green;

  return (
    <div
      className={`
        rounded-2xl
        border
        border-slate-200
        ${current.bg}
        px-4
        py-4
      `}
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <div className="min-w-0">
          <p
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-wide
              text-slate-400
            "
          >
            {label}
          </p>

          <p
            className={`
              mt-1.5
              text-[25px]
              font-extrabold
              leading-none
              tracking-tight
              ${current.value}
            `}
          >
            {value}
          </p>

          <p
            className="
              mt-2
              text-[9px]
              font-semibold
              leading-4
              text-slate-400
            "
          >
            {note}
          </p>
        </div>

        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${current.icon}
          `}
        >
          <Icon
            size={17}
            strokeWidth={2.1}
          />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   SECTION HEADER
========================================================= */

const SectionHeader = ({
  icon: Icon,
  title,
  subtitle,
}) => {
  return (
    <div
      className="
        border-b
        border-slate-100
        px-5
        py-4
      "
    >
      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-[#EAF5EF]
            text-[#0B5D3B]
          "
        >
          <Icon
            size={15}
            strokeWidth={2.1}
          />
        </div>

        <div className="min-w-0">
          <h2
            className="
              truncate
              text-[13px]
              font-extrabold
              text-[#17221D]
            "
          >
            {title}
          </h2>

          <p
            className="
              mt-1
              truncate
              text-[9px]
              font-medium
              text-slate-400
            "
          >
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   COMPACT INFO
========================================================= */

const CompactInfo = ({
  label,
  value,
}) => {
  return (
    <div
      className="
        rounded-lg
        border
        border-slate-100
        bg-white
        px-3
        py-2.5
      "
    >
      <p
        className="
          text-[7px]
          font-bold
          uppercase
          tracking-wide
          text-slate-400
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          text-[11px]
          font-extrabold
          text-[#253252]
        "
      >
        {value}
      </p>
    </div>
  );
};

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({
  status,
}) => {
  const normalized =
    String(
      status || ""
    ).toUpperCase();

  const classes =
    normalized ===
    "ONLINE"
      ? "bg-[#EAF5EF] text-[#0B6B43]"
      : normalized ===
        "OFFLINE"
      ? "bg-slate-100 text-slate-600"
      : normalized ===
        "SUSPENDED"
      ? "bg-red-50 text-red-600"
      : "bg-amber-50 text-amber-600";

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-2.5
        py-1
        text-[8px]
        font-extrabold
        ${classes}
      `}
    >
      {normalized}
    </span>
  );
};

/* =========================================================
   TABLE HEAD
========================================================= */

const TableHead = ({
  children,
  align = "left",
}) => {
  return (
    <th
      className={`
        whitespace-nowrap
        border-b
        border-slate-200
        px-5
        py-3
        text-[8px]
        font-bold
        uppercase
        tracking-wide
        text-slate-400
        ${
          align ===
          "center"
            ? "text-center"
            : "text-left"
        }
      `}
    >
      {children}
    </th>
  );
};

/* =========================================================
   SYSTEM STATUS CARD
========================================================= */

const SystemStatusCard = ({
  label,
  value,
  icon: Icon,
  tone = "green",
}) => {
  const styles = {
    green: {
      icon:
        "bg-[#EAF5EF] text-[#0B6B43]",
      badge:
        "bg-[#EAF5EF] text-[#0B6B43]",
    },
    blue: {
      icon:
        "bg-blue-50 text-blue-600",
      badge:
        "bg-blue-50 text-blue-600",
    },
    purple: {
      icon:
        "bg-purple-50 text-purple-600",
      badge:
        "bg-purple-50 text-purple-600",
    },
  };

  const current =
    styles[tone] ||
    styles.green;

  return (
    <div
      className="
        rounded-xl
        border
        border-slate-100
        bg-[#FAFCFB]
        px-4
        py-3
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          gap-3
        "
      >
        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >
          <div
            className={`
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              ${current.icon}
            `}
          >
            <Icon size={15} />
          </div>

          <p
            className="
              truncate
              text-[10px]
              font-extrabold
              text-[#253252]
            "
          >
            {label}
          </p>
        </div>

        <span
          className={`
            shrink-0
            rounded-full
            px-2.5
            py-1
            text-[7px]
            font-extrabold
            ${current.badge}
          `}
        >
          {value}
        </span>
      </div>
    </div>
  );
};

/* =========================================================
   STAFF DETAIL DRAWER
========================================================= */

const StaffDetailDrawer = ({
  staff,
  onClose,
  onViewSession,
}) => {
  return (
    <div
      className="
        fixed
        inset-0
        z-[700]
        bg-slate-950/40
        backdrop-blur-[2px]
      "
      onClick={onClose}
    >
      <aside
        className="
          absolute
          right-0
          top-0
          h-full
          w-full
          max-w-[500px]
          overflow-y-auto
          border-l
          border-slate-200
          bg-white
          shadow-[-20px_0_60px_rgba(15,23,42,0.18)]
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div
          className="
            sticky
            top-0
            z-10
            flex
            items-center
            justify-between
            border-b
            border-slate-100
            bg-white
            px-6
            py-5
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-[#EAF5EF]
                text-[#0B5D3B]
              "
            >
              <UserRound size={20} />
            </div>

            <div>
              <p
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-400
                "
              >
                Staff Details
              </p>

              <h2
                className="
                  mt-1
                  text-[17px]
                  font-extrabold
                  text-[#17221D]
                "
              >
                {staff.name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-slate-400
              hover:bg-slate-50
              hover:text-slate-700
            "
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div
            className="
              rounded-xl
              border
              border-[#D8E9DF]
              bg-[#F6FBF8]
              px-5
              py-4
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >
              <div>
                <p
                  className="
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-slate-400
                  "
                >
                  Current Status
                </p>

                <div className="mt-2">
                  <StatusBadge
                    status={
                      staff.status
                    }
                  />
                </div>
              </div>

              <div className="text-right">
                <p
                  className="
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-slate-400
                  "
                >
                  Role
                </p>

                <p
                  className="
                    mt-2
                    text-[10px]
                    font-extrabold
                    text-[#253252]
                  "
                >
                  {staff.role}
                </p>
              </div>
            </div>
          </div>

          <DetailGrid>
            <DetailItem
              label="Staff ID"
              value={staff.id}
            />

            <DetailItem
              label="Account Status"
              value={
                staff.accountStatus
              }
            />

            <DetailItem
              label="Today's Login"
              value={
                staff.todayLogin
              }
            />

            <DetailItem
              label="Yesterday"
              value={
                staff.yesterdayLogin
              }
            />

            <DetailItem
              label="Current Session"
              value={
                staff.currentSession
              }
            />

            <DetailItem
              label="Last Login"
              value={
                staff.lastLogin
              }
            />

            <DetailItem
              label="Last Logout"
              value={
                staff.lastLogout
              }
            />

            <DetailItem
              label="Device"
              value={
                staff.device
              }
            />

            <DetailItem
              label="Browser"
              value={
                staff.browser
              }
            />

            <DetailItem
              label="Location"
              value={
                staff.location
              }
            />
          </DetailGrid>

          <section>
            <div
              className="
                mb-3
                flex
                items-center
                gap-2
              "
            >
              <Activity
                size={16}
                className="text-[#0B5D3B]"
              />

              <h3
                className="
                  text-[11px]
                  font-extrabold
                  text-[#17221D]
                "
              >
                Recent Activity
              </h3>
            </div>

            <div
              className="
                space-y-2.5
                rounded-xl
                border
                border-slate-100
                bg-slate-50
                p-4
              "
            >
              {staff.activity.map(
                (activity) => (
                  <p
                    key={activity}
                    className="
                      text-[9px]
                      font-semibold
                      leading-5
                      text-slate-600
                    "
                  >
                    {activity}
                  </p>
                )
              )}
            </div>
          </section>

          {STAFF_SESSIONS[
            staff.id
          ] && (
            <button
              type="button"
              onClick={
                onViewSession
              }
              className="
                inline-flex
                h-11
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#0B5D3B]
                px-4
                text-[10px]
                font-extrabold
                text-white
                transition
                hover:bg-[#084A30]
              "
            >
              <MonitorCheck
                size={15}
              />
              View Session
            </button>
          )}
        </div>
      </aside>
    </div>
  );
};

/* =========================================================
   SESSION MODAL
========================================================= */

const SessionDetailModal = ({
  session,
  onClose,
}) => {
  return (
    <div
      className="
        fixed
        inset-0
        z-[800]
        flex
        items-center
        justify-center
        bg-slate-950/45
        p-4
        backdrop-blur-[3px]
      "
      onClick={onClose}
    >
      <div
        className="
          w-full
          max-w-[620px]
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-[0_30px_90px_rgba(15,23,42,0.28)]
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-100
            px-6
            py-5
          "
        >
          <div>
            <p
              className="
                text-[8px]
                font-bold
                uppercase
                tracking-wide
                text-slate-400
              "
            >
              Session Details
            </p>

            <h2
              className="
                mt-1
                text-[17px]
                font-extrabold
                text-[#17221D]
              "
            >
              {session.sessionId}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-slate-400
              hover:bg-slate-50
            "
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div
            className="
              rounded-xl
              border
              border-[#D8E9DF]
              bg-[#F6FBF8]
              px-5
              py-4
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >
              <div>
                <p
                  className="
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-slate-400
                  "
                >
                  Staff
                </p>

                <p
                  className="
                    mt-1.5
                    text-[12px]
                    font-extrabold
                    text-[#253252]
                  "
                >
                  {session.staff}
                </p>
              </div>

              <span
                className="
                  rounded-full
                  bg-[#EAF5EF]
                  px-3
                  py-1.5
                  text-[8px]
                  font-extrabold
                  text-[#0B6B43]
                "
              >
                {session.status}
              </span>
            </div>
          </div>

          <DetailGrid>
            <DetailItem
              label="Login"
              value={session.login}
            />

            <DetailItem
              label="Logout"
              value={session.logout}
            />

            <DetailItem
              label="Duration"
              value={session.duration}
            />

            <DetailItem
              label="Device"
              value={session.device}
            />

            <DetailItem
              label="Browser"
              value={session.browser}
            />

            <DetailItem
              label="IP / Network"
              value={session.network}
            />
          </DetailGrid>

          <section>
            <p
              className="
                mb-3
                text-[10px]
                font-extrabold
                text-[#17221D]
              "
            >
              Modules Accessed
            </p>

            <div
              className="
                flex
                flex-wrap
                gap-2
              "
            >
              {session.modules.map(
                (module) => (
                  <span
                    key={module}
                    className="
                      rounded-full
                      bg-slate-100
                      px-3
                      py-1.5
                      text-[8px]
                      font-bold
                      text-slate-600
                    "
                  >
                    {module}
                  </span>
                )
              )}
            </div>
          </section>

          <div
            className="
              rounded-xl
              border
              border-blue-100
              bg-blue-50
              px-4
              py-3
            "
          >
            <div
              className="
                flex
                items-start
                gap-2.5
              "
            >
              <Laptop2
                size={15}
                className="
                  mt-0.5
                  shrink-0
                  text-blue-600
                "
              />

              <p
                className="
                  text-[9px]
                  font-medium
                  leading-5
                  text-blue-700/80
                "
              >
                IP and session values shown here
                are static demonstration values and
                are not collected from the user's
                actual device or network.
              </p>
            </div>
          </div>

          <div
            className="
              flex
              justify-end
              border-t
              border-slate-100
              pt-4
            "
          >
            <button
              type="button"
              onClick={onClose}
              className="
                h-10
                rounded-lg
                border
                border-slate-200
                bg-white
                px-5
                text-[9px]
                font-bold
                text-slate-600
                hover:bg-slate-50
              "
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   DETAIL GRID
========================================================= */

const DetailGrid = ({
  children,
}) => {
  return (
    <div
      className="
        grid
        grid-cols-1
        gap-2.5
        sm:grid-cols-2
      "
    >
      {children}
    </div>
  );
};

/* =========================================================
   DETAIL ITEM
========================================================= */

const DetailItem = ({
  label,
  value,
}) => {
  return (
    <div
      className="
        rounded-xl
        border
        border-slate-100
        bg-slate-50
        px-4
        py-3
      "
    >
      <p
        className="
          text-[7px]
          font-bold
          uppercase
          tracking-wide
          text-slate-400
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1.5
          break-words
          text-[10px]
          font-extrabold
          leading-5
          text-[#253252]
        "
      >
        {value || "—"}
      </p>
    </div>
  );
};

export default ControlCenter;