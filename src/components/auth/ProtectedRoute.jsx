// src/components/auth/ProtectedRoute.jsx

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  getSession,
} from "../../services/authStorage";

const ProtectedRoute = ({
  children,
  role,
}) => {
  const session =
    getSession();

  const location =
    useLocation();

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname,
        }}
      />
    );
  }

  if (
    role &&
    session.role !== role
  ) {
    if (
      session.role ===
      "staff"
    ) {
      return (
        <Navigate
          to="/staff/collection"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;