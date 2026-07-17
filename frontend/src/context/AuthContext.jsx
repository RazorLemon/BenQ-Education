import { useState } from "react";

import { AuthContext } from "./auth-context";

const getStoredUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("user")
    ) || null;
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
};

export const AuthProvider = ({ children }) => {

  const [user, setUser] =
    useState(getStoredUser);

  const login = (userData, token) => {

    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    setUser(userData);
  };

  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated:
          Boolean(
            user &&
            localStorage.getItem("token")
          )
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
