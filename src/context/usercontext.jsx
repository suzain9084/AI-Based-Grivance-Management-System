import { createContext, useMemo, useState, useEffect } from "react";

const readStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  } catch {
    return {};
  }
};

export const userContext = createContext({});

export const UserContextProvider = ({ children }) => {
  const [User, setUser] = useState(readStoredUser);

  useEffect(() => {
    if (User.u_id || User.admin_id) {
      localStorage.setItem("user", JSON.stringify(User));
    }
  }, [User]);

  const logout = () => {
    setUser({});
    localStorage.removeItem("user");
  };

  const isLoggedIn = Boolean(User?.u_id || User?.admin_id);

  const value = useMemo(
    () => ({ User, setUser, logout, isLoggedIn }),
    [User, isLoggedIn]
  );

  return (
    <userContext.Provider value={value}>
      {children}
    </userContext.Provider>
  );
};
