// src/services/authStorage.js

import { DEMO_USERS } from "../data/demoUser";

const SESSION_KEY =
  "auto_finance_session";

export const login = (
  username,
  password
) => {
  const cleanUsername =
    String(username || "").trim();

  const user =
    DEMO_USERS.find(
      (item) =>
        item.username ===
          cleanUsername &&
        item.password === password
    );

  if (!user) {
    return {
      success: false,
      message:
        "Invalid username or password.",
    };
  }

  const session = {
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    loginAt:
      new Date().toISOString(),
  };

  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify(session)
  );

  return {
    success: true,
    user: session,
  };
};

export const getSession = () => {
  try {
    const stored =
      sessionStorage.getItem(
        SESSION_KEY
      );

    if (!stored) {
      return null;
    }

    return JSON.parse(stored);
  } catch (error) {
    console.error(
      "Failed to read login session:",
      error
    );

    return null;
  }
};

export const logout = () => {
  sessionStorage.removeItem(
    SESSION_KEY
  );
};

export const isLoggedIn = () => {
  return Boolean(getSession());
};