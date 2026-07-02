import React, { useEffect, useState } from "react";
import { LuX } from "react-icons/lu";

// Generic centered modal dialog with ease-in-out open/close animations.
// It stays mounted through the close so the exit animation can play, then
// unmounts once the panel's animation ends.
const Modal = ({ children, isOpen, onClose, title }) => {
  const [render, setRender] = useState(isOpen);
  const [closing, setClosing] = useState(false);

  // Converge local mount/close state to the isOpen prop during render (the same
  // pattern the Profile page uses — avoids a state-syncing effect).
  if (isOpen && (!render || closing)) {
    setRender(true);
    setClosing(false);
  }
  if (!isOpen && render && !closing) {
    setClosing(true);
  }

  // Close on Escape while the modal is open.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // Lock background scroll while the modal is mounted (including the close
  // animation); the modal body scrolls on its own if content is tall.
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

  if (!render) return null;

  const handleAnimationEnd = () => {
    if (closing) {
      setClosing(false);
      setRender(false);
    }
  };

  // Close when clicking the backdrop/gutter, but not the panel itself.
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black/20 p-4 ${
        closing ? "modal-backdrop-out" : "modal-backdrop-in"
      }`}
    >
      {/* Panel is capped to the viewport height so it never runs off-screen;
          the header stays put and the body scrolls if content is tall. */}
      <div
        onAnimationEnd={handleAnimationEnd}
        className={`relative flex flex-col w-full max-w-2xl max-h-[calc(100dvh-2rem)] bg-white rounded-lg shadow-sm overflow-hidden ${
          closing ? "modal-panel-out" : "modal-panel-in"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-200 rounded-t shrink-0">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center cursor-pointer"
          >
            <LuX className="text-lg" />
          </button>
        </div>

        {/* Body (scrolls within the capped panel) */}
        <div className="p-4 md:p-5 space-y-3 md:space-y-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
