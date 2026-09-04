// src/pages/auth/Login.jsx

import {
  LockKeyhole,
  UserRound,
  LogIn,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  login,
} from "../../services/authStorage";

const Login = () => {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    username,
    setUsername,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    const result =
      login(
        username,
        password
      );

    if (!result.success) {
      setError(
        result.message
      );
      setLoading(false);
      return;
    }

    const requestedPath =
      location.state?.from;

    if (
      result.user.role ===
      "staff"
    ) {
      navigate(
        "/staff/collection",
        {
          replace: true,
        }
      );

      return;
    }

    navigate(
      requestedPath ||
        "/dashboard",
      {
        replace: true,
      }
    );
  };

  return (
    <div
      className="
        min-h-screen
        bg-[#F5F8F6]
        px-4
        flex
        items-center
        justify-center
      "
    >
      <div
        className="
          w-full
          max-w-[420px]
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-[0_25px_80px_rgba(13,47,36,0.12)]
        "
      >
        {/* BRAND */}

        <div
          className="
            bg-[#0D2F24]
            px-6
            py-7
            text-white
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-[#174D38]
              "
            >
              <LogIn size={20} />
            </div>

            <div>
              <h1 className="text-[20px] font-extrabold">
                Auto Finance
              </h1>

              <p className="mt-1 text-[9px] font-medium text-[#A8C2B3]">
                Finance Management System
              </p>
            </div>
          </div>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="
            space-y-4
            p-6
          "
        >
          <div>
            <label
              className="
                mb-1.5
                block
                text-[10px]
                font-bold
                text-[#243253]
              "
            >
              Username
            </label>

            <div className="relative">
              <UserRound
                size={15}
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value
                  )
                }
                placeholder="Enter username"
                autoComplete="username"
                required
                className="
                  h-11
                  w-full
                  rounded-lg
                  border
                  border-slate-200
                  pl-9
                  pr-3
                  text-[12px]
                  font-semibold
                  text-[#253252]
                  outline-none
                  focus:border-[#70A98D]
                  focus:ring-2
                  focus:ring-[#E1F0E7]
                "
              />
            </div>
          </div>

          <div>
            <label
              className="
                mb-1.5
                block
                text-[10px]
                font-bold
                text-[#243253]
              "
            >
              Password
            </label>

            <div className="relative">
              <LockKeyhole
                size={15}
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Enter password"
                autoComplete="current-password"
                required
                className="
                  h-11
                  w-full
                  rounded-lg
                  border
                  border-slate-200
                  pl-9
                  pr-3
                  text-[12px]
                  font-semibold
                  text-[#253252]
                  outline-none
                  focus:border-[#70A98D]
                  focus:ring-2
                  focus:ring-[#E1F0E7]
                "
              />
            </div>
          </div>

          {error && (
            <div
              className="
                rounded-lg
                border
                border-red-200
                bg-red-50
                px-3
                py-2.5
                text-[10px]
                font-semibold
                text-red-600
              "
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              flex
              h-11
              w-full
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-[#0B6B43]
              text-[11px]
              font-bold
              text-white
              shadow-sm
              transition
              hover:bg-[#095B3B]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <LogIn size={15} />

            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

          {/* DEMO */}

          <div
            className="
              rounded-xl
              border
              border-slate-100
              bg-[#F8FAF9]
              p-3.5
            "
          >
            <p className="text-[10px] font-bold text-[#243253]">
              Demo Login
            </p>

            <div className="mt-2 space-y-1 text-[9px] text-slate-500">
              <p>
                <span className="font-bold">
                  Admin:
                </span>{" "}
                admin / admin123
              </p>

              <p>
                <span className="font-bold">
                  Staff:
                </span>{" "}
                staff / staff123
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;