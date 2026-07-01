import { createContext } from "react";

// The context object. Kept in its own (non-component) file so React Fast Refresh
// works cleanly for the provider component in UserProvider.jsx.
export const UserContext = createContext();
