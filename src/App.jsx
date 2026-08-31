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

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
      location.pathname.startsWith(
        "/loan"
      )
    ) {
      return "loan-management";
    }

    return "dashboard";
  };

  /* =====================================================
     NAVIGATION
  ====================================================== */

  const handleNavigate = (id) => {
    switch (id) {
      case "customers":
        navigate("/customers");
        break;

      case "loan-management":
        navigate("/loan");
        break;

      case "dashboard":
        navigate("/dashboard");
        break;

      case "settings":
        navigate("/settings");
        break;

      default:
        break;
    }
  };

  const isDashboard =
    location.pathname === "/dashboard" ||
    location.pathname === "/";

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

          {/* =================================================
              ROOT
          ================================================== */}

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          {/* =================================================
              DASHBOARD
          ================================================== */}

          <Route
            path="/dashboard"
            element={
              <div
                className="
                  h-full
                  min-h-0
                  overflow-hidden
                "
              >
                <Dashboard />
              </div>
            }
          />

          {/* =================================================
              CUSTOMERS
          ================================================== */}

          <Route
            path="/customers"
            element={<CustomerPage />}
          />

          {/* =================================================
              CUSTOMER ONBOARDING
          ================================================== */}

          <Route
            path="/customers/onboarding"
            element={
              <CustomerOnboarding />
            }
          />

          {/* =================================================
              CUSTOMER DETAILS
          ================================================== */}

          <Route
            path="/customers/:customerId"
            element={
              <CustomerDetails />
            }
          />

          {/* =================================================
              LOAN MANAGEMENT
          ================================================== */}

          <Route
            path="/loan"
            element={<LoanPage />}
          />

        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
};

export default App;