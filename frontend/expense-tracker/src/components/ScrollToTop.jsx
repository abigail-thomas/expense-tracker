import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Resets scroll to the top of the page whenever the route changes. Without this,
// navigating from a scrolled-down page lands the new page at the old scroll offset.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
