import React, { useContext, useState } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import SideMenu from "./SideMenu";
import { UserContext } from "../../context/UserContext";

const Navbar = ({ activeMenu }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);
  const { user } = useContext(UserContext);

  return (
    <div className="flex gap-5 bg-white border-b border-gray-200/50 backdrop-blur-[2px] py-4 px-7 sticky top-0 z-30">
      <button
        className="block lg:hidden text-black"
        onClick={() => setOpenSideMenu(!openSideMenu)}
      >
        {openSideMenu ? (
          <HiOutlineX className="text-2xl" />
        ) : (
          <HiOutlineMenu className="text-2xl" />
        )}
      </button>

      <h2 className="text-lg font-medium text-black">
        {user?.fullName ? `Welcome, ${user.fullName}` : "Personal Finance Manager"}
      </h2>

      {/* Mobile slide-out menu */}
      {openSideMenu && (
        <div className="fixed top-[61px] left-0 bg-white lg:hidden">
          <SideMenu activeMenu={activeMenu} />
        </div>
      )}
    </div>
  );
};

export default Navbar;
