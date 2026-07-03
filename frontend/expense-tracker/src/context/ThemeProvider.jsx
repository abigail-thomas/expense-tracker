import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "./ThemeContext";
import { UserContext } from "./UserContext";

// localStorage is the source of truth for instant, no-flash theming (see the
// inline script in index.html). The logged-in user's saved theme is adopted
// once it loads so the preference follows them across devices.
const getStoredTheme = () => {
  try {
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

const applyThemeClass = (theme) => {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
};

const ThemeProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  const [theme, setThemeState] = useState(getStoredTheme);

  // Adopt the server-stored preference once the user profile loads, converging
  // during render (the same pattern used elsewhere — avoids a setState effect).
  // Tracking the last-seen server value means a later local toggle isn't undone.
  const [syncedServerTheme, setSyncedServerTheme] = useState(null);
  if (
    (user?.theme === "light" || user?.theme === "dark") &&
    user.theme !== syncedServerTheme
  ) {
    setSyncedServerTheme(user.theme);
    setThemeState(user.theme);
  }

  // Apply the class to <html> and persist whenever the theme changes.
  useEffect(() => {
    applyThemeClass(theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* ignore unavailable storage */
    }
  }, [theme]);

  const setTheme = (next) => setThemeState(next === "dark" ? "dark" : "light");
  const toggleTheme = () =>
    setThemeState((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
