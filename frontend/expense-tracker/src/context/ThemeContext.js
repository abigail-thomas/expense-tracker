import { createContext } from "react";

// { theme: "light" | "dark", setTheme(next), toggleTheme() }
export const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});
