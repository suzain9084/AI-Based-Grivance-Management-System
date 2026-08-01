import { createContext, useState, useEffect } from "react";

export const userContext = createContext({});

export const UserContextProvider = ({ children }) => {
  const [User, setUser] = useState({});

  useEffect(() => {
    if (User.u_id || User.admin_id) {
      localStorage.setItem("user", JSON.stringify(User));
    }
  }, [User]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const logout = () => {
    setUser({});
    localStorage.removeItem("user");
  };

  return (
    <userContext.Provider value={{ User, setUser, logout }}>
      {children}
    </userContext.Provider>
  );
};
