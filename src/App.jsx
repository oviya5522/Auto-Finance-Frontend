// src/App.jsx

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import SideBar from "./SideBar";

import CustomerPage from "./pages/customers/CustomerPage";
import CustomerOnboarding from "./pages/customers/CustomerOnboarding";
import LoanPage from "./pages/loan/Loan";
import CustomerDetails from "./pages/customers/CustomerDetails";
import Dashboard from "./pages/dashboard/Dashboard";
import RecentActivities from "./pages/activities/RecentActivities";
import Settings from "./pages/settings/Settings";
import LoanManagement from "./pages/loan/LoanManagement";
import ExpenseControl from "./pages/expense/ExpenseControl";

import Login from "./pages/auth/Login";
import StaffCollection from "./pages/staff/StaffCollection";
import CollectionManagement from "./pages/collection/CollectionManagement";

import ProtectedRoute from "./components/auth/ProtectedRoute";

import {
  getSession,
} from "./services/authStorage";

/* =========================================================
   APP LAYOUT
========================================================= */

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const session = getSession();

  /* =====================================================
     LOGIN PAGE

     IMPORTANT:
     Login must NOT show sidebar.
  ====================================================== */

  if (location.pathname === "/login") {
    return (
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    );
  }

  /* =====================================================
     STAFF AREA

     Staff gets ONLY staff collection UI.
     No Admin sidebar.
  ====================================================== */

  if (
    session?.role === "staff" &&
    location.pathname.startsWith(
      "/staff"
    )
  ) {
    return (
      <Routes>
        <Route
          path="/staff/collection"
          element={
            <ProtectedRoute role="staff">
              <StaffCollection />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/staff/collection"
              replace
            />
          }
        />
      </Routes>
    );
  }

  /* =====================================================
     ACTIVE SIDEBAR ITEM
  ====================================================== */

  const getActiveItem = () => {
    if (
      location.pathname.startsWith(
        "/customers"
      )
    ) {
      return "customers";
    }

    if (
      location.pathname === "/loan"
    ) {
      return "loans";
    }

    if (
      location.pathname.startsWith(
        "/loan-management"
      )
    ) {
      return "loan-management";
    }

    if (
      location.pathname.startsWith(
        "/expense-control"
      )
    ) {
      return "expense-control";
    }

    if (
      location.pathname.startsWith(
        "/collections"
      )
    ) {
      return "collections";
    }

    if (
      location.pathname.startsWith(
        "/settings"
      )
    ) {
      return "settings";
    }

    if (
      location.pathname.startsWith(
        "/activities"
      )
    ) {
      return "dashboard";
    }

    return "dashboard";
  };

  /* =====================================================
     NAVIGATION
  ====================================================== */

  const handleNavigate = (id) => {
    switch (id) {
      case "dashboard":
        navigate("/dashboard");
        break;

      case "customers":
        navigate("/customers");
        break;

      case "loans":
        navigate("/loan");
        break;

      case "loan-management":
        navigate(
          "/loan-management"
        );
        break;

      case "expense-control":
        navigate(
          "/expense-control"
        );
        break;

      case "collections":
        navigate("/collections");
        break;

      case "settings":
        navigate("/settings");
        break;

      default:
        break;
    }
  };

  /* =====================================================
     ADMIN LAYOUT
  ====================================================== */

  return (
    <div
      className="
        flex
        h-screen
        min-h-0
        overflow-hidden
        bg-[#F8FAF9]
      "
    >
      {/* =================================================
          SIDEBAR
      ================================================== */}

      <SideBar
        activeItem={getActiveItem()}
        onNavigate={handleNavigate}
      />

      {/* =================================================
          MAIN APPLICATION AREA
      ================================================== */}

      <main
        className="
          min-w-0
          min-h-0
          flex-1
          overflow-auto
        "
      >
        <Routes>

          {/* =============================================
              ROOT
          ============================================== */}

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          {/* =============================================
              DASHBOARD
          ============================================== */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="admin">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* =============================================
              CUSTOMERS
          ============================================== */}

          <Route
            path="/customers"
            element={
              <ProtectedRoute role="admin">
                <CustomerPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers/onboarding"
            element={
              <ProtectedRoute role="admin">
                <CustomerOnboarding />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers/:customerId"
            element={
              <ProtectedRoute role="admin">
                <CustomerDetails />
              </ProtectedRoute>
            }
          />

          {/* =============================================
              LOANS
          ============================================== */}

          <Route
            path="/loan"
            element={
              <ProtectedRoute role="admin">
                <LoanPage />
              </ProtectedRoute>
            }
          />

          {/* =============================================
              LOAN MANAGEMENT
          ============================================== */}

          <Route
            path="/loan-management"
            element={
              <ProtectedRoute role="admin">
                <LoanManagement />
              </ProtectedRoute>
            }
          />

          {/* =============================================
              EXPENSE CONTROL
          ============================================== */}

          <Route
            path="/expense-control"
            element={
              <ProtectedRoute role="admin">
                <ExpenseControl />
              </ProtectedRoute>
            }
          />

          {/* =============================================
              COLLECTION MANAGEMENT
          ============================================== */}

          <Route
            path="/collections"
            element={
              <ProtectedRoute role="admin">
                <CollectionManagement />
              </ProtectedRoute>
            }
          />

          {/* =============================================
              ACTIVITIES
          ============================================== */}

          <Route
            path="/activities"
            element={
              <ProtectedRoute role="admin">
                <RecentActivities />
              </ProtectedRoute>
            }
          />

          {/* =============================================
              SETTINGS
          ============================================== */}

          <Route
            path="/settings"
            element={
              <ProtectedRoute role="admin">
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* =============================================
              STAFF
              
              Direct staff route is still protected.
              If staff gets here, outer layout will
              normally handle it without sidebar.
          ============================================== */}

          <Route
            path="/staff/collection"
            element={
              <ProtectedRoute role="staff">
                <StaffCollection />
              </ProtectedRoute>
            }
          />

          {/* =============================================
              UNKNOWN ROUTE
          ============================================== */}

          <Route
            path="*"
            element={
              <Navigate
                to={
                  session?.role === "staff"
                    ? "/staff/collection"
                    : "/dashboard"
                }
                replace
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
};

/* =========================================================
   APP
========================================================= */

const App = () => {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
};

export default App;