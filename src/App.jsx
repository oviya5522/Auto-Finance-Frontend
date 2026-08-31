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

  if (
    location.pathname.startsWith(
      "/settings"
    )
  ) {
    return "settings";
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

  <Route
    path="/"
    element={
      <Navigate
        to="/dashboard"
        replace
      />
    }
  />

  <Route
    path="/dashboard"
    element={
      <div className="h-full min-h-0 overflow-hidden">
        <Dashboard />
      </div>
    }
  />

  <Route
    path="/customers"
    element={<CustomerPage />}
  />

  <Route
    path="/customers/onboarding"
    element={<CustomerOnboarding />}
  />

  <Route
    path="/customers/:customerId"
    element={<CustomerDetails />}
  />

  <Route
    path="/loan"
    element={<LoanPage />}
  />

  {/* RECENT ACTIVITIES */}
  <Route
    path="/activities"
    element={<RecentActivities />}
  />
<Route
  path="/settings"
  element={<Settings />}
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