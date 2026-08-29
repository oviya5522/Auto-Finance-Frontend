// src/App.jsx

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import SideBar from "./components/SideBar";

import CustomerPage from "./pages/customers/CustomerPage";
import CustomerOnboarding from "./pages/customers/CustomerOnboarding";
import LoanPage from "./pages/loan/Loan";
import CustomerDetails from "./pages/customers/CustomerDetails";

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleNavigate = (id) => {
    switch (id) {
      case "customers":
        navigate("/customers");
        break;

      case "loan-management":
        navigate("/loan");
        break;

      case "dashboard":
        navigate("/");
        break;

      case "settings":
        navigate("/settings");
        break;

      default:
        break;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAF9]">

      <SideBar
        activeItem={getActiveItem()}
        onNavigate={handleNavigate}
      />

      <main className="min-w-0 flex-1 overflow-auto">

        <Routes>

          <Route
            path="/"
            element={
              <Navigate
                to="/customers"
                replace
              />
            }
          />

          <Route
            path="/customers"
            element={<CustomerPage />}
          />

          <Route
            path="/customers/onboarding"
            element={
              <CustomerOnboarding />
            }
          />
          <Route
  path="/customers/:customerId"
  element={<CustomerDetails />}
/>

          <Route
            path="/loan"
            element={<LoanPage />}
          />

        </Routes>

      </main>

    </div>
  );
};


function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;