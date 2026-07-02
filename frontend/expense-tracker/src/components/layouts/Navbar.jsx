import React, { useContext, useEffect, useState } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import SideMenu from "./SideMenu";
import { UserContext } from "../../context/UserContext";

const Navbar = ({ activeMenu }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);
  const { user } = useContext(UserContext);

  // The overlay stays mounted through the close so the exit animation can play,
  // then unmounts once the panel's animation ends. `render` = mounted,
  // `closing` = playing the exit animation. (Same pattern as Modal.)
  const [render, setRender] = useState(false);
  const [closing, setClosing] = useState(false);

  // Converge mount/close state to the openSideMenu intent during render.
  if (openSideMenu && (!render || closing)) {
    setRender(true);
    setClosing(false);
  }
  if (!openSideMenu && render && !closing) {
    setClosing(true);
  }

  // Lock page scroll while the menu is mounted (including the close animation).
  // Body has `overflow-x: hidden`, which makes both <html> and <body> scroll
  // containers, so lock both.
  useEffect(() => {
    if (!render) return;
    const html = document.documentElement;
    const { body } = document;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, [render]);

  const finishClose = () => {
    setClosing(false);
    setRender(false);
  };

  const handleAnimationEnd = () => {
    if (closing) finishClose();
  };

  // Fallback so the menu always finishes closing even if `animationend` never
  // fires (e.g. the tab is backgrounded, which pauses CSS animations, or
  // prefers-reduced-motion). Matches the 250ms exit animation plus a buffer.
  useEffect(() => {
    if (!closing) return;
    const t = setTimeout(finishClose, 320);
    return () => clearTimeout(t);
  }, [closing]);

  return (
    <>
      {/* While the menu is open the scroll-lock sets `overflow: hidden` on
          <html>/<body>, which makes a `sticky` bar drop back to its natural
          (scrolled-away) position. Switch to `fixed` so it stays pinned. */}
      <div
        className={`flex gap-5 bg-white border-b border-gray-200/50 backdrop-blur-[2px] py-4 px-7 ${
          render ? "fixed top-0 inset-x-0 z-50" : "sticky top-0 z-30"
        }`}
      >
        <button
          className="relative block lg:hidden text-black w-6 h-6"
          onClick={() => setOpenSideMenu(!openSideMenu)}
          aria-label={openSideMenu ? "Close menu" : "Open menu"}
        >
          <HiOutlineMenu
            className={`absolute inset-0 text-2xl transition-all duration-300 ease-in-out ${
              openSideMenu ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
            }`}
          />
          <HiOutlineX
            className={`absolute inset-0 text-2xl transition-all duration-300 ease-in-out ${
              openSideMenu ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
            }`}
          />
        </button>

        <h2 className="text-lg font-medium text-black">
          {user?.fullName ? `Welcome, ${user.fullName}` : "Personal Finance Manager"}
        </h2>
      </div>

      {/* Mobile slide-out menu. Rendered as a sibling of the navbar (NOT inside
          it): the navbar's `backdrop-blur` establishes a containing block for
          fixed descendants, which would otherwise anchor this overlay to the
          navbar's document position and push it off-screen when scrolled. */}
      {render && (
        <>
          {/* Backdrop — clicking outside the panel closes the menu */}
          <div
            className={`fixed top-[61px] left-0 right-0 z-30 h-[calc(100dvh-61px)] bg-black/30 lg:hidden ${
              closing ? "menu-fade-out" : "menu-fade-in"
            }`}
            onClick={() => setOpenSideMenu(false)}
          />
          <div
            onAnimationEnd={handleAnimationEnd}
            className={`fixed top-[61px] left-0 z-40 h-[calc(100dvh-61px)] bg-white overflow-y-auto lg:hidden ${
              closing ? "menu-slide-out" : "menu-slide-in"
            }`}
          >
            <SideMenu activeMenu={activeMenu} onNavigate={() => setOpenSideMenu(false)} />
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
