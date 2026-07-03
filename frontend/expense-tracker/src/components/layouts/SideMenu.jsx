import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { SIDE_MENU_DATA } from "../../utils/data";
import { UserContext } from "../../context/UserContext";
import Monogram from "../Monogram";

const SideMenu = ({ activeMenu, onNavigate }) => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  };

  const handleClick = (route) => {
    onNavigate?.();
    if (route === "logout") {
      handleLogout();
      return;
    }
    navigate(route);
  };

  return (
    <div className="w-64 min-h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 p-5 sticky top-[61px] z-20 dark:bg-gray-900 dark:border-gray-800">
      {/* User info */}
      <div className="flex flex-col items-center justify-center gap-3 mt-3 mb-7">
        {user?.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt="Profile"
            className="w-20 h-20 bg-slate-400 rounded-full object-cover"
          />
        ) : (
          <Monogram
            name={user?.fullName || ""}
            color={user?.monogramColor}
            textCase={user?.monogramCase}
            textSize={user?.monogramTextSize}
          />
        )}

        <h5 className="text-gray-950 font-medium leading-6 dark:text-gray-100">
          {user?.fullName || ""}
        </h5>
      </div>

      {/* Menu items */}
      {SIDE_MENU_DATA.map((item) => (
        <button
          key={`menu_${item.id}`}
          className={`w-full flex items-center gap-4 text-[15px] py-3 px-6 rounded-lg mb-3 cursor-pointer transition-colors duration-200 ease-in-out ${
            activeMenu === item.label
              ? "text-white bg-primary menu-item-active"
              : "text-gray-700 hover:bg-purple-50 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
          onClick={() => handleClick(item.path)}
        >
          <item.icon className="text-xl" />
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default SideMenu;
