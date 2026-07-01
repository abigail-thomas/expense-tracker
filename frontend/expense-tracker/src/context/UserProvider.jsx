import React, { useState } from "react";
import { UserContext } from "./UserContext";

// Holds the currently logged-in user and helpers to update/clear it.
const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Save the user after login/registration
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Clear user data on logout
  const clearUser = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
